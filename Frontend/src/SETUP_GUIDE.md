# SuperBear - Complete Setup Guide

## 🚀 Quick Start

This project is a **React + TypeScript + Tailwind CSS v4** application with custom animations.

---

## 📦 Required Packages

### Core Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "motion": "latest",
    "lucide-react": "latest",
    "recharts": "latest",
    "react-slick": "latest",
    "react-responsive-masonry": "latest",
    "react-dnd": "latest",
    "react-dnd-html5-backend": "latest",
    "react-hook-form": "7.55.0",
    "sonner": "2.0.3",
    "re-resizable": "latest"
  },
  "devDependencies": {
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.1",
    "typescript": "^5.5.3",
    "vite": "^5.4.2",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

---

## 🛠️ Installation Steps

### 1. Install Node Modules
```bash
npm install
```

### 2. Verify Tailwind CSS v4 Setup
Make sure your `vite.config.ts` has:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🎨 Critical Files for Animations

### ⚠️ DO NOT MODIFY THESE FILES:

1. **`/styles/globals.css`** 
   - Contains ALL custom animations
   - 40+ keyframe animations defined here
   - Animations: bounce-slow, cooking, ingredient-fly, document-shuffle, shake-attention, confetti, etc.

2. **Key Animation Classes:**
   - `animate-bounce-slow` - Thinking bear
   - `animate-cooking` - Cooking pot wobble
   - `animate-ingredient-1/2/3` - Flying ingredients
   - `animate-shake-attention` - CTA button shake
   - `animate-confetti` - Celebration confetti
   - `animate-document-shuffle` - Document stack animation
   - `animate-pop-in` - Pop bounce effect
   - `animate-slide-up-reveal` - Reveal animations
   - `animate-success-bounce` - Success checkmark

---

## 📁 Project Structure

```
/
├── styles/
│   └── globals.css           # ⚠️ ALL ANIMATIONS HERE
├── components/
│   ├── ui/
│   │   └── button.tsx        # Offset variant button
│   └── screens/
│       ├── UserProfiling.tsx # Onboarding + Deriv connection
│       ├── QuizFlow.tsx      # Diagnostic quiz
│       └── Dashboard.tsx     # Main app
├── App.tsx                   # Main entry point
└── assets/                   # Image assets
```

---

## 🎬 Animation Implementation Notes

### CSS Variables Used:
- `--bg-primary: #3bd6ff` (cyan background)
- `--font-['Arimo:Bold',sans-serif]` (primary font)

### Color Palette:
- **Primary Red:** `#FF1814`
- **Accent Yellow:** `#F3FF00`
- **Success Green:** `#22c55e`
- **Black:** `#000000`
- **White:** `#FFFFFF`

### Animation Timings:
- **Quiz End Screen:** 8.5 seconds total
  - Analyzing: 2s
  - Cooking: 4s
  - Finalizing: 2s
  - Complete: 1s
  - Button appears: 0.5s after

- **Deriv Connection:** 5 seconds total
  - Loading: 1s
  - Scanning: 2.5s
  - Analyzing: 1s
  - Reveal: 0.5s after

---

## 🐛 Troubleshooting

### Animations Not Working?
1. **Check `globals.css` is imported** in `App.tsx`:
   ```typescript
   import './styles/globals.css'
   ```

2. **Verify Tailwind v4 is running:**
   ```bash
   npm run dev
   ```
   - Should see no CSS errors in console

3. **Check browser DevTools:**
   - Open Elements → Styles
   - Look for `@keyframes` definitions
   - Verify animation classes are applied

### Common Issues:

#### ❌ "Animation classes not found"
- **Solution:** Make sure `globals.css` is loaded before components

#### ❌ "Segmented progress bars not showing"
- **Solution:** Check that you have at least 10 div elements for quiz, 4 for Deriv

#### ❌ "Document shuffle broken"
- **Solution:** Verify `document-shuffle` keyframes exist in `globals.css`

#### ❌ "Fonts not loading"
- **Solution:** Check that Arimo Bold font is available or use system fallback

---

## 🎯 Component-Specific Notes

### UserProfiling.tsx (Deriv Connection)
- **State:** `loading | scanning | analyzing | reveal`
- **Counter:** Counts from 0 → 127 (trade count)
- **Progress:** 4 segments (chunky bars)
- **Documents:** 5 stacked white cards with shuffle animation
- **Funny texts:** 
  - "Found 127 trades..."
  - "Oops, spotted some losses 👀"
  - "No judging... we promise 😅"

### QuizFlow.tsx (Diagnostic Quiz)
- **State:** `analyzing | cooking | finalizing | complete | ready`
- **Progress:** 10 segments (chunky bars)
- **Cooking:** Pot + 3 flying ingredients (📊📈💡)
- **Confetti:** 30 pieces, 4 colors
- **CTA:** Green button (#22c55e) with infinite shake

### Progress Bar Pattern:
```tsx
{[...Array(10)].map((_, i) => (
  <div
    key={i}
    className={`w-12 h-3 border-[3px] border-black rounded-[6px] ${
      i < filledSegments 
        ? 'bg-[#f3ff00] shadow-[3px_3px_0px_#000000]' 
        : 'bg-white/20'
    }`}
  />
))}
```

---

## 🎨 Design System

### Button Style (Offset Variant):
```tsx
<Button variant="offset">
  // White bg, black border (5px), offset shadow (8px 8px)
  // Hover: shadow reduces to 4px
  // Active: shadow reduces to 1px
</Button>
```

### Card Style:
```tsx
<div className="bg-white border-[5px] border-black rounded-[24px] shadow-[12px_12px_0px_#000000]">
  // Bold flat cards with offset shadow
</div>
```

---

## 📝 Important Implementation Details

### 1. Trader Types (4 types):
- **Scalper** ⚡
- **Day Trading** 📊
- **Swing Trading** 📈
- **Investment Trading** 💎

### 2. Backend Integration Points:

#### TODO Comments in Code:
```typescript
// UserProfiling.tsx line ~295
// TODO: Replace with backend API call to get trader type from Deriv analysis

// QuizFlow.tsx
// TODO: Send quiz answers to backend for knowledge gap analysis
```

### 3. Animation State Management:
- All animations use `useState` + `useEffect` with `setTimeout`
- Timers are cleaned up in `useEffect` return function
- No external animation libraries for core animations (pure CSS)

---

## 🚀 Build for Production

```bash
npm run build
```

**Output:** `/dist` folder

---

## 📱 Responsive Design

- **Target:** Desktop web app (not mobile-first)
- **Compact vertical layout**
- **Minimum width:** 1024px recommended

---

## ✅ Pre-Launch Checklist

- [ ] All animations play smoothly
- [ ] Progress bars fill correctly
- [ ] Documents shuffle without lag
- [ ] Confetti appears on quiz completion
- [ ] CTA button shakes infinitely
- [ ] Deriv counter counts up smoothly
- [ ] All fonts load properly (Arimo Bold)
- [ ] Colors match brand (#f3ff00, #ff1814, #3bd6ff)
- [ ] Offset shadows render correctly
- [ ] No console errors

---

## 🆘 Support

If animations break:
1. Check browser console for errors
2. Verify `globals.css` is loaded
3. Confirm Tailwind v4 is processing correctly
4. Check that all `@keyframes` are defined
5. Verify animation class names match exactly

---

## 🎉 You're Ready!

Run `npm run dev` and visit `http://localhost:5173`

All animations should work perfectly! 🐻✨
