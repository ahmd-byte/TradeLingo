"""
Research Node: Educational content generation

Generates structured trading educational content using OADT loop.
"""

from agent.state import AgentState
from prompts.research_prompt import build_research_prompt
from services.llm_service import llm_service


async def research_node(state: AgentState) -> AgentState:
    """
    Generate educational content on trading topics.

    OADT Loop:
    - OBSERVE: Analyze trade/question context
    - ANALYZE: Identify knowledge gaps
    - DECIDE: Choose concept to teach
    - TEACH: Generate structured lesson

    Only runs if intent is 'research' or 'both'.

    Returns:
        State with research_output populated
    """

    # Skip if intent is therapy-only
    if state.intent == "therapy":
        state.research_complete = True
        return state

    try:
        # Load memory context (concepts already taught)
        concepts_taught = []
        if state.memory_doc:
            concepts_taught = state.memory_doc.get("concepts_taught", [])

        # Build research prompt
        research_prompt = build_research_prompt(
            user_message=state.user_message,
            user_profile=state.user_profile,
            concepts_taught=concepts_taught,
            memory_doc=state.memory_doc,
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
