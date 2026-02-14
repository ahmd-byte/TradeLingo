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

    # Intent detection
    intent: Literal["research", "therapy", "both"] = "both"
    confidence: float = 0.0
    emotional_state: Optional[str] = None  # "calm", "anxious", "frustrated", etc.

    # Research node output
    research_output: Optional[Dict[str, Any]] = None
    research_complete: bool = False

    # Therapy node output
    therapy_output: Optional[Dict[str, Any]] = None
    therapy_complete: bool = False

    # Memory
    memory_doc: Optional[Dict] = None

    # Final merged output
    final_output: Optional[Dict[str, Any]] = None

    # Metadata
    timestamp: str
    session_id: str

    class Config:
        arbitrary_types_allowed = True
