"""
Pydantic schemas for authentication request/response validation.
Provides type safety and documentation for API endpoints.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

# Keep in sync with auth/models.py
PREFERRED_MARKET_VALUES = ("stocks", "forex", "crypto", "not_sure")
TRADING_FREQUENCY_VALUES = (
    "multiple_per_hour",
    "daily",
    "few_times_per_week",
    "few_times_per_month",
    "long_term",
)


class TokenResponse(BaseModel):
    """Response model for authentication tokens."""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: Optional[str] = Field(None, description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration in seconds")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 1800
            }
        }

#can change to our group format
class UserRegisterRequest(BaseModel):
    """Request model for user registration."""
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., description="Password")
    trading_level: Optional[str] = Field("occasional", description="Trading experience level")
    learning_style: Optional[str] = Field("analogies", description="Preferred learning style")
    risk_tolerance: Optional[str] = Field("medium", description="Risk tolerance level")
    preferred_market: Optional[str] = Field("stocks", description="Preferred market")
    trading_frequency: Optional[str] = Field("monthly", description="Trading frequency")
    trading_experience_years: Optional[int] = Field(None, ge=0, description="Years of trading experience")
    trade_type: Optional[str] = Field(None, description="Trade type (populated by classification logic)")
    has_connected_trades: bool = Field(False, description="Whether user has connected trades")

    @field_validator("preferred_market")
    @classmethod
    def validate_preferred_market(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in PREFERRED_MARKET_VALUES:
            raise ValueError(f"preferred_market must be one of {PREFERRED_MARKET_VALUES}")
        return v

    @field_validator("trading_frequency")
    @classmethod
    def validate_trading_frequency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in TRADING_FREQUENCY_VALUES:
            raise ValueError(f"trading_frequency must be one of {TRADING_FREQUENCY_VALUES}")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "trader_john",
                "password": "SecurePassword123!",
                "trading_level": "occasional",
                "learning_style": "analogies",
                "risk_tolerance": "medium",
                "preferred_market": "stocks",
                "trading_frequency": "monthly",
                "trading_experience_years": 2,
                "has_connected_trades": False
            }
        }


class UserLoginRequest(BaseModel):
    """Request model for user login."""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "SecurePassword123!"
            }
        }

#can change to our group format
class UserResponse(BaseModel):
    """Response model for user data (excludes password)."""
    id: str = Field(..., description="User ID", alias="_id")
    email: str = Field(..., description="User email")
    username: Optional[str] = Field(None, description="Username")
    trading_level: str = Field("beginner", description="Trading level")
    learning_style: str = Field("visual", description="Learning style")
    risk_tolerance: str = Field("medium", description="Risk tolerance")
    preferred_market: str = Field("stocks", description="Preferred market")
    trading_frequency: str = Field("daily", description="Trading frequency")
    trading_experience_years: Optional[int] = Field(None, description="Years of trading experience")
    trade_type: Optional[str] = Field(None, description="Trade type")
    has_connected_trades: bool = Field(False, description="Whether user has connected trades")
    is_active: bool = Field(..., description="Account active status")
    created_at: datetime = Field(..., description="Account creation time")
    updated_at: datetime = Field(..., description="Last update time")

    class Config:
        from_attributes = True
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }
        json_schema_extra = {
            "example": {
                "_id": "65f8c3d4e5f8c3d4e5f8c3d4",
                "email": "user@example.com",
                "username": "trader_john",
                "trading_level": "beginner",
                "learning_style": "visual",
                "risk_tolerance": "medium",
                "preferred_market": "stocks",
                "trading_frequency": "daily",
                "trading_experience_years": 2,
                "trade_type": None,
                "has_connected_trades": False,
                "is_active": True,
                "created_at": "2026-02-13T10:30:00",
                "updated_at": "2026-02-13T10:30:00"
            }
        }


class TokenRefreshRequest(BaseModel):
    """Request model for token refresh."""
    refresh_token: str = Field(..., description="Refresh token")

    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            }
        }
