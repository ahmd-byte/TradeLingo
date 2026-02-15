"""
Mastery Detection Node — SuperBear Graph

Lightweight mastery detection that runs after lesson-aware response.
Uses LLM to determine if the user demonstrates understanding of the
current module topic.

If mastery is detected, completes the current module and unlocks the next.
If partial understanding (confidence > 0.6), increments mastery score.
"""

import logging
from agent.state import AgentState
from services.llm_service import llm_service
from services import progress_service

logger = logging.getLogger(__name__)


MASTERY_DETECTION_PROMPT = """\
You are evaluating whether a student has demonstrated understanding of a trading concept.

Current Module Topic: {module_topic}
Module Difficulty: {module_difficulty}
Weak Concepts Being Reinforced: {weak_concepts}

Student's Message:
"{user_message}"

System's Teaching Response:
"{teaching_response}"

Based on the student's message, determine if they:
1. Explained the concept correctly in their own words
2. Answered a question correctly
3. Demonstrated applied understanding
4. Asked clarifying questions showing engagement
5. Made connections to related concepts

Respond with ONLY this JSON:
{{
  "mastery_detected": <true if student shows clear understanding, false otherwise>,
  "confidence_level": <0.0 to 1.0 representing confidence in their understanding>,
  "reasoning": "<brief explanation of why mastery was or wasn't detected>",
  "concepts_understood": ["<list of specific concepts the student understood>"],
  "areas_for_improvement": ["<concepts that still need work, if any>"]
}}

Be generous but accurate. A student asking good clarifying questions shows
engagement (confidence 0.5-0.6). A student explaining concepts correctly
shows understanding (confidence 0.7-0.9). Only mark mastery_detected=true
if confidence >= 0.8.
"""


def _join(items) -> str:
    """Safely join a list to a comma-separated string."""
    if isinstance(items, list):
        return ", ".join(str(i) for i in items) or "none"
    return str(items) if items else "none"


def _get_teaching_response(state: AgentState) -> str:
    """Extract the teaching response from research_output."""
    if not state.research_output:
        return "No teaching response available."
    
    # Combine relevant teaching components
    parts = []
    if state.research_output.get("teaching_explanation"):
        parts.append(state.research_output["teaching_explanation"])
    if state.research_output.get("teaching_example"):
        parts.append(f"Example: {state.research_output['teaching_example']}")
    if state.research_output.get("actionable_takeaway"):
        parts.append(f"Takeaway: {state.research_output['actionable_takeaway']}")
    
    return " ".join(parts) if parts else "No teaching response available."


async def mastery_detection_node(state: AgentState) -> AgentState:
    """
    Evaluate user's understanding and update progress accordingly.
    
    Only runs if:
    - current_module exists
    - research_output exists (lesson was delivered)
    - intent is lesson-related (lesson_question, general_question, trade_explain)
    
    Updates:
    - state.mastery_result with detection output
    - Calls progress_service to update module completion/mastery score
    
    Returns:
        Updated AgentState with mastery_result populated.
    """
    # Skip if no curriculum context
    if not state.current_module:
        logger.debug("[mastery] Skipping - no current module")
        state.mastery_result = None
        return state
    
    # Skip if no teaching occurred (therapy only, etc.)
    if not state.research_output:
        logger.debug("[mastery] Skipping - no research output")
        state.mastery_result = None
        return state
    
    # Skip for non-lesson intents
    skip_intents = {"emotional_support", "curriculum_modify"}
    if state.intent in skip_intents:
        logger.debug(f"[mastery] Skipping - intent is {state.intent}")
        state.mastery_result = None
        return state
    
    try:
        # Record the interaction
        await progress_service.mark_module_interaction(state.user_id)
        
        # Build mastery detection prompt
        gaps = state.knowledge_gaps or {}
        prompt = MASTERY_DETECTION_PROMPT.format(
            module_topic=state.current_module.get("topic", "general trading"),
            module_difficulty=state.current_module.get("difficulty", "beginner"),
            weak_concepts=_join(gaps.get("weak_concepts")),
            user_message=state.user_message,
            teaching_response=_get_teaching_response(state),
        )
        
        # Call LLM for mastery evaluation
        result = await llm_service.call_gemini_json(prompt)
        
        mastery_detected = result.get("mastery_detected", False)
        confidence_level = result.get("confidence_level", 0.0)
        
        logger.info(
            f"[mastery] User {state.user_id}: "
            f"mastery={mastery_detected}, confidence={confidence_level:.2f}"
        )
        
        # Process the result
        progress_update = None
        
        if mastery_detected and confidence_level >= 0.8:
            # Full mastery detected - complete module and unlock next
            progress_update = await progress_service.complete_current_module(state.user_id)
            logger.info(f"[mastery] Module completed for user {state.user_id}")
        
        elif confidence_level >= 0.6:
            # Partial understanding - increment mastery score moderately
            score_increment = int((confidence_level - 0.5) * 50)  # 5-25 points
            new_score = await progress_service.update_mastery_score(
                state.user_id, 
                score_increment
            )
            progress_update = {
                "score_incremented": True,
                "increment": score_increment,
                "new_score": new_score,
            }
            logger.info(
                f"[mastery] Mastery score incremented for user {state.user_id}: +{score_increment}"
            )
        
        elif confidence_level >= 0.4:
            # Some engagement - small score increment
            score_increment = int(confidence_level * 10)  # 4-6 points
            new_score = await progress_service.update_mastery_score(
                state.user_id,
                score_increment
            )
            progress_update = {
                "score_incremented": True,
                "increment": score_increment,
                "new_score": new_score,
            }
        
        # Store mastery result in state
        state.mastery_result = {
            "mastery_detected": mastery_detected,
            "confidence_level": confidence_level,
            "reasoning": result.get("reasoning", ""),
            "concepts_understood": result.get("concepts_understood", []),
            "areas_for_improvement": result.get("areas_for_improvement", []),
            "progress_update": progress_update,
        }
        
    except Exception as e:
        logger.error(f"[mastery] Detection error for user {state.user_id}: {e}")
        state.mastery_result = {
            "mastery_detected": False,
            "confidence_level": 0.0,
            "reasoning": "Error during mastery detection",
            "error": str(e),
        }
    
    return state
