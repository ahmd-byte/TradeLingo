# Commented Out Features

This document tracks features that have been temporarily disabled in the codebase.

## UserProfiling - Welcome Screen

**Status:** Temporarily Disabled  
**Date Disabled:** February 8, 2026  
**Location:** `frontend/src/components/figma/UserProfiling.tsx`

### What Was Commented Out

1. **WelcomeStep Component** (lines ~208-262)
   - Full component with typewriter animation
   - Speech bubble with "Hi there! I'm your LingoBear!" message
   - Bear wave image display
   - Continue button

2. **Step 0 Check in renderStep()** (lines ~656-658)
   - Conditional rendering for welcome screen

3. **Initial State Changes**
   - `currentStep` changed from 0 to 1
   - `furthestStep` changed from 0 to 1
   - Flow now starts at Name/Email step instead of Welcome step

4. **Updated Step Counts in getTotalSteps()**
   - New trader: 9 steps → 8 steps
   - Occasional/Experienced: 8 steps → 7 steps
   - Default: 2 steps → 1 step

### Why It Was Commented Out

The typewriter animation feature is not production-ready yet. While the implementation is functional, the animation behavior needs further refinement before going live.

### Issue Encountered & Resolution

**Issue:** Syntax error after commenting out the WelcomeStep component  
**Date:** February 8, 2026  
**Status:** ✅ RESOLVED

#### Problem

When the WelcomeStep component was initially commented out using block comments (`/* ... */`), a syntax error occurred:

```
[plugin:vite:react-swc] × Expression expected
```

#### Root Cause

The block comment syntax (`/* ... */`) contained nested JSX comments like `{/* Invisible placeholder to prevent layout shift */}`. The `*/` inside these JSX comments prematurely closed the outer block comment, causing the rest of the code to be treated as uncommented and breaking the syntax.

#### Solution

Changed from block comments to line comments (`//`). Line comments don't have nesting issues and can safely contain any characters including `*/`.

**Before (broken):**

```typescript
/*
function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  // ... code with {/* JSX comments */}
}
*/
```

**After (working):**

```typescript
// function WelcomeStep({ onContinue }: { onContinue: () => void }) {
//   // ... code with {/* JSX comments */}
// }
```

**Key Takeaway:** Always use line comments (`//`) when commenting out JSX/TSX code that contains JSX comments to avoid nesting conflicts.

### Technical Details

The WelcomeStep component included:

- **Typewriter Effect:** Character-by-character text reveal at 60ms per character
- **Layout Optimization:** Invisible placeholder text to prevent horizontal shifting
- **Visual Features:**
  - Speech bubble with tail pointer
  - Bear wave image (233px × 350px)
  - Animated cursor (pulsing `|`)
- **Styling:** Left-aligned text to support left-to-right typing animation

### How to Re-enable

When the animation is ready:

1. **Uncomment the WelcomeStep component** (remove `//` from each line)
   - Note: Component is now commented with line comments (`//`), not block comments
2. **Uncomment the Step 0 check** in `renderStep()`
3. **Reset initial state values:**
   ```typescript
   const [currentStep, setCurrentStep] = useState(0);
   const [furthestStep, setFurthestStep] = useState(0);
   ```
4. **Update getTotalSteps()** to add back the welcome step:
   ```typescript
   const getTotalSteps = () => {
     if (answers.traderLevel === "new") return 9;
     if (
       answers.traderLevel === "occasional" ||
       answers.traderLevel === "experienced"
     )
       return 8;
     return 2;
   };
   ```

### Related Files

- `frontend/src/assets/bearwave.png` - Image asset used in welcome screen
- `frontend/src/components/ui/button.tsx` - Button component used

### Future Improvements

When re-enabling, consider:

- Fine-tuning the typing speed for better readability
- Adding sound effects for typing
- Testing on various screen sizes
- Adding skip animation option for returning users
- Considers accessibility features (prefers-reduced-motion)

---

**Last Updated:** February 8, 2026
