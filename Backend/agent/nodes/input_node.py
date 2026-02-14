"""
Input Node: Entry point for user messages

Validates and parses user input, extracts metadata.
"""

from agent.state import AgentState


async def input_node(state: AgentState) -> AgentState:
    """
    Parse user input and extract metadata.

    Validations:
    - Message length minimum
    - Message content validation

    Returns:
        Updated state ready for intent detection
    """

    # Validate message
    if not state.user_message or len(state.user_message.strip()) < 3:
        raise ValueError("Message too short. Please provide more context.")

    # The message is valid - proceed to next node
    # Any preprocessing can happen here

    return state
