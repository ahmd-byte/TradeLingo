"""
User data models for MongoDB.
Pydantic models for data validation and serialization.
"""

from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Any, Annotated
from datetime import datetime
from bson import ObjectId


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
    preferred_markets: str = "Stocks"
    trading_frequency: str = "weekly"
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
    preferred_markets: Optional[str] = "Stocks"
    trading_frequency: Optional[str] = "weekly"


class UserUpdate(BaseModel):
    """User data for updates."""
    username: Optional[str] = None
    trading_level: Optional[str] = None
    learning_style: Optional[str] = None
    risk_tolerance: Optional[str] = None
    preferred_markets: Optional[str] = None
    trading_frequency: Optional[str] = None

    class Config:
        # Exclude None values when converting to dict
        exclude_unset = True


# UserResponse is defined in auth.schemas to avoid duplication.
# Import it here for backwards compatibility.
from auth.schemas import UserResponse  # noqa: E402

