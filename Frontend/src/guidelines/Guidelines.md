# TradeLingo Design Guidelines

## Design Principles

- **Desktop web app, not mobile UI** - Optimized for desktop experience
- **Compact vertical layout** - Efficient use of vertical space
- **Bold, confident, memorable** - Strong visual presence
- **Game-like, not finance-heavy** - Playful and engaging, not corporate
- **Visual consistency with the Feed the Pig brand** - Maintain brand identity

## Button Styles

### Offset Shadow Button

The primary button style uses a flat offset shadow for a tactile, pressable feel:

- **Button face:** White background with thick black stroke (5px)
- **Shadow:** Solid black offset (8px down, 8px right)
- **Interaction:** Shadow reduces on hover (4px) and active press (1px)
- **Typography:** Bold, uppercase, black text
- **Style:** Flat 2D, no gradients or glows

## Color Palette

- **Primary Red:** `#FF1814` - Main brand color
- **Accent Yellow:** `#F3FF00` - Highlights and secondary text
- **Black:** `#000000` - Text and borders
- **White:** `#FFFFFF` - Button backgrounds and contrast

## Typography

- **Primary Font:** Arimo Bold
- **Headings:** Uppercase, bold, large tracking
- **Body Text:** Uppercase for emphasis, yellow accent color

## CSS Class Conventions

### Use Explicit Pixel Values for Design Specs

When implementing designs with specific measurements, **always use explicit pixel values** instead of Tailwind defaults:

| ❌ Don't Use     | ✅ Do Use           | Reason                           |
| ---------------- | ------------------- | -------------------------------- |
| `text-5xl`       | `text-[52px]`       | Tailwind's 5xl is 48px, not 52px |
| `text-2xl`       | `text-[24px]`       | Ensures exact design matching    |
| `leading-tight`  | `leading-[46.8px]`  | Precise line height control      |
| `tracking-tight` | `tracking-[-1.3px]` | Exact letter spacing             |
| `rounded-2xl`    | `rounded-[16px]`    | Specific border radius           |

### Why This Matters

1. **Design fidelity:** Figma designs specify exact pixel values
2. **Consistency:** Prevents visual regression when refactoring
3. **Predictability:** Explicit values don't change between Tailwind versions

### Brand Colors

Use the defined brand color classes instead of hex values:

| ❌ Don't Use     | ✅ Do Use           |
| ---------------- | ------------------- |
| `bg-[#ff1814]`   | `bg-brand-red`      |
| `text-[#f3ff00]` | `text-brand-yellow` |

### Commenting Out JSX Code

When commenting out React/TSX code that contains JSX comments:

| ❌ Don't Use               | ✅ Do Use          |
| -------------------------- | ------------------ |
| Block comments `/* ... */` | Line comments `//` |

Block comments fail when the code contains `{/* JSX comments */}` because the `*/` prematurely closes the outer comment.
