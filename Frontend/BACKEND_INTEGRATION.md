# Backend Integration Guide

This guide explains how to integrate the SuperBear frontend with your FastAPI + MongoDB backend.

## 🎯 Current Status

✅ **Frontend is complete with:**
- Full TypeScript type definitions
- API service layer with Axios
- Custom React hooks for all features
- Mock data for development
- AuthContext for state management

⏳ **Ready to integrate:**
- Backend API endpoints
- MongoDB data models
- Authentication flow

---

## 📋 Quick Start Checklist

### 1. **Install Dependencies**
```bash
npm install
```

This installs:
- `axios` - HTTP client for API calls
- All other dependencies

### 2. **Configure Environment**
Update `.env` file with your backend URL:
```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. **Switch from Mock to Real API**

**Step A: Update `src/utils/mockData.ts`**
```typescript
export const USE_MOCK_API = false; // Change from true to false
```

**Step B: Update `src/contexts/AuthContext.tsx`**
```typescript
<AuthProvider useMockAuth={false}> {/* Change from true to false */}
```

**Step C: Update `src/main.tsx`** (see example below)

---

## 🔌 Integration Steps

### Step 1: Wrap App with AuthProvider

Update `src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider useMockAuth={false}> {/* Set to false when backend is ready */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
```

### Step 2: Use Auth in Components

Example: Update `src/components/screens/SignUpForm.tsx`:

**BEFORE (Mock):**
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // ... validation
  
  // Mock signup
  await new Promise(resolve => setTimeout(resolve, 1000));
  localStorage.setItem('superbear_user', JSON.stringify({...}));
  onSuccess();
};
```

**AFTER (Real API):**
```tsx
import { useAuthContext } from '../../contexts/AuthContext';

export default function SignUpForm({ onBack, onSuccess }: SignUpFormProps) {
  const { signUp } = useAuthContext();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signUp({
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'Sign up failed');
    }
    
    setIsLoading(false);
  };
  
  // ... rest of component
}
```

### Step 3: Use API Hooks in Components

Example: Fetch user profile in Dashboard:

```tsx
import { useUserProfile, useUserProgress } from '../../hooks/useApi';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuthContext();
  const { profile, loading: profileLoading } = useUserProfile(user?.id || '');
  const { progress, loading: progressLoading } = useUserProgress(user?.id || '');
  
  if (profileLoading || progressLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <h1>Welcome, {profile?.username}</h1>
      <p>Level: {progress?.level}</p>
      <p>XP: {progress?.totalXP}</p>
      {/* ... rest of component */}
    </div>
  );
}
```

---

## 🗂️ File Structure

```
src/
├── types/
│   └── index.ts              # All TypeScript types/interfaces
├── services/
│   └── api.ts                # API service layer (axios)
├── hooks/
│   └── useApi.ts             # Custom React hooks for API calls
├── contexts/
│   └── AuthContext.tsx       # Auth state management
├── utils/
│   └── mockData.ts           # Mock data for development
├── components/
│   └── screens/                # UI components (update these)
└── .env                      # Environment configuration
```

---

## 🔑 Backend API Requirements

Your FastAPI backend should implement these endpoints:

### Authentication Endpoints
```
POST   /api/auth/signup        - Create new user
POST   /api/auth/login         - Login user
POST   /api/auth/logout        - Logout user
GET    /api/auth/me            - Get current user
POST   /api/auth/refresh       - Refresh token
```

### User Profile Endpoints
```
GET    /api/users/{userId}/profile        - Get user profile
PATCH  /api/users/{userId}/profile        - Update profile
GET    /api/users/{userId}/progress       - Get user progress
GET    /api/users/{userId}/analytics      - Get user analytics
```

### Learning Path Endpoints
```
GET    /api/learning-paths                - Get all paths
GET    /api/learning-paths/{pathId}       - Get specific path
GET    /api/users/{userId}/paths          - Get user's paths
```

### Lesson Endpoints
```
GET    /api/lessons/{lessonId}            - Get lesson
GET    /api/lessons/{lessonId}/content    - Get lesson content
POST   /api/lessons/{lessonId}/start      - Start lesson
POST   /api/lessons/{lessonId}/complete   - Complete lesson
```

### Quiz Endpoints
```
GET    /api/quizzes/{quizId}              - Get quiz
POST   /api/quizzes/{quizId}/submit       - Submit quiz answers
GET    /api/quizzes/diagnostic            - Get diagnostic quiz
GET    /api/users/{userId}/quiz-attempts  - Get quiz attempts
```

### Deriv Integration Endpoints
```
POST   /api/deriv/connect                 - Connect Deriv account
DELETE /api/users/{userId}/deriv          - Disconnect Deriv
POST   /api/users/{userId}/deriv/sync     - Sync trades
GET    /api/users/{userId}/deriv/analysis - Get trade analysis
GET    /api/users/{userId}/deriv/status   - Get connection status
```

### SuperBear (AI) Endpoints
```
POST   /api/superbear/{userId}/message     - Send message to SuperBear
GET    /api/superbear/{userId}/messages    - Get message history
GET    /api/superbear/{userId}/encouragement - Get encouragement
GET    /api/superbear/{userId}/tip         - Get trading tip
```

### Achievement Endpoints
```
GET    /api/users/{userId}/achievements   - Get user achievements
GET    /api/achievements                  - Get all achievements
```

### Notification Endpoints
```
GET    /api/users/{userId}/notifications   - Get notifications
PATCH  /api/notifications/{id}/read        - Mark as read
PATCH  /api/users/{userId}/notifications/read-all - Mark all as read
```

### Leaderboard Endpoints
```
GET    /api/leaderboard                    - Get leaderboard
GET    /api/leaderboard/user/{userId}      - Get user rank
```

---

## 📝 Response Format

All API responses should follow this format:

```typescript
{
  "success": boolean,
  "data": T | null,
  "error": {
    "code": string,
    "message": string,
    "details": any
  } | null,
  "meta": {
    "page": number,
    "limit": number,
    "total": number
  } | null
}
```

Example success response:
```json
{
  "success": true,
  "data": {
    "id": "user-123",
    "username": "traderpro",
    "email": "trader@example.com"
  },
  "error": null
}
```

Example error response:
```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password",
    "details": null
  }
}
```

---

## 🔐 Authentication Flow

### 1. **User Signs Up/Logs In**
- Frontend calls `authApi.signUp()` or `authApi.login()`
- Backend returns user data + JWT token
- Frontend stores token in localStorage
- Token is automatically added to all subsequent requests via Axios interceptor

### 2. **Authenticated Requests**
- Axios interceptor adds: `Authorization: Bearer {token}` header
- Backend validates token on protected routes
- If token is invalid/expired → Backend returns 401
- Frontend auto-redirects to login page

### 3. **Token Refresh**
- Implement token refresh logic in `src/services/api.ts` if needed
- Or use short-lived tokens with refresh tokens

---

## 🧪 Testing the Integration

### Step 1: Test with Mock Data
```bash
# Make sure mock data is enabled
# In src/utils/mockData.ts: USE_MOCK_API = true
# In src/contexts/AuthContext.tsx: useMockAuth={true}

npm run dev
# Test all flows work correctly
```

### Step 2: Test with Real Backend
```bash
# Start your FastAPI backend
cd ../backend
python main.py  # or however you start it

# Switch to real API
# In src/utils/mockData.ts: USE_MOCK_API = false
# In src/contexts/AuthContext.tsx: useMockAuth={false}

# Update .env with backend URL
# VITE_API_BASE_URL=http://localhost:8000/api

cd ../frontend
npm run dev
```

### Step 3: Test Each Feature
- [ ] Sign up new user
- [ ] Login existing user
- [ ] View profile
- [ ] Start a lesson
- [ ] Complete a lesson
- [ ] Take a quiz
- [ ] Connect Deriv account
- [ ] Chat with SuperBear
- [ ] View achievements
- [ ] Check leaderboard

---

## 🐛 Troubleshooting

### CORS Issues
If you see CORS errors, add CORS middleware to your FastAPI backend:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 401 Errors (Unauthorized)
- Check if token is being sent: Open DevTools → Network → Headers
- Verify token format in backend
- Check token expiration

### Network Errors
- Verify backend is running
- Check VITE_API_BASE_URL in `.env`
- Verify backend port matches

### Type Mismatches
- Check backend response matches TypeScript types in `src/types/index.ts`
- Update types if backend schema is different

---

## 📚 Available API Services

Import these from `src/services/api.ts`:

```typescript
import {
  authApi,           // Authentication
  profileApi,        // User profile
  learningPathApi,   // Learning paths
  lessonApi,         // Lessons
  quizApi,           // Quizzes
  derivApi,          // Deriv integration
  superBearApi,      // AI companion
  achievementsApi,   // Achievements
  notificationsApi,  // Notifications
  leaderboardApi,    // Leaderboard
} from './services/api';
```

---

## 📚 Available Hooks

Import these from `src/hooks/useApi.ts`:

```typescript
import {
  useAuth,              // Authentication
  useUserProfile,       // User profile
  useUserProgress,      // User progress
  useLearningPaths,     // Learning paths
  useLearningPath,      // Single path
  useLesson,            // Lesson
  useQuiz,              // Quiz
  useDiagnosticQuiz,    // Diagnostic quiz
  useDerivConnection,   // Deriv integration
  useSuperBear,         // AI companion
  useAchievements,      // Achievements
  useNotifications,     // Notifications
  useLeaderboard,       // Leaderboard
  useUserRank,          // User rank
} from './hooks/useApi';
```

---

## ✅ Integration Complete!

Once you've followed these steps, your frontend will be fully integrated with the backend.

**Need help?** Check the inline comments in:
- `src/services/api.ts` - API service layer
- `src/hooks/useApi.ts` - React hooks
- `src/types/index.ts` - Type definitions

**Happy coding! 🐻✨**
