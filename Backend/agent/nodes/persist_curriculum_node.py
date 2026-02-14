"""
Persist Curriculum Node — Education Pipeline

Stores the generated curriculum (lesson plan) in the ``lesson_plans``
MongoDB collection so it can be loaded for later lesson delivery.
"""

import logging
from datetime import datetime, timezone

from database import get_database
from agent.education_state import EducationState

logger = logging.getLogger(__name__)


def _enhance_modules_with_progress(modules: list) -> list:
    """
    Add progress tracking fields to each module.
    
    First module gets status="current", others get status="locked".
    All modules get mastery_score=0, interaction_count=0.
    """
    enhanced = []
    for i, module in enumerate(modules):
        enhanced_module = {
            **module,
            "status": "current" if i == 0 else "locked",
            "mastery_score": 0,
            "interaction_count": 0,
        }
        enhanced.append(enhanced_module)
    return enhanced


async def persist_curriculum_node(state: EducationState) -> dict:
    """
    Insert the curriculum into the ``lesson_plans`` collection.

    Document shape:
        {
            "user_id": str,
            "learning_objective": str,
            "modules": list (with status, mastery_score, interaction_count),
            "knowledge_gaps": dict,
            "created_at": datetime,
            "current_module_index": 0
        }

    Module shape:
        {
            "topic": str,
            "difficulty": str,
            "explanation_style": str,
            "estimated_duration": str,
            "status": "locked" | "current" | "completed",
            "mastery_score": int (0-100),
            "interaction_count": int
        }

    Returns:
        State unchanged (empty partial update).
    """
    db = get_database()
    curriculum = state.get("curriculum", {})
    user_id = state["user_id"]

    # Enhance modules with progress tracking fields
    raw_modules = curriculum.get("modules", [])
    enhanced_modules = _enhance_modules_with_progress(raw_modules)

    doc = {
        "user_id": user_id,
        "learning_objective": curriculum.get("learning_objective", ""),
        "modules": enhanced_modules,
        "progression_strategy": curriculum.get("progression_strategy", ""),
        "knowledge_gaps": state.get("knowledge_gaps", {}),
        "created_at": datetime.now(timezone.utc),
        "current_module_index": 0,
    }

    result = await db["lesson_plans"].insert_one(doc)
    logger.info(
        f"[education] Lesson plan persisted for user {user_id} "
        f"(_id={result.inserted_id})"
    )

    return {}
