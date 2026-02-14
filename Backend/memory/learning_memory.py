"""
Learning Memory Module
Manages lightweight session memory for the tutor agent.
Tracks concepts taught, observed mistakes, and recent trades.

Note on interaction tracking:
- Session-level interactions: Tracked in LearningMemory (in-memory, per session)
- Module-level interactions: Tracked in lesson_plans via progress_service (persistent)

The mastery_detection_node automatically updates persistent interaction counts
in MongoDB when processing educational messages. LearningMemory remains 
lightweight and suitable for session-scoped context.
"""

import json
from datetime import datetime


class LearningMemory:
    """
    Lightweight session memory for the tutor agent.
    Stores concepts taught, observed mistakes, and trade summaries.
    """
    
    def __init__(self):
        """Initialize empty memory structure."""
        self.data = {
            "session_start": datetime.now().isoformat(),
            "concepts_taught": [],
            "observed_mistakes": [],
            "recent_trade_summaries": [],
            "interaction_count": 0,
            "learning_focus_areas": [],
            "user_feedback": []
        }
    
    def add_concept(self, concept_name, explanation="", timestamp=None):
        """
        Record a concept that was taught.
        
        Args:
            concept_name (str): Name of the concept
            explanation (str): Brief explanation (optional)
            timestamp (str): ISO timestamp (auto-generated if not provided)
        """
        timestamp = timestamp or datetime.now().isoformat()
        self.data["concepts_taught"].append({
            "concept": concept_name,
            "explanation": explanation,
            "timestamp": timestamp
        })
    
    def add_mistake(self, mistake_type, description="", context="", timestamp=None):
        """
        Record an observed mistake or knowledge gap.
        
        Args:
            mistake_type (str): Type of mistake (e.g., "risk management", "technical analysis")
            description (str): Description of the mistake
            context (str): Context where the mistake occurred
            timestamp (str): ISO timestamp (auto-generated if not provided)
        """
        timestamp = timestamp or datetime.now().isoformat()
        self.data["observed_mistakes"].append({
            "type": mistake_type,
            "description": description,
            "context": context,
            "timestamp": timestamp
        })
    
    def add_trade_summary(self, trade_data, analysis="", timestamp=None):
        """
        Record a summary of a recent trade.
        
        Args:
            trade_data (dict): Trade information
            analysis (str): Brief analysis of the trade
            timestamp (str): ISO timestamp (auto-generated if not provided)
        """
        timestamp = timestamp or datetime.now().isoformat()
        self.data["recent_trade_summaries"].append({
            "trade": trade_data,
            "analysis": analysis,
            "timestamp": timestamp
        })
    
    def add_focus_area(self, area, priority=1):
        """
        Mark a learning focus area.
        
        Args:
            area (str): The learning area
            priority (int): Priority level (1-5, where 5 is highest)
        """
        self.data["learning_focus_areas"].append({
            "area": area,
            "priority": priority
        })
    
    def increment_interaction(self):
        """Record that another interaction has occurred."""
        self.data["interaction_count"] += 1
    
    def add_feedback(self, feedback, feedback_type="general"):
        """
        Record user feedback.
        
        Args:
            feedback (str): The feedback text
            feedback_type (str): Type of feedback (e.g., "positive", "negative", "clarification")
        """
        self.data["user_feedback"].append({
            "feedback": feedback,
            "type": feedback_type,
            "timestamp": datetime.now().isoformat()
        })
    
    def get_concepts_taught(self):
        """Return list of concepts taught."""
        return self.data["concepts_taught"]
    
    def get_recent_mistakes(self, limit=5):
        """Return recent mistakes (up to limit)."""
        return self.data["observed_mistakes"][-limit:]
    
    def get_recent_trades(self, limit=3):
        """Return recent trade summaries (up to limit)."""
        return self.data["recent_trade_summaries"][-limit:]
    
    def get_focus_areas(self):
        """Return learning focus areas."""
        return self.data["learning_focus_areas"]
    
    def serialize(self):
        """Return memory as JSON-serializable dict."""
        return self.data.copy()
    
    @staticmethod
    def deserialize(data):
        """
        Restore memory from serialized data.
        
        Args:
            data (dict): Serialized memory data
        
        Returns:
            LearningMemory: Restored memory object
        """
        memory = LearningMemory()
        memory.data = data.copy()
        return memory


def initialize_memory():
    """
    Factory function to create a new LearningMemory instance.
    
    Returns:
        LearningMemory: New memory instance
    """
    return LearningMemory()


def update_memory(memory, event_type, event_data):
    """
    Update memory based on event type (helper function).
    
    Args:
        memory (LearningMemory): The memory object to update
        event_type (str): Type of event ("concept_taught", "mistake_observed", "trade_recorded", etc.)
        event_data (dict): Event data
    """
    if event_type == "concept_taught":
        memory.add_concept(event_data.get("concept"), event_data.get("explanation", ""))
    elif event_type == "mistake_observed":
        memory.add_mistake(event_data.get("type"), event_data.get("description", ""))
    elif event_type == "trade_recorded":
        memory.add_trade_summary(event_data.get("trade", {}), event_data.get("analysis", ""))
    elif event_type == "focus_area":
        memory.add_focus_area(event_data.get("area"), event_data.get("priority", 1))
    elif event_type == "user_feedback":
        memory.add_feedback(event_data.get("feedback", ""), event_data.get("type", "general"))
    
    memory.increment_interaction()


def serialize_memory(memory):
    """
    Serialize memory to JSON string.
    
    Args:
        memory (LearningMemory): The memory object to serialize
    
    Returns:
        str: JSON string representation
    """
    return json.dumps(memory.serialize(), indent=2, default=str)
