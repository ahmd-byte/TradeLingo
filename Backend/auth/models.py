"""
User data models for MongoDB.
Pydantic models for data validation and serialization.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom type for MongoDB ObjectId in Pydantic."""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            try:
                return ObjectId(v)
            except:
                raise ValueError(f"Invalid ObjectId: {v}")
        raise TypeError(f"ObjectId required, got {type(v)}")


class UserInDB(BaseModel):
    """User model as stored in MongoDB."""
    id: PyObjectId = Field(default_factory=ObjectId, alias="_id")
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

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True

    def to_dict(self):
        """Convert to dictionary for MongoDB operations."""
        data = self.dict(by_alias=True)
        if "_id" in data and isinstance(data["_id"], ObjectId):
            data["_id"] = str(data["_id"])
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


class UserResponse(BaseModel):
    """User data response (excludes password)."""
    id: str = Field(alias="_id")
    email: str
    username: Optional[str] = None
    trading_level: str
    learning_style: str
    risk_tolerance: str
    preferred_markets: str
    trading_frequency: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}

    @staticmethod
    def from_user_db(user: UserInDB) -> "UserResponse":
        """Create response from UserInDB model."""
        return UserResponse(
            **user.dict(by_alias=True)
        )

