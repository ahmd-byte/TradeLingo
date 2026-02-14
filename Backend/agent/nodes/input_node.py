"""
Input Node: Entry point for user messages

Validates and parses user input, extracts metadata.
"""

from agent.state import AgentState


async def input_node(state: AgentState) -> dict:
    """
    Parse and normalize user input.

    Validations:
    - Message length minimum (3 characters after stripping)
    - Message content validation

    Returns:
        Dict with 'user_message' key containing the stripped/normalized
        user input, i.e. {"user_message": state["user_message"].strip()}.
        This updates the state by normalizing whitespace in the user's message.
    """

    # Validate message
    if not state.user_message or len(state.user_message.strip()) < 3:
        raise ValueError("Message too short. Please provide more context.")

    # The message is valid - pass through the cleaned message
    return {"user_message": state.user_message.strip()}
