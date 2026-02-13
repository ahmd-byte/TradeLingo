# main.py
"""
TradeLingo FastAPI Application
Integrates the Single AI Trading Tutor Agent with FastAPI.
Provides REST API endpoints with JWT authentication and MongoDB.
"""

import logging
import os
from contextlib import asynccontextmanager
import requests as http_requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from agent import run_agent
from memory import LearningMemory
from database import connect_to_mongo, close_mongo_connection
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
    close_mongo_connection()


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
    Chat endpoint for SuperBear.
    
    Request body:
    {
        "message": "user's message text",
        "session_id": "optional session identifier",
        "user_profile": {
            "name": "...",
            "tradingLevel": "beginner|intermediate|advanced",
            "learningStyle": "visual|reading|hands-on",
            "riskTolerance": "low|medium|high",
            "preferredMarkets": "...",
            "tradingFrequency": "..."
        },
        "trade_data": {
            "stockCode": "...",
            "stockName": "...",
            "action": "buy|sell",
            "units": "...",
            "price": "...",
            "date": "..."
        }
    }
    
    Returns JSON:
    {
        "observation": "...",
        "analysis": "...",
        "learning_concept": "...",
        "why_it_matters": "...",
        "teaching_explanation": "...",
        "teaching_example": "...",
        "actionable_takeaway": "...",
        "next_learning_suggestion": "..."
    }
    """
    try:
        # Use authenticated user's profile as base
        user_profile = request.user_profile.model_dump() if request.user_profile else {
            "name": current_user.username or current_user.email,
            "tradingLevel": current_user.trading_level,
            "learningStyle": current_user.learning_style,
            "riskTolerance": current_user.risk_tolerance,
            "preferredMarkets": current_user.preferred_markets,
            "tradingFrequency": current_user.trading_frequency
        }
        
        # Add the user's message as a question
        user_profile["user_question"] = request.message
        
        # Get session memory
        memory = get_or_create_session_memory(request.session_id)
        
        # Prepare input for agent
        input_data = {
            "user_profile": user_profile,
            "trade_data": request.trade_data.model_dump(exclude_none=True) if request.trade_data else None,
            "user_question": request.message
        }
        
        # Run the agent
        response, updated_memory = run_agent(input_data, memory=memory)
        
        # Update session memory
        session_memory[request.session_id] = updated_memory
        
        logger.info(f"Chat request from user: {current_user.email}")
        return response
    
    except Exception as e:
        logger.error(f"Error in /api/chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/therapy")
async def therapy(
    request: TherapyRequest,
    current_user: UserResponse = Depends(get_current_active_user)
):
    """
    Therapy chat endpoint for Trading Therapy Bear.
    Focuses on emotional support and trading psychology around recent trades.
    
    Request body:
    {
        "message": "user's message text",
        "session_id": "optional session identifier",
        "user_profile": { ... },
        "trade_data": { ... }
    }
    
    Returns JSON:
    {
        "acknowledgment": "...",
        "emotional_insight": "...",
        "therapeutic_question": "...",
        "coping_strategy": "...",
        "encouragement": "...",
        "emotional_pattern": "..."
    }
    """
    try:
        # Use authenticated user's profile as base
        user_profile = request.user_profile.model_dump() if request.user_profile else {
            "name": current_user.username or current_user.email,
            "tradingLevel": current_user.trading_level,
            "learningStyle": current_user.learning_style,
            "riskTolerance": current_user.risk_tolerance,
            "preferredMarkets": current_user.preferred_markets,
            "tradingFrequency": current_user.trading_frequency
        }
        
        user_profile["user_question"] = request.message
        
        # Get session memory
        memory = get_or_create_session_memory(request.session_id)
        
        # Build observation & analysis (reuse existing helpers)
        from prompts import build_observation_context, build_analysis_context, build_memory_summary
        from prompts.therapy_prompt import build_therapy_prompt
        from services.llm_service import LLMService
        
        trade_data = request.trade_data.model_dump(exclude_none=True) if request.trade_data else None
        
        observation = build_observation_context(
            trade_data=trade_data,
            user_question=request.message
        )
        
        analysis = build_analysis_context(
            past_mistakes=memory.get_recent_mistakes(limit=5),
            recent_trades=memory.get_recent_trades(limit=3),
            focus_areas=memory.get_focus_areas()
        )
        
        memory_summary = build_memory_summary(memory)
        
        prompt = build_therapy_prompt(
            profile=user_profile,
            observation=observation,
            analysis_input=analysis,
            memory_summary=memory_summary
        )
        
        llm = LLMService()
        response = llm.call_gemini_json(prompt)
        
        # Update memory
        memory.increment_interaction()
        if response.get("emotional_pattern"):
            memory.add_mistake(
                mistake_type=response["emotional_pattern"],
                description=response.get("emotional_insight", ""),
                context=request.message
            )
        if trade_data:
            memory.add_trade_summary(trade_data, analysis=response.get("acknowledgment", ""))
        
        session_memory[request.session_id] = memory
        
        logger.info(f"Therapy request from user: {current_user.email}")
        return response
    
    except Exception as e:
        logger.error(f"Error in /api/therapy: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Include authentication router
app.include_router(auth_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=5000, reload=True)
