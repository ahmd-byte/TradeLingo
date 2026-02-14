"""
User data models for MongoDB.
Pydantic models for data validation and serialization.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Any, Annotated, Literal
from datetime import datetime
from bson import ObjectId


PREFERRED_MARKET_VALUES = ("stocks", "forex", "crypto", "not_sure")
TRADING_FREQUENCY_VALUES = (
    "multiple_per_hour",
    "daily",
    "few_times_per_week",
    "few_times_per_month",
    "long_term",
)


class PyObjectId(str):
    """Custom type for MongoDB ObjectId compatible with Pydantic v2."""

    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema

        def validate(value: Any) -> str:
            if isinstance(value, ObjectId):
                return str(value)
            if isinstance(value, str):
                if ObjectId.is_valid(value):
                    return value
                raise ValueError(f"Invalid ObjectId: {value}")
            raise TypeError(f"ObjectId or string required, got {type(value)}")

        return core_schema.no_info_plain_validator_function(
            validate,
            serialization=core_schema.plain_serializer_function_ser_schema(str),
        )


class UserInDB(BaseModel):
    """User model as stored in MongoDB."""
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: str
    username: Optional[str] = None
    hashed_password: str
    trading_level: str = "beginner"
    learning_style: str = "visual"
    risk_tolerance: str = "medium"
    preferred_market: str = "stocks"
    trading_frequency: str = "daily"
    trading_experience_years: Optional[int] = None
    trade_type: Optional[str] = None
    has_connected_trades: bool = False
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str},
    }

    def to_dict(self):
        """Convert to dictionary for MongoDB operations."""
        data = self.model_dump(by_alias=True)
        return data


class UserCreate(BaseModel):
    """User data for creation."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    trading_level: Optional[str] = "beginner"
    learning_style: Optional[str] = "visual"
    risk_tolerance: Optional[str] = "medium"
    preferred_market: Optional[str] = Field("stocks", description="Preferred market")
    trading_frequency: Optional[str] = Field("daily", description="Trading frequency")
    trading_experience_years: Optional[int] = Field(None, ge=0, description="Years of trading experience")
    trade_type: Optional[str] = None
    has_connected_trades: bool = False

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


class UserUpdate(BaseModel):
    """User data for updates."""
    username: Optional[str] = None
    trading_level: Optional[str] = None
    learning_style: Optional[str] = None
    risk_tolerance: Optional[str] = None
    preferred_market: Optional[str] = None
    trading_frequency: Optional[str] = None
    trading_experience_years: Optional[int] = Field(None, ge=0)
    trade_type: Optional[str] = None
    has_connected_trades: Optional[bool] = None

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
        # Exclude None values when converting to dict
        exclude_unset = True


# UserResponse is defined in auth.schemas to avoid duplication.
# Import it here for backwards compatibility.
from auth.schemas import UserResponse  # noqa: E402

