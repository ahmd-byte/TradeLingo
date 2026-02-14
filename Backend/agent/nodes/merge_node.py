"""
Merge Node: Combine branch outputs into final_output

Handles all curriculum-aware intent types:
  trade_explain, lesson_question, curriculum_modify,
  emotional_support, general_question,
  and legacy research / therapy / both.
"""

from agent.state import AgentState


async def merge_node(state: AgentState) -> AgentState:
    """
    Merge branch outputs based on intent.

    Routing logic:
        trade_explain      - research_output (trade explanation)
        lesson_question    - research_output (lesson-aware)
        curriculum_modify  - research_output (modified curriculum)
        emotional_support  - therapy_output (wellness)
        general_question   - research_output (fallback)
        legacy (research / therapy / both) - backward-compat merge

    Returns:
        State with final_output populated
    """
    intent = state.intent

    # --- New curriculum-aware intents --------------------------------
    if intent == "trade_explain":
        state.final_output = {
            "type": "trade_explain",
            **(state.research_output or {}),
        }

    elif intent == "curriculum_modify":
        state.final_output = {
            "type": "curriculum_modify",
            **(state.research_output or {}),
        }

    elif intent == "emotional_support":
        state.final_output = {
            "type": "wellness",
            **(state.therapy_output or {}),
            "related_concept": (
                state.research_output.get("learning_concept")
                if state.research_output
                else None
            ),
        }

    elif intent == "lesson_question":
        state.final_output = {
            "type": "educational",
            **(state.research_output or {}),
        }

    # --- Legacy intents (backward compat) ----------------------------
    elif intent == "research":
        state.final_output = {
            "type": "educational",
            **(state.research_output or {}),
            "wellness_support": (
                state.therapy_output.get("coping_strategy")
                if state.therapy_output
                else None
            ),
        }

    elif intent == "therapy":
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

    else:
        # general_question / "both" / unknown → balanced fallback
        state.final_output = {
            "type": "integrated",
            "primary_mode": "therapy" if state.emotional_state else "research",
            "therapy": state.therapy_output,
            "research": state.research_output,
        }

    return state
