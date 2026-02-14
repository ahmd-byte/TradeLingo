"""
Input Node: Entry point for user messages

Validates and parses user input, extracts metadata.
"""

from agent.state import AgentState


async def input_node(state: AgentState) -> dict:
    """
    Parse user input and extract metadata.

    Validations:
    - Message length minimum
    - Message content validation

    Returns:
        Empty dict (no state changes needed)
    """

    # Validate message
    if not state.get("user_message") or len(state["user_message"].strip()) < 3:
        raise ValueError("Message too short. Please provide more context.")

    # The message is valid - pass through the cleaned message
    return {"user_message": state["user_message"].strip()}
