"""
Intent Node: Intent classification and routing

Detects user's primary intent (research vs therapy vs both) using LLM.
"""

from agent.state import AgentState
from prompts.intent_prompt import build_intent_prompt
from services.llm_service import llm_service


async def intent_node(state: AgentState) -> AgentState:
    """
    Detect user's intent and emotional state using LLM.

    Routes to:
    - 'research': Educational/trading content needed (e.g., "What is position sizing?")
    - 'therapy': Emotional support/coaching needed (e.g., "I'm anxious about my trade")
    - 'both': Both modes needed (e.g., educational + emotional support)

    Returns:
        State with intent, confidence, and emotional_state populated
    """

    # Build intent classification prompt
    intent_prompt = build_intent_prompt(
        user_message=state.user_message,
        memory_doc=state.memory_doc,
        trading_level=state.user_profile.get("trading_level", "beginner"),
    )

    try:
        # Get intent classification from LLM
        response = await llm_service.call_gemini_json(intent_prompt)

        state.intent = response.get("intent", "both")
        state.confidence = response.get("confidence", 0.5)
        state.emotional_state = response.get("emotional_state")

    except Exception as e:
        # Fallback to "both" if intent detection fails
        print(f"Intent detection error: {e}")
        state.intent = "both"
        state.confidence = 0.0
        state.emotional_state = None

    return state
