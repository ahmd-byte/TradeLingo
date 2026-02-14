"""
Trade history API routes.
Handles trade upload, storage, and trade-type classification retrieval.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from database import get_database
from auth.schemas import UserResponse
from auth.dependencies import get_current_active_user
from services.trade_service import (
    calculate_holding_duration,
    update_user_trade_type,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/trades", tags=["trades"])


# ---------------------------------------------------------------------------
# Pydantic request / response schemas
# ---------------------------------------------------------------------------
class TradeItem(BaseModel):
    """Single trade submitted by the client."""
    symbol: str = Field(..., min_length=1, description="Ticker symbol")
    entry_time: datetime = Field(..., description="Trade entry time (ISO 8601)")
    exit_time: datetime = Field(..., description="Trade exit time (ISO 8601)")
    entry_price: float = Field(..., gt=0, description="Entry price (must be positive)")
    exit_price: float = Field(..., gt=0, description="Exit price (must be positive)")

    @field_validator("exit_time")
    @classmethod
    def exit_after_entry(cls, v, info):
        entry = info.data.get("entry_time")
        if entry is not None and v <= entry:
            raise ValueError("exit_time must be after entry_time")
        return v


class TradeUploadRequest(BaseModel):
    """Request body for uploading trades."""
    trades: List[TradeItem] = Field(..., min_length=1, description="List of trades")


class TradeTypeResponse(BaseModel):
    """Response for the user's classified trade type."""
    trade_type: str = Field(..., description="Classified trade type")
    message: Optional[str] = Field(None, description="Additional info")


class TradeUploadResponse(BaseModel):
    """Response after uploading trades."""
    inserted_count: int
    trade_type: str
    message: str


# ---------------------------------------------------------------------------
# POST /api/trades/upload
# ---------------------------------------------------------------------------
@router.post(
    "/upload",
    response_model=TradeUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_trades(
    request: TradeUploadRequest,
    current_user: UserResponse = Depends(get_current_active_user),
):
    """
    Accept a list of trades, compute holding durations server-side,
    store them in MongoDB, then reclassify the user's trade_type.
    """
    try:
        db = get_database()
        user_id = current_user.id
        now = datetime.now(timezone.utc)

        docs = []
        for trade in request.trades:
            holding_minutes = calculate_holding_duration(
                trade.entry_time, trade.exit_time
            )
            docs.append(
                {
                    "user_id": user_id,
                    "symbol": trade.symbol.upper(),
                    "entry_time": trade.entry_time,
                    "exit_time": trade.exit_time,
                    "entry_price": trade.entry_price,
                    "exit_price": trade.exit_price,
                    "holding_duration_minutes": holding_minutes,
                    "created_at": now,
                }
            )

        result = await db["trades"].insert_many(docs)
        inserted_count = len(result.inserted_ids)

        logger.info(
            f"User {user_id} uploaded {inserted_count} trade(s)"
        )

        # Reclassify trade type
        trade_type = await update_user_trade_type(user_id)

        return TradeUploadResponse(
            inserted_count=inserted_count,
            trade_type=trade_type,
            message=f"{inserted_count} trade(s) stored. Trade type: {trade_type}.",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trade upload error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during trade upload",
        )


# ---------------------------------------------------------------------------
# GET /api/trades/my-type
# ---------------------------------------------------------------------------
@router.get("/my-type", response_model=TradeTypeResponse)
async def get_my_trade_type(
    current_user: UserResponse = Depends(get_current_active_user),
):
    """
    Return the user's current trade_type.
    If insufficient history, returns "unknown" with an explanatory message.
    """
    try:
        # Re-derive to ensure freshness
        trade_type = await update_user_trade_type(current_user.id)

        if trade_type == "unknown":
            return TradeTypeResponse(
                trade_type="unknown",
                message="Not enough trade history to classify",
            )

        return TradeTypeResponse(trade_type=trade_type)

    except Exception as e:
        logger.error(f"Error fetching trade type: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching trade type",
        )
