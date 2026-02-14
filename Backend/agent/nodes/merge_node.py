"""
Merge Node: Combine branch outputs into final_output

Handles all curriculum-aware intent types:
  trade_explain, lesson_question, curriculum_modify,
  emotional_support, general_question,
  and legacy research / therapy / both.

Includes mastery detection results for progress tracking.
"""

from agent.state import AgentState


def _build_progress_info(state: AgentState) -> dict:
    """
    Extract progress information from mastery_result for inclusion in output.
    """
    if not state.mastery_result:
        return {}
    
    mastery = state.mastery_result
    progress_info = {
        "mastery_detected": mastery.get("mastery_detected", False),
        "confidence_level": mastery.get("confidence_level", 0.0),
    }
    
    # Include progress update message if module was completed
    progress_update = mastery.get("progress_update")
    if progress_update and isinstance(progress_update, dict):
        if progress_update.get("success"):
            progress_info["module_completed"] = True
            progress_info["completion_message"] = progress_update.get("message", "")
            progress_info["next_module"] = progress_update.get("next_module")
            progress_info["curriculum_complete"] = progress_update.get("curriculum_complete", False)
        elif progress_update.get("score_incremented"):
            progress_info["score_incremented"] = True
            progress_info["new_mastery_score"] = progress_update.get("new_score", 0)
    
    return progress_info


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

    Includes progress info from mastery detection.

    Returns:
        State with final_output populated
    """
    intent = state.intent
    progress_info = _build_progress_info(state)

    # --- New curriculum-aware intents --------------------------------
    if intent == "trade_explain":
        state.final_output = {
            "type": "trade_explain",
            **(state.research_output or {}),
            "progress": progress_info if progress_info else None,
        }

    elif intent == "curriculum_modify":
        state.final_output = {
            "type": "curriculum_modify",
            **(state.research_output or {}),
            "progress": progress_info if progress_info else None,
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
            "progress": progress_info if progress_info else None,
        }

    elif intent == "lesson_question":
        state.final_output = {
            "type": "educational",
            **(state.research_output or {}),
            "progress": progress_info if progress_info else None,
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
            "progress": progress_info if progress_info else None,
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
            "progress": progress_info if progress_info else None,
        }

    else:
        # general_question / "both" / unknown → balanced fallback
        state.final_output = {
            "type": "integrated",
            "primary_mode": "therapy" if state.emotional_state else "research",
            "therapy": state.therapy_output,
            "research": state.research_output,
            "progress": progress_info if progress_info else None,
        }

    return state
