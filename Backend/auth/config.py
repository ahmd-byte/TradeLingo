"""
Authentication configuration and constants.
Manages JWT settings and environment variables.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES"))
JWT_REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("JWT_REFRESH_TOKEN_EXPIRE_DAYS"))

# Access token expiration
ACCESS_TOKEN_EXPIRE_DELTA = timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
REFRESH_TOKEN_EXPIRE_DELTA = timedelta(days=JWT_REFRESH_TOKEN_EXPIRE_DAYS)

# Password hashing
PASSWORD_HASH_ALGORITHM = "bcrypt"
PASSWORD_MIN_LENGTH = 8

# API Configuration
API_ENVIRONMENT = os.getenv("API_ENVIRONMENT")
DEBUG_MODE = API_ENVIRONMENT == "development"
