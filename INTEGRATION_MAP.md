# TradeLingo — Frontend / Backend Integration Map

> Single reference for every route connecting the React frontend to the FastAPI backend.

---

## Connection Overview

| Layer | Detail |
|-------|--------|
| **Frontend** | React + TypeScript, Vite dev server on `http://localhost:3000` |
| **Backend** | FastAPI + MongoDB, Uvicorn on `http://localhost:8000` |
| **Base URL** | `VITE_API_URL = http://localhost:8000/api` (set in `Frontend/.env`) |
| **Auth** | JWT Bearer token stored in `localStorage("token")`, attached via Axios interceptor |
| **CORS** | Backend allows all origins (`*`) |

---

## API Client

**File:** `Frontend/src/services/api.ts`

- Axios instance with `baseURL` from `import.meta.env.VITE_API_URL`
- Request interceptor reads `localStorage.getItem("token")` and sets `Authorization: Bearer <token>`
- All service files import this single instance

---

## Route Map

### 1. Authentication

| Action | Frontend Service | Method | Full Backend Route | Auth Required | Backend File |
|--------|-----------------|--------|-------------------|---------------|-------------|
| Register | `authService.register(payload)` | `POST` | `/api/auth/register` | No | `Backend/auth/routes.py` |
| Login | `authService.login(email, password)` | `POST` | `/api/auth/login` | No | `Backend/auth/routes.py` |
| Refresh Token | — (not wired yet) | `POST` | `/api/auth/refresh` | No (uses refresh_token in body) | `Backend/auth/routes.py` |
| Get Current User | — (not wired yet) | `GET` | `/api/auth/me` | Yes | `Backend/auth/routes.py` |
| Logout | `authService.logout()` | — | `/api/auth/logout` | Yes | `Backend/auth/routes.py` |

**Notes:**
- `register` and `login` both save `access_token` to `localStorage("token")` and `refresh_token` to `localStorage("refresh_token")` on success.
- `logout()` is client-side only — clears tokens from `localStorage`.

---

### 2. Chat (SuperBear AI)

| Action | Frontend Service | Method | Full Backend Route | Auth Required | Backend File |
|--------|-----------------|--------|-------------------|---------------|-------------|
| Send Message | `chatService.sendMessage(message, sessionId?)` | `POST` | `/api/chat` | Yes | `Backend/main.py` |
| Send Therapy Message | `chatService.sendTherapyMessage(message, sessionId?)` | `POST` | `/api/therapy` | Yes | `Backend/main.py` |

**Request body:**
```json
{
  "message": "user's message",
  "session_id": "optional-session-id"
}
```

**Backend flow:**
`Input → Load Learning Context → Intent Detection → Route (research / therapy / trade_explain / curriculum_modify) → Mastery Detection → Merge → Response`

---

### 3. Education Pipeline

| Action | Frontend Service | Method | Full Backend Route | Auth Required | Backend File |
|--------|-----------------|--------|-------------------|---------------|-------------|
| Start Education (Quiz) | `educationService.startEducation()` | `POST` | `/api/education/start` | Yes | `Backend/routes/education_routes.py` |
| Submit Quiz | `educationService.submitQuiz(payload)` | `POST` | `/api/education/submit-quiz` | Yes | `Backend/routes/education_routes.py` |
| Get Progress | `educationService.getProgress()` | `GET` | `/api/education/progress` | Yes | `Backend/routes/education_routes.py` |

**Submit Quiz payload:**
```json
{
  "quiz_questions": ["..."],
  "quiz_answers": ["..."]
}
```

---

### 4. Trade Analysis

| Action | Frontend Service | Method | Full Backend Route | Auth Required | Backend File |
|--------|-----------------|--------|-------------------|---------------|-------------|
| Explain Trade | `tradeService.explainTrade(tradeId?, userMessage?, detectedEmotion?)` | `POST` | `/api/trades/explain` | Yes | `Backend/routes/trade_routes.py` |
| List Trades | `tradeService.listTrades(limit?)` | `GET` | `/api/trades/list?limit=N` | Yes | `Backend/routes/trade_routes.py` |
| Upload Trades | — (not wired yet) | `POST` | `/api/trades/upload` | Yes | `Backend/routes/trade_routes.py` |
| Get Trade Type | — (not wired yet) | `GET` | `/api/trades/my-type` | Yes | `Backend/routes/trade_routes.py` |

---

### 5. Utility

| Action | Frontend Service | Method | Full Backend Route | Auth Required | Backend File |
|--------|-----------------|--------|-------------------|---------------|-------------|
| Health Check | — | `GET` | `/api/health` | No | `Backend/main.py` |
| Root | — | `GET` | `/` | No | `Backend/main.py` |

---

## Frontend Component → Service Wiring

| Component | File | Service Used | Action |
|-----------|------|-------------|--------|
| `LoginForm` | `Frontend/src/components/figma/LoginForm.tsx` | `authService.login` | User login |
| `SignUpForm` | `Frontend/src/components/figma/SignUpForm.tsx` | `authService.register` | User registration |
| `App` | `Frontend/src/App.tsx` | `authService.logout` | Logout + session check |
| `SuperBear` | `Frontend/src/components/figma/SuperBear.tsx` | `chatService.sendMessage`, `tradeService.explainTrade` | Chat + trade explain |
| `TradingTherapy` | `Frontend/src/components/figma/TradingTherapy.tsx` | `chatService.sendTherapyMessage` | Therapy chat |
| `QuizFlow` | `Frontend/src/components/figma/QuizFlow.tsx` | `educationService.startEducation`, `educationService.submitQuiz` | Diagnostic quiz + curriculum |

---

## File Structure Reference

```
Frontend/
├── .env                          # VITE_API_URL=http://localhost:8000/api
├── src/
│   ├── services/
│   │   ├── api.ts                # Axios instance + JWT interceptor
│   │   ├── authService.ts        # register, login, logout
│   │   ├── chatService.ts        # sendMessage, sendTherapyMessage
│   │   ├── educationService.ts   # startEducation, submitQuiz, getProgress
│   │   └── tradeService.ts       # explainTrade, listTrades
│   ├── types/
│   │   └── api.ts                # TypeScript interfaces for all API payloads
│   └── components/figma/         # UI components (wired to services)

Backend/
├── .env                          # MONGO_URI, JWT_SECRET, GEMINI keys
├── main.py                       # FastAPI app, /api/chat, /api/therapy
├── auth/
│   ├── routes.py                 # /api/auth/* endpoints
│   ├── schemas.py                # Pydantic request/response models
│   ├── models.py                 # MongoDB user models
│   ├── dependencies.py           # get_current_active_user (JWT guard)
│   └── utils.py                  # hash_password, create_token, etc.
├── routes/
│   ├── education_routes.py       # /api/education/* endpoints
│   └── trade_routes.py           # /api/trades/* endpoints
├── agent/                        # SuperBear LangGraph AI agent
│   ├── state.py                  # AgentState (Pydantic model)
│   ├── graph.py                  # LangGraph workflow definition
│   └── nodes/                    # Individual graph nodes
├── services/                     # LLM service, progress tracking
└── database.py                   # MongoDB connection (Motor async)
```

---

## Quick Test Commands

```bash
# Health check (no auth)
curl http://localhost:8000/api/health

# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"t","password":"pass123"}'

# Login (returns access_token)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Chat (requires token)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"message":"What is a stop loss?"}'
```
