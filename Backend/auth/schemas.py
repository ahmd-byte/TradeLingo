"""
Pydantic schemas for authentication request/response validation.
Provides type safety and documentation for API endpoints.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


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


class UserRegisterRequest(BaseModel):
    """Request model for user registration."""
    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., min_length=1, description="Password")
    trading_level: Optional[str] = Field("beginner", description="Trading experience level")
    learning_style: Optional[str] = Field("visual", description="Preferred learning style")
    risk_tolerance: Optional[str] = Field("medium", description="Risk tolerance level")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "username": "trader_john",
                "password": "SecurePassword123!",
                "trading_level": "beginner",
                "learning_style": "visual",
                "risk_tolerance": "medium"
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


class UserResponse(BaseModel):
    """Response model for user data (excludes password)."""
    id: str = Field(..., description="User ID", alias="_id")
    email: str = Field(..., description="User email")
    username: Optional[str] = Field(None, description="Username")
    trading_level: str = Field(..., description="Trading level")
    learning_style: str = Field(..., description="Learning style")
    risk_tolerance: str = Field(..., description="Risk tolerance")
    preferred_markets: str = Field(..., description="Preferred markets")
    trading_frequency: str = Field(..., description="Trading frequency")
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
                "preferred_markets": "Stocks",
                "trading_frequency": "weekly",
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
