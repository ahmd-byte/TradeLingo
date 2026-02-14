"""
Reflection Service Module
Manages the learning_profiles collection and reflection persistence.
Provides async MongoDB operations for saving reflections, retrieving
learning profiles, and updating difficulty levels.
"""

import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

from database import get_database

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Default learning profile
# ---------------------------------------------------------------------------
_DEFAULT_PROFILE = {
    "behavioral_pattern_summary": "",
    "knowledge_gaps": [],
    "confidence_level_estimate": 0.0,
    "difficulty_level": "beginner",
    "last_reflection_at": None,
    "reflection_count": 0,
    "emotional_tendencies": [],
    "learning_strengths": [],
    "repeated_mistakes": [],
}


# ---------------------------------------------------------------------------
# Core CRUD
# ---------------------------------------------------------------------------
async def get_learning_profile(user_id: str) -> Dict[str, Any]:
    """
    Retrieve the user's learning profile, creating a default if absent.

    Args:
        user_id: The user's MongoDB ID as string.

    Returns:
        Learning profile document (always non-None).
    """
    db = get_database()
    profile = await db["learning_profiles"].find_one({"user_id": user_id})

    if profile:
        profile.pop("_id", None)  # Remove ObjectId for serialisation safety
        return profile

    # Return default (not persisted until first reflection)
    return {"user_id": user_id, **_DEFAULT_PROFILE}


async def save_reflection(user_id: str, reflection: Dict[str, Any]) -> bool:
    """
    Persist a reflection result into the learning_profiles collection.

    Behaviour:
    - Upsert: creates the document if it doesn't exist.
    - Merges ``updated_knowledge_gaps`` with existing gaps (dedup).
    - Appends repeated mistakes without overwriting old ones.
    - Updates difficulty, confidence, and behavioral summary.

    Args:
        user_id:    The user's string ID.
        reflection: Structured JSON output from the reflection LLM call.

    Returns:
        True if the write succeeded.
    """
    db = get_database()
    now = datetime.now(timezone.utc)

    # ---- Merge knowledge gaps (deduplicate) ----
    existing = await get_learning_profile(user_id)
    old_gaps = set(existing.get("knowledge_gaps", []))
    new_gaps = set(reflection.get("updated_knowledge_gaps", []))
    merged_gaps = list(old_gaps | new_gaps)

    # ---- Merge repeated mistakes ----
    old_mistakes = existing.get("repeated_mistakes", [])
    new_mistakes = reflection.get("repeated_mistakes", [])
    # Keep last 10 unique mistakes
    all_mistakes = list(dict.fromkeys(old_mistakes + new_mistakes))[-10:]

    # ---- Merge emotional tendencies ----
    old_emotions = existing.get("emotional_tendencies", [])
    new_emotion = reflection.get("emotional_tendency")
    if new_emotion and new_emotion not in old_emotions:
        old_emotions = (old_emotions + [new_emotion])[-5:]  # Keep last 5

    # ---- Map difficulty adjustment recommendation ----
    current_difficulty = existing.get("difficulty_level", "beginner")
    adjustment = reflection.get("recommended_difficulty_adjustment", "maintain")
    new_difficulty = _apply_difficulty_adjustment(current_difficulty, adjustment)

    update_doc = {
        "$set": {
            "user_id": user_id,
            "behavioral_pattern_summary": reflection.get(
                "behavioral_pattern_summary",
                existing.get("behavioral_pattern_summary", ""),
            ),
            "knowledge_gaps": merged_gaps,
            "confidence_level_estimate": reflection.get(
                "confidence_level_estimate",
                existing.get("confidence_level_estimate", 0.0),
            ),
            "difficulty_level": new_difficulty,
            "last_reflection_at": now,
            "next_focus_area": reflection.get("next_focus_area", ""),
            "reflection_summary": reflection.get("reflection_summary", ""),
            "learning_strengths": reflection.get(
                "learning_strengths",
                existing.get("learning_strengths", []),
            ),
            "repeated_mistakes": all_mistakes,
            "emotional_tendencies": old_emotions,
        },
        "$inc": {"reflection_count": 1},
    }

    result = await db["learning_profiles"].update_one(
        {"user_id": user_id},
        update_doc,
        upsert=True,
    )

    success = result.upserted_id is not None or result.modified_count > 0
    if success:
        logger.info(
            f"[reflection] Profile updated for user {user_id} "
            f"(difficulty={new_difficulty}, gaps={len(merged_gaps)})"
        )
    return success


async def update_difficulty(user_id: str, level: str) -> bool:
    """
    Directly set the difficulty level on a learning profile.

    Args:
        user_id: User string ID.
        level:   One of 'beginner', 'intermediate', 'advanced'.

    Returns:
        True if write succeeded.
    """
    if level not in ("beginner", "intermediate", "advanced"):
        logger.warning(f"[reflection] Invalid difficulty level: {level}")
        return False

    db = get_database()
    result = await db["learning_profiles"].update_one(
        {"user_id": user_id},
        {"$set": {"difficulty_level": level}},
        upsert=True,
    )
    return result.upserted_id is not None or result.modified_count > 0


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
_DIFFICULTY_ORDER = ["beginner", "intermediate", "advanced"]


def _apply_difficulty_adjustment(current: str, adjustment: str) -> str:
    """
    Apply a difficulty adjustment (increase / decrease / maintain).

    Returns the new difficulty level string.
    """
    if adjustment == "maintain" or adjustment not in ("increase", "decrease"):
        return current

    idx = _DIFFICULTY_ORDER.index(current) if current in _DIFFICULTY_ORDER else 0

    if adjustment == "increase":
        idx = min(idx + 1, len(_DIFFICULTY_ORDER) - 1)
    elif adjustment == "decrease":
        idx = max(idx - 1, 0)

    return _DIFFICULTY_ORDER[idx]
