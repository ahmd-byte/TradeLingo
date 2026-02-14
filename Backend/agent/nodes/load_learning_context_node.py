"""
Load Learning Context Node — SuperBear Graph

Runs BEFORE intent classification.
Fetches the user's latest lesson plan and trade_type from MongoDB and
injects curriculum-aware context into AgentState.

If no lesson plan exists the state fields stay None and the rest of the
graph falls back to legacy behaviour.

Includes backward compatibility: if old documents don't have status,
mastery_score, or interaction_count fields, they are initialized safely.

No LLM call.
"""

import logging
from bson import ObjectId
from database import get_database
from agent.state import AgentState

logger = logging.getLogger(__name__)


def _ensure_module_progress_fields(modules: list, current_module_index: int) -> list:
    """
    Backward compatibility: ensure all modules have progress tracking fields.
    
    If old documents don't contain status/mastery_score/interaction_count,
    initialize them safely based on current_module_index.
    """
    enhanced = []
    for i, module in enumerate(modules):
        # Skip if already has all progress fields
        if all(key in module for key in ["status", "mastery_score", "interaction_count"]):
            enhanced.append(module)
            continue
        
        # Determine status based on position relative to current_module_index
        if i < current_module_index:
            status = "completed"
        elif i == current_module_index:
            status = "current"
        else:
            status = "locked"
        
        enhanced_module = {
            **module,
            "status": module.get("status", status),
            "mastery_score": module.get("mastery_score", 0),
            "interaction_count": module.get("interaction_count", 0),
        }
        enhanced.append(enhanced_module)
    return enhanced


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
        raw_modules = lesson_plan.get("modules", [])
        module_index = lesson_plan.get("current_module_index", 0)
        
        # Backward compatibility: ensure modules have progress fields
        modules = _ensure_module_progress_fields(raw_modules, module_index)
        
        current_module = modules[module_index] if module_index < len(modules) else None

        state.current_curriculum = {
            "learning_objective": lesson_plan.get("learning_objective", ""),
            "modules": modules,
            "progression_strategy": lesson_plan.get("progression_strategy", ""),
            "current_module_index": module_index,
            "lesson_plan_id": str(lesson_plan.get("_id")),  # Store for progress updates
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

    # ------------------------------------------------------------------
    # 3. Load quiz history (all past quizzes for this user)
    # ------------------------------------------------------------------
    try:
        quiz_cursor = db["quiz_history"].find(
            {"user_id": user_id},
            sort=[("created_at", -1)],
        ).limit(5)  # Last 5 quizzes
        quiz_docs = await quiz_cursor.to_list(length=5)
        if quiz_docs:
            state.quiz_history = [
                {
                    "quiz_type": doc.get("quiz_type", "diagnostic"),
                    "qa_pairs": doc.get("qa_pairs", []),
                    "knowledge_gaps": doc.get("knowledge_gaps", {}),
                    "created_at": str(doc.get("created_at", "")),
                }
                for doc in quiz_docs
            ]
            logger.info(f"[context] Loaded {len(quiz_docs)} quiz(es) for user {user_id}")
        else:
            state.quiz_history = None
    except Exception as e:
        logger.debug(f"[context] Could not load quiz history: {e}")
        state.quiz_history = None

    # ------------------------------------------------------------------
    # 4. Load recent chat history (last 20 messages)
    # ------------------------------------------------------------------
    try:
        chat_cursor = db["chat_history"].find(
            {"user_id": user_id},
            sort=[("created_at", -1)],
        ).limit(20)  # Last 20 messages (10 exchanges)
        chat_docs = await chat_cursor.to_list(length=20)
        if chat_docs:
            # Reverse to chronological order
            chat_docs.reverse()
            state.chat_history = [
                {
                    "role": doc.get("role", "user"),
                    "message": doc.get("message", ""),
                    "intent": doc.get("intent"),
                    "learning_concept": doc.get("learning_concept"),
                }
                for doc in chat_docs
            ]
            logger.info(f"[context] Loaded {len(chat_docs)} chat messages for user {user_id}")
        else:
            state.chat_history = None
    except Exception as e:
        logger.debug(f"[context] Could not load chat history: {e}")
        state.chat_history = None

    return state
