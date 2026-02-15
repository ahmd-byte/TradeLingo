"""
Authentication routes for user login, registration, and token management.
Implements JWT authentication with MongoDB.
"""

import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId

from database import get_database
from auth.schemas import (
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
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
from auth.dependencies import get_current_active_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(request: UserRegisterRequest):
    """
    Register a new user.
    
    Returns both access and refresh tokens for immediate use.
    
    Args:
        request: User registration data
        
    Returns:
        TokenResponse with access and refresh tokens
        
    Raises:
        HTTPException: If email already exists or validation fails
    """
    try:
        db = get_database()
        
        # Check if email already exists
        existing_user = await db["users"].find_one({"email": request.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Hash password
        hashed_password = hash_password(request.password)
        
        # Create new user document (change to our group format)
        new_user = {
            "email": request.email,
            "username": request.username,
            "hashed_password": hashed_password,
            "trading_level": request.trading_level,
            "learning_style": request.learning_style,
            "risk_tolerance": request.risk_tolerance,
            "preferred_market": request.preferred_market,
            "trading_frequency": request.trading_frequency,
            "trading_experience_years": request.trading_experience_years,
            "trade_type": request.trade_type,
            "has_connected_trades": request.has_connected_trades,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        result = await db["users"].insert_one(new_user)
        user_id = str(result.inserted_id)
        
        logger.info(f"New user registered: {request.email}")
        
        # Create tokens
        access_token, access_expires = create_access_token(data={"sub": user_id})
        refresh_token, refresh_expires = create_refresh_token(data={"sub": user_id})
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=access_expires
        )
        
    except HTTPException:
        raise
    except ValueError as e:
        logger.error(f"Registration validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration error: {str(e)}"
        )


@router.post("/login", response_model=TokenResponse)
async def login(request: UserLoginRequest):
    """
    Authenticate user and return JWT tokens.
    
    Args:
        request: User login credentials
        
    Returns:
        TokenResponse with access and refresh tokens
        
    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        db = get_database()
        
        # Find user by email
        user = await db["users"].find_one({"email": request.email})
        
        if not user:
            logger.warning(f"Login attempt with non-existent email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password (support both field names for legacy docs)
        stored_password = user.get("hashed_password") or user.get("password", "")
        if not verify_password(request.password, stored_password):
            logger.warning(f"Failed login attempt for user: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.get("is_active", False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        # Create tokens
        user_id = str(user["_id"])
        access_token, access_expires = create_access_token(data={"sub": user_id})
        refresh_token, refresh_expires = create_refresh_token(data={"sub": user_id})
        
        logger.info(f"User logged in: {user['email']}")
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=access_expires
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: TokenRefreshRequest):
    """
    Refresh an access token using a refresh token.
    
    Args:
        request: TokenRefreshRequest with refresh token
        
    Returns:
        TokenResponse with new access token
        
    Raises:
        HTTPException: If refresh token is invalid
    """
    try:
        db = get_database()
        
        # Decode refresh token
        payload = decode_token(request.refresh_token)
        
        # Verify it's a refresh token
        if payload.get("token_type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id: str = payload.get("sub")
        
        # Verify user still exists and is active
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if not user or not user.get("is_active", False):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new access token
        access_token, access_expires = create_access_token(data={"sub": user_id})
        
        logger.info(f"Token refreshed for user: {user['email']}")
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=access_expires
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Get current authenticated user's profile information.
    
    Args:
        current_user: Current authenticated user (from dependency)
        
    Returns:
        UserResponse with user profile data
    """
    return current_user


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Logout endpoint (token invalidation on client side).
    
    In production, consider maintaining a token blacklist in Redis.
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    logger.info(f"User logged out: {current_user.email}")
    return {"message": "Successfully logged out", "email": current_user.email}
