"""
Progress Service Module
Handles lesson progress tracking, mastery scoring, and module completion.
All functions use async MongoDB operations.
"""

import logging
from typing import Optional, Dict, Any, List
from database import get_database

logger = logging.getLogger(__name__)


async def get_current_lesson_plan(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Fetch the user's active lesson plan from MongoDB.
    
    Args:
        user_id: The user's MongoDB ID as string.
    
    Returns:
        The lesson plan document or None if not found.
    """
    db = get_database()
    lesson_plan = await db["lesson_plans"].find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)],
    )
    return lesson_plan


async def get_current_module(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Return the current module object for the user.
    
    Args:
        user_id: The user's MongoDB ID as string.
    
    Returns:
        Current module dict or None if no lesson plan / no current module.
    """
    lesson_plan = await get_current_lesson_plan(user_id)
    if not lesson_plan:
        return None
    
    modules = lesson_plan.get("modules", [])
    module_index = lesson_plan.get("current_module_index", 0)
    
    if module_index >= len(modules):
        return None
    
    current_module = modules[module_index]
    
    # Add module index for reference
    current_module["_index"] = module_index
    
    return current_module


async def mark_module_interaction(user_id: str) -> bool:
    """
    Increment the interaction_count of the current module.
    
    Args:
        user_id: The user's MongoDB ID as string.
    
    Returns:
        True if update succeeded, False otherwise.
    """
    db = get_database()
    lesson_plan = await get_current_lesson_plan(user_id)
    
    if not lesson_plan:
        logger.warning(f"[progress] No lesson plan found for user {user_id}")
        return False
    
    module_index = lesson_plan.get("current_module_index", 0)
    modules = lesson_plan.get("modules", [])
    
    if module_index >= len(modules):
        logger.warning(f"[progress] Invalid module index {module_index} for user {user_id}")
        return False
    
    # Increment interaction_count for the current module
    result = await db["lesson_plans"].update_one(
        {"_id": lesson_plan["_id"]},
        {"$inc": {f"modules.{module_index}.interaction_count": 1}}
    )
    
    if result.modified_count > 0:
        logger.info(f"[progress] Incremented interaction for user {user_id}, module {module_index}")
        return True
    
    return False


async def update_mastery_score(user_id: str, score_increment: int) -> int:
    """
    Increase the mastery_score of the current module.
    Score is capped at 100.
    
    Args:
        user_id: The user's MongoDB ID as string.
        score_increment: Amount to increase the score by.
    
    Returns:
        New mastery score, or -1 if update failed.
    """
    db = get_database()
    lesson_plan = await get_current_lesson_plan(user_id)
    
    if not lesson_plan:
        logger.warning(f"[progress] No lesson plan found for user {user_id}")
        return -1
    
    module_index = lesson_plan.get("current_module_index", 0)
    modules = lesson_plan.get("modules", [])
    
    if module_index >= len(modules):
        return -1
    
    current_score = modules[module_index].get("mastery_score", 0)
    new_score = min(current_score + score_increment, 100)  # Cap at 100
    
    result = await db["lesson_plans"].update_one(
        {"_id": lesson_plan["_id"]},
        {"$set": {f"modules.{module_index}.mastery_score": new_score}}
    )
    
    if result.modified_count > 0:
        logger.info(f"[progress] Updated mastery for user {user_id}, module {module_index}: {current_score} → {new_score}")
        return new_score
    
    return current_score


async def complete_current_module(user_id: str) -> Dict[str, Any]:
    """
    Mark the current module as completed and unlock the next module.
    
    Steps:
    1. Set current module status = "completed"
    2. Unlock next module (status = "current")
    3. Increment current_module_index
    
    Args:
        user_id: The user's MongoDB ID as string.
    
    Returns:
        Dict with completion status and next module info.
    """
    db = get_database()
    lesson_plan = await get_current_lesson_plan(user_id)
    
    if not lesson_plan:
        return {
            "success": False,
            "reason": "no_lesson_plan",
            "message": "No lesson plan found for user."
        }
    
    module_index = lesson_plan.get("current_module_index", 0)
    modules = lesson_plan.get("modules", [])
    
    if module_index >= len(modules):
        return {
            "success": False,
            "reason": "invalid_index",
            "message": "Current module index is out of bounds."
        }
    
    # Check if there's a next module
    has_next_module = (module_index + 1) < len(modules)
    
    # Build update operations
    update_ops = {
        f"modules.{module_index}.status": "completed",
        f"modules.{module_index}.mastery_score": 100,  # Mark as fully mastered
    }
    
    if has_next_module:
        update_ops[f"modules.{module_index + 1}.status"] = "current"
        update_ops["current_module_index"] = module_index + 1
    
    result = await db["lesson_plans"].update_one(
        {"_id": lesson_plan["_id"]},
        {"$set": update_ops}
    )
    
    if result.modified_count > 0:
        completed_topic = modules[module_index].get("topic", "Unknown")
        next_topic = modules[module_index + 1].get("topic") if has_next_module else None
        
        logger.info(
            f"[progress] Module completed for user {user_id}: "
            f"'{completed_topic}' → {'Next: ' + next_topic if next_topic else 'Curriculum complete!'}"
        )
        
        return {
            "success": True,
            "completed_module": {
                "index": module_index,
                "topic": completed_topic,
            },
            "next_module": {
                "index": module_index + 1,
                "topic": next_topic,
            } if has_next_module else None,
            "curriculum_complete": not has_next_module,
            "message": f"Module '{completed_topic}' completed!" + (
                f" Moving to: '{next_topic}'" if next_topic else " Curriculum complete!"
            )
        }
    
    return {
        "success": False,
        "reason": "update_failed",
        "message": "Failed to update lesson plan in database."
    }


async def get_progress_summary(user_id: str) -> Dict[str, Any]:
    """
    Get a summary of the user's learning progress.
    
    Args:
        user_id: The user's MongoDB ID as string.
    
    Returns:
        Dict with learning_objective, current_module, completed_modules,
        remaining_modules, and progress_percentage.
    """
    lesson_plan = await get_current_lesson_plan(user_id)
    
    if not lesson_plan:
        return {
            "has_lesson_plan": False,
            "learning_objective": None,
            "current_module": None,
            "completed_modules": [],
            "remaining_modules": [],
            "progress_percentage": 0,
            "total_modules": 0,
        }
    
    modules = lesson_plan.get("modules", [])
    module_index = lesson_plan.get("current_module_index", 0)
    
    # Categorize modules by status
    completed_modules = []
    remaining_modules = []
    current_module = None
    
    for i, module in enumerate(modules):
        status = module.get("status", "locked")
        module_info = {
            "index": i,
            "topic": module.get("topic", "Unknown"),
            "difficulty": module.get("difficulty", "beginner"),
            "status": status,
            "mastery_score": module.get("mastery_score", 0),
            "interaction_count": module.get("interaction_count", 0),
            "estimated_duration": module.get("estimated_duration", "N/A"),
        }
        
        if status == "completed":
            completed_modules.append(module_info)
        elif status == "current":
            current_module = module_info
        else:  # locked
            remaining_modules.append(module_info)
    
    # Calculate progress percentage
    total_modules = len(modules)
    completed_count = len(completed_modules)
    progress_percentage = (completed_count / total_modules * 100) if total_modules > 0 else 0
    
    return {
        "has_lesson_plan": True,
        "learning_objective": lesson_plan.get("learning_objective", ""),
        "current_module": current_module,
        "completed_modules": completed_modules,
        "remaining_modules": remaining_modules,
        "progress_percentage": round(progress_percentage, 1),
        "total_modules": total_modules,
        "progression_strategy": lesson_plan.get("progression_strategy", ""),
    }


async def get_weak_concepts_for_reinforcement(user_id: str) -> List[str]:
    """
    Get weak concepts from knowledge gaps that need reinforcement.
    
    Args:
        user_id: The user's MongoDB ID as string.
    
    Returns:
        List of weak concept strings.
    """
    lesson_plan = await get_current_lesson_plan(user_id)
    
    if not lesson_plan:
        return []
    
    knowledge_gaps = lesson_plan.get("knowledge_gaps", {})
    weak_concepts = knowledge_gaps.get("weak_concepts", [])
    
    if isinstance(weak_concepts, list):
        return weak_concepts
    
    return []
