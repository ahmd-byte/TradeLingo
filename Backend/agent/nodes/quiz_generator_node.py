"""
Quiz Generator Node — Education Pipeline

Uses Gemini (via LLMService) to produce a 5-question diagnostic quiz
tailored to the user's trading level, trade type, preferred market, and
learning style.
"""

import logging
from agent.education_state import EducationState
from services.llm_service import llm_service

logger = logging.getLogger(__name__)

QUIZ_PROMPT_TEMPLATE = """\
You are a trading education expert. Create a 5-question multiple-choice diagnostic quiz.

Student profile:
- Trading level: {trading_level}
- Trade type: {trade_type}
- Preferred market: {preferred_market}
- Learning style: {learning_style}

RULES:
1. Each question MUST have exactly 4 answer choices in the "options" array.
2. Each question MUST have a "correct_answer" field (integer 0-3) indicating which option is correct.
3. Each question tests a DIFFERENT core trading concept.
4. The "options" field is REQUIRED for every question — do NOT omit it.

Return ONLY this exact JSON structure, nothing else:

{{"questions":[{{"question":"What is a bull market?","options":["Rising prices","Falling prices","Sideways movement","High volatility"],"correct_answer":0,"concept_tested":"Market Trends"}},{{"question":"<q2>","options":["<a>","<b>","<c>","<d>"],"correct_answer":0,"concept_tested":"<concept>"}},{{"question":"<q3>","options":["<a>","<b>","<c>","<d>"],"correct_answer":0,"concept_tested":"<concept>"}},{{"question":"<q4>","options":["<a>","<b>","<c>","<d>"],"correct_answer":0,"concept_tested":"<concept>"}},{{"question":"<q5>","options":["<a>","<b>","<c>","<d>"],"correct_answer":0,"concept_tested":"<concept>"}}]}}

Replace ALL placeholder values above with real trading questions appropriate for the student's level.
"""


async def quiz_generator_node(state: EducationState) -> dict:
    """
    Generate a 5-question diagnostic quiz via LLM.

    Returns:
        Partial state update with ``quiz_questions``.
    """
    profile = state.get("profile", {})
    trade_type = state.get("trade_type") or "unknown"

    prompt = QUIZ_PROMPT_TEMPLATE.format(
        trading_level=profile.get("trading_level", "beginner"),
        trade_type=trade_type,
        preferred_market=profile.get("preferred_market", "stocks"),
        learning_style=profile.get("learning_style", "visual"),
    )

    result = await llm_service.call_gemini_json(prompt)

    questions = result.get("questions", [])

    # Validate and fix: ensure every question has options
    validated = []
    for q in questions:
        if not isinstance(q, dict):
            continue
        if "options" not in q or not isinstance(q.get("options"), list) or len(q["options"]) < 2:
            logger.warning(f"[education] Question missing options, adding defaults: {q.get('question', '')[:50]}")
            q["options"] = [
                "I know this well",
                "I have some idea",
                "I've heard of it but unsure",
                "Not sure"
            ]
            q["correct_answer"] = None  # no grading for fallback
        validated.append(q)

    logger.info(f"[education] Generated {len(validated)} quiz questions for user {state.get('user_id')}")

    return {"quiz_questions": validated}
