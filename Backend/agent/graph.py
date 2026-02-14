"""
SuperBear LangGraph Definition and Execution

Curriculum-aware workflow with mastery detection:
Input → Load Learning Context → Intent → Conditional Routing → Branch Node → Mastery Detection → Merge → Output
"""

from langgraph.graph import StateGraph, START, END
from agent.state import AgentState
from agent.nodes import (
    input_node,
    intent_node,
    research_node,
    therapy_node,
    merge_node,
    load_learning_context_node,
    trade_explain_node,
    curriculum_modify_node,
    mastery_detection_node,
)


def create_superbear_graph():
    """
    Build the curriculum-aware SuperBear LangGraph workflow with mastery detection.

    Workflow:
    1. START → input_node
    2. input_node → load_learning_context (fetch curriculum + trade_type)
    3. load_learning_context → classify (intent detection)
    4. classify → conditional routing:
         trade_explain      → trade_explain_node
         lesson_question    → research_node (lesson-aware)
         curriculum_modify  → curriculum_modify_node
         emotional_support  → therapy_node
         general_question   → research_node (fallback)
    5. branch node → mastery_detection_node (tracks progress & detects understanding)
    6. mastery_detection_node → merge_node
    7. merge_node → END

    Returns:
        Compiled LangGraph workflow
    """

    graph_builder = StateGraph(AgentState)

    # Add all nodes
    graph_builder.add_node("input", input_node)
    graph_builder.add_node("load_context", load_learning_context_node)
    graph_builder.add_node("classify", intent_node)
    graph_builder.add_node("research", research_node)
    graph_builder.add_node("therapy", therapy_node)
    graph_builder.add_node("trade_explain", trade_explain_node)
    graph_builder.add_node("curriculum_modify", curriculum_modify_node)
    graph_builder.add_node("mastery_detection", mastery_detection_node)  # NEW
    graph_builder.add_node("merge", merge_node)

    # Linear flow: input → load_context → classify
    graph_builder.add_edge(START, "input")
    graph_builder.add_edge("input", "load_context")
    graph_builder.add_edge("load_context", "classify")

    # Conditional routing based on intent
    def route_based_on_intent(state: AgentState):
        intent = state.intent
        if intent == "trade_explain":
            return "trade_explain"
        elif intent == "curriculum_modify":
            return "curriculum_modify"
        elif intent == "emotional_support":
            return "therapy"
        else:
            # lesson_question, general_question, or any unknown
            return "research"

    graph_builder.add_conditional_edges(
        "classify",
        route_based_on_intent,
        {
            "trade_explain": "trade_explain",
            "curriculum_modify": "curriculum_modify",
            "therapy": "therapy",
            "research": "research",
        },
    )

    # All branch nodes converge to mastery detection (NEW flow)
    graph_builder.add_edge("trade_explain", "mastery_detection")
    graph_builder.add_edge("curriculum_modify", "mastery_detection")
    graph_builder.add_edge("therapy", "mastery_detection")
    graph_builder.add_edge("research", "mastery_detection")

    # Mastery detection leads to merge
    graph_builder.add_edge("mastery_detection", "merge")

    # Final output
    graph_builder.add_edge("merge", END)

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
