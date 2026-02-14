"""
AgentState Definition for SuperBear LangGraph Workflow

Shared state passed between all nodes in the graph.
"""

from typing import Optional, List, Dict, Literal, Any
from pydantic import BaseModel, Field


class AgentState(BaseModel):
    """
    Shared state that flows through all nodes in the SuperBear graph.
    Each node updates relevant fields and passes to next node.
    """

    # Input
    user_message: str
    user_id: str
    user_profile: Dict[str, Any]

    # Intent detection (expanded for curriculum-aware routing)
    intent: str = "general_question"
    confidence: float = 0.0
    emotional_state: Optional[str] = None  # "calm", "anxious", "frustrated", etc.
    detected_emotion: Optional[str] = None  # populated before intent classification

    # Curriculum-aware context (loaded from MongoDB)
    current_curriculum: Optional[Dict[str, Any]] = None
    knowledge_gaps: Optional[Dict[str, Any]] = None
    current_module: Optional[Dict[str, Any]] = None
    trade_type: Optional[str] = None

    # Research node output
    research_output: Optional[Dict[str, Any]] = None
    research_complete: bool = False

    # Therapy node output
    therapy_output: Optional[Dict[str, Any]] = None
    therapy_complete: bool = False

    # Mastery detection output
    mastery_result: Optional[Dict[str, Any]] = None

    # Memory
    memory_doc: Optional[Dict] = None

    # Final merged output
    final_output: Optional[Dict[str, Any]] = None

    # Metadata
    timestamp: str
    session_id: str

    class Config:
        arbitrary_types_allowed = True
