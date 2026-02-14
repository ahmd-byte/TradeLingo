"""
AgentState Definition for SuperBear LangGraph Workflow

Shared state passed between all nodes in the graph.
"""

from typing import Optional, Dict, Literal, Any, TypedDict


class AgentState(TypedDict, total=False):
    """
    Shared state that flows through all nodes in the SuperBear graph.
    Each node returns a dict of only the fields it updates.
    """

    # Input (required)
    user_message: str
    user_id: str
    user_profile: Dict[str, Any]

    # Intent detection
    intent: Literal["research", "therapy", "both"]
    confidence: float
    emotional_state: Optional[str]  # "calm", "anxious", "frustrated", etc.

    # Research node output
    research_output: Optional[Dict[str, Any]]
    research_complete: bool

    # Therapy node output
    therapy_output: Optional[Dict[str, Any]]
    therapy_complete: bool

    # Memory
    memory_doc: Optional[Dict]

    # Final merged output
    final_output: Optional[Dict[str, Any]]

    # Metadata
    timestamp: str
    session_id: str
