"""
Curriculum Modify Node — SuperBear Graph

Triggered when the user asks to adjust, simplify, or change their
learning plan. Uses LLM to propose modifications and persists the
updated module in MongoDB.
"""

import logging
from datetime import datetime, timezone

from bson import ObjectId
from database import get_database
from agent.state import AgentState
from services.llm_service import llm_service

logger = logging.getLogger(__name__)

CURRICULUM_MODIFY_PROMPT = """\
You are SuperBear, a personalised trading curriculum designer.

The student wants to adjust their learning plan.

Student profile:
- Trading level: {trading_level}
- Learning style: {learning_style}
- Trade type: {trade_type}

Current module:
{current_module}

Student request:
"{user_message}"

Decide how to adjust the curriculum and respond with ONLY this JSON:
{{
  "adjustment_type": "simplified | advanced | refocused | style_change",
  "new_focus": "A short description of the adjusted focus",
  "updated_module": {{
    "topic": "...",
    "difficulty": "beginner | intermediate | advanced",
    "explanation_style": "...",
    "estimated_duration": "..."
  }}
}}

ONLY respond with valid JSON, no other text.
"""


async def curriculum_modify_node(state: AgentState) -> AgentState:
    """
    Adjust the current curriculum module based on user feedback.

    Updates the ``lesson_plans`` document in MongoDB and puts the
    result into ``state.research_output`` so merge_node can surface it.
    """
    profile = state.user_profile or {}
    current_module = state.current_module or {}

    prompt = CURRICULUM_MODIFY_PROMPT.format(
        trading_level=profile.get("trading_level", "beginner"),
        learning_style=profile.get("learning_style", "visual"),
        trade_type=state.trade_type or "unknown",
        current_module=str(current_module) if current_module else "No active module",
        user_message=state.user_message,
    )

    try:
        response = await llm_service.call_gemini_json(prompt)

        # Persist the updated module back to MongoDB
        updated_module = response.get("updated_module", current_module)
        await _persist_module_update(state.user_id, updated_module)

        state.research_output = {
            "type": "curriculum_modify",
            "adjustment_type": response.get("adjustment_type"),
            "new_focus": response.get("new_focus"),
            "updated_module": updated_module,
        }
    except Exception as e:
        logger.error(f"Curriculum modify node error: {e}")
        state.research_output = None

    state.research_complete = True
    return state


async def _persist_module_update(user_id: str, updated_module: dict):
    """Overwrite the current module in the latest lesson plan."""
    db = get_database()
    lesson_plan = await db["lesson_plans"].find_one(
        {"user_id": user_id},
        sort=[("created_at", -1)],
    )
    if not lesson_plan:
        return

    module_index = lesson_plan.get("current_module_index", 0)
    modules = lesson_plan.get("modules", [])
    if module_index < len(modules):
        modules[module_index] = updated_module

    await db["lesson_plans"].update_one(
        {"_id": lesson_plan["_id"]},
        {
            "$set": {
                "modules": modules,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    logger.info(f"[curriculum] Updated module {module_index} for user {user_id}")
