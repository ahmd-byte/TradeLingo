"""
Research Node: Educational content generation (lesson-aware upgrade)

Generates structured trading educational content using OADT loop.
When a curriculum exists, constrains teaching to the current module topic
and reinforces weak concepts from the knowledge gap analysis.
Falls back to legacy behaviour when no curriculum is present.
"""

from agent.state import AgentState
from prompts.research_prompt import build_research_prompt
from services.llm_service import llm_service


def _join(items) -> str:
    if isinstance(items, list):
        return ", ".join(str(i) for i in items) or "none"
    return str(items) if items else "none"


LESSON_AWARE_ADDENDUM = """

CURRICULUM CONTEXT (adapt your teaching to this):
- Current module topic: {module_topic}
- Module difficulty: {module_difficulty}
- Weak concepts to reinforce: {weak_concepts}
- Trade type: {trade_type}
- Detected emotion: {detected_emotion}

Stay within the current module topic when possible. Reinforce weak
concepts naturally. Adapt tone to the student's emotional state.
"""


async def research_node(state: AgentState) -> AgentState:
    """
    Generate educational content on trading topics.

    OADT Loop:
    - OBSERVE: Analyze trade/question context
    - ANALYZE: Identify knowledge gaps
    - DECIDE: Choose concept to teach
    - TEACH: Generate structured lesson

    Curriculum-aware: when a current_module exists the prompt is
    augmented with module topic, weak concepts and emotion context.

    Returns:
        State with research_output populated
    """

    # Skip if intent is therapy / emotional_support only
    if state.intent in ("therapy", "emotional_support"):
        state.research_complete = True
        return state

    try:
        # Load memory context (concepts already taught)
        concepts_taught = []
        if state.memory_doc:
            concepts_taught = state.memory_doc.get("concepts_taught", [])

        # Build base research prompt (legacy)
        research_prompt = build_research_prompt(
            user_message=state.user_message,
            user_profile=state.user_profile,
            concepts_taught=concepts_taught,
            memory_doc=state.memory_doc,
        )

        # ----- Lesson-aware augmentation -----
        if state.current_module and isinstance(state.current_module, dict):
            gaps = state.knowledge_gaps or {}
            research_prompt += LESSON_AWARE_ADDENDUM.format(
                module_topic=state.current_module.get("topic", "general"),
                module_difficulty=state.current_module.get("difficulty", "beginner"),
                weak_concepts=_join(gaps.get("weak_concepts")),
                trade_type=state.trade_type or "unknown",
                detected_emotion=state.detected_emotion or state.emotional_state or "calm",
            )

        # Get educational response from LLM
        response = await llm_service.call_gemini_json(research_prompt)

        state.research_output = {
            "observation": response.get("observation"),
            "analysis": response.get("analysis"),
            "learning_concept": response.get("learning_concept"),
            "why_it_matters": response.get("why_it_matters"),
            "teaching_explanation": response.get("teaching_explanation"),
            "teaching_example": response.get("teaching_example"),
            "actionable_takeaway": response.get("actionable_takeaway"),
            "next_learning_suggestion": response.get("next_learning_suggestion"),
        }

    except Exception as e:
        print(f"Research node error: {e}")
        state.research_output = None

    state.research_complete = True
    return state
