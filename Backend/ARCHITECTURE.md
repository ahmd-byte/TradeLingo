# AI ARCHITECTURE DOCUMENTATION
## TradeLingo SuperBear AI Agent System — LangGraph Edition

### Overview

**Purpose**: Unified AI mentor for trading education and emotional wellness using agentic workflows

**Architecture**: Graph-based workflow using LangGraph for dynamic routing

**Core Concept**: User input → Intent Detection → Conditional Routing → Parallel Processing → Merged Response

**SuperBear Capabilities**:
- 📚 **Research Node**: Structured trading concepts & market education
- 🐻 **Therapy Node**: Trading psychology & emotional resilience coaching
- 🧠 **Memory System**: Tracks learning journey & emotional patterns
- 🎓 **Intelligent Routing**: Automatically detects user needs and routes to appropriate node
- 🔄 **Dynamic Merging**: Combines insights from both nodes when needed

**LLM**: Google Gemini 2.5 Flash Lite for reasoning and response generation

**Framework**: LangGraph for agentic state machines and conditional routing

---

## Module Structure

```
Backend/
├── agent/                        # SuperBear LangGraph Agent
│   ├── __init__.py
│   ├── graph.py                 # SuperBear graph definition & execution
│   ├── nodes/                   # Graph nodes
│   │   ├── __init__.py
│   │   ├── input_node.py        # Entry point: parse user input
│   │   ├── intent_node.py       # Detect: therapy vs research vs both
│   │   ├── research_node.py     # Educational: trading concepts
│   │   ├── therapy_node.py      # Wellness: psychology coaching
│   │   └── merge_node.py        # Combine outputs from parallel nodes
│   └── state.py                 # AgentState definition
│
├── memory/                       # Learning memory management
│   ├── __init__.py
│   └── learning_memory.py       # LearningMemory: tracks teaching & emotional patterns
│
├── prompts/                      # Prompt engineering
│   ├── __init__.py
│   ├── intent_prompt.py         # Intent classification prompts
│   ├── research_prompt.py       # Educational content generation
│   └── therapy_prompt.py        # Wellness coaching prompts
│
├── services/                     # LLM integration
│   ├── __init__.py
│   └── llm_service.py           # Gemini API wrapper with JSON parsing
│
└── test_agent.py                # Unit tests for SuperBear graph
```

---

## SuperBear Graph Architecture

### Graph Workflow

```
User Input
    ↓
┌───────────────────┐
│  INPUT NODE       │ - Parse user message
│  - Parse message  │ - Extract metadata
│  - Validate input │
└────────┬──────────┘
         ↓
┌───────────────────────────┐
│  CLASSIFY NODE            │ - Classify intent
│  - Run LLM classification │ - Analyze emotional state
│  - Determine routing      │
└────────┬──────────────────┘
         ↓
    ┌────────────────────────────────┐
    │  CONDITIONAL EDGE              │
    │  Routes to: therapy / research │
    └─────┬──────────────────┬────────┘
          │                  │
    ┌─────▼────┐      ┌──────▼──────┐
    │ THERAPY   │      │ RESEARCH    │
    │ NODE      │      │ NODE        │
    │           │      │             │
    │ - Validate│      │ - Analyze   │
    │   emotion │      │   trade/Q   │
    │ - Empath. │      │ - Generate  │
    │   respond │      │   concepts  │
    │ - Coach   │      │ - Educate   │
    └─────┬─────┘      └──────┬──────┘
          │                  │
          └──────┬───────────┘
                 ↓
        ┌────────────────────┐
        │  MERGE NODE        │
        │  - Combine outputs │
        │  - Prioritize      │
        │  - Format response │
        └────────┬───────────┘
                 ↓
        ┌────────────────────┐
        │  FINAL OUTPUT      │
        │  - Return JSON     │
        │  - Update memory   │
        └────────────────────┘
```

---

## Graph Nodes

### 1. agent/state.py

**AgentState** - Shared state across all nodes

```python
from typing import Optional, List, Dict, Literal, Any
from pydantic import BaseModel

class AgentState(BaseModel):
    """
    Shared state passed between nodes in the SuperBear graph.
    """
    # Input
    user_message: str
    user_id: str
    user_profile: Dict[str, Any]
    
    # Intent detection
    intent: Literal["research", "therapy", "both"]
    confidence: float
    emotional_state: Optional[str]  # "calm", "anxious", "frustrated", etc.
    
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
```

---

### 2. agent/nodes/input_node.py

**Purpose**: Entry point - parse and validate user input

```python
async def input_node(state: AgentState) -> AgentState:
    """
    Parse user input and extract metadata.
    
    Returns:
        Updated state ready for intent detection
    """
    # Validate message
    if not state.user_message or len(state.user_message) < 5:
        raise ValueError("Message too short")
    
    # Extract metadata
    # - Detect if includes trade data
    # - Identify emotional keywords
    # - Check for market context
    
    return state
```

---

### 3. agent/nodes/intent_node.py

**Purpose**: Classify user intent - therapy vs research vs both

```python
async def intent_node(state: AgentState) -> AgentState:
    """
    Detect user's primary intent and emotional state using LLM.
    
    Routes to:
    - 'therapy': Emotional support needed
    - 'research': Educational content needed
    - 'both': Both are needed
    """
    
    intent_prompt = build_intent_prompt(state.user_message, state.memory_doc)
    
    response = await llm.call_gemini_json(intent_prompt)
    
    state.intent = response["intent"]
    state.confidence = response["confidence"]
    state.emotional_state = response.get("emotional_state")
    
    return state
```

**Intent Classification Output**:
```json
{
  "intent": "therapy",
  "confidence": 0.85,
  "emotional_state": "anxiety",
  "reasoning": "User mentions 'panic selling' and '5% drop scared me'"
}
```

---

### 4. agent/nodes/research_node.py

**Purpose**: Generate educational content on trading topics

```python
async def research_node(state: AgentState) -> AgentState:
    """
    Research/Educational mode: Teach trading concepts.
    
    OBSERVE → ANALYZE → DECIDE → TEACH
    """
    
    # Only run if intent is "research" or "both"
    if state.intent not in ["research", "both"]:
        state.research_complete = True
        return state
    
    # Load memory for context
    concepts_taught = state.memory_doc.get("concepts_taught", [])
    
    # Build educational prompt
    research_prompt = build_research_prompt(
        user_message=state.user_message,
        user_profile=state.user_profile,
        memory=concepts_taught
    )
    
    # Get educational response from LLM
    response = await llm.call_gemini_json(research_prompt)
    
    state.research_output = {
        "observation": response.get("observation"),
        "analysis": response.get("analysis"),
        "learning_concept": response.get("learning_concept"),
        "why_it_matters": response.get("why_it_matters"),
        "teaching_explanation": response.get("teaching_explanation"),
        "teaching_example": response.get("teaching_example"),
        "actionable_takeaway": response.get("actionable_takeaway"),
        "next_learning_suggestion": response.get("next_learning_suggestion")
    }
    
    state.research_complete = True
    
    return state
```

---

### 5. agent/nodes/therapy_node.py

**Purpose**: Generate emotional wellness & psychology coaching

```python
async def therapy_node(state: AgentState) -> AgentState:
    """
    Wellness/Therapy mode: Coach emotional resilience.
    
    VALIDATE → ANALYZE → COACH → EMPOWER
    """
    
    # Only run if intent is "therapy" or "both"
    if state.intent not in ["therapy", "both"]:
        state.therapy_complete = True
        return state
    
    # Load emotional patterns from memory
    emotional_patterns = state.memory_doc.get("emotional_patterns", [])
    
    # Build therapy prompt
    therapy_prompt = build_therapy_prompt(
        user_message=state.user_message,
        emotional_state=state.emotional_state,
        emotional_patterns=emotional_patterns,
        user_profile=state.user_profile
    )
    
    # Get wellness response from LLM
    response = await llm.call_gemini_json(therapy_prompt)
    
    state.therapy_output = {
        "emotional_state": response.get("emotional_state"),
        "validation": response.get("validation"),
        "perspective": response.get("perspective"),
        "coping_strategy": response.get("coping_strategy"),
        "educational_focus": response.get("educational_focus"),
        "actionable_steps": response.get("actionable_steps"),
        "encouragement": response.get("encouragement")
    }
    
    state.therapy_complete = True
    
    return state
```

---

### 6. agent/nodes/merge_node.py

**Purpose**: Combine outputs from parallel research and therapy nodes

```python
async def merge_node(state: AgentState) -> AgentState:
    """
    Merge research and therapy outputs based on intent.
    
    Priority:
    - intent="therapy" → therapy first, research as context
    - intent="research" → research first, therapy as support
    - intent="both" → balanced combination
    """
    
    if state.intent == "research":
        # Research-focused
        state.final_output = {
            "type": "educational",
            **state.research_output,
            "wellness_support": state.therapy_output.get("coping_strategy") if state.therapy_output else None
        }
    
    elif state.intent == "therapy":
        # Therapy-focused
        state.final_output = {
            "type": "wellness",
            **state.therapy_output,
            "educational_focus": state.therapy_output.get("educational_focus"),
            "related_concept": state.research_output.get("learning_concept") if state.research_output else None
        }
    
    else:  # "both"
        # Balanced
        state.final_output = {
            "type": "integrated",
            "primary_mode": "therapy" if state.emotional_state else "research",
            "therapy": state.therapy_output,
            "research": state.research_output
        }
    
    return state
```

---

## Conditional Routing

### agent/graph.py - Edge Routing Logic

```python
from langgraph.graph import StateGraph, START, END

def create_superbear_graph():
    """
    Build the SuperBear LangGraph workflow.
    
    Note: The intent classification node is named "classify" (not "intent")
    to avoid conflict with the AgentState.intent field, which LangGraph
    reserves as a state key.
    """
    
    graph_builder = StateGraph(AgentState)
    
    # Add nodes
    graph_builder.add_node("input", input_node)
    graph_builder.add_node("classify", intent_node)  # Named "classify" to avoid state key conflict
    graph_builder.add_node("research", research_node)
    graph_builder.add_node("therapy", therapy_node)
    graph_builder.add_node("merge", merge_node)
    
    # Add edges
    graph_builder.add_edge(START, "input")
    graph_builder.add_edge("input", "classify")
    
    # Conditional routing based on intent
    def route_based_on_intent(state: AgentState):
        """Route to research, therapy, or both based on detected intent"""
        if state.intent == "research":
            return ["research"]
        elif state.intent == "therapy":
            return ["therapy"]
        else:  # "both"
            return ["research", "therapy"]
    
    graph_builder.add_conditional_edges(
        "classify",
        route_based_on_intent,
        {"research": "research", "therapy": "therapy"}
    )
    
    # Converge back to merge
    graph_builder.add_edge("research", "merge")
    graph_builder.add_edge("therapy", "merge")
    
    # Final output
    graph_builder.add_edge("merge", END)
    
    return graph_builder.compile()

# Create singleton graph
superbear_graph = create_superbear_graph()
```

---

## Data Flow with LangGraph

```
START
  ↓
INPUT_NODE
  • Parse user message
  • Extract metadata
  ↓
CLASSIFY_NODE (intent detection)
  • Classify: research/therapy/both
  • Detect emotional state
  ↓
CONDITIONAL_ROUTING
  ├─ If research → RESEARCH_NODE (parallel)
  ├─ If therapy → THERAPY_NODE (parallel)
  └─ If both → both nodes (parallel execution)
  ↓
RESEARCH_NODE (if needed)
  • OBSERVE: Analyze trade/question context
  • ANALYZE: Identify knowledge gaps
  • DECIDE: Choose concept
  • TEACH: Generate lesson
  ↓
THERAPY_NODE (if needed)
  • VALIDATE: Acknowledge emotion
  • ANALYZE: Understand triggers
  • COACH: Provide guidance
  • EMPOWER: Action steps
  ↓
MERGE_NODE
  • Combine outputs
  • Prioritize based on intent
  • Format final response
  ↓
END → Return to Frontend
```

---

### 2. memory/learning_memory.py

**Main Class**: `LearningMemory`

Tracks the user's learning journey across sessions to enable personalization and prevent repetition.

```python
class LearningMemory:
    """
    Lightweight, stateless memory system for tracking learning progress.
    Serializes to/from JSON for MongoDB storage.
    """
```

**Tracked Data**:

| Data | Purpose | Example |
|------|---------|---------|
| **Concepts Taught** | Avoid repetition, build on prior lessons | `[{concept: "Position Sizing", timestamp: "..."}, ...]` |
| **Observed Mistakes** | Identify knowledge gaps & patterns | `[{type: "overleveraging", context: "...", timestamp: "..."}, ...]` |
| **Trade Summaries** | Provide context-aware teaching | `[{symbol: "AAPL", action: "buy", reason: "...", timestamp: "..."}, ...]` |
| **Learning Focus** | Prioritize topics based on need | `[{area: "Risk Management", priority: 3}, ...]` |
| **Interaction Count** | Adapt complexity over sessions | `45` (total interactions) |
| **Emotional Patterns** | Recognize psychological blocks | `[{emotion: "anxiety", trigger: "volatility", frequency: 3}, ...]` |

**Key Methods**:

```python
memory = LearningMemory()

# Track teaching
memory.add_concept("Diversification", "Spreading risk across assets")

# Track mistakes
memory.record_mistake("panic_selling", "Sold entire position due to 5% drop")

# Track trades
memory.add_trade_summary({
    "symbol": "AAPL",
    "action": "buy",
    "units": 10,
    "reasoning": "uptrend signal",
    "emotion_state": "confident"
})

# Get summary for context
summary = memory.get_teaching_context()

# Serialize for storage
json_data = memory.serialize()

# Restore from storage
memory = LearningMemory.deserialize(json_data)
```

**Memory Structure (MongoDB Document)**:

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "session_start": "2025-02-13T10:00:00Z",
  "concepts_taught": [
    {
      "concept": "Position Sizing",
      "explanation": "Managing position size relative to account risk",
      "timestamp": "2025-02-13T10:05:00Z"
    }
  ],
  "observed_mistakes": [
    {
      "type": "overleveraging",
      "description": "Traded 5x account size",
      "context": "Market euphoria",
      "timestamp": "2025-02-13T09:50:00Z"
    }
  ],
  "recent_trades": [
    {
      "symbol": "AAPL",
      "action": "buy",
      "units": 10,
      "price": 150.25,
      "emotion_before": "confident",
      "emotion_after": "anxious",
      "timestamp": "2025-02-13T10:15:00Z"
    }
  ],
  "learning_focus_areas": [
    {
      "area": "Risk Management",
      "priority": 3,
      "reason": "Overleveraging pattern detected"
    }
  ],
  "interaction_count": 12,
  "emotional_patterns": [
    {
      "emotion": "anxiety",
      "trigger": "Market volatility > 3%",
      "frequency": 5,
      "coping_strength": "medium"
    }
  ]
}
```

---

### 3. prompts/tutor_prompt.py

**Purpose**: Constructs structured prompts for SuperBear's educational mode.

**Key Functions**:

```python
def build_tutor_prompt(user_profile, trade_data, memory, user_question):
    """
    Main prompt that instructs the agent on:
    - What to OBSERVE (user situation)
    - What to ANALYZE (knowledge gaps)
    - How to DECIDE (teaching strategy)
    - How to TEACH (lesson structure)
    """

def build_observation_context(user_profile, trade_data):
    """Summarize the current teaching situation"""
    return {
        "trading_level": "beginner",  # or intermediate, advanced
        "learning_style": "visual",   # or kinesthetic, auditory
        "recent_emotion": "anxiety",
        "market_context": "volatile",
        "trade_context": {...}
    }

def build_analysis_context(memory):
    """What has this user learned already?"""
    return {
        "concepts_taught": [...],
        "gaps_identified": [...],
        "emotional_blocks": [...]
    }

def build_memory_summary(memory):
    """Create concise summary to prevent repetition"""
    return f"""
    This user has learned: {concepts_list}
    Observed mistakes: {mistakes_list}
    Current focus areas: {focus_areas}
    """
```

---

### 4. prompts/therapy_prompt.py

**Purpose**: Constructs structured prompts for SuperBear's wellness mode.

**Focus Areas**:
- Anxiety & fear management
- Greed & overconfidence recognition  
- Decision paralysis & indecision
- Loss aversion alignment
- Impulsive trading triggers

**Prompt Strategy** (VACE Framework):
1. **Validate** - Acknowledge the emotional state
2. **Analyze** - Understand triggers & patterns
3. **Coach** - Teach underlying trading concept
4. **Empower** - Provide coping strategies & actionable steps

---

### 5. services/llm_service.py

**Main Class**: `LLMService`

Wrapper around Google Gemini 2.5 Flash Lite API with deterministic JSON output.

```python
class LLMService:
    async def call_gemini_json(self, prompt, output_schema=None):
        """
        Call Gemini with JSON output guarantee (async, non-blocking).
        
        Returns: dict (parsed JSON)
        Raises: ValueError if JSON parsing fails
        """
    
    async def call_gemini_text(self, prompt):
        """
        Call Gemini for plain text output (async, non-blocking).
        
        Returns: str (cleaned text)
        """
```

**Features**:
- ✅ Fully async — uses `asyncio.to_thread` to avoid blocking the event loop
- ✅ JSON output enforcement
- ✅ Markdown cleanup
- ✅ Error handling & retries with `asyncio.sleep` (non-blocking)
- ✅ Configurable model selection
- ✅ Rate-limit retry with exponential backoff

**Configuration**:
```python
model = "gemini-2.5-flash-lite"
temperature = 0.3  # Low for deterministic output
max_tokens = 2000
```

---

## Dependencies & Requirements

Add LangGraph to requirements.txt:

```
langgraph==0.1.13
langchain-core==0.2.43
langchain-google-genai==1.0.10
```

Installation:
```bash
pip install -r requirements.txt
```

---

## Agent Behavior Principles

### 1. **Educational Focus Only**
- ✅ Teach concepts & reasoning
- ✅ Explain why markets behave a certain way
- ❌ NO buy/sell signals
- ❌ NO specific stock recommendations

### 2. **Structured Reasoning (OADT)**
- Always follow the 4-step loop
- Provide explanations (not just answers)
- Show reasoning transparency

### 3. **Memory-Aware Teaching**
- Reference previously taught concepts
- Build on prior lessons
- Avoid repetition
- Track emotional patterns

### 4. **Personalized for Each User**
- Adapt to trading level (beginner → advanced)
- Match learning style (visual, kinesthetic, auditory)
- Respect risk tolerance
- Account for emotional state

### 5. **Deterministic Output**
- JSON structure ensures frontend consistency
- Markdown formatting for readability
- Structured fields prevent ambiguity

---

## Testing SuperBear Graph

### Test 1: Research-Only Intent

```python
from agent.graph import superbear_graph
from agent.state import AgentState

state = AgentState(
    user_message="What is position sizing and why is it important?",
    user_id="user-123",
    user_profile={"trading_level": "beginner"},
    session_id="session-456",
    timestamp="2025-02-13T10:30:00Z"
)

# Run graph
result = await superbear_graph.ainvoke(state)

print(result.final_output)
# Output: research-focused educational response
```

### Test 2: Therapy-Only Intent

```python
state = AgentState(
    user_message="I got scared and panic sold my entire portfolio when the market dropped 5%",
    user_id="user-123",
    user_profile={"trading_level": "beginner"},
    session_id="session-456",
    timestamp="2025-02-13T10:30:00Z"
)

result = await superbear_graph.ainvoke(state)

print(result.final_output)
# Output: therapy-focused wellness response
```

### Test 3: Both Intent (Parallel Execution)

```python
state = AgentState(
    user_message="I'm anxious about my AAPL position. Should I hold or sell given the recent volatility?",
    user_id="user-123",
    user_profile={"trading_level": "beginner"},
    session_id="session-456",
    timestamp="2025-02-13T10:30:00Z"
)

result = await superbear_graph.ainvoke(state)

print(result.final_output)
# Output: integrated response with both therapy & research
```

---

## Integration with FastAPI

### SuperBear API Endpoint

```
POST /api/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I'm anxious about my position. What should I do?",
  "session_id": "user-session-123"
}

Response: {...merged graph output...}
```

### FastAPI Handler Pattern

```python
from agent.graph import superbear_graph
from agent.state import AgentState

@app.post("/api/chat")
async def chat(request: ChatRequest, user = Depends(get_current_active_user)):
    # 1. Load user's memory from MongoDB
    memory_doc = await db.memories.find_one({"user_id": user["_id"]})
    
    # 2. Create initial state
    state = AgentState(
        user_message=request.message,
        user_id=str(user["_id"]),
        user_profile=user,
        memory_doc=memory_doc,
        session_id=request.session_id,
        timestamp=datetime.now().isoformat()
    )
    
    # 3. Run SuperBear graph (automatic routing & merging)
    result = await superbear_graph.ainvoke(state)
    
    # 4. Update memory with teaching/coaching
    if result.research_output:
        memory_doc["concepts_taught"].append({
            "concept": result.research_output.get("learning_concept"),
            "timestamp": result.timestamp
        })
    
    if result.therapy_output:
        memory_doc["emotional_patterns"].append({
            "emotion": result.therapy_output.get("emotional_state"),
            "timestamp": result.timestamp
        })
    
    await db.memories.update_one(
        {"user_id": user["_id"]},
        {"$set": memory_doc},
        upsert=True
    )
    
    # 5. Return merged response
    return result.final_output
```

---

## LangGraph Benefits

### 1. **Automatic Parallelization**
Both research and therapy nodes execute in parallel when intent="both"
```
research_node ──┐
                ├─→ merge_node
therapy_node ───┘
```

### 2. **Conditional Routing**
Intent detection automatically routes to the right nodes
```
intent="research" → [research_node]
intent="therapy"  → [therapy_node]
intent="both"     → [research_node, therapy_node]
```

### 3. **State Management**
Unified `AgentState` object flows through all nodes
- Each node updates only relevant fields
- Previous node outputs available to subsequent nodes

### 4. **Composability**
Easy to add new nodes or fine-tune routing logic
```python
# Add a new node
graph_builder.add_node("analytics", analytics_node)

# Update routing
def route_advanced(state):
    if state.confidence < 0.5:
        return ["analytics"]
    return route_based_on_intent(state)
```

### 5. **Streaming & Monitoring**
LangGraph provides built-in streaming and debugging
```python
# Stream events
async for event in superbear_graph.astream(state):
    print(f"Node: {event['type']}, Data: {event['data']}")

# Debug state at each node
async for step in superbear_graph.astream(state, debug=True):
    print(step)
```

---

## Configuration & Environment

**Required Environment Variables**:
```
GEMINI_API_KEY=<your-gemini-api-key>
MONGODB_URL=<mongodb-connection-string>
DATABASE_NAME=tradelingo
```

**LangGraph Configuration** (in `agent/graph.py`):
```python
# Graph execution
GRAPH_TIMEOUT = 30  # seconds
PARALLEL_EXECUTION = True  # Enable parallel node execution

# LLM settings
MODEL = "gemini-2.5-flash-lite"
temperature = 0.3  # Deterministic output
max_tokens = 2000
```

**Node Configuration**:
```python
# Intent classification confidence threshold
INTENT_CONFIDENCE_MIN = 0.6

# Parallel node timeout
PARALLEL_TIMEOUT = 15  # seconds

# Memory retrieval
MEMORY_CONTEXT_LIMIT = 10  # last N concepts taught
```

---

## Monitoring & Debugging

### LangGraph Execution Tracing

```python
from agent.graph import superbear_graph

# Stream execution events
async for event in superbear_graph.astream(state, stream_mode="updates"):
    print(f"Node executed: {event}")
    
# Example output:
# Node executed: {'input': {...}}
# Node executed: {'classify': {'intent': 'therapy', 'confidence': 0.85}}
# Node executed: {'therapy': {...therapy_output...}}
# Node executed: {'merge': {...final_output...}}
```

### Graph Visualization

```python
# Display graph structure
import pprint
pprint.pprint(superbear_graph.get_graph().to_dict())

# Visualize graph
# from IPython.display import Image
# Image(superbear_graph.get_graph().draw_mermaid_png())
```

### Node Execution Analysis

```python
# Profile node execution times
import time

async def benchmark_nodes(state):
    times = {}
    
    for node_name in ["input", "classify", "research", "therapy", "merge"]:
        start = time.time()
        result = await superbear_graph.invoke({...}, node=node_name)
        times[node_name] = time.time() - start
    
    return times

# Debug specific node
state = AgentState(...)
research_result = await research_node(state)
print(f"Research output: {research_result.research_output}")
```

### Test SuperBear Graph

```python
# Run graph without API
python test_agent.py

# Expected output:
# ✅ Graph compiled successfully
# ✅ Input node test passed
# ✅ Intent detection test passed
# ✅ Research node test passed
# ✅ Therapy node test passed
# ✅ Merge node test passed
# ✅ Full graph execution test passed
# ✅ All 8 tests passed
```

### Graph State Inspection

```python
# At each node, inspect full state
@app.post("/api/chat/debug")
async def chat_debug(request, user):
    state = AgentState(...)
    
    # Inspect state progression
    async for event in superbear_graph.astream(state):
        node = event.get("node")
        state_snapshot = event.get("state")
        
        print(f"\n--- {node} Node ---")
        print(f"Intent: {state_snapshot.intent}")
        print(f"Research complete: {state_snapshot.research_complete}")
        print(f"Therapy complete: {state_snapshot.therapy_complete}")
        print(f"Final output: {state_snapshot.final_output}")
```

---

## Future Enhancements

### Near-term (LangGraph Enhancements)

1. **Human-in-the-Loop**: Add approval node for critical coaching suggestions
   - Insert new node between data processing and merge
   - Manual approval for risk-related advice

2. **Multi-turn Conversation State**:
   - Extend AgentState to track conversation history
   - Update nodes to reference previous turns

3. **Streaming Responses**:
   - Stream node outputs to frontend in real-time
   - Use LangGraph's streaming capabilities

4. **Intent Confidence Routing**:
   - If confidence < threshold, route to clarification node
   - Ask user to clarify their intent

### Medium-term (Architecture)

5. **Custom Nodes**:
   - Add analytics node for trade performance analysis
   - Add market sentiment node
   - Add peer learning node

6. **Recursive Subgraphs**:
   - Therapy node can call mini-research graph
   - Research node can request emotional context

7. **Vector Memory Integration**:
   - Replace simple memory with semantic vector DB
   - Enable semantic similarity search across teachings

8. **Multi-Modal Input**:
   - Accept voice input → transcribe → same graph
   - Accept chart images → analyze → research node

### Long-term (Scaling)

9. **Agent Network**:
   - Multiple specialized SuperBear instances
   - Communication between agents
   - Collaborative coaching

10. **Persistent Learning**:
    - Aggregate learnings across all users
    - Improve prompts based on effectiveness metrics
    - A/B test different coaching strategies

---

## Support & Contribution

**For Issues With**:
- **Agent Logic** → `agent/tutor_agent.py`
- **Memory System** → `memory/learning_memory.py`
- **LLM Integration** → `services/llm_service.py`
- **Prompt Engineering** → `prompts/*.py`
- **API Integration** → `main.py` and auth routes
