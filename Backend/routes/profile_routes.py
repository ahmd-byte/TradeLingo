"""
Profile routes for updating user profile after onboarding.
"""

import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from database import get_database
from auth.schemas import UserResponse
from auth.dependencies import get_current_active_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/profile", tags=["profile"])


class OnboardingProfileUpdate(BaseModel):
    trading_level: Optional[str] = None
    preferred_market: Optional[str] = None
    learning_style: Optional[str] = None
    risk_tolerance: Optional[str] = None
    trading_frequency: Optional[str] = None
    trading_experience_years: Optional[int] = 0
    trade_type: Optional[str] = None
    has_connected_trades: Optional[bool] = False
    starting_point: Optional[str] = None


@router.put("/onboarding")
async def update_onboarding_profile(
    profile_data: OnboardingProfileUpdate,
    current_user: UserResponse = Depends(get_current_active_user),
):
    """
    Update user profile after completing onboarding/user profiling.
    This is called once the user finishes the TradingFrequencyStep and beyond.
    """
    try:
        db = get_database()

        update_fields = {
            "updated_at": datetime.utcnow(),
        }

        # Only update fields that were provided
        if profile_data.trading_level is not None:
            update_fields["trading_level"] = profile_data.trading_level
        if profile_data.preferred_market is not None:
            update_fields["preferred_market"] = profile_data.preferred_market
        if profile_data.learning_style is not None:
            update_fields["learning_style"] = profile_data.learning_style
        if profile_data.risk_tolerance is not None:
            update_fields["risk_tolerance"] = profile_data.risk_tolerance
        if profile_data.trading_frequency is not None:
            update_fields["trading_frequency"] = profile_data.trading_frequency
        if profile_data.trading_experience_years is not None:
            update_fields["trading_experience_years"] = profile_data.trading_experience_years
        if profile_data.trade_type is not None:
            update_fields["trade_type"] = profile_data.trade_type
        if profile_data.has_connected_trades is not None:
            update_fields["has_connected_trades"] = profile_data.has_connected_trades

        result = await db["users"].update_one(
            {"email": current_user.email},
            {"$set": update_fields},
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        logger.info(f"Updated onboarding profile for user: {current_user.email}")

        return {
            "message": "Profile updated successfully",
            "updated_fields": list(update_fields.keys()),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating onboarding profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))