"""
Education Pipeline State

TypedDict shared across all nodes in the Education LangGraph workflow.
This graph is NOT conversational — it drives a structured onboarding pipeline.
"""

from typing import TypedDict, Optional


class EducationState(TypedDict, total=False):
    """State flowing through the education pipeline graph."""

    # Identifiers
    user_id: str

    # User profile extracted from MongoDB
    profile: dict

    # Derived trade classification (may be None / "unknown")
    trade_type: Optional[str]

    # Phase 1 outputs
    quiz_questions: list  # list of {"question": ..., "concept_tested": ...}

    # Phase 2 inputs (injected externally between phases)
    quiz_answers: list  # list of answer strings

    # Phase 2 outputs
    knowledge_gaps: dict  # strong_concepts, weak_concepts, etc.
    curriculum: dict  # learning_objective, modules, progression_strategy
