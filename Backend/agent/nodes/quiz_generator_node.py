"""
Quiz Generator Node — Education Pipeline

Uses Gemini (via LLMService) to produce a 5-question diagnostic quiz
tailored to the user's trading level, trade type, preferred market, and
learning style.
"""

import logging
from agent.education_state import EducationState
from services.llm_service import llm_service

logger = logging.getLogger(__name__)

QUIZ_PROMPT_TEMPLATE = """\
You are a trading education expert creating a diagnostic quiz for a student.

Student profile:
- Trading level: {trading_level}
- Trade type: {trade_type}
- Preferred market: {preferred_market}
- Learning style: {learning_style}

Generate exactly 5 multiple-knowledge diagnostic questions.
Each question must test a DIFFERENT core trading concept relevant to the
student's level and market.

Respond with ONLY the following JSON (no extra text):
{{
  "questions": [
    {{
      "question": "<question text>",
      "concept_tested": "<short concept label>"
    }}
  ]
}}
"""


async def quiz_generator_node(state: EducationState) -> dict:
    """
    Generate a 5-question diagnostic quiz via LLM.

    Returns:
        Partial state update with ``quiz_questions``.
    """
    profile = state.get("profile", {})
    trade_type = state.get("trade_type") or "unknown"

    prompt = QUIZ_PROMPT_TEMPLATE.format(
        trading_level=profile.get("trading_level", "beginner"),
        trade_type=trade_type,
        preferred_market=profile.get("preferred_market", "stocks"),
        learning_style=profile.get("learning_style", "visual"),
    )

    result = await llm_service.call_gemini_json(prompt)

    questions = result.get("questions", [])
    logger.info(f"[education] Generated {len(questions)} quiz questions for user {state.get('user_id')}")

    return {"quiz_questions": questions}
