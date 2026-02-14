"""
Merge Node: Combine research and therapy outputs

Intelligently merges outputs from parallel research and therapy nodes.
"""

from agent.state import AgentState


async def merge_node(state: AgentState) -> AgentState:
    """
    Merge research and therapy outputs based on intent.

    Priority logic:
    - intent='research': Research first, therapy as support context
    - intent='therapy': Therapy first, research as educational context
    - intent='both': Balanced integration of both modes

    Returns:
        State with final_output populated
    """

    if state.intent == "research":
        # Research-focused response
        state.final_output = {
            "type": "educational",
            **(state.research_output or {}),
            "wellness_support": (
                state.therapy_output.get("coping_strategy")
                if state.therapy_output
                else None
            ),
        }

    elif state.intent == "therapy":
        # Therapy-focused response
        state.final_output = {
            "type": "wellness",
            **(state.therapy_output or {}),
            "educational_focus": (
                state.therapy_output.get("educational_focus")
                if state.therapy_output
                else None
            ),
            "related_concept": (
                state.research_output.get("learning_concept")
                if state.research_output
                else None
            ),
        }

    else:  # "both"
        # Balanced - include both therapy and research
        state.final_output = {
            "type": "integrated",
            "primary_mode": "therapy" if state.emotional_state else "research",
            "therapy": state.therapy_output,
            "research": state.research_output,
        }

    return state
