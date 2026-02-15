"""
Trade service for holding-duration computation and rule-based trade-type classification.
Also provides trade retrieval and P&L calculation for diagnostic analysis.
Pure Python — no LLM involved.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

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


# ---------------------------------------------------------------------------
# 4. Trade Retrieval Functions
# ---------------------------------------------------------------------------
async def get_trade_by_id(user_id: str, trade_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a specific trade by its MongoDB _id.
    
    Args:
        user_id: The user's string ID (for authorization check).
        trade_id: The trade's MongoDB ObjectId as string.
    
    Returns:
        Trade document dict if found and belongs to user, else None.
    """
    db = get_database()
    
    try:
        trade = await db["trades"].find_one({
            "_id": ObjectId(trade_id),
            "user_id": user_id,
        })
        
        if trade:
            trade["_id"] = str(trade["_id"])  # Serialize ObjectId
            return trade
        return None
        
    except Exception as e:
        logger.error(f"Error retrieving trade {trade_id}: {e}")
        return None


async def get_latest_trade(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve the user's most recent trade.
    
    Args:
        user_id: The user's string ID.
    
    Returns:
        Most recent trade document dict or None.
    """
    db = get_database()
    
    trade = await db["trades"].find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)],
    )
    
    if trade:
        trade["_id"] = str(trade["_id"])
        return trade
    return None


async def get_user_trades(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Retrieve user's recent trades.
    
    Args:
        user_id: The user's string ID.
        limit: Maximum number of trades to return.
    
    Returns:
        List of trade documents.
    """
    db = get_database()
    
    cursor = db["trades"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    trades = await cursor.to_list(length=limit)
    
    for trade in trades:
        trade["_id"] = str(trade["_id"])
    
    return trades


# ---------------------------------------------------------------------------
# 5. Profit/Loss Computation (Server-side)
# ---------------------------------------------------------------------------
def calculate_pnl(entry_price: float, exit_price: float) -> Dict[str, Any]:
    """
    Compute profit/loss metrics server-side.
    
    Args:
        entry_price: Trade entry price.
        exit_price: Trade exit price.
    
    Returns:
        Dict with absolute P&L, percentage, and direction.
    """
    if entry_price <= 0:
        return {
            "absolute_pnl": 0.0,
            "percentage_pnl": 0.0,
            "direction": "error",
            "is_profit": False,
        }
    
    absolute_pnl = exit_price - entry_price
    percentage_pnl = (absolute_pnl / entry_price) * 100
    is_profit = absolute_pnl >= 0
    
    return {
        "absolute_pnl": round(absolute_pnl, 4),
        "percentage_pnl": round(percentage_pnl, 2),
        "direction": "profit" if is_profit else "loss",
        "is_profit": is_profit,
    }


def compute_trade_metrics(trade: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compute all diagnostic metrics for a trade.
    
    Args:
        trade: Trade document from MongoDB.
    
    Returns:
        Dict with all computed metrics.
    """
    entry_price = trade.get("entry_price", 0)
    exit_price = trade.get("exit_price", 0)
    entry_time = trade.get("entry_time")
    exit_time = trade.get("exit_time")
    
    # P&L metrics
    pnl = calculate_pnl(entry_price, exit_price)
    
    # Holding duration
    holding_minutes = trade.get("holding_duration_minutes")
    if holding_minutes is None and entry_time and exit_time:
        holding_minutes = calculate_holding_duration(entry_time, exit_time)
    
    # Format holding duration
    if holding_minutes is not None:
        if holding_minutes < 60:
            holding_str = f"{holding_minutes:.1f} minutes"
        elif holding_minutes < 1440:
            holding_str = f"{holding_minutes / 60:.1f} hours"
        else:
            holding_str = f"{holding_minutes / 1440:.1f} days"
    else:
        holding_str = "unknown"
    
    return {
        "symbol": trade.get("symbol", "UNKNOWN"),
        "entry_price": entry_price,
        "exit_price": exit_price,
        "entry_time": str(entry_time) if entry_time else None,
        "exit_time": str(exit_time) if exit_time else None,
        "holding_duration_minutes": holding_minutes,
        "holding_duration_str": holding_str,
        **pnl,
    }


async def get_trade_with_metrics(user_id: str, trade_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a trade and compute its diagnostic metrics.
    
    Args:
        user_id: User's string ID.
        trade_id: Trade's MongoDB ObjectId as string.
    
    Returns:
        Trade document enriched with computed metrics, or None.
    """
    trade = await get_trade_by_id(user_id, trade_id)
    if not trade:
        return None
    
    metrics = compute_trade_metrics(trade)
    
    return {
        "trade_id": trade.get("_id"),
        "raw_trade": trade,
        "metrics": metrics,
    }

