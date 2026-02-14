"""
Research Prompt Engineering

Builds prompts for the research node to generate educational trading content.
"""

from typing import Optional, Dict, List, Any


def build_research_prompt(
    user_message: str,
    user_profile: Dict[str, Any],
    concepts_taught: List[Dict[str, Any]] = None,
    memory_doc: Optional[Dict[str, Any]] = None,
) -> str:
    """
    Build prompt for educational research node.

    OADT Loop:
    - OBSERVE: Analyze the user's question/trade context
    - ANALYZE: Identify knowledge gaps and learning level
    - DECIDE: Choose appropriate concept to teach
    - TEACH: Generate structured educational response

    Args:
        user_message: User's question or trade description
        user_profile: User profile (level, style, risk tolerance)
        concepts_taught: Previously taught concepts (avoid repetition)
        memory_doc: Full memory document

    Returns:
        Prompt string for LLM
    """

    if concepts_taught is None:
        concepts_taught = []

    # Build concepts list
    taught_concepts = "- User has not been taught any concepts yet"
    if concepts_taught:
        concept_names = [c.get("concept", "Unknown") for c in concepts_taught[-5:]]  # Last 5
        taught_concepts = "- Previously taught: " + ", ".join(concept_names)

    # Build response format
    prompt = f"""You are SuperBear, an expert trading educator. Your role is to teach trading concepts through the OADT framework:
- OBSERVE: Understand what the user is asking or experiencing
- ANALYZE: Identify knowledge gaps and personalize to their level
- DECIDE: Choose the most appropriate concept to teach
- TEACH: Provide a clear, actionable lesson

USER PROFILE:
- Trading Level: {user_profile.get('trading_level', 'beginner')}
- Learning Style: {user_profile.get('learning_style', 'visual')}
- Risk Tolerance: {user_profile.get('risk_tolerance', 'medium')}

LEARNING HISTORY:
{taught_concepts}

USER QUESTION/CONTEXT:
"{user_message}"

**IMPORTANT GUIDELINES**:
1. Never provide buy/sell signals or specific stock recommendations
2. Focus on concepts, reasoning, and market mechanics
3. If user asks something already taught multiple times, provide fresh perspective
4. Always include real-world examples relevant to their level
5. End with ONE actionable takeaway
6. Suggest next concept to learn

Respond with this EXACT JSON format:
{{
    "observation": "What is the user asking/experiencing? What context matters?",
    "analysis": "What patterns or gaps did you identify? How does this relate to their level?",
    "learning_concept": "The key concept to teach (e.g., 'Position Sizing', 'Risk Management')",
    "why_it_matters": "Why is this concept important for their trading journey?",
    "teaching_explanation": "2-3 paragraph clear, simple explanation of the concept",
    "teaching_example": "Concrete real-world example relevant to their level and experience",
    "actionable_takeaway": "ONE specific action they can take today to apply this",
    "next_learning_suggestion": "What concept should they learn next?"
}}

ONLY respond with valid JSON, no other text."""

    return prompt
