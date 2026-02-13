# 🔗 Frontend ↔ Backend Integration Plan

> **Status:** Not started  
> **Goal:** Connect the React frontend to the FastAPI backend with full JWT authentication.

---

## 📍 Current State

| Area | Status |
|---|---|
| Backend API | ✅ Running at `http://localhost:8000` |
| Swagger UI | ✅ Available at `http://localhost:8000/docs` |
| JWT Auth (Backend) | ✅ Login, register, refresh, me endpoints |
| Vite Proxy | ✅ `/api` → `http://localhost:8000` (updated) |
| Frontend Auth | ❌ **No login/signup flow** |
| Token Management | ❌ **No token storage or injection** |
| SuperBear Chat | ⚠️ Calls `/api/chat` but **without Bearer token** → 403 |
| Trading Therapy | ⚠️ Calls `/api/therapy` but **without Bearer token** → 403 |
| User Profile | ⚠️ Hardcoded in components instead of fetched from backend |

---

## 🛠️ Integration Steps

### Step 1: Create API Service Layer

Create `frontend/src/services/api.ts` — a centralized API client that handles:

- Base URL configuration
- Token injection (Bearer header) on every request
- Auto-refresh on 401 responses
- Logout on refresh failure

```
frontend/src/services/
├── api.ts          # fetch wrapper with auth headers
├── auth.ts         # login(), register(), logout(), refreshToken()
└── chat.ts         # sendChat(), sendTherapy()
```

### Step 2: Create Auth Context & State

Create `frontend/src/context/AuthContext.tsx`:

- Store `accessToken`, `refreshToken`, and `user` in React context
- Persist tokens in `localStorage`
- Provide `login()`, `register()`, `logout()` functions
- Auto-load user on app mount via `GET /api/auth/me`
- Auto-refresh token before expiry

### Step 3: Create Login/Signup Page

Create `frontend/src/components/figma/LoginPage.tsx`:

- Email + password form
- Call `POST /api/auth/login`
- Store tokens → redirect to `/dashboard/learn`
- Link to registration flow

Option: Integrate into existing `OnboardingFlow` — after profiling/quiz, auto-register the user.

### Step 4: Add Protected Route Wrapper

Create `frontend/src/components/ProtectedRoute.tsx`:

- Check if user is authenticated
- Redirect to `/login` if no token
- Wrap Dashboard routes

Update `App.tsx`:
```tsx
<Route path="/dashboard/*" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

### Step 5: Update SuperBear & TradingTherapy Components

Update `SuperBear.tsx` and `TradingTherapy.tsx` to:

1. Get token from AuthContext
2. Add `Authorization: Bearer <token>` header to fetch calls
3. Use real user profile from `GET /api/auth/me` instead of hardcoded values
4. Handle 401 errors (trigger token refresh or redirect to login)

**Before (current):**
```tsx
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message, session_id: '...', user_profile: { /* hardcoded */ } }),
});
```

**After (integrated):**
```tsx
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ message, session_id: '...' }),
});
```

### Step 6: Wire User Profile from Backend

- Fetch user profile on login via `GET /api/auth/me`
- Pass real `trading_level`, `learning_style`, `risk_tolerance` to chat
- Display username in Dashboard sidebar/header
- Update profile via `PUT /api/auth/profile` (if needed)

---

## 📁 New Files to Create

| File | Purpose |
|---|---|
| `src/services/api.ts` | Fetch wrapper with auth headers |
| `src/services/auth.ts` | Auth API functions (login, register, etc.) |
| `src/services/chat.ts` | Chat/therapy API functions |
| `src/context/AuthContext.tsx` | Auth state management |
| `src/components/ProtectedRoute.tsx` | Route guard for authenticated pages |
| `src/components/figma/LoginPage.tsx` | Login/signup UI |

---

## 🔧 Files to Modify

| File | Change |
|---|---|
| `App.tsx` | Add login route, wrap dashboard with ProtectedRoute |
| `SuperBear.tsx` | Add Bearer token to fetch, use real user profile |
| `TradingTherapy.tsx` | Add Bearer token to fetch, use real user profile |
| `Dashboard.tsx` | Show user info from auth context |
| `OnboardingFlow.tsx` | Optionally auto-register user after profiling |

---

## 🏃 Quick Start (Development)

```bash
# Terminal 1: Backend
cd Backend
.venv\Scripts\activate
uvicorn main:app --reload
# → http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev
# → http://localhost:3000 (proxies /api → localhost:8000)
```

### Demo Login
- **Email:** ahmadsyafi01@gmail.com
- **Password:** 1234

---

## ⚡ API Endpoints Used by Frontend

| Frontend Action | Method | Endpoint | Auth Required |
|---|---|---|---|
| Health check | GET | `/api/health` | No |
| Register | POST | `/api/auth/register` | No |
| Login | POST | `/api/auth/login` | No |
| Get profile | GET | `/api/auth/me` | Yes |
| Refresh token | POST | `/api/auth/refresh` | No |
| Chat (SuperBear) | POST | `/api/chat` | Yes |
| Therapy | POST | `/api/therapy` | Yes |
