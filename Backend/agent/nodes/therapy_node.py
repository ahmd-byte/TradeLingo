"""
Therapy Node: Emotional wellness and psychology coaching

Generates emotional support and trading psychology coaching.
"""

from agent.state import AgentState
from prompts.therapy_prompt import build_therapy_prompt
from services.llm_service import llm_service


async def therapy_node(state: AgentState) -> AgentState:
    """
    Generate emotional wellness and psychology coaching.

    VACE Loop:
    - VALIDATE: Acknowledge the emotional state
    - ANALYZE: Understand triggers & patterns
    - COACH: Provide guidance
    - EMPOWER: Action steps

    Only runs if intent is 'therapy' or 'both'.

    Returns:
        State with therapy_output populated
    """

    # Skip if intent is research-only
    if state.intent == "research":
        state.therapy_complete = True
        return state

    try:
        # Load emotional patterns from memory
        emotional_patterns = []
        if state.memory_doc:
            emotional_patterns = state.memory_doc.get("emotional_patterns", [])

        # Build therapy prompt
        therapy_prompt = build_therapy_prompt(
            user_message=state.user_message,
            emotional_state=state.emotional_state,
            emotional_patterns=emotional_patterns,
            user_profile=state.user_profile,
            memory_doc=state.memory_doc,
        )

        # Get wellness response from LLM
        response = await llm_service.call_gemini_json(therapy_prompt)

        state.therapy_output = {
            "emotional_state": response.get("emotional_state"),
            "validation": response.get("validation"),
            "perspective": response.get("perspective"),
            "coping_strategy": response.get("coping_strategy"),
            "educational_focus": response.get("educational_focus"),
            "actionable_steps": response.get("actionable_steps", []),
            "encouragement": response.get("encouragement"),
        }

    except Exception as e:
        print(f"Therapy node error: {e}")
        state.therapy_output = None

    state.therapy_complete = True
    return state
