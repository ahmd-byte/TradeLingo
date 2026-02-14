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

QUIZ_HISTORY_ADDENDUM = """

DIAGNOSTIC QUIZ HISTORY (the student's original quiz performance):
{quiz_summary}

Use this to understand what the student already knew and where they
struggled. Reference their quiz answers when relevant to deepen learning.
"""

CHAT_HISTORY_ADDENDUM = """

RECENT CONVERSATION HISTORY (last exchanges with this student):
{chat_summary}

Use this to maintain conversation continuity. Don't repeat things you've
already explained. Build on previous topics and reference prior discussions.
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

        # ----- Quiz history augmentation -----
        if state.quiz_history:
            quiz_lines = []
            for quiz in state.quiz_history:
                for pair in quiz.get("qa_pairs", []):
                    q = pair.get("question", "")
                    a = pair.get("user_answer", "")
                    concept = pair.get("concept_tested", "")
                    quiz_lines.append(f"  Q ({concept}): {q}")
                    quiz_lines.append(f"  A: {a}")
            if quiz_lines:
                research_prompt += QUIZ_HISTORY_ADDENDUM.format(
                    quiz_summary="\n".join(quiz_lines[:30])  # Cap at 30 lines
                )

        # ----- Chat history augmentation -----
        if state.chat_history:
            chat_lines = []
            for msg in state.chat_history:
                role = msg.get("role", "user")
                text = msg.get("message", "")
                # Truncate long AI messages for prompt efficiency
                if len(text) > 200:
                    text = text[:200] + "..."
                prefix = "Student" if role == "user" else "SuperBear"
                chat_lines.append(f"  {prefix}: {text}")
            if chat_lines:
                research_prompt += CHAT_HISTORY_ADDENDUM.format(
                    chat_summary="\n".join(chat_lines[-20:])  # Last 20 lines
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
