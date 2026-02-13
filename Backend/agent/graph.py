"""
SuperBear LangGraph Definition and Execution

Builds and executes the graph workflow:
User Input → Intent → Conditional Routing → Research/Therapy (Parallel) → Merge → Output
"""

from langgraph.graph import StateGraph, START, END
from agent.state import AgentState
from agent.nodes import input_node, intent_node, research_node, therapy_node, merge_node


def create_superbear_graph():
    """
    Build the SuperBear LangGraph workflow.

    Workflow:
    1. START → input_node (validate input)
    2. input_node → intent_node (classify intent)
    3. intent_node → conditional routing based on intent
       - research: → research_node
       - therapy: → therapy_node
       - both: → [research_node, therapy_node] (parallel)
    4. research_node → merge_node
    5. therapy_node → merge_node
    6. merge_node → END (return final output)

    Returns:
        Compiled LangGraph workflow
    """

    graph_builder = StateGraph(AgentState)

    # Add nodes to graph
    graph_builder.add_node("input", input_node)
    graph_builder.add_node("intent", intent_node)
    graph_builder.add_node("research", research_node)
    graph_builder.add_node("therapy", therapy_node)
    graph_builder.add_node("merge", merge_node)

    # Add edges: Linear flow through input and intent
    graph_builder.add_edge(START, "input")
    graph_builder.add_edge("input", "intent")

    # Conditional routing based on detected intent
    def route_based_on_intent(state: AgentState):
        """Route to research, therapy, or both based on detected intent."""
        if state.intent == "research":
            return ["research"]
        elif state.intent == "therapy":
            return ["therapy"]
        else:  # "both"
            return ["research", "therapy"]

    graph_builder.add_conditional_edges(
        "intent",
        route_based_on_intent,
        {"research": "research", "therapy": "therapy"},
    )

    # Converge both research and therapy back to merge
    graph_builder.add_edge("research", "merge")
    graph_builder.add_edge("therapy", "merge")

    # Final output
    graph_builder.add_edge("merge", END)

    # Compile graph
    return graph_builder.compile()


# Create singleton graph instance
superbear_graph = create_superbear_graph()


async def run_superbear(state: AgentState) -> AgentState:
    """
    Execute the SuperBear graph with a given state.

    Args:
        state: Initial AgentState with user_message, user_id, etc.

    Returns:
        Final AgentState with final_output populated
    """
    result = await superbear_graph.ainvoke(state)
    return result


async def stream_superbear(state: AgentState):
    """
    Stream the SuperBear graph execution for real-time output.

    Args:
        state: Initial AgentState with user_message, user_id, etc.

    Yields:
        Events as graph executes through each node
    """
    async for event in superbear_graph.astream(state, stream_mode="updates"):
        yield event
