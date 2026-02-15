# SuperBear Frontend - Quick Reference

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
src/
├── types/              # TypeScript type definitions
│   └── index.ts        # All interfaces and types for the app
│
├── services/           # API services
│   ├── api.ts          # Main API service layer (Axios)
│   └── apiTest.ts      # API connection testing utility
│
├── hooks/              # Custom React hooks
│   └── useApi.ts       # Hooks for all API calls
│
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
│
├── utils/              # Utility functions
│   └── mockData.ts     # Mock data for development
│
├── components/         # React components
│   ├── ui/             # Reusable UI components (buttons, cards, etc.)
│   └── screens/          # Feature components (Dashboard, Lessons, etc.)
│
├── styles/             # Global styles
│   └── globals.css     # Tailwind + custom animations
│
└── assets/             # Images, icons, etc.
```

---

## 🔧 Configuration Files

### `.env`
Environment variables for the app:
```env
VITE_API_BASE_URL=http://localhost:8000/api  # Your FastAPI backend URL
VITE_APP_NAME=SuperBear
VITE_APP_ENV=development
```

### `package.json`
Project dependencies and scripts. Key dependency:
- `axios` - For API calls to backend

### `vite.config.ts`
Vite configuration (already set up)

### `tsconfig.json`
TypeScript configuration (already set up)

---

## 🎯 Backend Integration Status

### ✅ Ready for Integration
- All TypeScript types defined
- API service layer complete
- Custom hooks for all features
- Auth context for state management
- Mock data for development

### 🔄 To Integrate Backend
1. Update `.env` with your backend URL
2. Set `USE_MOCK_API = false` in `src/utils/mockData.ts`
3. Set `useMockAuth={false}` in `src/contexts/AuthContext.tsx`
4. Test connection: Run `window.testAPI()` in browser console

**See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) for detailed instructions.**

---

## 📚 Key Features

### 1. **Authentication**
- Sign up / Login / Logout
- JWT token management
- Auto-redirect on auth errors
- Protected routes

**Files:**
- `src/contexts/AuthContext.tsx` - Auth state
- `src/components/screens/SignUpForm.tsx` - Sign up UI
- `src/components/screens/LoginForm.tsx` - Login UI

### 2. **Learning Paths**
- Browse learning paths
- Track progress
- Complete lessons
- Earn XP and achievements

**Files:**
- `src/components/screens/Dashboard.tsx` - Main dashboard
- `src/components/screens/LessonFlow.tsx` - Lesson interface
- `src/components/screens/BranchingRail.tsx` - Learning path visualization

### 3. **Quizzes**
- Diagnostic quiz
- Lesson quizzes
- Progress tracking
- XP rewards

**Files:**
- `src/components/screens/QuizFlow.tsx` - Quiz interface

### 4. **Deriv Integration**
- Connect Deriv account
- Sync trading history
- Analyze trading patterns
- Get personalized recommendations

**Files:**
- `src/components/screens/UserProfiling.tsx` - Deriv connection flow

### 5. **SuperBear (AI Companion)**
- Chat with AI
- Get trading tips
- Receive encouragement
- Personalized guidance

**Files:**
- `src/components/screens/SuperBear.tsx` - AI chat interface

### 6. **Gamification**
- XP system
- Levels
- Streaks
- Achievements
- Leaderboard

**Files:**
- `src/components/screens/StreaksCenter.tsx` - Streak tracking
- `src/components/screens/ProfileCenter.tsx` - Profile & achievements

---

## 🎨 UI Components

### Design System
- **Colors:** Red (#FF1814), Yellow (#F3FF00), Black, White
- **Fonts:** Arimo Bold
- **Style:** Flat 2D with offset shadows
- **Buttons:** Offset shadow style (see `src/components/ui/button.tsx`)

### Custom Animations
All animations are defined in `src/styles/globals.css`:
- `animate-bounce-slow` - Thinking bear
- `animate-cooking` - Cooking animation
- `animate-confetti` - Success confetti
- `animate-shake-attention` - Button shake
- And 40+ more animations

**⚠️ DO NOT MODIFY `globals.css` - animations are production-ready**

---

## 🔌 Using the API

### Example: Fetch User Profile

```tsx
import { useUserProfile } from '../hooks/useApi';

function ProfileComponent({ userId }: { userId: string }) {
  const { profile, loading, error, updateProfile } = useUserProfile(userId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{profile?.username}</h1>
      <p>Level: {profile?.currentLevel}</p>
      <p>XP: {profile?.totalXP}</p>
    </div>
  );
}
```

### Example: Submit Quiz

```tsx
import { useQuiz } from '../hooks/useApi';

function QuizComponent({ quizId }: { quizId: string }) {
  const { quiz, loading, submitQuiz } = useQuiz(quizId);

  const handleSubmit = async () => {
    const result = await submitQuiz({
      quizId,
      answers: [...], // user answers
      timeSpent: 120,
    });

    if (result.success) {
      console.log('Score:', result.result.score);
    }
  };

  // ...
}
```

### Example: Connect Deriv Account

```tsx
import { useDerivConnection } from '../hooks/useApi';

function DerivConnectComponent({ userId }: { userId: string }) {
  const { connection, connectAccount, fetchTradeAnalysis } = useDerivConnection(userId);

  const handleConnect = async () => {
    const result = await connectAccount('DERIV_ACCOUNT_ID', 'DERIV_TOKEN');
    
    if (result.success) {
      // Fetch trade analysis
      const analysis = await fetchTradeAnalysis();
      console.log('Trading patterns:', analysis.analysis?.tradingPatterns);
    }
  };

  // ...
}
```

---

## 🧪 Testing API Connection

### In Browser Console:
```javascript
// Test if backend is reachable
window.testAPI()
```

This will check:
- ✅ Backend connectivity
- ✅ Auth endpoints
- ✅ Environment configuration

### Manual Testing:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform an action (e.g., login)
4. Check the API request:
   - Request URL
   - Request headers (should have `Authorization: Bearer ...`)
   - Response status (200 = success, 401 = unauthorized, etc.)

---

## 📖 Available Imports

### Types
```typescript
import type {
  User,
  UserProfile,
  LearningPath,
  Lesson,
  Quiz,
  Achievement,
  // ... and many more
} from './types';
```

### API Services (Direct)
```typescript
import {
  authApi,
  profileApi,
  lessonApi,
  quizApi,
  derivApi,
  superBearApi,
  // ... and more
} from './services/api';

// Example
const user = await authApi.getCurrentUser();
```

### API Hooks (Recommended)
```typescript
import {
  useAuth,
  useUserProfile,
  useLesson,
  useQuiz,
  useDerivConnection,
  useSuperBear,
  // ... and more
} from './hooks/useApi';

// Example
const { user, login, logout } = useAuth();
```

### Auth Context
```typescript
import { useAuthContext } from './contexts/AuthContext';

const { user, isAuthenticated, login, logout } = useAuthContext();
```

---

## 🐛 Common Issues

### Issue: "Cannot reach backend API"
**Solution:** 
1. Check if backend is running
2. Verify `VITE_API_BASE_URL` in `.env`
3. Restart dev server after changing `.env`

### Issue: CORS errors
**Solution:** Add CORS middleware in your FastAPI backend:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Types don't match backend response
**Solution:** Update types in `src/types/index.ts` to match your backend schema

### Issue: Token not being sent
**Solution:** Check Axios interceptor in `src/services/api.ts` - it should automatically add auth header

---

## 📝 Development Workflow

### Working WITHOUT Backend (Mock Mode)
1. Keep `USE_MOCK_API = true` in `src/utils/mockData.ts`
2. Keep `useMockAuth={true}` in `src/contexts/AuthContext.tsx`
3. Work on UI and interactions
4. All data comes from `src/utils/mockData.ts`

### Working WITH Backend
1. Set `USE_MOCK_API = false` in `src/utils/mockData.ts`
2. Set `useMockAuth={false}` in `src/contexts/AuthContext.tsx`
3. Update `.env` with correct backend URL
4. Run `window.testAPI()` to verify connection
5. Start building features

---

## 🚀 Deployment

### Backend Requirements
- FastAPI backend running
- MongoDB connected
- All required endpoints implemented (see BACKEND_INTEGRATION.md)
- CORS configured for your frontend domain

### Frontend Build
```bash
# Build for production
npm run build

# Output will be in /dist folder
# Deploy this folder to your hosting service (Vercel, Netlify, etc.)
```

### Environment Variables
Make sure to set production environment variables:
```env
VITE_API_BASE_URL=https://your-backend-api.com/api
VITE_APP_ENV=production
```

---

## 📚 Additional Documentation

- **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** - Complete backend integration guide
- **[SETUP_GUIDE.md](src/SETUP_GUIDE.md)** - Original setup guide with animation details
- **[Guidelines.md](src/guidelines/Guidelines.md)** - Design system guidelines

---

## 🆘 Need Help?

1. **API not working?** → Check `BACKEND_INTEGRATION.md`
2. **Types unclear?** → Check `src/types/index.ts`
3. **How to use a hook?** → Check `src/hooks/useApi.ts` (fully commented)
4. **Animation broken?** → Check `src/SETUP_GUIDE.md`

---

## ✅ Checklist for Backend Integration

- [ ] Backend API is running
- [ ] `.env` file configured with correct API URL
- [ ] `npm install` completed (axios installed)
- [ ] `USE_MOCK_API = false` in `src/utils/mockData.ts`
- [ ] `useMockAuth={false}` in `src/contexts/AuthContext.tsx`
- [ ] Ran `window.testAPI()` - all tests passed
- [ ] Can sign up new user
- [ ] Can login existing user
- [ ] User data persists across page refreshes
- [ ] Protected routes work correctly

**You're ready to go! 🎉**
