# main.py
"""
TradeLingo FastAPI Application
Integrates the Single AI Trading Tutor Agent with FastAPI.
Provides REST API endpoints with JWT authentication and MongoDB.
"""

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
import requests as http_requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from agent.graph import superbear_graph
from agent.state import AgentState
from memory import LearningMemory
from database import connect_to_mongo, close_mongo_connection, db
from auth.schemas import UserResponse
from auth.routes import router as auth_router
from auth.dependencies import get_current_active_user

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Sheety API configuration (optional external storage)
PROFILES_ENDPOINT = os.getenv("PROFILES_ENDPOINT", "")
TRADES_ENDPOINT = os.getenv("TRADES_ENDPOINT", "")
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {os.getenv('SHEETY_TOKEN', '')}"
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage FastAPI application lifecycle.
    Connects to MongoDB on startup and closes on shutdown.
    """
    # Startup
    logger.info("Initializing TradeLingo Backend...")
    try:
        await connect_to_mongo()
        logger.info("✅ Database connected successfully")
    except Exception as e:
        logger.error(f"❌ Failed to connect to database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down TradeLingo Backend...")
    await close_mongo_connection()


app = FastAPI(
    title="TradeLingo",
    version="2.0.0",
    description="AI-powered trading education with FastAPI & MongoDB",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session memory (in production, use persistent storage like Redis or MongoDB)
session_memory = {}


# Pydantic models
class UserProfile(BaseModel):
    name: str = "User"
    tradingLevel: str = "beginner"
    learningStyle: str = "visual"
    riskTolerance: str = "medium"
    preferredMarkets: str = "Stocks"
    tradingFrequency: str = "weekly"


class TradeData(BaseModel):
    stockCode: Optional[str] = None
    stockName: Optional[str] = None
    action: Optional[str] = None
    units: Optional[str] = None
    price: Optional[str] = None
    date: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"
    user_profile: Optional[UserProfile] = None
    trade_data: Optional[TradeData] = None


class TherapyRequest(BaseModel):
    message: str
    session_id: Optional[str] = "therapy-default"
    user_profile: Optional[UserProfile] = None
    trade_data: Optional[TradeData] = None


def create_profile(form_data):
    payload = {
        "profiling": {
            "name": form_data.get("name", ""),
            "tradingLevel": form_data.get("tradingLevel", ""),
            "learningStyle": form_data.get("learningStyle", ""),
            "riskTolerance": form_data.get("riskTolerance", ""),
            "preferredMarkets": form_data.get("preferredMarkets", ""),
            "tradingFrequency": form_data.get("tradingFrequency", "")
        }
    }
    response = http_requests.post(PROFILES_ENDPOINT, json=payload, headers=HEADERS)
    if response.status_code not in [200, 201]:
        raise Exception(f"Failed to create profile: {response.text}")
    profile_id = response.json().get("profiling", {}).get("id")
    if not profile_id:
        raise Exception(f"Profile ID not found in response: {response.json()}")
    return profile_id, response.json()


def post_trade(form_data, profile_id):
    stock_code = form_data.get("stock_code")
    stock_name = form_data.get("stock_name")
    if not stock_code and not stock_name:
        return None  # No trade data to post

    payload = {
        "pasttrade": {
            "profileId": profile_id,
            "date": form_data.get("date", ""),
            "stockCode": stock_code or "",
            "stockName": stock_name or "",
            "action": form_data.get("action", ""),
            "units": form_data.get("units", ""),
            "price": form_data.get("price", ""),
            "intraday": form_data.get("intraday", "")
        }
    }
    print("Posting trade:", payload["pasttrade"])  # Debug
    response = http_requests.post(TRADES_ENDPOINT, json=payload, headers=HEADERS)
    if response.status_code not in [200, 201]:
        print("Failed to post trade:", response.text)
        return None
    return response.json()


def get_or_create_session_memory(session_id: str) -> LearningMemory:
    """
    Get or create learning memory for a user session.
    
    Args:
        session_id (str): The user's session ID
    
    Returns:
        LearningMemory: The user's learning memory
    """
    if session_id not in session_memory:
        session_memory[session_id] = LearningMemory()
    return session_memory[session_id]


@app.get("/api/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "version": "2.0.0", "database": "MongoDB", "authentication": "JWT"}


@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Unified chat endpoint using SuperBear LangGraph.
    
    Automatically detects intent and routes to research, therapy, or both.

    Request body:
    {
        "message": "user's message text",
        "session_id": "optional session identifier"
    }

    Returns merged response based on detected intent.
    """
    try:
        # Load user's memory from MongoDB
        memory_doc = await db.memories.find_one({"user_id": str(current_user.id)})

        # Build user profile from authenticated user
        user_profile = {
            "name": current_user.username or current_user.email,
            "email": current_user.email,
            "trading_level": getattr(current_user, "trading_level", "beginner"),
            "learning_style": getattr(current_user, "learning_style", "visual"),
            "risk_tolerance": getattr(current_user, "risk_tolerance", "medium"),
        }

        # Create initial state for SuperBear graph
        state = AgentState(
            user_message=request.message,
            user_id=str(current_user.id),
            user_profile=user_profile,
            memory_doc=memory_doc or {},
            session_id=request.session_id or "default",
            timestamp=datetime.now().isoformat(),
            intent="both",  # Will be determined by intent_node
            confidence=0.0,
        )

        # Run SuperBear graph - automatic intent detection & routing
        result = await superbear_graph.ainvoke(state)

        # Update memory with new teachings/emotions
        if not memory_doc:
            memory_doc = {
                "user_id": str(current_user.id),
                "concepts_taught": [],
                "emotional_patterns": [],
            }

        if result.research_output:
            memory_doc["concepts_taught"].append({
                "concept": result.research_output.get("learning_concept"),
                "explanation": result.research_output.get("teaching_explanation"),
                "timestamp": result.timestamp,
            })

        if result.therapy_output:
            memory_doc["emotional_patterns"].append({
                "emotion": result.therapy_output.get("emotional_state"),
                "trigger": request.message[:100],  # Store first 100 chars as trigger
                "timestamp": result.timestamp,
            })

        # Save updated memory to MongoDB
        await db.memories.update_one(
            {"user_id": str(current_user.id)},
            {"$set": memory_doc},
            upsert=True,
        )

        logger.info(f"Chat request from user: {current_user.email}, intent: {result.intent}")
        return result.final_output or {"error": "No output generated"}

    except Exception as e:
        logger.error(f"Error in /api/chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/therapy")
async def therapy(
    request: TherapyRequest,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Therapy endpoint - Convenience route for wellness-focused messages.
    
    Routes to SuperBear LangGraph with intent classification.
    Emotionally-focused messages are automatically routed to therapy mode.

    Request body:
    {
        "message": "user's emotional concern or question"
    }

    Returns wellness-focused response with emotional support and coping strategies.
    """
    try:
        # Load user's memory from MongoDB
        memory_doc = await db.memories.find_one({"user_id": str(current_user.id)})

        # Build user profile from authenticated user
        user_profile = {
            "name": current_user.username or current_user.email,
            "email": current_user.email,
            "trading_level": getattr(current_user, "trading_level", "beginner"),
            "learning_style": getattr(current_user, "learning_style", "visual"),
            "risk_tolerance": getattr(current_user, "risk_tolerance", "medium"),
        }

        # Create initial state for SuperBear graph
        state = AgentState(
            user_message=request.message,
            user_id=str(current_user.id),
            user_profile=user_profile,
            memory_doc=memory_doc or {},
            session_id=request.session_id or "therapy-default",
            timestamp=datetime.now().isoformat(),
            intent="both",  # Will be determined by intent_node
            confidence=0.0,
        )

        # Run SuperBear graph - automatic intent detection & routing
        result = await superbear_graph.ainvoke(state)

        # Update memory with new emotional patterns
        if not memory_doc:
            memory_doc = {
                "user_id": str(current_user.id),
                "concepts_taught": [],
                "emotional_patterns": [],
            }

        if result.therapy_output:
            memory_doc["emotional_patterns"].append({
                "emotion": result.therapy_output.get("emotional_state"),
                "trigger": request.message[:100],
                "timestamp": result.timestamp,
            })

        if result.research_output:
            memory_doc["concepts_taught"].append({
                "concept": result.research_output.get("learning_concept"),
                "timestamp": result.timestamp,
            })

        # Save updated memory to MongoDB
        await db.memories.update_one(
            {"user_id": str(current_user.id)},
            {"$set": memory_doc},
            upsert=True,
        )

        logger.info(f"Therapy request from user: {current_user.email}, intent: {result.intent}")
        return result.final_output or {"error": "No output generated"}

    except Exception as e:
        logger.error(f"Error in /api/therapy: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# Include authentication router
app.include_router(auth_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, reload=True)
