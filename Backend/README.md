<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Flask-3.1-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

# 🐻 TradeLingo Backend — AI Trading Tutor Agent

> A modular, single AI agent system that serves as an educational tutor for trading concepts. Powered by Google Gemini, it follows a structured **OBSERVE → ANALYZE → DECIDE → TEACH** decision loop to deliver personalized trading education.

---

## 🧠 How It Works

```
User Question / Trade Data
        │
        ▼
┌───────────────────┐
│    OBSERVE        │  ← Gather context (trade, question, profile)
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│    ANALYZE        │  ← Identify patterns, gaps, and learning opportunities
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│    DECIDE         │  ← Choose one concept to teach (via LLM)
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│    TEACH          │  ← Generate structured educational content
└───────────────────┘
        │
        ▼
  JSON Response → Frontend
```

The agent processes each interaction through this loop and returns a structured JSON response with observations, analysis, teaching content, and next steps — all personalized to the user's trading level and learning style.

---

## 📁 Project Structure

```
Backend/
├── flask-app.py              # Main Flask application & API routes
│
├── agent/                    # 🤖 Agent logic
│   ├── __init__.py
│   └── tutor_agent.py        # TutorAgent class (OADT decision loop)
│
├── memory/                   # 🧠 Session memory management
│   ├── __init__.py
│   └── learning_memory.py    # LearningMemory class
│
├── prompts/                  # 📝 Prompt engineering
│   ├── __init__.py
│   └── tutor_prompt.py       # Prompt templates & builders
│
├── services/                 # 🔗 External services
│   ├── __init__.py
│   └── llm_service.py        # Gemini API wrapper
│
├── ARCHITECTURE.md           # Detailed architecture documentation
├── requirements.txt          # Python dependencies
└── README.md                 # You are here
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
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
GEMINI_API_KEY=your_gemini_api_key_here
```

### 5. Run the Server

```bash
python flask-app.py
```

The server will start at **http://127.0.0.1:5000** with debug mode enabled.

---

## 📡 API Endpoints

### `GET /api/health`

Health check endpoint.

**Response:**
```json
{ "status": "ok" }
```

### `POST /api/chat`

Main chat endpoint for the SuperBear AI tutor.

**Request Body:**
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

---

## 🏗️ Core Modules

### `TutorAgent` — The Brain

The main agent class implementing the OADT educational loop. It orchestrates the entire flow from receiving user input to generating teaching content.

```python
from agent import run_agent
from memory import LearningMemory

memory = LearningMemory()
response, updated_memory = run_agent(input_data, memory=memory)
```

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

Wrapper around the **Google Gemini 2.5 Flash Lite** model, handling:
- Structured JSON output enforcement
- Markdown cleanup
- Error handling and retries

### `Prompt Builder` — The Script

Constructs contextual prompts that guide the agent's decision loop, incorporating:
- User profile & trading level
- Session memory & history
- Educational focus (NOT trading signals)

---

## ⚙️ Configuration

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | Google Gemini API key | Required |
| `PORT` | Server port | `5000` |
| `DEBUG` | Flask debug mode | `True` |

---

## 🧪 Testing

```bash
python test_agent.py
```

---

## 📄 License

This project is part of the **TradeLingo** platform.
