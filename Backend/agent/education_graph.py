"""
Education Pipeline LangGraph Definition

Two-phase structured pipeline (NOT conversational):

Phase 1 — ``generate_quiz``
    load_user → quiz_generator → END

Phase 2 — ``generate_curriculum``
    gap_analysis → curriculum_generator → persist_curriculum → END

Each phase is built as a separate compiled graph so they can be invoked
independently from the API layer.
"""

import logging
from langgraph.graph import StateGraph, START, END

from agent.education_state import EducationState
from agent.nodes.load_user_node import load_user_node
from agent.nodes.quiz_generator_node import quiz_generator_node
from agent.nodes.gap_analysis_node import gap_analysis_node
from agent.nodes.curriculum_node import curriculum_node
from agent.nodes.persist_curriculum_node import persist_curriculum_node

logger = logging.getLogger(__name__)


# ------------------------------------------------------------------
# Phase 1 graph: load user → generate quiz
# ------------------------------------------------------------------
def _build_phase1_graph():
    builder = StateGraph(EducationState)
    builder.add_node("load_user", load_user_node)
    builder.add_node("quiz_generator", quiz_generator_node)

    builder.add_edge(START, "load_user")
    builder.add_edge("load_user", "quiz_generator")
    builder.add_edge("quiz_generator", END)

    return builder.compile()


# ------------------------------------------------------------------
# Phase 2 graph: gap analysis → curriculum → persist
# ------------------------------------------------------------------
def _build_phase2_graph():
    builder = StateGraph(EducationState)
    builder.add_node("gap_analysis", gap_analysis_node)
    builder.add_node("curriculum_generator", curriculum_node)
    builder.add_node("persist_curriculum", persist_curriculum_node)

    builder.add_edge(START, "gap_analysis")
    builder.add_edge("gap_analysis", "curriculum_generator")
    builder.add_edge("curriculum_generator", "persist_curriculum")
    builder.add_edge("persist_curriculum", END)

    return builder.compile()


# Singleton compiled graphs
_phase1_graph = _build_phase1_graph()
_phase2_graph = _build_phase2_graph()


# ------------------------------------------------------------------
# Public entry-points
# ------------------------------------------------------------------
async def generate_quiz(user_id: str) -> dict:
    """
    Run Phase 1: load user profile and generate a diagnostic quiz.

    Args:
        user_id: MongoDB user _id as string.

    Returns:
        dict with ``quiz_questions`` (list) and ``profile`` / ``trade_type``.
    """
    initial_state: EducationState = {
        "user_id": user_id,
        "profile": {},
        "trade_type": None,
        "quiz_questions": [],
        "quiz_answers": [],
        "knowledge_gaps": {},
        "curriculum": {},
    }

    result = await _phase1_graph.ainvoke(initial_state)
    logger.info(f"[education] Phase 1 complete for user {user_id}")
    return result


async def generate_curriculum(
    user_id: str,
    quiz_questions: list,
    quiz_answers: list,
    profile: dict,
    trade_type: str | None,
) -> dict:
    """
    Run Phase 2: analyse answers, build curriculum, and persist.

    Args:
        user_id:        MongoDB user _id as string.
        quiz_questions:  Questions produced in Phase 1.
        quiz_answers:   Answers submitted by the user.
        profile:        User profile dict from Phase 1.
        trade_type:     Trade type string (may be None / "unknown").

    Returns:
        dict with ``knowledge_gaps`` and ``curriculum``.
    """
    initial_state: EducationState = {
        "user_id": user_id,
        "profile": profile,
        "trade_type": trade_type,
        "quiz_questions": quiz_questions,
        "quiz_answers": quiz_answers,
        "knowledge_gaps": {},
        "curriculum": {},
    }

    result = await _phase2_graph.ainvoke(initial_state)
    logger.info(f"[education] Phase 2 complete for user {user_id}")
    return result
