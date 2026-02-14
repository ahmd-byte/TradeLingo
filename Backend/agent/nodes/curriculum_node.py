"""
Curriculum Generator Node — Education Pipeline

Uses Gemini to produce a personalised curriculum (4–6 modules) based on
the student's knowledge gaps, profile, and learning style.
"""

import logging
from agent.education_state import EducationState
from services.llm_service import llm_service

logger = logging.getLogger(__name__)

CURRICULUM_PROMPT_TEMPLATE = """\
You are a trading education curriculum designer.

Student profile:
- Trading level: {trading_level}
- Trade type: {trade_type}
- Learning style: {learning_style}
- Preferred market: {preferred_market}

Knowledge gap analysis:
- Strong concepts: {strong_concepts}
- Weak concepts: {weak_concepts}
- Behavioral patterns: {behavioral_patterns}
- Recommended focus: {recommended_focus}

Design a personalised trading curriculum with 4 to 6 modules.
Each module should directly address the student's weak areas while
leveraging their strengths. Match the explanation style to the student's
preferred learning style.

Respond with ONLY the following JSON (no extra text):
{{
  "learning_objective": "<one sentence overall goal>",
  "modules": [
    {{
      "topic": "<module topic>",
      "difficulty": "beginner | intermediate | advanced",
      "explanation_style": "<style matching student's learning style>",
      "estimated_duration": "<e.g. 15 minutes>"
    }}
  ],
  "progression_strategy": "<short description of how modules build on each other>"
}}
"""


def _join(items) -> str:
    """Safely join a list to a comma-separated string."""
    if isinstance(items, list):
        return ", ".join(str(i) for i in items) or "none"
    return str(items) if items else "none"


async def curriculum_node(state: EducationState) -> dict:
    """
    Generate structured curriculum via LLM.

    Returns:
        Partial state update with ``curriculum``.
    """
    profile = state.get("profile", {})
    gaps = state.get("knowledge_gaps", {})
    trade_type = state.get("trade_type") or "unknown"

    prompt = CURRICULUM_PROMPT_TEMPLATE.format(
        trading_level=profile.get("trading_level", "beginner"),
        trade_type=trade_type,
        learning_style=profile.get("learning_style", "visual"),
        preferred_market=profile.get("preferred_market", "stocks"),
        strong_concepts=_join(gaps.get("strong_concepts")),
        weak_concepts=_join(gaps.get("weak_concepts")),
        behavioral_patterns=_join(gaps.get("behavioral_patterns")),
        recommended_focus=_join(gaps.get("recommended_focus")),
    )

    result = await llm_service.call_gemini_json(prompt)

    logger.info(
        f"[education] Curriculum generated for user {state.get('user_id')}: "
        f"{len(result.get('modules', []))} modules"
    )

    return {"curriculum": result}
