"""
Reflection Node — SuperBear Graph

Autonomous reflection that runs conditionally after mastery detection.
Analyses patterns across interactions, updates the persistent learning
profile, and recommends difficulty adjustments.

Trigger conditions (any one is sufficient):
  - A module was just completed
  - A trade explanation was just delivered
  - Interaction count is a multiple of 5
  - A strong emotional signal was detected

The output is internal — it updates MongoDB but is NOT shown directly to
the user. Failures are non-blocking: the user still receives the main
response even if reflection errors out.
"""

import logging
from agent.state import AgentState
from services.llm_service import llm_service
from services.reflection_service import get_learning_profile, save_reflection
from services import progress_service

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Reflection Prompt
# ---------------------------------------------------------------------------
REFLECTION_PROMPT = """\
You are an internal meta-learning AI reflecting on a student's progress.
This reflection is NOT shown to the student — it is stored to improve
future teaching.

STUDENT PROFILE:
- Trading Level: {trading_level}
- Trade Type: {trade_type}
- Current Difficulty: {difficulty_level}

CURRICULUM STATE:
- Current Module: {current_module_topic}
- Module Mastery Score: {mastery_score}
- Modules Completed: {completed_count} / {total_modules}

CURRENT INTERACTION:
- User Message: "{user_message}"
- Intent: {intent}
- Detected Emotion: {detected_emotion}

MASTERY DETECTION RESULT:
- Mastery Detected: {mastery_detected}
- Confidence Level: {confidence_level}
- Concepts Understood: {concepts_understood}
- Areas for Improvement: {areas_for_improvement}

TRADE ANALYSIS (if applicable):
- Core Mistake: {core_mistake}
- Behavioral Bias: {bias_detected}

EXISTING LEARNING PROFILE:
- Previous Knowledge Gaps: {existing_knowledge_gaps}
- Previous Behavioral Patterns: {existing_behavioral_patterns}
- Previous Repeated Mistakes: {existing_repeated_mistakes}
- Reflection Count: {reflection_count}

Based on ALL of the above, generate a structured reflection.
Consider:
1. Patterns across interactions (repeated mistakes? improving areas?)
2. Emotional tendencies (consistently frustrated? growing confident?)
3. Learning strengths (what do they grasp quickly?)
4. Whether difficulty should increase, decrease, or stay the same
5. What the next teaching focus should be

Respond with ONLY this JSON:
{{
  "updated_knowledge_gaps": ["<list of current weak concepts>"],
  "behavioral_pattern_summary": "<1-2 sentence summary of behavioral tendencies>",
  "confidence_level_estimate": <0.0 to 1.0>,
  "recommended_difficulty_adjustment": "<increase | decrease | maintain>",
  "next_focus_area": "<specific topic or skill to focus on next>",
  "reflection_summary": "<short internal note about student progress>",
  "learning_strengths": ["<what the student is good at>"],
  "repeated_mistakes": ["<mistakes that keep recurring>"],
  "emotional_tendency": "<dominant emotional pattern or null>"
}}

Important:
- Be objective and data-driven
- Do NOT include therapy language or psychological labels
- Stay educational
- Do NOT include financial forecasts
"""


def _join(items) -> str:
    """Safely join a list to a comma-separated string."""
    if isinstance(items, list):
        return ", ".join(str(i) for i in items) or "none"
    return str(items) if items else "none"


def should_trigger_reflection(state: AgentState) -> bool:
    """
    Determine whether this interaction warrants a reflection.

    Triggers:
      1. Module was just completed (mastery_result has progress_update.success)
      2. Trade explanation occurred (intent == trade_explain)
      3. Strong emotional signal (frustrated, anxious, stressed)
      4. Interaction count divisible by 5

    Returns:
        True if reflection should run.
    """
    # 1. Module completed
    if state.mastery_result and isinstance(state.mastery_result, dict):
        progress_update = state.mastery_result.get("progress_update")
        if isinstance(progress_update, dict) and progress_update.get("success"):
            return True

    # 2. Trade explanation occurred
    if state.intent == "trade_explain":
        return True

    # 3. Strong emotional signal
    emotion = (state.detected_emotion or state.emotional_state or "").lower()
    if emotion in ("frustrated", "anxious", "stressed", "upset", "overwhelmed"):
        return True

    # 4. Every 5th interaction (check from current module)
    if state.current_module and isinstance(state.current_module, dict):
        interaction_count = state.current_module.get("interaction_count", 0)
        if interaction_count > 0 and interaction_count % 5 == 0:
            return True

    return False


async def reflection_node(state: AgentState) -> AgentState:
    """
    Generate and persist a structured reflection about the user's progress.

    Non-blocking: if anything fails, log the error and return state unchanged.
    The user still receives their main response regardless.

    Updates:
    - MongoDB learning_profiles collection
    - state.reflection_output (internal metadata, not shown to user)
    """
    # Guard: skip if reflection not warranted
    if not should_trigger_reflection(state):
        logger.debug("[reflection] Skipping — trigger conditions not met")
        state.reflection_output = None
        return state

    try:
        # Gather context
        profile = state.user_profile or {}
        gaps = state.knowledge_gaps or {}
        mastery = state.mastery_result or {}
        research = state.research_output or {}

        # Current module info
        current_module_topic = ""
        mastery_score = 0
        if state.current_module and isinstance(state.current_module, dict):
            current_module_topic = state.current_module.get("topic", "")
            mastery_score = state.current_module.get("mastery_score", 0)

        # Progress info
        completed_count = 0
        total_modules = 0
        if state.current_curriculum and isinstance(state.current_curriculum, dict):
            modules = state.current_curriculum.get("modules", [])
            total_modules = len(modules)
            completed_count = sum(
                1 for m in modules if m.get("status") == "completed"
            )

        # Existing learning profile from DB
        existing_profile = await get_learning_profile(state.user_id)

        # Trade analysis info
        core_mistake = research.get("core_mistake", "N/A")
        bias_detected = "N/A"
        behavioral_analysis = research.get("behavioral_analysis")
        if isinstance(behavioral_analysis, dict):
            bias_detected = behavioral_analysis.get("bias_detected", "N/A")

        # Build prompt
        prompt = REFLECTION_PROMPT.format(
            trading_level=profile.get("trading_level", "beginner"),
            trade_type=state.trade_type or "unknown",
            difficulty_level=existing_profile.get("difficulty_level", "beginner"),
            current_module_topic=current_module_topic or "N/A",
            mastery_score=mastery_score,
            completed_count=completed_count,
            total_modules=total_modules,
            user_message=state.user_message[:500],  # Truncate for safety
            intent=state.intent,
            detected_emotion=state.detected_emotion or state.emotional_state or "calm",
            mastery_detected=mastery.get("mastery_detected", False),
            confidence_level=mastery.get("confidence_level", 0.0),
            concepts_understood=_join(mastery.get("concepts_understood")),
            areas_for_improvement=_join(mastery.get("areas_for_improvement")),
            core_mistake=core_mistake,
            bias_detected=bias_detected,
            existing_knowledge_gaps=_join(existing_profile.get("knowledge_gaps")),
            existing_behavioral_patterns=existing_profile.get(
                "behavioral_pattern_summary", "none"
            ),
            existing_repeated_mistakes=_join(
                existing_profile.get("repeated_mistakes")
            ),
            reflection_count=existing_profile.get("reflection_count", 0),
        )

        # Call LLM
        result = await llm_service.call_gemini_json(prompt)

        # Persist to learning_profiles
        await save_reflection(state.user_id, result)

        # Store in state for downstream visibility (internal only)
        state.reflection_output = {
            "reflected": True,
            "difficulty_adjustment": result.get(
                "recommended_difficulty_adjustment", "maintain"
            ),
            "next_focus_area": result.get("next_focus_area", ""),
            "reflection_summary": result.get("reflection_summary", ""),
        }

        logger.info(
            f"[reflection] Completed for user {state.user_id}: "
            f"difficulty={result.get('recommended_difficulty_adjustment', 'maintain')}, "
            f"focus={result.get('next_focus_area', 'N/A')}"
        )

    except Exception as e:
        # Non-blocking: log and continue
        logger.error(f"[reflection] Error for user {state.user_id}: {e}")
        state.reflection_output = {
            "reflected": False,
            "error": str(e),
        }

    return state
