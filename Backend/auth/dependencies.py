"""
FastAPI dependencies for authentication and authorization.
Handles token validation and user extraction for protected routes.
"""

import logging
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer
from typing import Optional
from bson import ObjectId

from database import get_database
from auth.models import UserInDB, UserResponse
from auth.utils import decode_token, get_user_id_from_token

logger = logging.getLogger(__name__)

# Security scheme for Bearer token
security = HTTPBearer()


async def get_current_user(
    authorization: Optional[str] = Header(None),
) -> UserResponse:
    """
    Dependency to get current authenticated user.
    Validates JWT token and returns user from database.
    
    Args:
        authorization: Authorization header with Bearer token
        
    Returns:
        Current authenticated User
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        # Extract token from "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Decode and validate token
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from MongoDB
        db = get_database()
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
        
        if user_doc is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not user_doc.get("is_active", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )
        
        # Convert to UserResponse (with backward-compat defaults for old docs)
        user_doc_str_id = {**user_doc, "_id": str(user_doc["_id"])}
        # Ensure new profiling fields have defaults for legacy documents
        user_doc_str_id.setdefault("preferred_market", user_doc_str_id.pop("preferred_markets", "stocks"))
        user_doc_str_id.setdefault("trading_frequency", "daily")
        user_doc_str_id.setdefault("trading_experience_years", None)
        user_doc_str_id.setdefault("trade_type", None)
        user_doc_str_id.setdefault("has_connected_trades", False)
        return UserResponse(**user_doc_str_id)
        
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_active_user(
    current_user: UserResponse = Depends(get_current_user)
) -> UserResponse:
    """
    Dependency to ensure user is active.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current user if active
        
    Raises:
        HTTPException: If user is not active
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    return current_user


async def get_optional_user(
    authorization: Optional[str] = Header(None),
) -> Optional[UserResponse]:
    """
    Dependency for optional authentication.
    Returns user if token is provided and valid, None otherwise.
    
    Args:
        authorization: Optional authorization header
        
    Returns:
        User if authenticated, None otherwise
    """
    if not authorization:
        return None
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            return None
        
        user_id = get_user_id_from_token(token)
        if user_id is None:
            return None
        
        db = get_database()
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
        
        if user_doc and user_doc.get("is_active", False):
            user_doc_str_id = {**user_doc, "_id": str(user_doc["_id"])}
            # Ensure new profiling fields have defaults for legacy documents
            user_doc_str_id.setdefault("preferred_market", user_doc_str_id.pop("preferred_markets", "stocks"))
            user_doc_str_id.setdefault("trading_frequency", "daily")
            user_doc_str_id.setdefault("trading_experience_years", None)
            user_doc_str_id.setdefault("trade_type", None)
            user_doc_str_id.setdefault("has_connected_trades", False)
            return UserResponse(**user_doc_str_id)
        
        return None
        
    except Exception as e:
        logger.debug(f"Optional user extraction failed: {e}")
        return None
