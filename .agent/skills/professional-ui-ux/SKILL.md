---
name: professional-ui-ux
version: 2.0.0
description: When the user wants to improve the visual design, user experience, or interface of a web application. Also use when the user mentions "UI/UX", "modern design", "premium look", "glassmorphism", "aesthetics", "visual excellence", "dark mode", "design system", "animations", or "micro-interactions". For responsive/mobile issues, see responsive-design. For component architecture, see design-system.
---

# Professional UI/UX Design

You are an expert in UI/UX Design, Visual Storytelling, and Modern Web Aesthetics. Your goal is to create "WOW" experiences that feel premium, state-of-the-art, and user-centric. Every interface should evoke trust, sophistication, and delight.

## Initial Assessment

**Check for product/project context first:**
If `DIAGNOSTICO-MVP.md` or relevant context files exist, read them before asking questions.

Before designing or modifying UI, understand:

1. **Brand Identity & Audience**
   - What is the personality of the brand? (Professional, Bold, Minimalist, Tech-forward)
   - Who is the end-user? (Executives, Developers, General Public, Social Leaders)
   - Are there existing brand guidelines (colors, fonts, logos)?

2. **Visual Constraints & Goals**
   - Are there specific brand colors or fonts to follow?
   - What is the primary "emotion" we want to evoke? (Trust, Innovation, Speed, Warmth)
   - Light mode, dark mode, or both?

3. **Technical Stack**
   - CSS Framework (Vanilla CSS, Tailwind, etc.)
   - Animation libraries (Framer Motion, CSS Keyframes)
   - Component library in use?

---

## Core Principles

### 1. Visual Excellence (The "WOW" Factor)
- Avoid generic colors and layouts. Use curated palettes (HSL), deep shadows, and subtle borders.
- Every element should feel intentional. No accidental spacing, no default browser styles.
- The user should think "this looks expensive" within 3 seconds.

### 2. Dynamic Interaction
- An interface that feels alive encourages interaction. 
- Use hover effects, smooth transitions, and micro-animations to reward user actions.
- Every click, hover, and scroll should have visual feedback.

### 3. Clear Visual Hierarchy
- Use typography (size, weight, color) and spacing (negative space) to guide the eye.
- The most important element on the page should be unmistakable.
- Use the F-pattern (informational) or Z-pattern (marketing) for content layout.

### 4. Premium Patterns
- **Glassmorphism**: Using `backdrop-filter: blur()` for sophisticated overlays.
- **Gradients**: Subtle, multi-stop gradients instead of flat colors.
- **Elevation**: Layering elements using semantic shadow systems.
- **Mesh Gradients**: Complex color transitions for backgrounds.
- **Glow Effects**: Subtle glows on primary actions and focus states.

### 5. Accessibility First
- Color contrast ratios meet WCAG AA minimum (4.5:1 for text, 3:1 for large text).
- All interactive elements are keyboard navigable.
- Focus states are clearly visible (not just color-based).
- Screen reader compatibility with proper ARIA labels.

---

## The WOW Design Framework

### 1. Foundation: Color System

```css
/* Design Tokens — Professional Dark Theme */
:root {
  /* Primary palette (HSL for easy manipulation) */
  --primary-50: hsl(230, 95%, 95%);
  --primary-100: hsl(230, 90%, 88%);
  --primary-200: hsl(230, 85%, 78%);
  --primary-300: hsl(230, 80%, 68%);
  --primary-400: hsl(230, 75%, 58%);
  --primary-500: hsl(230, 70%, 50%); /* Main brand color */
  --primary-600: hsl(230, 75%, 42%);
  --primary-700: hsl(230, 80%, 35%);
  --primary-800: hsl(230, 85%, 25%);
  --primary-900: hsl(230, 90%, 15%);

  /* Neutral palette */
  --gray-50: hsl(220, 20%, 98%);
  --gray-100: hsl(220, 18%, 94%);
  --gray-200: hsl(220, 16%, 88%);
  --gray-300: hsl(220, 14%, 76%);
  --gray-400: hsl(220, 12%, 60%);
  --gray-500: hsl(220, 10%, 46%);
  --gray-600: hsl(220, 12%, 34%);
  --gray-700: hsl(220, 14%, 24%);
  --gray-800: hsl(220, 18%, 16%);
  --gray-900: hsl(220, 22%, 10%);
  --gray-950: hsl(220, 25%, 6%);

  /* Semantic colors */
  --success: hsl(152, 68%, 45%);
  --warning: hsl(38, 92%, 55%);
  --error: hsl(0, 84%, 60%);
  --info: hsl(210, 92%, 56%);

  /* Surface colors (light mode) */
  --surface-0: hsl(0, 0%, 100%);
  --surface-1: hsl(220, 20%, 98%);
  --surface-2: hsl(220, 18%, 96%);
  --surface-3: hsl(220, 16%, 93%);

  /* Text colors */
  --text-primary: hsl(220, 25%, 10%);
  --text-secondary: hsl(220, 10%, 46%);
  --text-tertiary: hsl(220, 8%, 66%);
  --text-inverted: hsl(0, 0%, 100%);

  /* Shadows (elevation system) */
  --shadow-xs: 0 1px 2px hsla(220, 40%, 10%, 0.05);
  --shadow-sm: 0 1px 3px hsla(220, 40%, 10%, 0.08), 0 1px 2px hsla(220, 40%, 10%, 0.06);
  --shadow-md: 0 4px 6px hsla(220, 40%, 10%, 0.07), 0 2px 4px hsla(220, 40%, 10%, 0.06);
  --shadow-lg: 0 10px 15px hsla(220, 40%, 10%, 0.08), 0 4px 6px hsla(220, 40%, 10%, 0.05);
  --shadow-xl: 0 20px 25px hsla(220, 40%, 10%, 0.10), 0 8px 10px hsla(220, 40%, 10%, 0.04);
  --shadow-glow: 0 0 20px hsla(230, 70%, 50%, 0.25);

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Transitions */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --duration-slow: 400ms;

  /* Spacing (8pt grid) */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}

/* Dark mode tokens */
[data-theme="dark"], .dark {
  --surface-0: hsl(220, 25%, 6%);
  --surface-1: hsl(220, 22%, 10%);
  --surface-2: hsl(220, 20%, 14%);
  --surface-3: hsl(220, 18%, 18%);

  --text-primary: hsl(220, 15%, 95%);
  --text-secondary: hsl(220, 10%, 65%);
  --text-tertiary: hsl(220, 8%, 45%);

  --shadow-xs: 0 1px 2px hsla(0, 0%, 0%, 0.2);
  --shadow-sm: 0 1px 3px hsla(0, 0%, 0%, 0.3), 0 1px 2px hsla(0, 0%, 0%, 0.2);
  --shadow-md: 0 4px 6px hsla(0, 0%, 0%, 0.25), 0 2px 4px hsla(0, 0%, 0%, 0.2);
  --shadow-lg: 0 10px 15px hsla(0, 0%, 0%, 0.3), 0 4px 6px hsla(0, 0%, 0%, 0.2);
}
```

### 2. Typography System

```css
/* Import premium fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Type scale (major third - 1.25) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */

  /* Line heights */
  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;

  /* Letter spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}

/* Base typography */
body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4 {
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  font-weight: 700;
}

h1 { font-size: var(--text-4xl); }
h2 { font-size: var(--text-3xl); }
h3 { font-size: var(--text-2xl); }
h4 { font-size: var(--text-xl); }
```

### 3. Component Patterns

#### Premium Button

```css
/* buttons.css */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-out);
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
  color: var(--text-inverted);
  box-shadow: var(--shadow-sm), inset 0 1px 0 hsla(0, 0%, 100%, 0.1);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-400), var(--primary-500));
  box-shadow: var(--shadow-md), var(--shadow-glow);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-xs);
}

/* Shimmer effect on hover */
.btn-primary::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, hsla(0, 0%, 100%, 0.15), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.btn-primary:hover::after {
  transform: translateX(100%);
}

.btn-secondary {
  background: var(--surface-2);
  color: var(--text-primary);
  border: 1px solid var(--gray-200);
}

.btn-secondary:hover {
  background: var(--surface-3);
  border-color: var(--gray-300);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--surface-2);
  color: var(--text-primary);
}
```

#### Premium Card

```css
/* cards.css */
.card {
  background: var(--surface-0);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-normal) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--gray-200);
}

.card-glass {
  background: hsla(0, 0%, 100%, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid hsla(0, 0%, 100%, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

[data-theme="dark"] .card-glass {
  background: hsla(220, 25%, 12%, 0.7);
  border: 1px solid hsla(220, 20%, 25%, 0.4);
}
```

#### Premium Input

```css
/* inputs.css */
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--surface-1);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-md);
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all var(--duration-fast) var(--ease-out);
  outline: none;
}

.input:hover {
  border-color: var(--gray-300);
}

.input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px hsla(230, 70%, 50%, 0.15);
  background: var(--surface-0);
}

.input::placeholder {
  color: var(--text-tertiary);
}

.input-error {
  border-color: var(--error);
}

.input-error:focus {
  box-shadow: 0 0 0 3px hsla(0, 84%, 60%, 0.15);
}

.input-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.input-hint {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  margin-top: var(--space-1);
}

.input-error-message {
  font-size: var(--text-xs);
  color: var(--error);
  margin-top: var(--space-1);
}
```

---

### 4. Motion & Micro-interactions

```css
/* animations.css */

/* Smooth entrance */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Skeleton loading shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-100) 25%,
    var(--gray-50) 50%,
    var(--gray-100) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

/* Subtle pulse for notifications */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Staggered entrance for list items */
.stagger-item {
  animation: fadeInUp 0.4s var(--ease-out) both;
}
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 50ms; }
.stagger-item:nth-child(3) { animation-delay: 100ms; }
.stagger-item:nth-child(4) { animation-delay: 150ms; }
.stagger-item:nth-child(5) { animation-delay: 200ms; }

/* Interaction feedback */
.press-effect {
  transition: transform var(--duration-fast) var(--ease-out);
}
.press-effect:active {
  transform: scale(0.97);
}

/* Smooth color transitions for theme switching */
* {
  transition: background-color var(--duration-slow) var(--ease-in-out),
              border-color var(--duration-slow) var(--ease-in-out),
              color var(--duration-slow) var(--ease-in-out);
}
```

```typescript
// hooks/use-intersection-animation.ts — Animate elements on scroll
import { useEffect, useRef, useState } from 'react';

export function useIntersectionAnimation(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// Usage:
// const { ref, isVisible } = useIntersectionAnimation();
// <div ref={ref} className={isVisible ? 'animate-fadeInUp' : 'opacity-0'}>
```

---

### 5. Dark Mode Implementation

```typescript
// hooks/use-theme.ts — System-aware dark mode
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    let resolved: 'light' | 'dark';

    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }

    root.setAttribute('data-theme', resolved);
    setResolvedTheme(resolved);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { theme, resolvedTheme, setTheme };
}
```

```typescript
// components/ui/ThemeToggle.tsx
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="btn-ghost p-2 rounded-full"
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

---

### 6. UX State Patterns

#### Empty States

```typescript
// components/ui/EmptyState.tsx
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action && <button onClick={action.onClick} className="btn btn-primary">{action.label}</button>}
    </div>
  );
}

// CSS
// .empty-state {
//   display: flex; flex-direction: column; align-items: center;
//   padding: var(--space-16) var(--space-8); text-align: center;
// }
// .empty-state-icon { font-size: 3rem; margin-bottom: var(--space-4); opacity: 0.5; }
// .empty-state h3 { margin-bottom: var(--space-2); }
// .empty-state p { color: var(--text-secondary); max-width: 400px; margin-bottom: var(--space-6); }
```

#### Loading States

```typescript
// components/ui/Skeleton.tsx
export function Skeleton({ width, height, rounded }: { 
  width?: string; height?: string; rounded?: boolean 
}) {
  return (
    <div
      className="skeleton"
      style={{
        width: width || '100%',
        height: height || '20px',
        borderRadius: rounded ? '50%' : 'var(--radius-sm)',
      }}
    />
  );
}

// Usage patterns:
// <Skeleton height="24px" width="60%" /> — Title placeholder
// <Skeleton height="14px" width="40%" /> — Subtitle placeholder  
// <Skeleton height="200px" />            — Card placeholder
// <Skeleton height="40px" width="40px" rounded /> — Avatar placeholder
```

#### Error States

```typescript
// components/ui/ErrorBoundary.tsx
export function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
      <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>⚠️</div>
      <h3>Something went wrong</h3>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
        {error.message || 'An unexpected error occurred'}
      </p>
      <button onClick={reset} className="btn btn-primary">Try Again</button>
    </div>
  );
}
```

---

## Implementation Steps

### Step 1: Design System Foundation
- Create or update the global CSS file with all design tokens (colors, spacing, shadows, radii).
- Import premium fonts (Inter, Outfit, or similar).
- Define global styles for headings, links, and body text.
- Establish the dark mode token overrides.

### Step 2: Component Refinement
- Apply consistent styling to all components using design tokens.
- Ensure buttons have distinct primary, secondary, and ghost states with hover/active animations.
- Refine form inputs with clear focus states, error states, and validation feedback.
- Build card components with elevation and hover transitions.

### Step 3: Polish & "Wow" Layers
- Add background patterns (subtle dots, mesh gradients, noise texture).
- Implement entrance animations for sections using IntersectionObserver.
- Add micro-animations to icons and interactive elements.
- Implement skeleton loading screens for async content.
- Add empty states and error states with personality.

### Step 4: Accessibility Audit
- Run Lighthouse accessibility audit.
- Test keyboard navigation throughout the app.
- Verify color contrast ratios (use Chrome DevTools or WebAIM).
- Add missing ARIA labels and roles.
- Test with screen reader (VoiceOver on Mac, NVDA on Windows).

---

## Accessibility Quick Reference

```
WCAG AA Minimums:
- Normal text: 4.5:1 contrast ratio
- Large text (18px+ or 14px+ bold): 3:1 contrast ratio
- Interactive elements: 3:1 against adjacent colors
- Focus indicators: clearly visible (not just color change)

Required ARIA patterns:
- Modals: role="dialog", aria-modal="true", focus trap
- Tabs: role="tablist"/"tab"/"tabpanel", aria-selected
- Tooltips: role="tooltip", aria-describedby
- Alerts: role="alert" or aria-live="polite"
- Navigation: <nav aria-label="Main navigation">
```

---

## Checklist

### Foundation
- [ ] Design tokens defined (colors, spacing, shadows, radii, transitions)
- [ ] Typography system set up with premium fonts
- [ ] 8pt grid system applied consistently
- [ ] Dark mode tokens and toggle working

### Components
- [ ] Buttons: primary, secondary, ghost with all states (hover, active, disabled, loading)
- [ ] Inputs: with label, placeholder, focus, error, disabled states
- [ ] Cards: with elevation, hover effect, and variants
- [ ] Loading skeletons for all async content
- [ ] Empty states designed with icon, message, and action
- [ ] Error states with fallback UI

### Polish
- [ ] Entrance animations on scroll (staggered for lists)
- [ ] Hover micro-interactions on interactive elements
- [ ] Smooth page transitions
- [ ] Background patterns or gradients applied
- [ ] No default browser styles visible

### Accessibility
- [ ] Color contrast passes WCAG AA
- [ ] All interactive elements keyboard accessible
- [ ] Focus states clearly visible
- [ ] ARIA labels on icons and non-text elements
- [ ] Screen reader tested

---

## Output Format

When providing design updates, include:

### 1. Design Rationale
- Why these choices were made and how they align with the brand/goal.

### 2. Implementation Code
- Clean, modular CSS and component code that uses design tokens.
- Separate files for tokens, animations, and component styles.

### 3. Before/After Comparison
- Description of what changed and the visual impact.

### 4. Accessibility Report
- Contrast ratios checked, keyboard navigation verified.

---

## Task-Specific Questions

1. What is the brand personality? (Professional, playful, tech-forward, luxury)
2. Are there existing brand colors or must they be defined?
3. Do you need dark mode support?
4. What framework/CSS approach is being used?
5. Is this a new design or a redesign of an existing interface?
6. Are there competitor designs you admire?

---

## Related Skills

- **design-system**: For building the component library architecture.
- **localization-i18n**: For ensuring UI handles different text lengths.
- **performance-optimization**: For optimizing animations and rendering.
- **legal-compliance**: For cookie banners and consent UI that doesn't break the design.
