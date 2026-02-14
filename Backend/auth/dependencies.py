"""
FastAPI dependencies for authentication and authorization.
Handles token validation and user extraction for protected routes.
"""

import logging
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from bson import ObjectId

from database import get_database
from auth.models import UserResponse
from auth.utils import decode_token, get_user_id_from_token

logger = logging.getLogger(__name__)

# Security scheme for Bearer token (enables Authorize button in Swagger UI)
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> UserResponse:
    """
    Dependency to get current authenticated user.
    Validates JWT token and returns user from database.
    
    Args:
        credentials: Bearer token from HTTPBearer security scheme
        
    Returns:
        Current authenticated User
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    try:
        token = credentials.credentials
        
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
        
        # Convert to UserResponse
        user_doc_str_id = {**user_doc, "_id": str(user_doc["_id"])}
        return UserResponse(**user_doc_str_id)
        
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
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
) -> Optional[UserResponse]:
    """
    Dependency for optional authentication.
    Returns user if token is provided and valid, None otherwise.
    
    Args:
        credentials: Optional Bearer token
        
    Returns:
        User if authenticated, None otherwise
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        
        user_id = get_user_id_from_token(token)
        if user_id is None:
            return None
        
        db = get_database()
        user_doc = await db["users"].find_one({"_id": ObjectId(user_id)})
        
        if user_doc and user_doc.get("is_active", False):
            user_doc_str_id = {**user_doc, "_id": str(user_doc["_id"])}
            return UserResponse(**user_doc_str_id)
        
        return None
        
    except Exception as e:
        logger.debug(f"Optional user extraction failed: {e}")
        return None
