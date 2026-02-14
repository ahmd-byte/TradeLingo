"""
Merge Node: Combine research and therapy outputs

Intelligently merges outputs from parallel research and therapy nodes.
"""

from agent.state import AgentState


async def merge_node(state: AgentState) -> dict:
    """
    Merge research and therapy outputs based on intent.

    Priority logic:
    - intent='research': Research first, therapy as support context
    - intent='therapy': Therapy first, research as educational context
    - intent='both': Balanced integration of both modes

    Returns:
        Dict with final_output populated
    """

    intent = state.get("intent", "both")
    research_output = state.get("research_output")
    therapy_output = state.get("therapy_output")

    if intent == "research":
        # Research-focused response
        final_output = {
            "type": "educational",
            **(research_output or {}),
            "wellness_support": (
                therapy_output.get("coping_strategy")
                if therapy_output
                else None
            ),
        }

    elif intent == "therapy":
        # Therapy-focused response
        final_output = {
            "type": "wellness",
            **(therapy_output or {}),
            "educational_focus": (
                therapy_output.get("educational_focus")
                if therapy_output
                else None
            ),
            "related_concept": (
                research_output.get("learning_concept")
                if research_output
                else None
            ),
        }

    else:  # "both"
        # Balanced - include both therapy and research
        final_output = {
            "type": "integrated",
            "primary_mode": "therapy" if state.get("emotional_state") else "research",
            "therapy": therapy_output,
            "research": research_output,
        }

    return {"final_output": final_output}
