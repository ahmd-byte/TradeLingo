"""
Therapy Node: Emotional wellness and psychology coaching

Generates emotional support and trading psychology coaching.
"""

import logging

from agent.state import AgentState
from prompts.therapy_prompt import build_therapy_prompt
from services.llm_service import llm_service

logger = logging.getLogger(__name__)


async def therapy_node(state: AgentState) -> dict:
    """
    Generate emotional wellness and psychology coaching.

    VACE Loop:
    - VALIDATE: Acknowledge the emotional state
    - ANALYZE: Understand triggers & patterns
    - COACH: Provide guidance
    - EMPOWER: Action steps

    Only runs if intent is 'therapy' or 'both'.

    Returns:
        Dict with therapy_output populated
    """

    # Skip if intent is research-only
    if state.get("intent") == "research":
        return {"therapy_complete": True}

    try:
        # Load emotional patterns from memory
        emotional_patterns = []
        memory_doc = state.get("memory_doc")
        if memory_doc:
            emotional_patterns = memory_doc.get("emotional_patterns", [])

        # Build therapy prompt
        therapy_prompt = build_therapy_prompt(
            user_message=state["user_message"],
            emotional_state=state.get("emotional_state"),
            emotional_patterns=emotional_patterns,
            user_profile=state.get("user_profile", {}),
            memory_doc=memory_doc,
        )

        # Get wellness response from LLM
        response = await llm_service.call_gemini_json(therapy_prompt)

        therapy_output = {
            "emotional_state": response.get("emotional_state"),
            "validation": response.get("validation"),
            "perspective": response.get("perspective"),
            "coping_strategy": response.get("coping_strategy"),
            "educational_focus": response.get("educational_focus"),
            "actionable_steps": response.get("actionable_steps", []),
            "encouragement": response.get("encouragement"),
        }

        return {"therapy_output": therapy_output, "therapy_complete": True}

    except Exception as e:
        logger.warning("Therapy node error: %s", e, exc_info=True)
        return {"therapy_output": None, "therapy_complete": True}
