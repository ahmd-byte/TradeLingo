"""
MongoDB configuration and connection management.
Async-compatible database setup using Motor (async MongoDB driver).
"""

import os
import logging
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Global client and database instances
client: AsyncIOMotorClient = None
db: AsyncIOMotorDatabase = None


async def connect_to_mongo():
    """
    Establish connection to MongoDB.
    Called during application startup.
    """
    global client, db
    try:
        client = AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
        db = client[DATABASE_NAME]
        
        # Verify connection
        await client.admin.command("ping")
        logger.info(f"✅ Connected to MongoDB: {DATABASE_NAME}")
        
        # Create indexes for optimal performance
        await create_indexes()
        
    except Exception as e:
        logger.error(f"❌ Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """
    Close MongoDB connection.
    Called during application shutdown.
    """
    global client
    if client is not None:
        client.close()
        logger.info("✅ MongoDB connection closed")


async def create_indexes():
    """
    Create database indexes for optimal query performance.
    """
    try:
        # Users collection indexes
        users_collection = db["users"]
        await users_collection.create_index("email", unique=True)
        await users_collection.create_index("created_at")
        await users_collection.create_index("is_active")
        
        # Sessions collection indexes
        sessions_collection = db["sessions"]
        await sessions_collection.create_index("user_id")
        await sessions_collection.create_index("session_id", unique=True)
        await sessions_collection.create_index("created_at")
        
        # Trades collection indexes
        trades_collection = db["trades"]
        await trades_collection.create_index("user_id")
        await trades_collection.create_index("created_at")
        await trades_collection.create_index([("created_at", -1)])  # For sorting
        
        logger.info("✅ Database indexes created")
        
    except Exception as e:
        logger.warning(f"⚠️ Index creation warning: {e}")


def get_database() -> AsyncIOMotorDatabase:
    """
    Get the database instance.
    Use in async context only.
    """
    if db is None:
        raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
    return db


def get_client() -> AsyncIOMotorClient:
    """
    Get the MongoDB client instance.
    """
    if client is None:
        raise RuntimeError("MongoDB client not initialized. Call connect_to_mongo() first.")
    return client


# Helper functions for common operations
async def find_user_by_email(email: str):
    """Find user by email."""
    return await db["users"].find_one({"email": email})


async def find_user_by_id(user_id: str):
    """Find user by ID."""
    from bson import ObjectId
    try:
        return await db["users"].find_one({"_id": ObjectId(user_id)})
    except:
        return None


async def create_user(user_data: dict):
    """Create a new user."""
    user_data["created_at"] = datetime.now(timezone.utc)
    user_data["updated_at"] = datetime.now(timezone.utc)
    user_data["is_active"] = True
    
    result = await db["users"].insert_one(user_data)
    return result.inserted_id


async def update_user(user_id: str, update_data: dict):
    """Update user data."""
    from bson import ObjectId
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0


async def delete_user(user_id: str):
    """Soft delete user (set is_active to False)."""
    from bson import ObjectId
    result = await db["users"].update_one(
        {"_id": ObjectId(user_id)},
        {
            "$set": {
                "is_active": False,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    return result.modified_count > 0

