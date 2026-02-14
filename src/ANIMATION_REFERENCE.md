# 🎬 SuperBear Animation Reference Card

## Quick Animation Class Reference

### Quiz End Screen Animations (QuizFlow.tsx)

| Animation Class | Element | Duration | Purpose |
|----------------|---------|----------|---------|
| `animate-bounce-slow` | 🤔 Thinking emoji | 2s infinite | Slow bounce while analyzing |
| `animate-cooking` | 🍳 Cooking pot | 1s infinite | Wobble/rotate pot |
| `animate-ingredient-1` | 📊 Chart icon | 2s infinite | Fly into pot (left) |
| `animate-ingredient-2` | 📈 Graph icon | 2.5s infinite | Fly into pot (right) |
| `animate-ingredient-3` | 💡 Bulb icon | 2.2s infinite | Fly into pot (bottom) |
| `animate-sparkle` | ✨ Sparkle | 1s infinite | Rotate and scale |
| `animate-success-bounce` | ✓ Checkmark | 0.6s once | Pop in with bounce |
| `animate-confetti` | 🎊 30 pieces | 2-4s once | Fall from top |
| `animate-shake-attention` | 🚀 CTA Button | 1s infinite | Shake left/right |

**Progress Bar:** 10 chunky segments, yellow (#f3ff00), 3px borders, offset shadows

---

### Deriv Connection Animations (UserProfiling.tsx)

| Animation Class | Element | Duration | Purpose |
|----------------|---------|----------|---------|
| `animate-pulse-scale` | Deriv logo | 1.5s infinite | Pulse in/out |
| `document-shuffle` | 📄 5 documents | 1.5s infinite | Lift and rotate |
| `animate-slide-down` | Title banner | 0.6s once | Slide from top |
| `animate-slide-up-reveal` | Reveal card | 0.7s once | Slide from bottom |
| `animate-pop-in` | Emoji & badges | 0.5s staggered | Pop with bounce |

**Progress Bar:** 4 chunky segments, yellow (#f3ff00), 3px borders, offset shadows

**Counter:** 0 → 127 (counts up in 50ms intervals, +7 per tick)

---

## Critical CSS Classes (globals.css)

### Layout & Borders
- `border-[3px]` / `border-[5px]` - Thick borders
- `rounded-[16px]` / `rounded-[24px]` - Bold rounded corners
- `shadow-[8px_8px_0px_#000000]` - Offset shadow

### Colors
- `bg-[#f3ff00]` - Yellow accent
- `bg-[#ff1814]` - Primary red
- `bg-[#3bd6ff]` - Cyan (bg-primary)
- `bg-[#22c55e]` - Success green

### Typography
- `font-['Arimo:Bold',sans-serif]` - Primary font
- `uppercase` - All caps text
- `tracking-wide` - Letter spacing

---

## Animation States & Timing

### Quiz End Screen Flow (8.5s total):
```
0s    → analyzing (show score)
2s    → cooking (pot + ingredients, 25%)
3s    → cooking (50%)
4.5s  → cooking (75%)
6s    → finalizing (90%)
8s    → complete (100% + confetti)
8.5s  → ready (show shaking button)
```

### Deriv Connection Flow (5s total):
```
0s    → loading (Deriv logo pulse)
1s    → scanning (documents shuffle, counter counts)
2s    → scanning text changes ("Oops, spotted some losses 👀")
2.8s  → scanning text changes ("No judging... we promise 😅")
3.5s  → analyzing ("Crunching the numbers...")
5s    → reveal (show trader type card)
```

---

## File Locations

### Components:
- `/components/screens/QuizFlow.tsx` - Diagnostic quiz with end screen
- `/components/screens/UserProfiling.tsx` - Onboarding + Deriv reveal
- `/components/ui/button.tsx` - Offset variant button

### Styles:
- `/styles/globals.css` - **ALL ANIMATIONS HERE** (40+ keyframes)

### Assets:
- `/assets/` - Image assets
- Import images using relative paths (e.g., `../../assets/mascot.png`)

---

## Testing Checklist

### Visual Tests:
- [ ] Progress bars fill smoothly (no jumps)
- [ ] Documents shuffle without flickering
- [ ] Confetti falls naturally (not too fast/slow)
- [ ] Button shake is noticeable but not annoying
- [ ] Counter counts up smoothly (not laggy)
- [ ] All shadows render correctly

### Timing Tests:
- [ ] Quiz screen completes in ~8.5 seconds
- [ ] Deriv screen completes in ~5 seconds
- [ ] Text changes happen at right moments
- [ ] Button appears AFTER completion

### Browser Tests:
- [ ] Chrome ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Edge ✓

---

## Common Fixes

### Animation not playing?
1. Check `globals.css` is imported
2. Verify class name matches exactly
3. Check browser DevTools → Styles
4. Look for `@keyframes` definition

### Progress bar not filling?
1. Check `filledSegments` calculation
2. Verify array length (10 for quiz, 4 for deriv)
3. Confirm `progress` state updates

### Documents not shuffling?
1. Verify `animation` style is applied
2. Check `animationDelay` is unique per document
3. Confirm 5 document divs exist

### Counter not counting?
1. Check `setInterval` is running
2. Verify cleanup in `useEffect` return
3. Confirm `tradesCount` state updates

---

## 🎨 Design Tokens

```css
/* Colors */
--primary-red: #ff1814;
--accent-yellow: #f3ff00;
--bg-primary: #3bd6ff;
--success-green: #22c55e;
--black: #000000;
--white: #ffffff;

/* Borders */
--border-thin: 3px;
--border-thick: 5px;

/* Shadows */
--shadow-small: 3px 3px 0px #000000;
--shadow-medium: 6px 6px 0px #000000;
--shadow-large: 8px 8px 0px #000000;
--shadow-xl: 12px 12px 0px #000000;

/* Radius */
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
```

---

## 🆘 Emergency Contacts

If animations completely break:
1. Restart dev server: `npm run dev`
2. Clear browser cache
3. Check console for errors
4. Verify `globals.css` loads
5. Rebuild: `npm run build`

---

**Remember:** All animations are pure CSS (no external libraries needed!)
The magic is in `/styles/globals.css` ✨🐻
