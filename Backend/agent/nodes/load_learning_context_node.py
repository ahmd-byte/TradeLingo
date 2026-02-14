"""
Load Learning Context Node — SuperBear Graph

Runs BEFORE intent classification.
Fetches the user's latest lesson plan and trade_type from MongoDB and
injects curriculum-aware context into AgentState.

If no lesson plan exists the state fields stay None and the rest of the
graph falls back to legacy behaviour.

No LLM call.
"""

import logging
from bson import ObjectId
from database import get_database
from agent.state import AgentState

logger = logging.getLogger(__name__)


async def load_learning_context_node(state: AgentState) -> AgentState:
    """
    Populate curriculum-aware fields on AgentState.

    Sets:
        - current_curriculum
        - current_module
        - knowledge_gaps
        - trade_type
        - detected_emotion  (preserves any value already set)
    """
    db = get_database()
    user_id = state.user_id

    # ------------------------------------------------------------------
    # 1. Load latest lesson plan (if any)
    # ------------------------------------------------------------------
    lesson_plan = await db["lesson_plans"].find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)],
    )

    if lesson_plan:
        modules = lesson_plan.get("modules", [])
        module_index = lesson_plan.get("current_module_index", 0)
        current_module = modules[module_index] if module_index < len(modules) else None

        state.current_curriculum = {
            "learning_objective": lesson_plan.get("learning_objective", ""),
            "modules": modules,
            "progression_strategy": lesson_plan.get("progression_strategy", ""),
            "current_module_index": module_index,
        }
        state.current_module = current_module
        state.knowledge_gaps = lesson_plan.get("knowledge_gaps")
        logger.info(f"[context] Loaded curriculum for user {user_id} (module {module_index})")
    else:
        state.current_curriculum = None
        state.current_module = None
        state.knowledge_gaps = None
        logger.info(f"[context] No curriculum found for user {user_id} — legacy mode")

    # ------------------------------------------------------------------
    # 2. Load trade_type from user document
    # ------------------------------------------------------------------
    user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
    if user_doc:
        state.trade_type = user_doc.get("trade_type")
    else:
        state.trade_type = None

    return state
