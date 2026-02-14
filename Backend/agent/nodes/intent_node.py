"""
Intent Node: Intent classification and routing

Detects user's primary intent (research vs therapy vs both) using LLM.
"""

import logging

from agent.state import AgentState
from prompts.intent_prompt import build_intent_prompt
from services.llm_service import llm_service

logger = logging.getLogger(__name__)


async def intent_node(state: AgentState) -> dict:
    """
    Detect user's intent and emotional state using LLM.

    Routes to:
    - 'research': Educational/trading content needed (e.g., "What is position sizing?")
    - 'therapy': Emotional support/coaching needed (e.g., "I'm anxious about my trade")
    - 'both': Both modes needed (e.g., educational + emotional support)

    Returns:
        Dict with intent, confidence, and emotional_state
    """

    # Build intent classification prompt
    intent_prompt = build_intent_prompt(
        user_message=state["user_message"],
        memory_doc=state.get("memory_doc"),
        trading_level=state.get("user_profile", {}).get("trading_level", "beginner"),
    )

    try:
        # Get intent classification from LLM
        response = await llm_service.call_gemini_json(intent_prompt)

        return {
            "intent": response.get("intent", "both"),
            "confidence": response.get("confidence", 0.5),
            "emotional_state": response.get("emotional_state"),
        }

    except Exception as e:
        # Fallback to "both" if intent detection fails
        logger.warning("Intent detection error: %s", e, exc_info=True)
        return {
            "intent": "both",
            "confidence": 0.0,
            "emotional_state": None,
        }
