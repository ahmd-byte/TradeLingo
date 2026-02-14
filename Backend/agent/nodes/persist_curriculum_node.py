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


async def persist_curriculum_node(state: EducationState) -> dict:
    """
    Insert the curriculum into the ``lesson_plans`` collection.

    Document shape:
        {
            "user_id": str,
            "learning_objective": str,
            "modules": list,
            "knowledge_gaps": dict,
            "created_at": datetime,
            "current_module_index": 0
        }

    Returns:
        State unchanged (empty partial update).
    """
    db = get_database()
    curriculum = state.get("curriculum", {})
    user_id = state["user_id"]

    doc = {
        "user_id": user_id,
        "learning_objective": curriculum.get("learning_objective", ""),
        "modules": curriculum.get("modules", []),
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
