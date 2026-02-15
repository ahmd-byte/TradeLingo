"""
Trade history API routes.
Handles trade upload, storage, trade-type classification, and trade diagnostics.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from database import get_database
from auth.schemas import UserResponse
from auth.dependencies import get_current_active_user
from services.trade_service import (
    calculate_holding_duration,
    update_user_trade_type,
    get_trade_by_id,
    get_latest_trade,
    get_user_trades,
    compute_trade_metrics,
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


# ---------------------------------------------------------------------------
# Trade Diagnostic Schemas
# ---------------------------------------------------------------------------
class TradeExplainRequest(BaseModel):
    """Request body for POST /api/trades/explain."""
    trade_id: Optional[str] = Field(None, description="Trade ID to analyze (uses latest if not provided)")
    user_message: Optional[str] = Field(
        "Why did this trade go wrong?",
        description="User's question about the trade"
    )
    detected_emotion: Optional[str] = Field(
        None,
        description="Detected emotional state (frustrated, anxious, calm, confident)"
    )


class TechnicalAnalysis(BaseModel):
    """Technical analysis breakdown."""
    entry_quality: str = Field(..., description="Assessment of entry timing")
    exit_quality: str = Field(..., description="Assessment of exit timing")
    risk_management: str = Field(..., description="Risk management assessment")


class BehavioralAnalysis(BaseModel):
    """Behavioral analysis breakdown."""
    bias_detected: str = Field(..., description="Any cognitive bias detected")
    emotional_pattern: str = Field(..., description="Emotional pattern observed")


class TradeMetrics(BaseModel):
    """Server-computed trade metrics."""
    symbol: str
    entry_price: float
    exit_price: float
    absolute_pnl: float
    percentage_pnl: float
    direction: str
    holding_duration_str: str


class TradeExplainResponse(BaseModel):
    """Response for POST /api/trades/explain."""
    trade_id: Optional[str] = Field(None, description="Trade ID analyzed")
    trade_metrics: Optional[TradeMetrics] = Field(None, description="Server-computed metrics")
    trade_summary: Optional[str] = Field(None, description="Trade outcome summary")
    technical_analysis: Optional[TechnicalAnalysis] = Field(None)
    behavioral_analysis: Optional[BehavioralAnalysis] = Field(None)
    core_mistake: Optional[str] = Field(None, description="Primary mistake identified")
    linked_knowledge_gap: Optional[str] = Field(None, description="Related weak concept")
    recommended_lesson_topic: Optional[str] = Field(None, description="Suggested lesson")
    suggested_module_index: Optional[int] = Field(None, description="Matching curriculum module")
    improvement_framework: List[str] = Field(default=[], description="Actionable improvements")
    tone_style_used: str = Field("neutral", description="Tone used in response")


# ---------------------------------------------------------------------------
# POST /api/trades/explain
# ---------------------------------------------------------------------------
@router.post("/explain", response_model=TradeExplainResponse)
async def explain_trade(
    request: TradeExplainRequest,
    current_user: UserResponse = Depends(get_current_active_user),
):
    """
    Deep trade diagnostic analysis.
    
    Analyzes a specific trade (or the latest trade if none specified) and provides:
    - Technical analysis (entry/exit quality, risk management)
    - Behavioral analysis (bias detection, emotional patterns)
    - Knowledge gap linking (correlates to curriculum)
    - Emotion-adaptive explanation
    - Actionable improvement framework
    
    SAFETY: Does NOT provide trading signals, price predictions, or profit guarantees.
    """
    from bson import ObjectId
    from agent.nodes.trade_explain_node import trade_explain_node
    from agent.state import AgentState
    from services import progress_service
    
    try:
        user_id = current_user.id
        
        # Load trade data
        trade_data = None
        if request.trade_id:
            trade_data = await get_trade_by_id(user_id, request.trade_id)
            if not trade_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Trade {request.trade_id} not found or does not belong to you"
                )
        else:
            trade_data = await get_latest_trade(user_id)
            if not trade_data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No trades found. Please upload your trade history first."
                )
        
        # Get user profile from DB
        db = get_database()
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
        user_profile = {
            "trading_level": user_doc.get("trading_level", "beginner") if user_doc else "beginner",
            "learning_style": user_doc.get("learning_style", "visual") if user_doc else "visual",
        }
        
        # Load curriculum context
        lesson_plan = await progress_service.get_current_lesson_plan(user_id)
        knowledge_gaps = lesson_plan.get("knowledge_gaps", {}) if lesson_plan else {}
        current_module = None
        current_curriculum = None
        
        if lesson_plan:
            modules = lesson_plan.get("modules", [])
            module_index = lesson_plan.get("current_module_index", 0)
            current_module = modules[module_index] if module_index < len(modules) else None
            current_curriculum = {
                "modules": modules,
                "current_module_index": module_index,
            }
        
        # Build minimal state for the node
        state = AgentState(
            user_message=request.user_message or "Why did this trade go wrong?",
            user_id=user_id,
            user_profile=user_profile,
            trade_type=user_doc.get("trade_type") if user_doc else None,
            trade_data=trade_data,
            detected_emotion=request.detected_emotion,
            knowledge_gaps=knowledge_gaps,
            current_module=current_module,
            current_curriculum=current_curriculum,
            timestamp=datetime.now(timezone.utc).isoformat(),
            session_id="api_trade_explain",
        )
        
        # Run the trade explain node
        result_state = await trade_explain_node(state)
        
        # Extract response
        output = result_state.research_output or {}
        
        # Build response models
        metrics_data = output.get("trade_metrics")
        trade_metrics = None
        if metrics_data:
            trade_metrics = TradeMetrics(
                symbol=metrics_data.get("symbol", "UNKNOWN"),
                entry_price=metrics_data.get("entry_price", 0),
                exit_price=metrics_data.get("exit_price", 0),
                absolute_pnl=metrics_data.get("absolute_pnl", 0),
                percentage_pnl=metrics_data.get("percentage_pnl", 0),
                direction=metrics_data.get("direction", "unknown"),
                holding_duration_str=metrics_data.get("holding_duration_str", "unknown"),
            )
        
        tech_data = output.get("technical_analysis")
        technical_analysis = None
        if tech_data and isinstance(tech_data, dict):
            technical_analysis = TechnicalAnalysis(
                entry_quality=tech_data.get("entry_quality", "N/A"),
                exit_quality=tech_data.get("exit_quality", "N/A"),
                risk_management=tech_data.get("risk_management", "N/A"),
            )
        
        behav_data = output.get("behavioral_analysis")
        behavioral_analysis = None
        if behav_data and isinstance(behav_data, dict):
            behavioral_analysis = BehavioralAnalysis(
                bias_detected=behav_data.get("bias_detected", "none"),
                emotional_pattern=behav_data.get("emotional_pattern", "N/A"),
            )
        
        return TradeExplainResponse(
            trade_id=output.get("trade_id"),
            trade_metrics=trade_metrics,
            trade_summary=output.get("trade_summary"),
            technical_analysis=technical_analysis,
            behavioral_analysis=behavioral_analysis,
            core_mistake=output.get("core_mistake"),
            linked_knowledge_gap=output.get("linked_knowledge_gap"),
            recommended_lesson_topic=output.get("recommended_lesson_topic"),
            suggested_module_index=output.get("suggested_module_index"),
            improvement_framework=output.get("improvement_framework", []),
            tone_style_used=output.get("tone_style_used", "neutral"),
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Trade explain error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during trade analysis",
        )


# ---------------------------------------------------------------------------
# GET /api/trades/list
# ---------------------------------------------------------------------------
@router.get("/list")
async def list_trades(
    limit: int = 10,
    current_user: UserResponse = Depends(get_current_active_user),
):
    """
    Get user's recent trades with computed metrics.
    """
    try:
        trades = await get_user_trades(current_user.id, limit=limit)
        
        result = []
        for trade in trades:
            metrics = compute_trade_metrics(trade)
            result.append({
                "trade_id": trade.get("_id"),
                "symbol": metrics.get("symbol"),
                "entry_time": metrics.get("entry_time"),
                "exit_time": metrics.get("exit_time"),
                "entry_price": metrics.get("entry_price"),
                "exit_price": metrics.get("exit_price"),
                "pnl_direction": metrics.get("direction"),
                "percentage_pnl": metrics.get("percentage_pnl"),
                "holding_duration": metrics.get("holding_duration_str"),
            })
        
        return {"trades": result, "count": len(result)}
    
    except Exception as e:
        logger.error(f"Trade list error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching trades",
        )
