<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/MongoDB-7.0-13AA52?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/LangGraph-0.1.13-FF6F00?style=for-the-badge&logo=graphql&logoColor=white" alt="LangGraph" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/JWT-Auth-FFA500?style=for-the-badge&logo=auth0&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

# 🐻 TradeLingo Backend — AI Trading Tutor Agent

> A modern, modular AI agent system with JWT authentication and MongoDB persistence. Delivers **personalized trading education**, **deep trade diagnostics**, and **emotional wellness coaching** through two **LangGraph-based agentic pipelines** with automatic intent detection, curriculum-aware routing, mastery tracking, and autonomous reflection — powered by Google Gemini and FastAPI.

---

## 🧠 How It Works

The backend runs **two separate LangGraph pipelines**:

1. **SuperBear Conversational Graph** — Real-time chat with intelligent routing, mastery detection, and self-reflection
2. **Education Onboarding Pipeline** — Structured two-phase quiz → curriculum generation flow

### SuperBear Conversational Graph (Main Chat)

```
User Message
     │
     ▼
┌──────────────────────────┐
│  1. INPUT NODE           │  ← Validate & parse user message
└────────┬─────────────────┘
         ▼
┌──────────────────────────┐
│  2. LOAD LEARNING        │  ← Fetch curriculum, trade_type,
│     CONTEXT              │    knowledge gaps from MongoDB
└────────┬─────────────────┘
         ▼
┌──────────────────────────┐
│  3. INTENT CLASSIFY      │  ← LLM detects intent + emotion
└────────┬─────────────────┘
         ▼
   ┌─────── CONDITIONAL ROUTING ────────┐
   │              │            │        │
   ▼              ▼            ▼        ▼
┌────────┐ ┌───────────┐ ┌────────┐ ┌──────────┐
│ TRADE  │ │ RESEARCH  │ │THERAPY │ │CURRICULUM│
│EXPLAIN │ │  (OADT)   │ │ (VACE) │ │ MODIFY   │
└───┬────┘ └─────┬─────┘ └───┬────┘ └────┬─────┘
    │            │            │           │
    └────────────┴─────┬──────┴───────────┘
                       ▼
          ┌────────────────────────┐
          │ 5. MASTERY DETECTION   │  ← LLM evaluates understanding
          └────────┬───────────────┘
                   ▼
             ┌── CONDITIONAL ──┐
             │                 │
             ▼                 ▼
     ┌────────────┐       (skip)
     │6. REFLECTION│         │
     │  (internal) │         │
     └──────┬──────┘         │
            └─────────┬──────┘
                      ▼
             ┌────────────────┐
             │  7. MERGE NODE │  ← Combine outputs + progress
             └────────┬───────┘
                      ▼
               JSON Response → Frontend
```

### Education Onboarding Pipeline

```
Phase 1 (Quiz Generation):
  START → Load User → Quiz Generator → END

Phase 2 (Curriculum Generation):
  START → Gap Analysis → Curriculum Generator → Persist Curriculum → END
```

---

## 📁 Project Structure

```
Backend/
├── main.py                          # FastAPI app, /api/chat & /api/therapy endpoints, app lifecycle
├── database.py                      # MongoDB async connection (Motor), index creation, get_database()
│
├── auth/                            # 🔐 JWT Authentication
│   ├── config.py                    # JWT settings (secret, algorithm, expiry)
│   ├── models.py                    # Pydantic v2 models (UserInDB, UserCreate)
│   ├── schemas.py                   # API request/response schemas (UserResponse)
│   ├── utils.py                     # Password hashing (bcrypt) & JWT token generation
│   ├── dependencies.py              # FastAPI dependency: get_current_active_user
│   └── routes.py                    # Auth endpoints (/register, /login, /refresh, /me, /logout)
│
├── agent/                           # 🤖 SuperBear LangGraph Agent
│   ├── graph.py                     # SuperBear graph definition, create_superbear_graph(), run/stream helpers
│   ├── education_graph.py           # Education pipeline: Phase 1 (quiz) & Phase 2 (curriculum) graphs
│   ├── state.py                     # AgentState — Pydantic model shared across all SuperBear nodes
│   ├── education_state.py           # EducationState — TypedDict for the education pipeline
│   ├── tutor_agent.py               # Legacy standalone TutorAgent class (OADT loop)
│   └── nodes/                       # Individual graph nodes
│       ├── input_node.py            # Validate user message (min length check)
│       ├── load_learning_context_node.py  # Load curriculum + trade_type from MongoDB (no LLM)
│       ├── intent_node.py           # LLM-based intent classification (5 intent categories)
│       ├── research_node.py         # Educational content via OADT loop (curriculum-aware)
│       ├── therapy_node.py          # Wellness coaching via VACE framework
│       ├── trade_explain_node.py    # Deep trade diagnostic engine (server-side P&L, bias detection)
│       ├── curriculum_modify_node.py # Adjust learning plan based on user request
│       ├── mastery_detection_node.py # LLM evaluates understanding, updates progress scores
│       ├── reflection_node.py       # Autonomous meta-learning reflection (internal, not shown to user)
│       ├── merge_node.py            # Combine branch outputs into final_output with progress info
│       ├── load_user_node.py        # [Education] Load user profile from MongoDB
│       ├── quiz_generator_node.py   # [Education] Generate 5-question diagnostic quiz via LLM
│       ├── gap_analysis_node.py     # [Education] Analyze quiz answers → knowledge gaps via LLM
│       ├── curriculum_node.py       # [Education] Generate 4-6 module curriculum via LLM
│       └── persist_curriculum_node.py # [Education] Save curriculum to MongoDB with progress fields
│
├── memory/                          # 🧠 Session memory management
│   └── learning_memory.py           # LearningMemory class: in-memory per-session tracking
│
├── prompts/                         # 📝 Prompt engineering
│   ├── intent_prompt.py             # Legacy intent classification prompt builder
│   ├── research_prompt.py           # OADT educational prompt builder (build_research_prompt)
│   ├── therapy_prompt.py            # VACE wellness prompt builder (build_therapy_prompt)
│   └── tutor_prompt.py              # Legacy tutor prompt builder (standalone OADT)
│
├── routes/                          # 🛤️ API route modules
│   ├── education_routes.py          # /api/education/* (start, submit-quiz, progress)
│   └── trade_routes.py              # /api/trades/* (upload, my-type, explain, list)
│
├── services/                        # 🔗 Business logic & external integrations
│   ├── llm_service.py               # Async Gemini API wrapper (retry, JSON parsing, markdown cleanup)
│   ├── trade_service.py             # Trade retrieval, P&L computation, trade-type classification
│   ├── progress_service.py          # Module completion, mastery scoring, interaction tracking
│   └── reflection_service.py        # Learning profile CRUD, reflection persistence, difficulty adjustment
│
├── ARCHITECTURE.md                  # Detailed architecture documentation
├── requirements.txt                 # Python dependencies
├── test_agent.py                    # Unit tests for SuperBear graph
└── README.md                        # You are here
```

---

## 🔄 SuperBear Graph — Node-by-Node Reference

This section explains every node in the SuperBear conversational graph. If you need to modify a node's behaviour, this tells you exactly where to look and what each node does.

### 1. Input Node — `agent/nodes/input_node.py`

| | |
|---|---|
| **Purpose** | Entry point — validates user message |
| **LLM call** | No |
| **What it does** | Checks message length (minimum 3 characters). Raises `ValueError` if too short. Passes state through unchanged if valid. |
| **State fields modified** | None (validation only) |

### 2. Load Learning Context Node — `agent/nodes/load_learning_context_node.py`

| | |
|---|---|
| **Purpose** | Fetch curriculum and trade type from MongoDB before intent classification |
| **LLM call** | No |
| **What it does** | Queries `lesson_plans` collection for the user's latest lesson plan. Extracts `current_curriculum`, `current_module`, and `knowledge_gaps`. Queries `users` collection for `trade_type`. Handles backward compatibility for old documents missing `status`/`mastery_score`/`interaction_count` fields. |
| **State fields modified** | `current_curriculum`, `current_module`, `knowledge_gaps`, `trade_type` |
| **Fallback** | If no lesson plan exists, fields stay `None` and downstream nodes use legacy (non-curriculum-aware) behaviour |

### 3. Intent (Classify) Node — `agent/nodes/intent_node.py`

| | |
|---|---|
| **Purpose** | Classify user intent and detect emotional state using LLM |
| **LLM call** | Yes — `llm_service.call_gemini_json()` |
| **What it does** | Sends user message + context (trading level, curriculum state, current module topic, detected emotion) to LLM. Returns one of 5 intent categories. |
| **State fields modified** | `intent`, `confidence`, `emotional_state`, `detected_emotion` |

**Intent categories and their routing:**

| Intent | Description | Routes to |
|---|---|---|
| `trade_explain` | User asks about a specific trade or position | Trade Explain Node |
| `lesson_question` | Conceptual/educational trading question | Research Node |
| `curriculum_modify` | User wants to change/simplify/skip learning plan | Curriculum Modify Node |
| `emotional_support` | User expresses emotions (anxiety, frustration, fear) | Therapy Node |
| `general_question` | Greetings, off-topic, unclear | Research Node (fallback) |

### 4a. Trade Explain Node — `agent/nodes/trade_explain_node.py`

| | |
|---|---|
| **Purpose** | Deep, structured trade diagnostic analysis |
| **LLM call** | Yes |
| **Triggered when** | `intent == "trade_explain"` |
| **What it does** | Loads trade data from state or fetches latest trade from DB. **Computes P&L metrics server-side** (never lets the LLM calculate). Loads behavioral history from `learning_profiles`. Adapts tone based on detected emotion (supportive for frustrated, analytical for calm). |
| **Two modes** | **Deep Analysis** (trade data available): technical analysis, behavioral bias detection, core mistake identification, curriculum-linked recommendations. **Conceptual** (no trade data): general educational guidance about the trading scenario. |
| **Safety** | Never provides buy/sell signals, price predictions, or profit guarantees |
| **State fields modified** | `research_output`, `research_complete` |

### 4b. Research Node — `agent/nodes/research_node.py`

| | |
|---|---|
| **Purpose** | Educational content generation using the OADT loop |
| **LLM call** | Yes |
| **Triggered when** | `intent == "lesson_question"` or `"general_question"` |
| **What it does** | Loads previously taught concepts from memory (avoids repetition). Builds prompt via `build_research_prompt()`. If a `current_module` exists, augments prompt with module topic, difficulty, weak concepts, and emotion context. Generates structured lesson: observation, analysis, concept, explanation, example, takeaway. |
| **State fields modified** | `research_output`, `research_complete` |

**OADT Loop**: Observe → Analyze → Decide → Teach

### 4c. Therapy Node — `agent/nodes/therapy_node.py`

| | |
|---|---|
| **Purpose** | Emotional wellness and trading psychology coaching |
| **LLM call** | Yes |
| **Triggered when** | `intent == "emotional_support"` |
| **What it does** | Loads emotional patterns from memory. Builds prompt via `build_therapy_prompt()`. Generates: emotional validation, perspective reframing, coping strategies, educational focus tie-in, actionable steps, encouragement. |
| **State fields modified** | `therapy_output`, `therapy_complete` |

**VACE Loop**: Validate → Analyze → Coach → Empower

### 4d. Curriculum Modify Node — `agent/nodes/curriculum_modify_node.py`

| | |
|---|---|
| **Purpose** | Adjust the user's learning plan based on their request |
| **LLM call** | Yes |
| **Triggered when** | `intent == "curriculum_modify"` |
| **What it does** | Sends current module + user request to LLM. LLM proposes an `adjustment_type` (`simplified`, `advanced`, `refocused`, `style_change`) and a new module definition. **Persists** updated module directly to MongoDB `lesson_plans` collection. |
| **State fields modified** | `research_output`, `research_complete` |

### 5. Mastery Detection Node — `agent/nodes/mastery_detection_node.py`

| | |
|---|---|
| **Purpose** | Evaluate whether the user demonstrates understanding of the current module topic |
| **LLM call** | Yes |
| **Runs after** | All 4 branch nodes converge here |
| **Skip conditions** | No current module, no research output, or intent is `emotional_support` / `curriculum_modify` |
| **What it does** | Records interaction via `progress_service.mark_module_interaction()`. Sends user message + teaching response to LLM for mastery evaluation. |
| **State fields modified** | `mastery_result` |

**Scoring logic:**

| Confidence | Action |
|---|---|
| ≥ 0.8 + `mastery_detected=true` | **Module completed** — sets mastery score to 100, unlocks next module |
| ≥ 0.6 | Moderate mastery score increment (+5 to +25 points) |
| ≥ 0.4 | Small engagement score increment (+4 to +6 points) |
| < 0.4 | No score change |

### 6. Reflection Node — `agent/nodes/reflection_node.py`

| | |
|---|---|
| **Purpose** | Autonomous meta-learning that analyzes patterns across interactions |
| **LLM call** | Yes |
| **Shown to user** | **No** — internal only, persisted to MongoDB `learning_profiles` collection |
| **Non-blocking** | If reflection fails, the user still receives their normal response |
| **State fields modified** | `reflection_output` |

**Trigger conditions** (checked by `should_trigger_reflection()`):

| Condition | Description |
|---|---|
| Module completed | `mastery_result.progress_update.success == true` |
| Trade explanation | `intent == "trade_explain"` |
| Strong emotion | Detected emotion is `frustrated`, `anxious`, `stressed`, `upset`, or `overwhelmed` |
| Every 5th interaction | `interaction_count % 5 == 0` |

**What it produces**: Updated knowledge gaps, behavioral pattern summary, confidence level estimate, difficulty adjustment recommendation (increase / decrease / maintain), next focus area, learning strengths, repeated mistakes, emotional tendency.

### 7. Merge Node — `agent/nodes/merge_node.py`

| | |
|---|---|
| **Purpose** | Combine branch outputs into a single `final_output` for the API response |
| **LLM call** | No |
| **What it does** | Selects output based on intent, attaches progress info from mastery detection |
| **State fields modified** | `final_output` |

**Output routing:**

| Intent | Output `type` | Primary content |
|---|---|---|
| `trade_explain` | `trade_explain` | Full trade diagnostic from Trade Explain Node |
| `curriculum_modify` | `curriculum_modify` | Modified curriculum details |
| `emotional_support` | `wellness` | Therapy output + related concept |
| `lesson_question` | `educational` | Research output |
| `general_question` | `integrated` | Balanced therapy + research |

---

## 🎓 Education Pipeline — Node-by-Node Reference

The education pipeline (`agent/education_graph.py`) runs as two separate compiled graphs invoked from the API layer. It uses `EducationState` (a TypedDict defined in `agent/education_state.py`).

### Phase 1: Quiz Generation

| Node | File | LLM | Purpose |
|---|---|---|---|
| **Load User** | `agent/nodes/load_user_node.py` | No | Fetches user profile from MongoDB `users` collection (trading level, learning style, risk tolerance, preferred market, trade type) |
| **Quiz Generator** | `agent/nodes/quiz_generator_node.py` | Yes | Generates a 5-question diagnostic quiz tailored to user's profile. Each question tests a different core trading concept. |

### Phase 2: Curriculum Generation

| Node | File | LLM | Purpose |
|---|---|---|---|
| **Gap Analysis** | `agent/nodes/gap_analysis_node.py` | Yes | Analyzes quiz Q&A pairs. Produces: `strong_concepts`, `weak_concepts`, `behavioral_patterns`, `recommended_focus` |
| **Curriculum Generator** | `agent/nodes/curriculum_node.py` | Yes | Designs a 4–6 module personalized curriculum based on knowledge gaps, profile, and difficulty calibration from the reflection system's `learning_profiles` collection |
| **Persist Curriculum** | `agent/nodes/persist_curriculum_node.py` | No | Saves curriculum to MongoDB `lesson_plans` collection. First module gets `status="current"`, others get `status="locked"`. All modules initialized with `mastery_score=0`, `interaction_count=0`. |

---

## 🔗 Services Reference

Business logic is kept in the `services/` directory, separate from graph nodes.

### `services/llm_service.py` — LLM Service

| | |
|---|---|
| **Model** | Google Gemini 2.5 Flash Lite (`gemini-2.5-flash-lite`) |
| **Key methods** | `call_gemini_json(prompt)` — returns parsed JSON dict. `call_gemini_text(prompt)` — returns raw text. |
| **Features** | Non-blocking via `asyncio.to_thread`. Automatic retry on 429 rate limits (up to 3 retries with extracted delay). Markdown code block cleanup. Structured JSON enforcement. |
| **Singleton** | `llm_service` — global instance used across all nodes |

### `services/trade_service.py` — Trade Service

| | |
|---|---|
| **Key functions** | `calculate_holding_duration()` — entry/exit → minutes. `classify_trade_type()` — rule-based classification from trade history. `update_user_trade_type()` — reclassify and persist. `compute_trade_metrics()` — server-side P&L, holding duration formatting. `get_latest_trade()`, `get_trade_by_id()`, `get_user_trades()`. |
| **Trade type rules** | avg ≤ 15 min → `scalper`, ≤ 1 day → `day_trader`, ≤ 14 days → `swing_trader`, > 14 days → `investor`. Requires ≥ 3 trades, otherwise `unknown`. |
| **Important** | P&L is always computed server-side — never by the LLM |

### `services/progress_service.py` — Progress Service

| | |
|---|---|
| **Key functions** | `mark_module_interaction()` — increments `interaction_count` on current module. `update_mastery_score()` — adds score (capped at 100). `complete_current_module()` — marks current module "completed", sets mastery to 100, unlocks next module. `get_progress_summary()` — full progress report. `get_current_lesson_plan()`, `get_current_module()`. |
| **MongoDB collection** | `lesson_plans` |

### `services/reflection_service.py` — Reflection Service

| | |
|---|---|
| **Key functions** | `get_learning_profile()` — fetch or return default profile. `save_reflection()` — upsert reflection with merged knowledge gaps, repeated mistakes, emotional tendencies, difficulty adjustment. `update_difficulty()` — directly set difficulty level. |
| **MongoDB collection** | `learning_profiles` |
| **Merge behaviour** | Knowledge gaps are deduplicated. Repeated mistakes keep last 10 unique. Emotional tendencies keep last 5. Difficulty adjusts one level at a time (beginner ↔ intermediate ↔ advanced). |

---

## 📦 MongoDB Collections

| Collection | Purpose | Key fields |
|---|---|---|
| `users` | User accounts & profiles | `email`, `username`, `trading_level`, `learning_style`, `risk_tolerance`, `trade_type`, `is_active` |
| `sessions` | User sessions | `user_id`, `session_id` |
| `trades` | Trade history | `user_id`, `symbol`, `entry_time`, `exit_time`, `entry_price`, `exit_price`, `holding_duration_minutes` |
| `lesson_plans` | Generated curricula | `user_id`, `learning_objective`, `modules[]` (with `status`, `mastery_score`, `interaction_count`), `current_module_index`, `knowledge_gaps` |
| `learning_profiles` | Reflection data | `user_id`, `knowledge_gaps[]`, `repeated_mistakes[]`, `behavioral_pattern_summary`, `difficulty_level`, `emotional_tendencies[]`, `reflection_count` |
| `memories` | Session memory snapshots | `user_id`, `concepts_taught[]`, `emotional_patterns[]` |

---

## 📡 API Endpoints

### 🔐 Authentication — `auth/routes.py`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user (returns access + refresh tokens) |
| `POST` | `/api/auth/login` | Authenticate (returns access + refresh tokens) |
| `POST` | `/api/auth/refresh` | Refresh expired access token |
| `GET` | `/api/auth/me` | Get authenticated user profile |
| `POST` | `/api/auth/logout` | Logout (client-side token invalidation) |

### 🐻 AI Tutor — `main.py`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | No | Health check |
| `POST` | `/api/chat` | Yes | Main chat — runs full SuperBear graph with intent detection |
| `POST` | `/api/therapy` | Yes | Convenience wellness route — same graph, emotionally-focused |

### 🎓 Education — `routes/education_routes.py`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/education/start` | Yes | Phase 1 — generate diagnostic quiz |
| `POST` | `/api/education/submit-quiz` | Yes | Phase 2 — submit answers → gap analysis → curriculum generation |
| `GET` | `/api/education/progress` | Yes | Get module-by-module learning progress |

### 📊 Trade History — `routes/trade_routes.py`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/trades/upload` | Yes | Upload trades, compute holding durations, classify trade type |
| `GET` | `/api/trades/my-type` | Yes | Get user's classified trade type |
| `POST` | `/api/trades/explain` | Yes | Deep trade diagnostic analysis (runs Trade Explain Node directly) |
| `GET` | `/api/trades/list` | Yes | List recent trades with computed metrics |

---

## 🏗️ Key Design Patterns

| Pattern | Description |
|---|---|
| **Curriculum-aware with legacy fallback** | If no lesson plan exists, the system works in "legacy mode" without curriculum context. No code changes needed. |
| **Server-side computation** | P&L and trade metrics are always computed in Python (`trade_service.py`), never by the LLM. |
| **Compliance-safe** | Trade Explain Node explicitly avoids buy/sell signals, price predictions, and profit guarantees. |
| **Emotion-adaptive tone** | Emotional state is detected early in the intent node and adjusts language throughout (supportive for frustrated, analytical for calm). |
| **Non-blocking reflection** | The reflection node is internal-only and failure-tolerant — the user always receives their response even if reflection errors. |
| **Progressive mastery** | Users unlock modules sequentially through demonstrated understanding (tracked by mastery scores), not just time spent. |
| **Backward compatibility** | Old lesson plan documents missing `status`/`mastery_score`/`interaction_count` fields are automatically enhanced at load time. |

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **MongoDB 5.0+** — [Install locally](https://docs.mongodb.com/manual/installation/) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Google Gemini API Key** — [Get one here](https://aistudio.google.com/apikey)

### 1. Clone & Navigate

```bash
cd Backend
```

### 2. Create Virtual Environment

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `Backend/` directory:

```env
# ==================== MONGODB ====================
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=tradelingo

# ==================== JWT AUTHENTICATION ====================
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# ==================== GEMINI API ====================
GEMINI_API_KEY=your_gemini_api_key_here

# ==================== API ENVIRONMENT ====================
API_ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

### 5. Run the Server

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 5000
```

The server will start at **http://127.0.0.1:5000** with automatic reload on code changes.

**API Documentation:**
- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

---

## ⚙️ Configuration

### Environment Variables (.env)

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URL` | MongoDB connection string | `mongodb://localhost:27017` or MongoDB Atlas URI |
| `DATABASE_NAME` | MongoDB database name | `tradelingo` |
| `JWT_SECRET_KEY` | Secret key for JWT signing (CHANGE IN PRODUCTION) | Auto-generated, min 32 chars |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiration | `30` |
| `JWT_REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiration | `7` |
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |

### MongoDB Setup

**Local Development:**
```bash
# Install MongoDB Community Edition
# https://www.mongodb.com/docs/manual/installation/

# Start MongoDB service
mongod
```

**Production (MongoDB Atlas):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string from Atlas dashboard
4. Add connection string to `.env` as `MONGODB_URL`

### Security Notes

- ⚠️ **JWT_SECRET_KEY**: Generate a strong secret key in production
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- 🔒 **Password Hashing**: Uses bcrypt with automatic salt generation
- 🎟️ **Token Lifecycle**: Access tokens short-lived (30 min), refresh tokens long-lived (7 days)

---

## 🧪 Testing

### Run Development Server

```bash
# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server with auto-reload
uvicorn main:app --reload --host 127.0.0.1 --port 5000
```

### Server Output
```
INFO:     Uvicorn running on http://127.0.0.1:5000
INFO:     MongoDB connected to tradelingo database
INFO:     Application startup complete
```

### Test Authentication Flow

```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "securepassword123",
    "trading_level": "beginner"
  }'

# Response includes access_token and refresh_token

# 2. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'

# 3. Access protected endpoint
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <access_token>"

# 4. Test AI tutor with auth
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is a stock?",
    "session_id": "test-session"
  }'
```

### Unit Tests

```bash
python test_agent.py
```

---

## 📄 License

This project is part of the **TradeLingo** platform.
