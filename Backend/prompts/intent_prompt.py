"""
Intent Classification Prompt

Builds prompts to classify user intent (research vs therapy vs both).
"""

from typing import Optional, Dict, Any


def build_intent_prompt(
    user_message: str,
    memory_doc: Optional[Dict[str, Any]] = None,
    trading_level: str = "beginner",
) -> str:
    """
    Build prompt for intent classification.

    Classifies whether user needs:
    - research: Trading education/concepts
    - therapy: Emotional support/coaching
    - both: Both modes needed

    Args:
        user_message: User's input message
        memory_doc: User's memory document from MongoDB
        trading_level: User's trading level (beginner/intermediate/advanced)

    Returns:
        Prompt string for LLM
    """

    # Prepare memory context
    memory_context = ""
    if memory_doc:
        concepts_count = len(memory_doc.get("concepts_taught", []))
        emotional_patterns = memory_doc.get("emotional_patterns", [])
        memory_context = f"""
User Learning History:
- Concepts taught: {concepts_count}
- Emotional patterns recorded: {len(emotional_patterns)}
"""

    prompt = f"""You are an expert at understanding trading educator needs. Classify the user's message into one of three categories:

1. "research": User is asking for trading education, concepts, market mechanics, strategies, analysis
2. "therapy": User is expressing emotions, anxiety, fear, seeking psychological support or coping strategies
3. "both": User needs both educational content AND emotional support

User Trading Level: {trading_level}

{memory_context}

User Message:
"{user_message}"

Respond with this EXACT JSON format:
{{
    "intent": "research|therapy|both",
    "confidence": 0.0-1.0,
    "emotional_state": "calm|anxious|frustrated|excited|confused|nervous|confident|peaceful|null",
    "reasoning": "Brief explanation of classification"
}}

ONLY respond with valid JSON, no other text."""

    return prompt
