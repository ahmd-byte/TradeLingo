"""
Load User Node — Education Pipeline

Fetches the user document from MongoDB and extracts profile fields
needed by downstream education nodes. No LLM call.
"""

import logging
from bson import ObjectId
from database import get_database
from agent.education_state import EducationState

logger = logging.getLogger(__name__)


async def load_user_node(state: EducationState) -> dict:
    """
    Fetch user profile from MongoDB and populate state.

    Extracts:
        trading_level, learning_style, risk_tolerance,
        preferred_market, trading_frequency, trade_type

    Returns:
        Partial state update with ``profile`` and ``trade_type``.
    """
    user_id = state["user_id"]
    db = get_database()
    user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})

    if user_doc is None:
        raise ValueError(f"User not found: {user_id}")

    profile = {
        "trading_level": user_doc.get("trading_level", "beginner"),
        "learning_style": user_doc.get("learning_style", "visual"),
        "risk_tolerance": user_doc.get("risk_tolerance", "medium"),
        "preferred_market": user_doc.get("preferred_market", "stocks"),
        "trading_frequency": user_doc.get("trading_frequency", "daily"),
    }

    trade_type = user_doc.get("trade_type", None)

    logger.info(f"[education] Loaded profile for user {user_id}, trade_type={trade_type}")

    return {
        "profile": profile,
        "trade_type": trade_type,
    }
