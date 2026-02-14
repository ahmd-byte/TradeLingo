"""
Research Node: Educational content generation

Generates structured trading educational content using OADT loop.
"""

import logging

from agent.state import AgentState
from prompts.research_prompt import build_research_prompt
from services.llm_service import llm_service

logger = logging.getLogger(__name__)


async def research_node(state: AgentState) -> dict:
    """
    Generate educational content on trading topics.

    OADT Loop:
    - OBSERVE: Analyze trade/question context
    - ANALYZE: Identify knowledge gaps
    - DECIDE: Choose concept to teach
    - TEACH: Generate structured lesson

    Only runs if intent is 'research' or 'both'.

    Returns:
        Dict with research_output populated
    """

    # Skip if intent is therapy-only
    if state.get("intent") == "therapy":
        return {"research_complete": True}

    try:
        # Load memory context (concepts already taught)
        concepts_taught = []
        memory_doc = state.get("memory_doc")
        if memory_doc:
            concepts_taught = memory_doc.get("concepts_taught", [])

        # Build research prompt
        research_prompt = build_research_prompt(
            user_message=state["user_message"],
            user_profile=state.get("user_profile", {}),
            concepts_taught=concepts_taught,
            memory_doc=memory_doc,
        )

        # Get educational response from LLM
        response = await llm_service.call_gemini_json(research_prompt)

        research_output = {
            "observation": response.get("observation"),
            "analysis": response.get("analysis"),
            "learning_concept": response.get("learning_concept"),
            "why_it_matters": response.get("why_it_matters"),
            "teaching_explanation": response.get("teaching_explanation"),
            "teaching_example": response.get("teaching_example"),
            "actionable_takeaway": response.get("actionable_takeaway"),
            "next_learning_suggestion": response.get("next_learning_suggestion"),
        }

        return {"research_output": research_output, "research_complete": True}

    except Exception as e:
        logger.warning("Research node error: %s", e, exc_info=True)
        return {"research_output": None, "research_complete": True}
