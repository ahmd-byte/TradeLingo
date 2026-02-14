"""
Trade service for holding-duration computation and rule-based trade-type classification.
Pure Python — no LLM involved.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from database import get_database

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MIN_TRADES_FOR_CLASSIFICATION = 3

# Thresholds (in minutes)
SCALPER_MAX_MINUTES = 15.0          # avg <= 15 min
DAY_TRADE_MAX_MINUTES = 1440.0     # avg <= 1 day  (24 * 60)
SWING_TRADE_MAX_MINUTES = 20160.0  # avg <= 14 days (14 * 24 * 60)


# ---------------------------------------------------------------------------
# 1. Calculate holding duration
# ---------------------------------------------------------------------------
def calculate_holding_duration(entry_time: datetime, exit_time: datetime) -> float:
    """
    Compute the holding duration between entry and exit in **minutes**.

    Args:
        entry_time: Trade entry timestamp.
        exit_time:  Trade exit timestamp.

    Returns:
        Duration in minutes (float). Always >= 0.
    """
    delta = exit_time - entry_time
    return max(delta.total_seconds() / 60.0, 0.0)


# ---------------------------------------------------------------------------
# 2. Classify trade type from a list of trades
# ---------------------------------------------------------------------------
def classify_trade_type(trades: List[dict]) -> str:
    """
    Rule-based classification of a trader's style from their trade history.

    Rules (applied on the **average** holding_duration_minutes):
        avg <= 15 min                        → "scalper"
        avg > 15 min AND avg <= 1 day        → "day_trader"
        avg > 1 day AND avg <= 14 days       → "swing_trader"
        avg > 14 days                        → "investor"

    If fewer than MIN_TRADES_FOR_CLASSIFICATION trades → "unknown".

    Args:
        trades: List of trade dicts, each containing "holding_duration_minutes".

    Returns:
        One of: "scalper", "day_trader", "swing_trader", "investor", "unknown".
    """
    if len(trades) < MIN_TRADES_FOR_CLASSIFICATION:
        return "unknown"

    durations = [t.get("holding_duration_minutes", 0.0) for t in trades]
    avg_duration = sum(durations) / len(durations)

    if avg_duration <= SCALPER_MAX_MINUTES:
        return "scalper"
    elif avg_duration <= DAY_TRADE_MAX_MINUTES:
        return "day_trader"
    elif avg_duration <= SWING_TRADE_MAX_MINUTES:
        return "swing_trader"
    else:
        return "investor"


# ---------------------------------------------------------------------------
# 3. Update user's trade_type in the users collection
# ---------------------------------------------------------------------------
async def update_user_trade_type(user_id: str) -> str:
    """
    Recalculate and persist the user's trade_type.

    Steps:
        1. Fetch all trades for the user.
        2. Classify via rule-based logic.
        3. Update the user document's `trade_type` field.

    Args:
        user_id: The user's string ID.

    Returns:
        The computed trade_type string.
    """
    db = get_database()

    # Fetch user trades
    cursor = db["trades"].find({"user_id": user_id})
    trades = await cursor.to_list(length=None)

    trade_type = classify_trade_type(trades)

    # Persist on user document
    await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "trade_type": trade_type,
                "has_connected_trades": len(trades) > 0,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )

    logger.info(
        f"User {user_id} trade_type updated to '{trade_type}' "
        f"(based on {len(trades)} trades)"
    )
    return trade_type
