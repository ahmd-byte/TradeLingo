# app.py
"""
TradeLingo Flask Application
Integrates the Single AI Trading Tutor Agent with Flask.
Provides REST API endpoints for the React frontend.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests as http_requests
from dotenv import load_dotenv
from agent import run_agent
from memory import LearningMemory

load_dotenv()

# Sheety API configuration (optional external storage)
PROFILES_ENDPOINT = os.getenv("PROFILES_ENDPOINT", "")
TRADES_ENDPOINT = os.getenv("TRADES_ENDPOINT", "")
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {os.getenv('SHEETY_TOKEN', '')}"
}

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Session memory (in production, use persistent storage like Redis or DB)
session_memory = {}


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

def get_or_create_session_memory(session_id):
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


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"})


@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Chat endpoint for SuperBear.
    
    Expects JSON body:
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
        "trade_data": {  // optional
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
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400
        
        message = data.get("message", "")
        session_id = data.get("session_id", "default")
        
        # Build user profile (use defaults if not provided)
        user_profile = data.get("user_profile", {
            "name": "User",
            "tradingLevel": "beginner",
            "learningStyle": "visual",
            "riskTolerance": "medium",
            "preferredMarkets": "Stocks",
            "tradingFrequency": "weekly"
        })
        
        # Add the user's message as a question
        user_profile["user_question"] = message
        
        trade_data = data.get("trade_data", None)
        
        # Get session memory
        memory = get_or_create_session_memory(session_id)
        
        # Prepare input for agent
        input_data = {
            "user_profile": user_profile,
            "trade_data": trade_data,
            "user_question": message
        }
        
        # Run the agent
        response, updated_memory = run_agent(input_data, memory=memory)
        
        # Update session memory
        session_memory[session_id] = updated_memory
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error in /api/chat: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/therapy", methods=["POST"])
def therapy():
    """
    Therapy chat endpoint for Trading Therapy Bear.
    Focuses on emotional support and trading psychology around recent trades.
    
    Expects JSON body:
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
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body provided"}), 400
        
        message = data.get("message", "")
        session_id = data.get("session_id", "therapy-default")
        
        user_profile = data.get("user_profile", {
            "name": "Friend",
            "tradingLevel": "beginner",
            "learningStyle": "visual",
            "riskTolerance": "medium",
            "preferredMarkets": "Stocks",
            "tradingFrequency": "weekly"
        })
        
        user_profile["user_question"] = message
        
        trade_data = data.get("trade_data", None)
        
        # Get session memory
        memory = get_or_create_session_memory(session_id)
        
        # Build observation & analysis (reuse existing helpers)
        from prompts import build_observation_context, build_analysis_context, build_memory_summary
        from prompts.therapy_prompt import build_therapy_prompt
        from services.llm_service import LLMService
        
        observation = build_observation_context(
            trade_data=trade_data,
            user_question=message
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
                context=message
            )
        if trade_data:
            memory.add_trade_summary(trade_data, analysis=response.get("acknowledgment", ""))
        
        session_memory[session_id] = memory
        
        return jsonify(response)
    
    except Exception as e:
        print(f"Error in /api/therapy: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
