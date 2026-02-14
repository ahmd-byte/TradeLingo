<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

# 🐻 TradeLingo Frontend — Gamified Trading Education

> A bold, gamified trading education interface built with React and Tailwind CSS. Designed with a playful, comic-book aesthetic featuring SuperBear — your AI-powered trading tutor.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Learning Path** | Duolingo-style lesson progression with XP, milestones, and locked levels |
| 🐻 **SuperBear AI Chat** | Interactive AI tutor powered by Gemini — ask any trading question |
| 🧠 **Trading Therapy** | Guided self-reflection on trading habits and emotions |
| 🔥 **Streaks** | Track your daily learning streaks to build consistency |
| 👤 **User Profile** | Personalized trading profile with learning preferences |
| 🎨 **Onboarding Flow** | Step-by-step user profiling to personalize the experience |
| 📊 **Quiz System** | Test your trading knowledge with interactive quizzes |

---

## 🖼️ Pages & Navigation

```
Landing Page (/)
  └── Onboarding Flow → User Profiling
        └── Dashboard (/dashboard/*)
              ├── /learn          → Lesson Path (Duolingo-style)
              ├── /therapy        → Trading Therapy
              ├── /superbear      → SuperBear AI Chat
              ├── /streaks        → Streak Tracker
              └── /profile        → User Profile
```

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.tsx                      # Router & route definitions
│   ├── main.tsx                     # Entry point
│   ├── index.css                    # Global styles
│   │
│   ├── components/
│   │   ├── figma/                   # 🎨 Main application components
│   │   │   ├── LandingPage.tsx      # Landing page with hero & CTA
│   │   │   ├── OnboardingFlow.tsx   # Multi-step onboarding wizard
│   │   │   ├── UserProfiling.tsx    # Trading profile questionnaire
│   │   │   ├── Dashboard.tsx        # Main dashboard layout & navigation
│   │   │   ├── LessonFlow.tsx       # Lesson content & quiz flow
│   │   │   ├── QuizFlow.tsx         # Interactive quiz component
│   │   │   ├── SuperBear.tsx        # 🐻 AI chat interface (center)
│   │   │   ├── SuperBearRightPanel.tsx  # AI response details panel
│   │   │   ├── TradingTherapy.tsx   # Trading therapy module
│   │   │   ├── StreaksCenter.tsx     # Streak display (center)
│   │   │   ├── StreaksRightPanel.tsx # Streak details panel
│   │   │   ├── ProfileCenter.tsx    # Profile display (center)
│   │   │   ├── ProfileRightPanel.tsx # Profile details panel
│   │   │   └── ImageWithFallback.tsx # Utility image component
│   │   │
│   │   └── ui/                      # 🧩 Reusable Radix UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── progress.tsx
│   │       └── ... (30+ components)
│   │
│   ├── assets/                      # Images & static assets
│   └── styles/                      # Additional stylesheets
│
├── vite.config.ts                   # Vite config with proxy to backend
├── tailwind.config.js               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies & scripts
└── README.md                        # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm** or **yarn**

### 1. Navigate to Frontend

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app will open at **http://localhost:3000**.

> **Note:** The Vite dev server proxies `/api/*` requests to `http://localhost:5000` (the Flask backend). Make sure the backend is running for AI chat features to work.

### 4. Build for Production

```bash
npm run build
```

Output will be in the `build/` directory.

---

## 🔌 Backend Integration

The frontend communicates with the Flask backend via a Vite proxy:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
}
```

### API Calls

| Component | Endpoint | Purpose |
|---|---|---|
| **SuperBear** | `POST /api/chat` | Send messages to the AI tutor |
| **Health Check** | `GET /api/health` | Verify backend connectivity |

---

## 🎨 Design System

The UI follows a **bold, comic-book inspired** design language:

- **Colors:** Dark theme (`#1a1a1a`) with red (`#ff1814`), yellow (`#f3ff00`), and white accents
- **Borders:** Thick black borders (`3-5px`) with offset shadows (`shadow-[6px_6px_0px_#000]`)
- **Typography:** Arimo Bold font, uppercase headings, chunky text
- **Components:** Radix UI primitives styled with Tailwind CSS
- **Animations:** Fade-ins, typewriter effects, bounce animations

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite 6** | Build tool & dev server |
| **Tailwind CSS 3** | Utility-first styling |
| **Radix UI** | Accessible UI primitives |
| **React Router 7** | Client-side routing |
| **Lucide React** | Icon library |
| **Recharts** | Data visualization |

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Build for production |

---

## 📄 License

This project is part of the **TradeLingo** platform.
