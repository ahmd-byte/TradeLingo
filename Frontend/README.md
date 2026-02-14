
  # TradeLingo Frontend

  React + TypeScript frontend for TradeLingo, an AI-powered trading education platform. The original design is available at https://www.figma.com/design/qUkby6yliex7D62hruycCW/deriv-hackathon-tradelingo.

  ## Prerequisites

  - Node.js 18+
  - The FastAPI backend running at `http://localhost:8000` (see `Backend/` folder)

  ## Setup

  1. Install dependencies:

     ```bash
     npm install
     ```

  2. Create a `.env` file in this directory (if not already present):

     ```
     VITE_API_URL=http://localhost:8000/api
     ```

  3. Start the development server:

     ```bash
     npm run dev
     ```

     The app opens at `http://localhost:3000`.

  ## Project Structure

  ```
  src/
  ├── services/           # API integration layer
  │   ├── api.ts          # Central Axios instance (base URL, JWT interceptor)
  │   ├── authService.ts  # register(), login(), logout()
  │   ├── chatService.ts  # sendMessage(), sendTherapyMessage()
  │   ├── educationService.ts  # startEducation(), submitQuiz(), getProgress()
  │   └── tradeService.ts # explainTrade(), listTrades()
  ├── types/
  │   └── api.ts          # Shared TypeScript interfaces for API responses
  ├── components/
  │   └── figma/           # UI components (Figma-exported design)
  │       ├── LandingPage.tsx
  │       ├── LoginForm.tsx
  │       ├── SignUpForm.tsx
  │       ├── OnboardingFlow.tsx
  │       ├── QuizFlow.tsx
  │       ├── Dashboard.tsx
  │       ├── SuperBear.tsx         # AI chat interface
  │       ├── TradingTherapy.tsx    # Therapy chat interface
  │       ├── TradeDiagnosticView.tsx  # Structured trade analysis renderer
  │       └── ...
  └── App.tsx             # Root component with auth-aware routing
  ```

  ## Backend Integration

  The frontend communicates with a FastAPI backend. All AI logic lives server-side; the frontend is presentation-only.

  ### Authentication

  - JWT-based. On login/register, the `access_token` is saved to `localStorage` under the key `"token"`.
  - Every API request automatically attaches `Authorization: Bearer <token>` via an Axios request interceptor.
  - Logging out clears the stored tokens.

  ### API Endpoints Used

  | Endpoint                     | Method | Service Function       | Description                        |
  |------------------------------|--------|------------------------|------------------------------------|
  | `/api/auth/register`         | POST   | `register()`           | Create account, receive JWT        |
  | `/api/auth/login`            | POST   | `login()`              | Authenticate, receive JWT          |
  | `/api/education/start`       | POST   | `startEducation()`     | Generate diagnostic quiz           |
  | `/api/education/submit-quiz` | POST   | `submitQuiz()`         | Submit answers, get curriculum     |
  | `/api/education/progress`    | GET    | `getProgress()`        | Fetch learning progress            |
  | `/api/chat`                  | POST   | `sendMessage()`        | SuperBear AI chat                  |
  | `/api/therapy`               | POST   | `sendTherapyMessage()` | Therapy-focused chat               |
  | `/api/trades/explain`        | POST   | `explainTrade()`       | Deep trade diagnostic analysis     |
  | `/api/trades/list`           | GET    | `listTrades()`         | Fetch recent trades                |

  ### Environment Variables

  | Variable        | Default                        | Description          |
  |-----------------|--------------------------------|----------------------|
  | `VITE_API_URL`  | `http://localhost:8000/api`    | Backend API base URL |

  ## Build

  ```bash
  npm run build
  ```

  Output is written to the `build/` directory.
  