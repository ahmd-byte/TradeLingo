"""
Intent Node: Intent classification and routing

Detects user's primary intent and emotional state using LLM.
Supports curriculum-aware intent categories:
  trade_explain, lesson_question, curriculum_modify,
  emotional_support, general_question
"""

from agent.state import AgentState
from services.llm_service import llm_service


INTENT_PROMPT_TEMPLATE = """\
You are an expert at understanding trading education needs.
Classify the user's message into ONE of these categories:

1. "trade_explain"       - User asks about a specific trade, wants analysis of a position or market move
2. "lesson_question"     - User asks a conceptual / educational question about trading
3. "curriculum_modify"   - User explicitly asks to change, simplify, skip, or adjust their learning plan
4. "emotional_support"   - User expresses emotions (anxiety, frustration, fear) and needs psychological coaching
5. "general_question"    - Anything else (greetings, off-topic, unclear)

Additional context:
- Trading level: {trading_level}
- Has curriculum: {has_curriculum}
- Current module topic: {current_module_topic}
- Detected emotion: {detected_emotion}

User message:
"{user_message}"

Respond with this EXACT JSON (no other text):
{{
    "intent": "trade_explain|lesson_question|curriculum_modify|emotional_support|general_question",
    "confidence": 0.0,
    "emotional_state": "calm|anxious|frustrated|excited|confused|nervous|confident|peaceful|null",
    "reasoning": "Brief explanation"
}}
"""


async def intent_node(state: AgentState) -> AgentState:
    """
    Detect user intent and emotional state using LLM.

    Curriculum-aware routing:
        trade_explain      → trade_explain_node
        lesson_question    → research_node (lesson-aware)
        curriculum_modify  → curriculum_modify_node
        emotional_support  → therapy_node
        general_question   → research_node (fallback)

    Returns:
        State with intent, confidence, emotional_state, and detected_emotion populated
    """
    profile = state.user_profile or {}
    has_curriculum = state.current_curriculum is not None
    current_module_topic = ""
    if state.current_module and isinstance(state.current_module, dict):
        current_module_topic = state.current_module.get("topic", "")

    prompt = INTENT_PROMPT_TEMPLATE.format(
        trading_level=profile.get("trading_level", "beginner"),
        has_curriculum=has_curriculum,
        current_module_topic=current_module_topic or "N/A",
        detected_emotion=state.detected_emotion or "unknown",
        user_message=state.user_message,
    )

    try:
        response = await llm_service.call_gemini_json(prompt)

        state.intent = response.get("intent", "general_question")
        state.confidence = response.get("confidence", 0.5)
        state.emotional_state = response.get("emotional_state")

        # Propagate detected_emotion for downstream nodes
        if state.emotional_state and not state.detected_emotion:
            state.detected_emotion = state.emotional_state

    except Exception as e:
        # Fallback — safe default
        print(f"Intent detection error: {e}")
        state.intent = "general_question"
        state.confidence = 0.0
        state.emotional_state = None

    return state
