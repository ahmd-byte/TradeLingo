"""
Gap Analysis Node — Education Pipeline

Uses Gemini to analyze quiz answers against the questions and user profile,
producing a structured knowledge-gap report.
"""

import json
import logging
from agent.education_state import EducationState
from services.llm_service import llm_service

logger = logging.getLogger(__name__)

GAP_ANALYSIS_PROMPT_TEMPLATE = """\
You are a trading education analyst.

Student profile:
- Trading level: {trading_level}
- Trade type: {trade_type}

The student answered a 5-question diagnostic quiz.

Questions and answers:
{qa_pairs}

Analyze the student's responses carefully.

Respond with ONLY the following JSON (no extra text):
{{
  "strong_concepts": ["<concepts the student clearly understands>"],
  "weak_concepts": ["<concepts the student struggles with>"],
  "behavioral_patterns": ["<observable learning/trading patterns>"],
  "recommended_focus": ["<top priority topics to study next>"]
}}
"""


def _format_qa(questions: list, answers: list) -> str:
    """Build a numbered Q&A block for the prompt."""
    lines = []
    for i, (q, a) in enumerate(zip(questions, answers), 1):
        q_text = q.get("question", q) if isinstance(q, dict) else str(q)
        concept = q.get("concept_tested", "") if isinstance(q, dict) else ""
        lines.append(f"Q{i} (concept: {concept}): {q_text}")
        lines.append(f"A{i}: {a}")
    return "\n".join(lines)


async def gap_analysis_node(state: EducationState) -> dict:
    """
    Analyze quiz answers and identify knowledge gaps via LLM.

    Returns:
        Partial state update with ``knowledge_gaps``.
    """
    profile = state.get("profile", {})
    trade_type = state.get("trade_type") or "unknown"
    questions = state.get("quiz_questions", [])
    answers = state.get("quiz_answers", [])

    prompt = GAP_ANALYSIS_PROMPT_TEMPLATE.format(
        trading_level=profile.get("trading_level", "beginner"),
        trade_type=trade_type,
        qa_pairs=_format_qa(questions, answers),
    )

    result = await llm_service.call_gemini_json(prompt)

    logger.info(
        f"[education] Gap analysis done for user {state.get('user_id')}: "
        f"weak={result.get('weak_concepts')}"
    )

    return {"knowledge_gaps": result}
