"""
Trade Explain Node — SuperBear Graph

Generates a structured explanation of a specific trade, contextualised by
the user's trade_type, knowledge gaps, and detected emotion.
Falls back to a generic educational response when no trade context is
available.
"""

import logging
from agent.state import AgentState
from services.llm_service import llm_service

logger = logging.getLogger(__name__)

TRADE_EXPLAIN_PROMPT = """\
You are SuperBear, an expert trading educator.

A trader wants to understand a specific trade or trading situation.

Context:
- Trading level: {trading_level}
- Learning style: {learning_style}
- Trade type: {trade_type}
- Detected emotion: {detected_emotion}
- Weak concepts: {weak_concepts}
- Current module topic: {current_module_topic}

User message:
"{user_message}"

Analyse the situation and respond with ONLY this JSON:
{{
  "what_happened": "Clear description of what occurred in the trade / scenario",
  "mistake_identified": "Any mistake or sub-optimal decision (or 'none' if N/A)",
  "linked_concept": "The core trading concept this relates to",
  "lesson_reference": "How this ties to the student's current curriculum module (or 'N/A')",
  "improvement_suggestion": "Actionable improvement advice tailored to their level and emotion"
}}

Adapt your tone to the student's emotional state — be encouraging if they
are frustrated, analytical if they are calm.

ONLY respond with valid JSON, no other text.
"""


def _join(items) -> str:
    if isinstance(items, list):
        return ", ".join(str(i) for i in items) or "none"
    return str(items) if items else "none"


async def trade_explain_node(state: AgentState) -> AgentState:
    """
    Explain a trade / trading scenario using curriculum context.
    Populates ``state.research_output`` so the merge node can include it.
    """
    profile = state.user_profile or {}
    gaps = state.knowledge_gaps or {}
    current_module_topic = ""
    if state.current_module and isinstance(state.current_module, dict):
        current_module_topic = state.current_module.get("topic", "")

    prompt = TRADE_EXPLAIN_PROMPT.format(
        trading_level=profile.get("trading_level", "beginner"),
        learning_style=profile.get("learning_style", "visual"),
        trade_type=state.trade_type or "unknown",
        detected_emotion=state.detected_emotion or state.emotional_state or "calm",
        weak_concepts=_join(gaps.get("weak_concepts")),
        current_module_topic=current_module_topic or "N/A",
        user_message=state.user_message,
    )

    try:
        response = await llm_service.call_gemini_json(prompt)

        state.research_output = {
            "type": "trade_explain",
            "what_happened": response.get("what_happened"),
            "mistake_identified": response.get("mistake_identified"),
            "linked_concept": response.get("linked_concept"),
            "lesson_reference": response.get("lesson_reference"),
            "improvement_suggestion": response.get("improvement_suggestion"),
        }
    except Exception as e:
        logger.error(f"Trade explain node error: {e}")
        state.research_output = None

    state.research_complete = True
    return state
