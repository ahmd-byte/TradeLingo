<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<h1 align="center">🐻 TradeLingo</h1>

<p align="center">
  <strong>Learn trading the fun way — with SuperBear, your AI-powered trading tutor.</strong><br/>
  A gamified education platform that feels like Duolingo, but for the stock market.
</p>

---

## 💡 What is TradeLingo?

Most people want to learn trading but get overwhelmed by jargon, boring textbooks, and information overload. **TradeLingo** flips that on its head.

We combine a **bold, comic-book-style UI** with an **AI tutor agent** (powered by Google Gemini) that adapts to *your* level, remembers what you've learned, and teaches you one concept at a time — the way a great mentor would.

> **No fluff. No trading signals. Just real education, gamified.**

---

## ✨ Features at a Glance

| Feature | What It Does |
|---|---|
| 🎯 **Learning Path** | Duolingo-style lesson progression with XP, milestones, and locked levels |
| 🐻 **SuperBear AI Chat** | Ask any trading question — get personalized, structured teaching |
| 🧠 **Trading Therapy** | Guided self-reflection on your trading habits and emotions |
| 🔥 **Streaks** | Track daily learning streaks to build consistency |
| 📊 **Interactive Quizzes** | Test your knowledge after each lesson |
| 👤 **Smart Profiling** | Onboarding wizard that tailors everything to your experience level |
| 🤖 **OADT Agent Loop** | AI follows Observe → Analyze → Decide → Teach to never give generic answers |

---

## 🧠 How the AI Works

TradeLingo's backend isn't just a chatbot wrapper — it's a **structured AI agent** that thinks before it teaches:

```
  Your Question / Trade Data
          │
          ▼
  ┌───────────────────┐
  │     OBSERVE       │  ← Gather context (trade, question, profile)
  └───────┬───────────┘
          │
          ▼
  ┌───────────────────┐
  │     ANALYZE       │  ← Identify patterns, gaps, learning opportunities
  └───────┬───────────┘
          │
          ▼
  ┌───────────────────┐
  │     DECIDE        │  ← Pick ONE concept to teach (via Gemini LLM)
  └───────┬───────────┘
          │
          ▼
  ┌───────────────────┐
  │     TEACH         │  ← Generate structured, personalized content
  └───────────────────┘
          │
          ▼
    JSON Response → Frontend
```

The agent **remembers** what it already taught you, tracks your mistakes, and adapts its depth over time. Every response includes an observation, analysis, teaching content, a practical example, and a suggestion for what to learn next.

---

## 🖼️ App Navigation

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

## 🛠️ Tech Stack

<table>
  <tr>
    <th align="center">Frontend</th>
    <th align="center">Backend</th>
  </tr>
  <tr>
    <td>
      React 18 &nbsp;·&nbsp; TypeScript<br/>
      Vite 6 &nbsp;·&nbsp; Tailwind CSS 3<br/>
      Radix UI &nbsp;·&nbsp; React Router 7<br/>
      Lucide Icons &nbsp;·&nbsp; Recharts
    </td>
    <td>
      Python 3.11+ &nbsp;·&nbsp; Flask 3.1<br/>
      Google Gemini 2.5 Flash<br/>
      Flask-CORS &nbsp;·&nbsp; dotenv<br/>
      Modular Agent Architecture
    </td>
  </tr>
</table>

---

## 📁 Project Structure

```
TradeLingo/
│
├── frontend/                         # 🎨 React + Vite client
│   ├── src/
│   │   ├── App.tsx                   # Router & route definitions
│   │   ├── main.tsx                  # Entry point
│   │   ├── components/
│   │   │   ├── figma/                # Main application screens
│   │   │   │   ├── LandingPage.tsx   # Hero & CTA
│   │   │   │   ├── OnboardingFlow.tsx# Multi-step onboarding wizard
│   │   │   │   ├── Dashboard.tsx     # Main layout & sidebar nav
│   │   │   │   ├── LessonFlow.tsx    # Lesson content & progression
│   │   │   │   ├── QuizFlow.tsx      # Interactive quizzes
│   │   │   │   ├── SuperBear.tsx     # 🐻 AI chat interface
│   │   │   │   ├── TradingTherapy.tsx# Guided self-reflection
│   │   │   │   ├── StreaksCenter.tsx  # Streak tracker
│   │   │   │   └── ProfileCenter.tsx # User profile
│   │   │   └── ui/                   # 30+ Radix UI primitives
│   │   ├── assets/                   # Images & static files
│   │   └── styles/                   # Global stylesheets
│   ├── vite.config.ts                # Dev server & backend proxy
│   ├── tailwind.config.js            # Tailwind configuration
│   └── package.json                  # Dependencies & scripts
│
├── Backend/                          # 🤖 Flask + Gemini AI server
│   ├── flask-app.py                  # Flask app & API routes
│   ├── agent/
│   │   └── tutor_agent.py            # TutorAgent (OADT decision loop)
│   ├── memory/
│   │   └── learning_memory.py        # Session memory tracking
│   ├── prompts/
│   │   └── tutor_prompt.py           # Prompt templates & builders
│   ├── services/
│   │   └── llm_service.py            # Gemini API wrapper
│   ├── test_agent.py                 # Agent tests
│   └── requirements.txt              # Python dependencies
│
└── README.md                         # You are here
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| **Node.js** | 18+ |
| **Python** | 3.11+ |
| **Google Gemini API Key** | [Get one free](https://aistudio.google.com/apikey) |

### 1 · Clone the Repository

```bash
git clone https://github.com/your-username/TradeLingo.git
cd TradeLingo
```

### 2 · Start the Backend

```bash
cd Backend

# Create & activate virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure your API key
echo GEMINI_API_KEY=your_key_here > .env

# Run the server
python flask-app.py
```

Backend starts at **http://localhost:5000**

### 3 · Start the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend starts at **http://localhost:3000** — the Vite dev server automatically proxies `/api/*` requests to the backend.

### 4 · Open & Explore

Visit **http://localhost:3000** in your browser. You'll land on the homepage — go through the onboarding flow and start chatting with SuperBear!

---

## 📡 API Reference

### `GET /api/health`

Quick health check.

```json
{ "status": "ok" }
```

### `POST /api/chat`

Send a message to the AI tutor.

<details>
<summary><strong>Request Body</strong></summary>

```json
{
  "message": "What is a stock?",
  "session_id": "user-session-123",
  "user_profile": {
    "name": "Ahmad",
    "tradingLevel": "beginner",
    "learningStyle": "visual",
    "riskTolerance": "medium",
    "preferredMarkets": "Stocks",
    "tradingFrequency": "weekly"
  },
  "trade_data": {
    "stockCode": "AAPL",
    "stockName": "Apple Inc.",
    "action": "buy",
    "units": "10",
    "price": "150.00",
    "date": "2026-02-08"
  }
}
```

</details>

<details>
<summary><strong>Response</strong></summary>

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

</details>

---

## 🎨 Design Language

TradeLingo uses a **bold, comic-book inspired** aesthetic:

- **Dark theme** (`#1a1a1a`) with punchy red (`#ff1814`) and yellow (`#f3ff00`) accents
- **Thick borders** (`3–5px`) with offset box shadows (`shadow-[6px_6px_0px_#000]`)
- **Arimo Bold** font, uppercase headings, chunky text
- **Radix UI** primitives styled with Tailwind CSS
- Subtle animations — fade-ins, typewriter effects, bounce

---

## 🧪 Running Tests

```bash
# Backend agent tests
cd Backend
python test_agent.py
```

---

## ⚙️ Environment Variables

| Variable | Where | Description |
|---|---|---|
| `GEMINI_API_KEY` | `Backend/.env` | Your Google Gemini API key (**required**) |

---

## 📜 Available Scripts

| Command | Location | Description |
|---|---|---|
| `npm run dev` | `frontend/` | Start frontend dev server (port 3000) |
| `npm run build` | `frontend/` | Production build |
| `python flask-app.py` | `Backend/` | Start backend server (port 5000) |
| `python test_agent.py` | `Backend/` | Run agent tests |

---

## 📄 License

MIT — build cool things with it.

---

<p align="center">
  <strong>Built with ❤️ by the TradeLingo team</strong><br/>
  <em>Because everyone deserves to understand the market.</em>
</p>
