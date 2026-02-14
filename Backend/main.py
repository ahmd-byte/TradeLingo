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
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from agent.graph import superbear_graph
from agent.state import AgentState
from database import connect_to_mongo, close_mongo_connection, get_database
from auth.schemas import UserResponse
from auth.routes import router as auth_router
from auth.dependencies import get_current_active_user
from routes.trade_routes import router as trade_router
from routes.education_routes import router as education_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

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
    docs_url="/docs",
    openapi_url="/openapi.json",
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


# Maximum number of memory entries to keep per array
MEMORY_CAP = 50


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to TradeLingo API", "version": "2.0.0", "docs": "/docs"}


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
        database = get_database()

        # Load user's memory from MongoDB
        memory_doc = await database["memories"].find_one({"user_id": str(current_user.id)})

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

        research_output = result.get("research_output")
        therapy_output = result.get("therapy_output")

        if research_output:
            memory_doc.setdefault("concepts_taught", []).append({
                "concept": research_output.get("learning_concept"),
                "explanation": research_output.get("teaching_explanation"),
                "timestamp": result.get("timestamp"),
            })

        if therapy_output:
            memory_doc.setdefault("emotional_patterns", []).append({
                "emotion": therapy_output.get("emotional_state"),
                "trigger": request.message[:100],  # Store first 100 chars as trigger
                "timestamp": result.get("timestamp"),
            })

        # Cap arrays to the most recent MEMORY_CAP entries
        memory_doc["concepts_taught"] = memory_doc.get("concepts_taught", [])[-MEMORY_CAP:]
        memory_doc["emotional_patterns"] = memory_doc.get("emotional_patterns", [])[-MEMORY_CAP:]

        # Save updated memory to MongoDB
        await database["memories"].update_one(
            {"user_id": str(current_user.id)},
            {"$set": memory_doc},
            upsert=True,
        )

        logger.info(f"Chat request from user: {current_user.email}, intent: {result.get('intent')}")
        return result.get("final_output") or {"error": "No output generated"}

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
        database = get_database()

        # Load user's memory from MongoDB
        memory_doc = await database["memories"].find_one({"user_id": str(current_user.id)})

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

        therapy_output = result.get("therapy_output")
        research_output = result.get("research_output")

        if therapy_output:
            memory_doc.setdefault("emotional_patterns", []).append({
                "emotion": therapy_output.get("emotional_state"),
                "trigger": request.message[:100],
                "timestamp": result.get("timestamp"),
            })

        if research_output:
            memory_doc.setdefault("concepts_taught", []).append({
                "concept": research_output.get("learning_concept"),
                "timestamp": result.get("timestamp"),
            })

        # Cap arrays to the most recent MEMORY_CAP entries
        memory_doc["concepts_taught"] = memory_doc.get("concepts_taught", [])[-MEMORY_CAP:]
        memory_doc["emotional_patterns"] = memory_doc.get("emotional_patterns", [])[-MEMORY_CAP:]

        # Save updated memory to MongoDB
        await database["memories"].update_one(
            {"user_id": str(current_user.id)},
            {"$set": memory_doc},
            upsert=True,
        )

        logger.info(f"Therapy request from user: {current_user.email}, intent: {result.get('intent')}")
        return result.get("final_output") or {"error": "No output generated"}

    except Exception as e:
        logger.error(f"Error in /api/therapy: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# Include authentication router
app.include_router(auth_router)

# Include trade history router
app.include_router(trade_router)

# Include education pipeline router
app.include_router(education_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, reload=True)
