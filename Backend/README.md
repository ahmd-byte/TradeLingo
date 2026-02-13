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

> A modern, modular AI agent system with JWT authentication and MongoDB persistence. Delivers personalized trading education and emotional wellness coaching through a **LangGraph-based agentic workflow** with automatic intent detection and conditional routing, powered by Google Gemini and FastAPI.

---

## 🧠 How It Works

```
User Question / Trade Data
        │
        ▼
┌───────────────────┐
│   INPUT NODE      │  ← Validate & parse user message
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  CLASSIFY NODE    │  ← Detect intent: research / therapy / both
└───────┬───────────┘
        │
   ┌────┴─────┐
   │            │
   ▼            ▼
┌────────┐  ┌─────────┐
│RESEARCH│  │ THERAPY │  ← Parallel execution if intent="both"
│ (OADT) │  │ (VACE)  │
└────┬───┘  └────┬────┘
     │            │
     └────┬─────┘
          │
          ▼
   ┌───────────┐
   │ MERGE NODE│  ← Combine & prioritize outputs
   └───────────┘
          │
          ▼
   JSON Response → Frontend
```

The **SuperBear LangGraph** automatically classifies user intent and routes to the appropriate node(s). Research uses the OADT loop (Observe → Analyze → Decide → Teach), while therapy uses the VACE framework (Validate → Analyze → Coach → Empower). Both are personalized to the user's trading level and learning style.

---

## 📁 Project Structure

```
Backend/
├── main.py                   # Main FastAPI application & API routes (async)
│
├── database.py               # MongoDB connection & helpers (Motor/async)
│
├── auth/                     # 🔐 JWT Authentication
│   ├── __init__.py
│   ├── config.py             # JWT & auth configuration
│   ├── models.py             # Pydantic v2 models (UserInDB, UserCreate, etc.)
│   ├── schemas.py            # API request/response schemas (UserResponse lives here)
│   ├── utils.py              # Password hashing & JWT token generation
│   ├── dependencies.py       # FastAPI dependency injection
│   └── routes.py             # Auth endpoints (/register, /login, /refresh, etc.)
│
├── agent/                    # 🤖 SuperBear LangGraph Agent
│   ├── __init__.py
│   ├── graph.py              # LangGraph workflow definition & execution
│   ├── state.py              # AgentState (shared state across all nodes)
│   ├── tutor_agent.py        # Legacy TutorAgent class (OADT decision loop)
│   └── nodes/                # Graph nodes
│       ├── __init__.py
│       ├── input_node.py     # Entry point: validate user input
│       ├── intent_node.py    # Detect intent: research vs therapy vs both
│       ├── research_node.py  # Educational: OADT trading concepts
│       ├── therapy_node.py   # Wellness: VACE psychology coaching
│       └── merge_node.py     # Combine outputs from parallel nodes
│
├── memory/                   # 🧠 Session memory management
│   ├── __init__.py
│   └── learning_memory.py    # LearningMemory class
│
├── prompts/                  # 📝 Prompt engineering
│   ├── __init__.py
│   ├── intent_prompt.py      # Intent classification prompts
│   ├── research_prompt.py    # Educational content generation
│   ├── therapy_prompt.py     # Wellness coaching prompts
│   └── tutor_prompt.py       # Legacy tutor prompt templates
│
├── services/                 # 🔗 External services
│   ├── __init__.py
│   └── llm_service.py        # Async Gemini API wrapper with JSON parsing
│
├── ARCHITECTURE.md           # Detailed architecture documentation
├── requirements.txt          # Python dependencies
├── test_agent.py             # Unit tests for SuperBear graph
└── README.md                 # You are here
```

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
- Swagger UI: http://localhost:5000/api/docs
- ReDoc: http://localhost:5000/api/redoc

---

## 📡 API Endpoints

### 🔐 Authentication Endpoints

#### `POST /api/auth/register`

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "trader_john",
  "password": "SecurePassword123!",
  "trading_level": "beginner",
  "learning_style": "visual",
  "risk_tolerance": "medium"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### `POST /api/auth/login`

Authenticate user and get tokens.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** (Same as register)

#### `POST /api/auth/refresh`

Refresh an expired access token.

**Request:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `GET /api/auth/me`

Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "_id": "65f8c3d4e5f8c3d4e5f8c3d4",
  "email": "user@example.com",
  "username": "trader_john",
  "trading_level": "beginner",
  "learning_style": "visual",
  "risk_tolerance": "medium",
  "is_active": true,
  "created_at": "2026-02-13T10:30:00",
  "updated_at": "2026-02-13T10:30:00"
}
```

#### `POST /api/auth/logout`

Logout endpoint (invalidate on client side).

---

### 🐻 AI Tutor Endpoints

#### `GET /api/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "version": "2.0.0",
  "database": "MongoDB",
  "authentication": "JWT"
}
```

#### `POST /api/chat`

Main chat endpoint for the SuperBear AI tutor. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "What is a stock?",
  "session_id": "user-session-123",
  "user_profile": {
    "trading_level": "beginner",
    "learning_style": "visual",
    "risk_tolerance": "medium"
  },
  "trade_data": {
    "stockCode": "AAPL",
    "action": "buy",
    "units": "10",
    "price": "150.00"
  }
}
```

**Response:**
```json
{
  "observation": "The user is a beginner asking about stocks...",
  "analysis": "This is a foundational question...",
  "learning_concept": "What is a Stock?",
  "why_it_matters": "Understanding stocks is the bedrock of...",
  "teaching_explanation": "A stock represents ownership in a company...",
  "teaching_example": "Imagine buying 10 shares of Apple (AAPL)...",
  "actionable_takeaway": "Pick one company you use daily and look up its stock ticker...",
  "next_learning_suggestion": "How stock prices are determined"
}
```

#### `POST /api/therapy`

Trading psychology and emotional wellness endpoint. **Requires authentication.**

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "emotion": "anxiety",
  "trigger": "Market dropped 5%",
  "session_id": "user-session-123",
  "recent_trades": [
    {
      "symbol": "AAPL",
      "action": "sell",
      "reason": "Fear of loss"
    }
  ]
}
```

**Response:**
```json
{
  "emotional_state": "Anxiety detected",
  "validation": "Your concerns about market volatility are valid...",
  "perspective": "Market corrections are normal and healthy...",
  "coping_strategy": "Take a 30-minute break to reset your mindset...",
  "educational_focus": "Understanding market cycles and volatility",
  "actionable_steps": [
    "Review your investment thesis",
    "Check if fundamentals have changed",
    "Avoid panic-driven decisions"
  ],
  "encouragement": "You're building discipline—that's the foundation of successful trading."
}
```

---

## 🏗️ Core Modules

### `TutorAgent` — The Brain

The **SuperBear LangGraph** is the main agent system. It uses a graph-based workflow that automatically detects user intent and routes to the appropriate processing nodes:

- **Research Node** (OADT loop): Educational trading concepts
- **Therapy Node** (VACE framework): Emotional wellness coaching
- **Merge Node**: Combines outputs when both modes are needed

```python
from agent.graph import superbear_graph
from agent.state import AgentState

state = AgentState(
    user_message="What is position sizing?",
    user_id="user-123",
    user_profile={"trading_level": "beginner"},
    session_id="session-456",
    timestamp="2026-02-13T10:30:00Z"
)
result = await superbear_graph.ainvoke(state)
```

The legacy `TutorAgent` class (`agent/tutor_agent.py`) is still available for standalone OADT usage.

### `LearningMemory` — The Memory

Tracks the user's learning journey across sessions:

| Tracked Data | Purpose |
|---|---|
| **Concepts Taught** | Avoid repetition, build on previous lessons |
| **Observed Mistakes** | Identify knowledge gaps |
| **Trade Summaries** | Provide context-aware teaching |
| **Focus Areas** | Prioritize what to teach next |
| **Interaction Count** | Adapt depth and complexity |

### `LLMService` — The Voice

Async wrapper around the **Google Gemini 2.5 Flash Lite** model, handling:
- Fully async calls via `asyncio.to_thread` (non-blocking event loop)
- Structured JSON output enforcement
- Markdown cleanup
- Rate-limit retry with `asyncio.sleep`
- Error handling and retries

### `Prompt Builder` — The Script

Constructs contextual prompts that guide the agent's nodes, incorporating:
- User profile & trading level (snake_case field names: `trading_level`, `learning_style`, `risk_tolerance`)
- Session memory & history
- Intent classification (research / therapy / both)
- Educational focus (NOT trading signals)

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
