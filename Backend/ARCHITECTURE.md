"""
ARCHITECTURE DOCUMENTATION
TradeLingo AI Trading Tutor Agent System
========================================

## Overview
This is a modular, single AI agent system designed to be an educational tutor
for trading concepts. It follows a structured decision loop:

    OBSERVE → ANALYZE → DECIDE → TEACH

## Directory Structure

```
Backend/
├── agent/                    # Agent logic
│   ├── __init__.py
│   └── tutor_agent.py       # Main TutorAgent class
│
├── memory/                   # Session memory management
│   ├── __init__.py
│   └── learning_memory.py   # LearningMemory class
│
├── prompts/                  # Prompt building utilities
│   ├── __init__.py
│   └── tutor_prompt.py      # Prompt templates and builders
│
├── services/                 # External service integrations
│   ├── __init__.py
│   └── llm_service.py       # Gemini API wrapper
│
├── flask-app.py             # Main Flask application
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

## Module Details

### 1. agent/tutor_agent.py
The core agent implementing the educational loop.

**Main Class: TutorAgent**
- `run_agent(user_profile, trade_data, user_question)`: Main entry point
- `observe()`: Gathers current situation
- `analyze()`: Identifies patterns and gaps
- `teach()`: Generates structured lesson via LLM

**Key Features:**
- Maintains LearningMemory across sessions
- Tracks concepts taught and mistakes observed
- Generates deterministic, explainable output via structured prompts

**Output JSON:**
```json
{
  "observation": "What was observed",
  "analysis": "Pattern analysis",
  "learning_concept": "Concept name",
  "why_it_matters": "Why this concept matters",
  "teaching_explanation": "2-3 paragraph teaching",
  "teaching_example": "Practical example",
  "actionable_takeaway": "One concrete action to take",
  "next_learning_suggestion": "What to learn next"
}
```

### 2. memory/learning_memory.py
Manages lightweight session memory.

**Main Class: LearningMemory**
- `add_concept()`: Record taught concepts
- `add_mistake()`: Record observed mistakes
- `add_trade_summary()`: Record trade data
- `serialize()`: Convert to JSON
- `deserialize()`: Restore from JSON

**Tracked Data:**
- Concepts taught (with timestamps)
- Observed mistakes and knowledge gaps
- Recent trade summaries
- Learning focus areas
- User feedback

**Usage:**
```python
memory = LearningMemory()
memory.add_concept("Position Sizing", "Managing risk exposure")
memory.add_mistake("overleveraging", "Traded beyond account risk limit")
```

### 3. prompts/tutor_prompt.py
Builds prompts for the agent's decision loop.

**Key Functions:**
- `build_tutor_prompt()`: Main prompt that guides OADT loop
- `build_observation_context()`: Structure current situation
- `build_analysis_context()`: Include history and focus areas
- `build_memory_summary()`: Summarize what's been taught

**Prompt Strategy:**
- Emphasizes educational focus (NOT trading signals)
- Includes user profile for personalization
- References memory to avoid repetition
- Forces JSON output for deterministic processing

### 4. services/llm_service.py
Wrapper around Gemini API.

**Main Class: LLMService**
- `call_gemini_json()`: Get JSON-structured response
- `call_gemini_text()`: Get plain text response

**Features:**
- Automatic markdown cleanup
- JSON parsing with error handling
- Consistent error messages
- Configurable model and API key

**Example:**
```python
llm = LLMService()
response = llm.call_gemini_json(prompt)
# Returns dict with parsed JSON
```

### 5. flask-app.py
Flask web application integrating the agent.

**Routes:**
- `GET /`: Show form
- `POST /`: Process form, run agent, return education

**Key Functions:**
- `create_profile()`: Save profile to Sheety
- `post_trade()`: Save trade to Sheety
- `run_tutor_agent()`: Execute agent with session memory
- `format_agent_response_for_html()`: Convert JSON to HTML

**Workflow:**
1. Receive form submission
2. Create/update user profile via Sheety
3. Record trade data (optional) via Sheety
4. Retrieve user's session memory
5. Run TutorAgent with context
6. Format response for frontend
7. Render template with structured content

## Data Flow

```
Frontend Form
    ↓
Flask Route (POST)
    ↓
Create Profile (Sheety)
    ↓
Record Trade (Sheety)
    ↓
Get Session Memory
    ↓
TutorAgent.run_agent()
    ├─ observe()
    ├─ analyze()
    └─ teach() → LLMService.call_gemini_json()
    ↓
Update Memory with Taught Concept
    ↓
Format for HTML
    ↓
Render Template
    ↓
Frontend Display
```

## Memory Management

**Session Memory Structure (Dict):**
```python
{
    "session_start": "2024-01-01T12:00:00",
    "concepts_taught": [
        {"concept": "Name", "explanation": "...", "timestamp": "..."},
        ...
    ],
    "observed_mistakes": [
        {"type": "Type", "description": "...", "context": "...", "timestamp": "..."},
        ...
    ],
    "recent_trade_summaries": [
        {"trade": {...}, "analysis": "...", "timestamp": "..."},
        ...
    ],
    "learning_focus_areas": [
        {"area": "Area", "priority": 3},
        ...
    ],
    "interaction_count": 5,
    "user_feedback": [
        {"feedback": "...", "type": "...", "timestamp": "..."},
        ...
    ]
}
```

**In Production:**
- Use Redis for session storage
- Use PostgreSQL for historical data
- Implement user authentication
- Add memory persistence/reload on app restart

## Agent Behavior Rules

1. **EDUCATIONAL FOCUS ONLY**
   - Never give buy/sell signals
   - Never recommend specific securities
   - Focus on reasoning quality and concepts

2. **STRUCTURED REASONING**
   - Always follow OADT loop
   - Provide explanations (not just answers)
   - Connect to user's learning level and style

3. **MEMORY-AWARE**
   - Reference what's been taught
   - Avoid repeating concepts
   - Build on previous lessons

4. **PERSONALIZATION**
   - Match learning style (visual, kinesthetic, auditory)
   - Respect trading level (beginner, intermediate, advanced)
   - Address stated risk tolerance

## Testing the Agent

### Test 1: Simple Profile Input
```python
from agent import run_agent
from memory import LearningMemory

profile = {
    "name": "Alice",
    "tradingLevel": "beginner",
    "learningStyle": "visual",
    "riskTolerance": "low",
    "preferredMarkets": "stocks",
    "tradingFrequency": "weekly"
}

response, memory = run_agent(
    {"user_profile": profile},
    memory=None
)

print(response)
```

### Test 2: With Trade Data
```python
trade_data = {
    "date": "2024-01-01",
    "stockCode": "AAPL",
    "action": "buy",
    "units": 10,
    "price": 150,
}

response, memory = run_agent(
    {
        "user_profile": profile,
        "trade_data": trade_data
    },
    memory=None
)
```

## Configuration

**Environment Variables (.env):**
```
GEMINI_API_KEY=your_key_here
PROFILES_SHEETY_ENDPOINT=https://api.sheety.co/...
PAST_TRADES_SHEETY_ENDPOINT=https://api.sheety.co/...
SHEETY_TOKEN=your_token_here
```

**Flask Configuration (flask-app.py):**
```python
app.config['DEBUG'] = True  # Set to False in production
app.config['TESTING'] = False
```

## Error Handling

The system handles errors at multiple levels:

1. **LLM Service**: JSON parsing errors, API failures
2. **Agent**: Missing profile data, API timeouts
3. **Flask**: Form validation, Sheety integration errors

All errors are logged and returned to the user with context.

## Future Improvements

1. **Persistent Memory**: Use database instead of in-memory dict
2. **User Authentication**: Session-based user tracking
3. **Multi-Turn Conversations**: Remember conversation history
4. **Feedback Loop**: Let users rate lessons
5. **Advanced Memory**: Use embeddings for semantic search
6. **Caching**: Cache common concepts/explanations
7. **Analytics**: Track which concepts are most helpful
8. **Streaming**: Stream LLM responses for faster UX

## Debugging

**Enable verbose logging:**
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Inspect agent output:**
```python
response, memory = run_agent(input_data)
print(json.dumps(response, indent=2))
print(json.dumps(memory.serialize(), indent=2))
```

**Test LLM directly:**
```python
from services import LLMService
llm = LLMService()
result = llm.call_gemini_json("Your test prompt")
```

## Support & Questions

For issues or improvements, refer to:
- Agent logic: `agent/tutor_agent.py`
- Memory management: `memory/learning_memory.py`
- LLM integration: `services/llm_service.py`
- Prompt templates: `prompts/tutor_prompt.py`
- Flask routes: `flask-app.py`
"""
