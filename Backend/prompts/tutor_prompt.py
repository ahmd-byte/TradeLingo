"""
Tutor Prompt Module
Builds structured prompts for the tutor agent's decision loop.
Handles: observe, analyze, decide, teach steps.
"""

import json


def build_tutor_prompt(profile, observation, analysis_input, memory_summary):
    """
    Build a structured prompt for the tutor agent.
    
    Guides the agent through:
    1. OBSERVE: What about the user's situation?
    2. ANALYZE: What patterns or gaps exist?
    3. DECIDE: What ONE concept to teach?
    4. TEACH: Explain it clearly and educationally.
    
    Args:
        profile (dict): User profile with trading level, learning style, etc.
        observation (dict): Current observation data (trade, question, context)
        analysis_input (dict): Input for analysis (past mistakes, trades, etc.)
        memory_summary (dict): Summary of what was already taught
    
    Returns:
        str: Prompt to send to Gemini
    """
    
    prompt = f"""
You are an EDUCATIONAL AI Trading Tutor. Your role is to help users understand trading concepts, 
decision-making, and risk management—NOT to give trading advice or buy/sell signals.

You must follow a structured decision loop:
1. OBSERVE: What is the user's situation?
2. ANALYZE: What concepts or reasoning gaps are present?
3. DECIDE: What ONE learning concept should be taught next?
4. TEACH: Provide a clear, structured lesson appropriate to their level.

=== USER PROFILE ===
- Name: {profile.get('name', 'User')}
- Trading Level: {profile.get('tradingLevel', 'Unknown')}
- Learning Style: {profile.get('learningStyle', 'Unknown')}
- Risk Tolerance: {profile.get('riskTolerance', 'Unknown')}
- Preferred Markets: {profile.get('preferredMarkets', 'Unknown')}
- Trading Frequency: {profile.get('tradingFrequency', 'Unknown')}

=== CURRENT SITUATION ===
{json.dumps(observation, indent=2)}

=== CONTEXT (Past Teaching & Mistakes) ===
{json.dumps(analysis_input, indent=2)}

=== MEMORY (Already Taught) ===
Number of concepts taught: {memory_summary.get('concepts_count', 0)}
Concepts: {', '.join([c.get('concept', '') for c in memory_summary.get('concepts', [])][:5]) if memory_summary.get('concepts') else 'None yet'}
Recent mistakes: {', '.join([m.get('type', '') for m in memory_summary.get('mistakes', [])][:3]) if memory_summary.get('mistakes') else 'None observed'}

=== YOUR TASK ===
Follow this exact structure and respond ONLY with JSON (no markdown, no code blocks).

1. OBSERVE: Describe what you see in the user's situation
2. ANALYZE: What patterns, gaps, or opportunities for learning exist?
3. DECIDE: Choose ONE concept to teach (be specific: "Price Action Reversal Patterns", "Position Sizing", etc.)
4. TEACH: Provide a clear explanation appropriate for a {profile.get('learningStyle', 'visual')} learner at {profile.get('tradingLevel', 'intermediate')} level

WHY_IT_MATTERS: Explain why this concept is important for their trading journey

NEXT_LEARNING_SUGGESTION: What should they focus on next time?

=== RESPONSE FORMAT ===
You MUST respond with ONLY valid JSON (no markdown markers). Include these fields:
{{
  "observation": "Your brief description of what you observed",
  "analysis": "Your analysis of patterns and gaps",
  "learning_concept": "The exact name of the concept to teach",
  "why_it_matters": "Why this matters for the user",
  "teaching_explanation": "Clear explanation of the concept (2-3 paragraphs, no markdown)",
  "teaching_example": "A practical example relevant to their markets/style",
  "actionable_takeaway": "One specific thing they can do immediately",
  "next_learning_suggestion": "What to focus on in their next interaction"
}}

Remember:
- NEVER give buy/sell signals
- NEVER recommend specific securities
- FOCUS on reasoning quality and concepts
- Keep teaching clear and actionable
- Match their learning style and level
"""
    
    return prompt.strip()


def build_observation_context(trade_data=None, user_question=None, context=""):
    """
    Build observation data dictionary.
    
    Args:
        trade_data (dict): Trade information if available
        user_question (str): User's question or context
        context (str): Additional context
    
    Returns:
        dict: Observation data
    """
    observation = {
        "type": "trade" if trade_data else "general_question",
        "context": context or "User seeking trading education"
    }
    
    if trade_data:
        observation["trade"] = trade_data
    
    if user_question:
        observation["question"] = user_question
    
    return observation


def build_analysis_context(past_mistakes=None, recent_trades=None, focus_areas=None):
    """
    Build analysis context from memory and past data.
    
    Args:
        past_mistakes (list): List of past mistakes
        recent_trades (list): List of recent trades
        focus_areas (list): Learning focus areas
    
    Returns:
        dict: Analysis context
    """
    return {
        "observed_mistakes": past_mistakes or [],
        "recent_trades": recent_trades or [],
        "focus_areas": focus_areas or []
    }


def build_memory_summary(memory_obj):
    """
    Build a summary of memory for context in prompts.
    
    Args:
        memory_obj: LearningMemory object
    
    Returns:
        dict: Memory summary
    """
    concepts = memory_obj.get_concepts_taught()
    mistakes = memory_obj.get_recent_mistakes(limit=5)
    
    return {
        "concepts_count": len(concepts),
        "concepts": concepts,
        "mistakes": mistakes,
        "interaction_count": memory_obj.data.get("interaction_count", 0),
        "focus_areas": memory_obj.get_focus_areas()
    }
