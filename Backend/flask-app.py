# app.py
"""
TradeLingo Flask Application
Integrates the Single AI Trading Tutor Agent with Flask and Sheety backend.
"""

from flask import Flask, render_template, request
import requests
import os
from dotenv import load_dotenv
from agent import run_agent
from memory import LearningMemory

load_dotenv()

template_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Frontend/templates'))
app = Flask(__name__, template_folder=template_dir)

# Sheety Configuration
PROFILES_ENDPOINT = os.getenv("PROFILES_SHEETY_ENDPOINT")
TRADES_ENDPOINT = os.getenv("PAST_TRADES_SHEETY_ENDPOINT")
SHEETY_TOKEN = os.getenv("SHEETY_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {SHEETY_TOKEN}",
    "Content-Type": "application/json"
}

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
    response = requests.post(PROFILES_ENDPOINT, json=payload, headers=HEADERS)
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
    response = requests.post(TRADES_ENDPOINT, json=payload, headers=HEADERS)
    if response.status_code not in [200, 201]:
        print("Failed to post trade:", response.text)
        return None
    return response.json()

def get_or_create_session_memory(profile_id):
    """
    Get or create learning memory for a user session.
    
    In a production app, this would load from a database or Redis.
    For now, we use an in-memory dictionary.
    
    Args:
        profile_id (str): The user's profile ID from Sheety
    
    Returns:
        LearningMemory: The user's learning memory
    """
    if profile_id not in session_memory:
        session_memory[profile_id] = LearningMemory()
    return session_memory[profile_id]


def run_tutor_agent(profile_data, trade_data=None):
    """
    Run the Tutor Agent with the user's profile and optional trade data.
    
    Args:
        profile_data (dict): User profile from form
        trade_data (dict): Optional trade data from form
    
    Returns:
        dict: Structured response from the agent
    """
    # Get or create session memory for this user
    profile_id = profile_data.get("id", "temp")
    memory = get_or_create_session_memory(profile_id)
    
    # Prepare input for agent
    input_data = {
        "user_profile": profile_data,
        "trade_data": trade_data if trade_data else None,
        "user_question": profile_data.get("user_question", None)
    }
    
    # Run the agent
    response, updated_memory = run_agent(input_data, memory=memory)
    
    # Update session memory
    session_memory[profile_id] = updated_memory
    
    return response

def format_agent_response_for_html(agent_response):
    """
    Format the structured agent response for HTML display.
    
    Converts the JSON response fields into a readable HTML format.
    
    Args:
        agent_response (dict): Structured response from the agent
    
    Returns:
        dict: Formatted response ready for template rendering
    """
    formatted = {
        "observation": agent_response.get("observation", ""),
        "analysis": agent_response.get("analysis", ""),
        "learning_concept": agent_response.get("learning_concept", ""),
        "why_it_matters": agent_response.get("why_it_matters", ""),
        "teaching_explanation": format_text_to_html(agent_response.get("teaching_explanation", "")),
        "teaching_example": format_text_to_html(agent_response.get("teaching_example", "")),
        "actionable_takeaway": agent_response.get("actionable_takeaway", ""),
        "next_learning_suggestion": agent_response.get("next_learning_suggestion", "")
    }
    
    return formatted


def format_text_to_html(text):
    """
    Convert plain text to simple HTML.
    
    Handles:
    - Line breaks
    - Bold (**text**)
    - Italic (*text*)
    
    Args:
        text (str): Plain text with markdown-like formatting
    
    Returns:
        str: HTML formatted text
    """
    import re
    
    html = text
    
    # Bold
    html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', html)
    
    # Italic
    html = re.sub(r'\*(.+?)\*', r'<em>\1</em>', html)
    
    # Line breaks
    html = html.replace('\n', '<br>')
    
    return html


@app.route("/", methods=["GET", "POST"])
def index():
    """
    Main Flask route.
    
    Handles:
    1. Form submission (GET: show form, POST: process)
    2. Profile creation via Sheety
    3. Trade recording via Sheety (optional)
    4. Agent execution and response formatting
    5. Rendering structured education content
    """
    agent_response = None
    error_message = None
    
    if request.method == "POST":
        form = request.form
        try:
            # Step 1: Create user profile
            profile_id, profile_resp = create_profile(form)
            profile_data = profile_resp.get("profiling", {})
            
            # Step 2: Record trade (optional)
            trade_data = None
            stock_code = form.get("stock_code")
            stock_name = form.get("stock_name")
            
            if stock_code or stock_name:
                trade_resp = post_trade(form, profile_id)
                if trade_resp:
                    trade_data = trade_resp.get("pasttrade", {})
            
            # Step 3: Run the tutor agent
            llm_response = run_tutor_agent(profile_data, trade_data=trade_data)
            
            # Step 4: Format for HTML display
            agent_response = format_agent_response_for_html(llm_response)
        
        except Exception as e:
            error_message = str(e)
    
    return render_template(
        "index.html",
        agent_response=agent_response,
        error_message=error_message
    )


# @app.route("/", methods=["GET", "POST"])
# def index():
#     if request.method == "POST":
#         form = request.form
#         try:
#             profile_id, profile_resp = create_profile(form)
#             print("Profile created:", profile_resp)

#             trade_resp = post_trade(form, profile_id)
#             if trade_resp:
#                 print("Trade posted:", trade_resp)
#         except Exception as e:
#             return str(e)

#         return redirect("/")

#     return render_template("index.html")


if __name__ == "__main__":
    app.run(debug=True)
