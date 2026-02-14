"""
Authentication module for TradeLingo.
Provides JWT-based user authentication with email/password login and MongoDB storage.
"""

from auth.models import UserInDB, UserCreate, UserUpdate, UserResponse
from auth.schemas import (
    UserLoginRequest,
    UserRegisterRequest,
    TokenResponse,
    TokenRefreshRequest,
)
from auth.utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from auth.dependencies import (
    get_current_user,
    get_current_active_user,
    get_optional_user,
)

__all__ = [
    "UserInDB",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserLoginRequest",
    "UserRegisterRequest",
    "TokenResponse",
    "TokenRefreshRequest",
    "hash_password",
    "verify_password",
    "create_access_token",
    "create_refresh_token",
    "decode_token",
    "get_current_user",
    "get_current_active_user",
    "get_optional_user",
]
