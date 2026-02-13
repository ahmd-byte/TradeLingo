"""
Authentication utilities for password hashing and JWT token management.
Implements industry-standard security practices.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
import logging

from auth.config import (
    JWT_SECRET_KEY,
    JWT_ALGORITHM,
    ACCESS_TOKEN_EXPIRE_DELTA,
    REFRESH_TOKEN_EXPIRE_DELTA,
    PASSWORD_MIN_LENGTH
)

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Store password as plain text (DEMO MODE - no hashing).
    
    Args:
        password: Plain text password
        
    Returns:
        Plain text password (no hashing for demo)
    """
    return password


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password with plain text comparison (DEMO MODE).
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Stored password (plain text in demo mode)
        
    Returns:
        True if password matches, False otherwise
    """
    return plain_password == hashed_password


def create_access_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> tuple[str, int]:
    """
    Create a JWT access token.
    
    Args:
        data: Dictionary containing user claims
        expires_delta: Optional custom expiration time
        
    Returns:
        Tuple of (token_string, expires_in_seconds)
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + ACCESS_TOKEN_EXPIRE_DELTA
    
    to_encode.update({"exp": expire})
    
    try:
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        expires_in = int(expires_delta.total_seconds()) if expires_delta else int(ACCESS_TOKEN_EXPIRE_DELTA.total_seconds())
        return encoded_jwt, expires_in
    except Exception as e:
        logger.error(f"Token creation error: {e}")
        raise


def create_refresh_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None
) -> tuple[str, int]:
    """
    Create a JWT refresh token.
    
    Args:
        data: Dictionary containing user claims
        expires_delta: Optional custom expiration time
        
    Returns:
        Tuple of (token_string, expires_in_seconds)
    """
    to_encode = data.copy()
    to_encode["token_type"] = "refresh"
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + REFRESH_TOKEN_EXPIRE_DELTA
    
    to_encode.update({"exp": expire})
    
    try:
        encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        expires_in = int(expires_delta.total_seconds()) if expires_delta else int(REFRESH_TOKEN_EXPIRE_DELTA.total_seconds())
        return encoded_jwt, expires_in
    except Exception as e:
        logger.error(f"Refresh token creation error: {e}")
        raise


def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        Decoded token payload
        
    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError as e:
        logger.error(f"Token decode error: {e}")
        raise


def get_user_id_from_token(token: str) -> Optional[int]:
    """
    Extract user ID from a JWT token.
    
    Args:
        token: JWT token string
        
    Returns:
        User ID if valid, None otherwise
    """
    try:
        payload = decode_token(token)
        user_id: int = payload.get("sub")
        return user_id
    except Exception as e:
        logger.error(f"Error extracting user ID from token: {e}")
        return None
