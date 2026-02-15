"""
Trade Explain Node — SuperBear Graph (Deep Trade Diagnostic Engine)

Generates deep, structured analysis of a specific trade, contextualised by
the user's trade_type, knowledge gaps, curriculum module, and detected emotion.

Features:
- Server-side P&L computation (never let LLM calculate profit)
- Knowledge gap linking (correlates mistakes to weak concepts)
- Curriculum reinforcement (suggests relevant modules)
- Emotion-adaptive tone (supportive for frustrated, analytical for calm)
- Structured JSON output with compliance safeguards
"""

import logging
from typing import Optional, Dict, Any, List
from agent.state import AgentState
from services.llm_service import llm_service
from services.trade_service import (
    get_latest_trade,
    get_trade_by_id,
    compute_trade_metrics,
)
from services.reflection_service import get_learning_profile

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Deep Trade Analysis Prompt (Compliance-Safe)
# ---------------------------------------------------------------------------
DEEP_TRADE_ANALYSIS_PROMPT = """\
You are SuperBear, an expert trading educator conducting a deep trade analysis.

SAFETY REQUIREMENTS (CRITICAL - MUST FOLLOW):
- Do NOT provide buy/sell signals or recommendations
- Do NOT predict future price movements
- Do NOT promise or guarantee profits
- Stay purely educational and analytical
- Focus on learning from the trade, not making money

TRADER PROFILE:
- Trading Level: {trading_level}
- Learning Style: {learning_style}
- Trade Type Classification: {trade_type}

TRADE DATA (Server-computed - DO NOT recalculate):
- Symbol: {symbol}
- Entry Price: ${entry_price}
- Exit Price: ${exit_price}
- Profit/Loss: {pnl_direction} of {percentage_pnl}%
- Holding Duration: {holding_duration}

CURRICULUM CONTEXT:
- Current Module Topic: {current_module_topic}
- Student's Weak Concepts: {weak_concepts}
- Recommended Focus Areas: {recommended_focus}

EMOTIONAL STATE: {detected_emotion}

HISTORICAL BEHAVIORAL PATTERNS:
{behavioral_history}

TONE INSTRUCTION:
{tone_instruction}

USER'S QUESTION:
"{user_message}"

Analyze this trade thoroughly and respond with ONLY this JSON structure:
{{
  "trade_summary": "<objective 1-2 sentence summary of the trade outcome>",
  "technical_analysis": {{
    "entry_quality": "<was entry timing good, premature, or late? explain>",
    "exit_quality": "<was exit optimal, premature profit-taking, or late?>",
    "risk_management": "<position sizing, stop-loss usage assessment>"
  }},
  "behavioral_analysis": {{
    "bias_detected": "<confirmation bias, loss aversion, overconfidence, FOMO, or none>",
    "emotional_pattern": "<calm execution, panic selling, greedy holding, etc.>"
  }},
  "core_mistake": "<the primary mistake or 'none - trade executed well'>",
  "linked_knowledge_gap": "<which weak concept from their profile this relates to, or 'none'>",
  "recommended_lesson_topic": "<specific topic they should study, matching curriculum if possible>",
  "improvement_framework": [
    "<specific actionable improvement #1>",
    "<specific actionable improvement #2>",
    "<specific actionable improvement #3>"
  ],
  "tone_style_used": "<supportive | neutral | analytical>"
}}

Remember: Be educational, empathetic if needed, and growth-oriented.
Respond with ONLY valid JSON.
"""


# ---------------------------------------------------------------------------
# Fallback prompt when no trade data available
# ---------------------------------------------------------------------------
CONCEPTUAL_TRADE_EXPLAIN_PROMPT = """\
You are SuperBear, an expert trading educator.

A trader is asking about a trade or trading scenario, but no specific trade data
is available. Provide educational guidance based on their question.

TRADER PROFILE:
- Trading Level: {trading_level}
- Learning Style: {learning_style}
- Trade Type: {trade_type}

CURRICULUM CONTEXT:
- Current Module: {current_module_topic}
- Weak Concepts: {weak_concepts}

EMOTIONAL STATE: {detected_emotion}

HISTORICAL BEHAVIORAL PATTERNS:
{behavioral_history}

TONE INSTRUCTION:
{tone_instruction}

USER'S QUESTION:
"{user_message}"

Respond with ONLY this JSON:
{{
  "what_happened": "<interpret what they're describing or asking about>",
  "general_analysis": "<educational analysis of the scenario>",
  "common_mistakes": "<typical mistakes related to this scenario>",
  "linked_knowledge_gap": "<which weak concept this might relate to>",
  "recommended_lesson_topic": "<topic they should study>",
  "improvement_suggestion": "<actionable advice>",
  "tone_style_used": "<supportive | neutral | analytical>"
}}

SAFETY: Do NOT give trading signals, price predictions, or profit guarantees.
Respond with ONLY valid JSON.
"""


def _join(items) -> str:
    """Safely join a list to a comma-separated string."""
    if isinstance(items, list):
        return ", ".join(str(i) for i in items) or "none"
    return str(items) if items else "none"


def _get_tone_instruction(detected_emotion: Optional[str]) -> str:
    """
    Generate tone instruction based on detected emotion.
    
    Emotion-adaptive teaching:
    - Frustrated/anxious: Validating, supportive, non-judgmental
    - Confident: Analytical, direct, challenge-oriented
    - Calm/neutral: Balanced, structured  
    """
    emotion = (detected_emotion or "calm").lower()
    
    if emotion in ("frustrated", "anxious", "stressed", "upset", "disappointed"):
        return (
            "The student appears {emotion}. Use a calm, validating, non-judgmental tone. "
            "Acknowledge that losses are part of learning. Emphasize growth mindset. "
            "Avoid accusatory language like 'you should have' or 'your mistake was'. "
            "Instead use 'one opportunity for improvement' or 'next time, consider'."
        ).format(emotion=emotion)
    
    elif emotion in ("confident", "excited", "eager"):
        return (
            "The student appears confident. Use a direct, analytical tone. "
            "Challenge them to think deeper about their decision-making process. "
            "Be straightforward about what went well and what could improve."
        )
    
    else:  # calm, neutral, curious
        return (
            "Use a structured, educational teaching tone. "
            "Be balanced - acknowledge both positives and areas for improvement. "
            "Focus on building systematic trading habits."
        )


def _find_matching_module_index(
    curriculum: Optional[Dict[str, Any]], 
    recommended_topic: str
) -> Optional[int]:
    """
    Find if recommended lesson topic matches an existing curriculum module.
    
    Returns module index if found, None otherwise.
    """
    if not curriculum or not recommended_topic:
        return None
    
    modules = curriculum.get("modules", [])
    recommended_lower = recommended_topic.lower()
    
    for i, module in enumerate(modules):
        module_topic = module.get("topic", "").lower()
        # Check for keyword overlap
        if any(word in module_topic for word in recommended_lower.split() if len(word) > 3):
            return i
    
    return None


async def trade_explain_node(state: AgentState) -> AgentState:
    """
    Perform deep trade diagnostic analysis.
    
    Flow:
    1. Check if trade_data is in state (from API endpoint)
    2. If not, try to load user's most recent trade
    3. Compute metrics server-side (NEVER let LLM calculate P&L)
    4. Build emotion-adaptive prompt
    5. Call LLM for structured analysis
    6. Link to curriculum modules if applicable
    
    Populates ``state.research_output`` for the merge node.
    """
    profile = state.user_profile or {}
    gaps = state.knowledge_gaps or {}
    
    # Extract curriculum context
    current_module_topic = ""
    if state.current_module and isinstance(state.current_module, dict):
        current_module_topic = state.current_module.get("topic", "")
    
    # Determine emotional tone
    detected_emotion = state.detected_emotion or state.emotional_state or "calm"
    tone_instruction = _get_tone_instruction(detected_emotion)
    
    # ----- Trade Data Handling -----
    trade_data = state.trade_data
    metrics = None

    # ----- Load behavioral history from learning profile -----
    behavioral_history = "No historical patterns available yet."
    try:
        learning_profile = await get_learning_profile(state.user_id)
        parts = []
        bps = learning_profile.get("behavioral_pattern_summary")
        if bps:
            parts.append(f"Behavioral tendency: {bps}")
        rm = learning_profile.get("repeated_mistakes", [])
        if rm:
            parts.append(f"Repeated mistakes: {', '.join(rm[:5])}")
        et = learning_profile.get("emotional_tendencies", [])
        if et:
            parts.append(f"Emotional tendencies: {', '.join(et)}")
        if parts:
            behavioral_history = "\n".join(parts)
    except Exception as e:
        logger.debug(f"[trade_explain] Could not load learning profile: {e}")
    
    # If no trade_data in state, try to load the latest trade
    if not trade_data:
        try:
            latest_trade = await get_latest_trade(state.user_id)
            if latest_trade:
                trade_data = latest_trade
                metrics = compute_trade_metrics(latest_trade)
                logger.info(f"[trade_explain] Loaded latest trade for user {state.user_id}")
        except Exception as e:
            logger.warning(f"[trade_explain] Could not load latest trade: {e}")
    else:
        # trade_data was provided - compute metrics
        metrics = compute_trade_metrics(trade_data)
    
    try:
        if metrics:
            # ----- Deep Analysis Mode (with trade data) -----
            prompt = DEEP_TRADE_ANALYSIS_PROMPT.format(
                trading_level=profile.get("trading_level", "beginner"),
                learning_style=profile.get("learning_style", "visual"),
                trade_type=state.trade_type or "unknown",
                symbol=metrics.get("symbol", "UNKNOWN"),
                entry_price=metrics.get("entry_price", 0),
                exit_price=metrics.get("exit_price", 0),
                pnl_direction=metrics.get("direction", "unknown"),
                percentage_pnl=metrics.get("percentage_pnl", 0),
                holding_duration=metrics.get("holding_duration_str", "unknown"),
                current_module_topic=current_module_topic or "N/A",
                weak_concepts=_join(gaps.get("weak_concepts")),
                recommended_focus=_join(gaps.get("recommended_focus")),
                detected_emotion=detected_emotion,
                behavioral_history=behavioral_history,
                tone_instruction=tone_instruction,
                user_message=state.user_message,
            )
            
            response = await llm_service.call_gemini_json(prompt)
            
            # Find matching curriculum module if applicable
            suggested_module_index = _find_matching_module_index(
                state.current_curriculum,
                response.get("recommended_lesson_topic", "")
            )
            
            state.research_output = {
                "type": "trade_diagnostic",
                "trade_id": trade_data.get("_id") if trade_data else None,
                "trade_metrics": metrics,
                "trade_summary": response.get("trade_summary"),
                "technical_analysis": response.get("technical_analysis"),
                "behavioral_analysis": response.get("behavioral_analysis"),
                "core_mistake": response.get("core_mistake"),
                "linked_knowledge_gap": response.get("linked_knowledge_gap"),
                "recommended_lesson_topic": response.get("recommended_lesson_topic"),
                "suggested_module_index": suggested_module_index,
                "improvement_framework": response.get("improvement_framework", []),
                "tone_style_used": response.get("tone_style_used", "neutral"),
            }
            
            logger.info(
                f"[trade_explain] Deep analysis complete for user {state.user_id}: "
                f"{metrics.get('direction')} of {metrics.get('percentage_pnl')}%"
            )
        
        else:
            # ----- Conceptual Mode (no trade data) -----
            prompt = CONCEPTUAL_TRADE_EXPLAIN_PROMPT.format(
                trading_level=profile.get("trading_level", "beginner"),
                learning_style=profile.get("learning_style", "visual"),
                trade_type=state.trade_type or "unknown",
                current_module_topic=current_module_topic or "N/A",
                weak_concepts=_join(gaps.get("weak_concepts")),
                detected_emotion=detected_emotion,
                behavioral_history=behavioral_history,
                tone_instruction=tone_instruction,
                user_message=state.user_message,
            )
            
            response = await llm_service.call_gemini_json(prompt)
            
            suggested_module_index = _find_matching_module_index(
                state.current_curriculum,
                response.get("recommended_lesson_topic", "")
            )
            
            state.research_output = {
                "type": "trade_explain_conceptual",
                "what_happened": response.get("what_happened"),
                "general_analysis": response.get("general_analysis"),
                "common_mistakes": response.get("common_mistakes"),
                "linked_knowledge_gap": response.get("linked_knowledge_gap"),
                "recommended_lesson_topic": response.get("recommended_lesson_topic"),
                "suggested_module_index": suggested_module_index,
                "improvement_suggestion": response.get("improvement_suggestion"),
                "tone_style_used": response.get("tone_style_used", "neutral"),
            }
            
            logger.info(f"[trade_explain] Conceptual analysis for user {state.user_id}")
    
    except Exception as e:
        logger.error(f"Trade explain node error: {e}")
        state.research_output = {
            "type": "trade_explain_error",
            "error": "Unable to analyze trade at this time.",
            "fallback_advice": "Consider reviewing your entry and exit criteria systematically.",
        }
    
    state.research_complete = True
    return state
