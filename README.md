# SuperBear Trading Education

A gamified trading education platform with AI-powered personalized learning.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [GitHub Upload](#-github-upload)
- [Documentation](#-documentation)
- [Project Structure](#-project-structure)

---

## 🎯 Features

- **Personalized Learning Paths** - AI-driven adaptive learning based on trading style
- **Gamification** - XP, levels, streaks, and achievements
- **SuperBear AI Companion** - Trading coach and emotional support
- **Deriv Integration** - Connect real trading account for personalized insights
- **Interactive Quizzes** - Diagnostic and lesson-based assessments
- **Beautiful UI** - Bold, game-like design with smooth animations

---

## 🛠 Tech Stack

- **Framework**: React 18.3.1 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git (for cloning)

### Installation

1. **Clone the repository** (or download the code):
   ```bash
   git clone https://github.com/ahmd-byte/TradeLingo.git
   cd TradeLingo/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   This will download all required packages (~200-300 MB). Takes 5-10 minutes.

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output will be in the `dist/` folder.

---

## 📤 GitHub Upload

### For Repository Maintainers

To upload this frontend to the `sarvind2` branch on GitHub:

#### Option 1: Automated Script (Recommended)

```powershell
.\upload-to-github.ps1
```

Follow the prompts. The script will guide you through the entire process.

#### Option 2: Manual Upload

See detailed instructions in **[GITHUB_UPLOAD_GUIDE.md](./GITHUB_UPLOAD_GUIDE.md)**

#### What Gets Uploaded

✅ **Included** (~5-15 MB):
- Source code (`src/`)
- `package.json` and `package-lock.json`
- Configuration files
- Documentation

❌ **Excluded** (via `.gitignore`):
- `node_modules/` (200+ MB)
- `dist/` (build output)
- `.env` files
- Editor settings

Team members will run `npm install` to download packages locally.

---

## 📚 Documentation

- **[FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)** - Complete frontend architecture and features
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - API integration guide
- **[GITHUB_UPLOAD_GUIDE.md](./GITHUB_UPLOAD_GUIDE.md)** - Step-by-step upload instructions
- **[INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)** - Integration overview
- **[src/SETUP_GUIDE.md](./src/SETUP_GUIDE.md)** - Animation and styling setup
- **[src/ANIMATION_REFERENCE.md](./src/ANIMATION_REFERENCE.md)** - Animation implementation details

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── screens/          # Main application screens
│   │   │   ├── Dashboard.tsx
│   │   │   ├── BranchingRail.tsx
│   │   │   ├── LessonFlow.tsx
│   │   │   ├── QuizFlow.tsx
│   │   │   └── ...
│   │   └── ui/               # Reusable UI components
│   ├── contexts/             # React contexts (Auth, etc.)
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API services
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── assets/               # Images and static files
│   └── styles/               # Global CSS and animations
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .gitignore

```

---

## 🔐 Environment Variables

Create a `.env` file in the root:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME=SuperBear
VITE_APP_ENV=development
```

---

## 🤝 Contributing

1. Create a new branch from `sarvind2`:
   ```bash
   git checkout sarvind2
   git pull origin sarvind2
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Commit and push:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature/your-feature-name
   ```

4. Create a Pull Request to `sarvind2`

---

## 📦 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## 🎨 Design System

- **Colors**: Red (#FF1814), Yellow (#F3FF00), Cyan (#3BD6FF), Black, White
- **Font**: Arimo Bold
- **Style**: Flat 2D with offset shadows
- **Animations**: 40+ custom keyframe animations

---

## 📝 License

This project is licensed under the MIT License.

---

## 🆘 Support

For issues or questions:
1. Check the documentation files
2. Review the troubleshooting section in [GITHUB_UPLOAD_GUIDE.md](./GITHUB_UPLOAD_GUIDE.md)
3. Contact the development team

---

## ✨ Credits

- UI Components: [shadcn/ui](https://ui.shadcn.com/)
- Icons: [Lucide](https://lucide.dev/)
- Images: [Unsplash](https://unsplash.com)

---

**Made with ❤️ by the SuperBear Team**
