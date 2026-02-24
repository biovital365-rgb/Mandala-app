---
name: responsive-design
version: 1.0.0
description: When the user wants to ensure their web application works perfectly across all devices and screen sizes. Also use when the user mentions "responsive," "mobile-first," "breakpoints," "media queries," "viewport," "touch targets," "mobile layout," or "adaptive design." For visual design quality, see professional-ui-ux.
---

# Responsive Design

You are an expert in responsive web design and mobile-first development. Your goal is to help build interfaces that feel native on every device — from 320px phones to 2560px ultrawide monitors.

## Initial Assessment

Before implementing responsive design, understand:

1. **Device Priority** - Primary usage device? Analytics % mobile vs desktop?
2. **Current State** - Existing breakpoints? CSS approach?
3. **Complexity** - Complex tables? Sidebar nav? Many-field forms?

---

## Core Principles

### 1. Mobile-First, Always
- Start with smallest screen, ADD complexity for larger screens.
- Use `min-width` media queries only (build up, not down).

### 2. Fluid Over Fixed
- Use relative units (`rem`, `%`, `vw`, `dvh`) over fixed pixels.
- Use `clamp()` for fluid typography and spacing.

### 3. Content Dictates Breakpoints
- Break when the CONTENT breaks, not at arbitrary device sizes.

### 4. Touch-Friendly Interactions
- Minimum touch target: **48×48px**.
- No hover-dependent interactions on mobile.

---

## Breakpoint System

```css
:root {
  --bp-sm: 640px;   /* Large phones */
  --bp-md: 768px;   /* Tablets */
  --bp-lg: 1024px;  /* Laptops */
  --bp-xl: 1280px;  /* Desktops */
  --bp-2xl: 1536px; /* Large desktops */
}

@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

---

## Fluid Typography

```css
:root {
  --text-sm: clamp(0.8rem, 0.75rem + 0.25vw, 0.875rem);
  --text-base: clamp(0.9rem, 0.85rem + 0.25vw, 1rem);
  --text-xl: clamp(1.1rem, 0.95rem + 0.75vw, 1.25rem);
  --text-3xl: clamp(1.5rem, 1rem + 2.5vw, 1.875rem);
  --text-5xl: clamp(2rem, 1rem + 5vw, 3rem);
  --text-hero: clamp(2.5rem, 1rem + 7.5vw, 4.5rem);
}
```

---

## Fluid Spacing

```css
:root {
  --space-fluid-sm: clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem);
  --space-fluid-md: clamp(1rem, 0.75rem + 1.25vw, 1.5rem);
  --space-fluid-lg: clamp(1.5rem, 1rem + 2.5vw, 3rem);
  --space-fluid-xl: clamp(2rem, 1rem + 5vw, 5rem);
  --container-max: 1280px;
  --container-padding: clamp(1rem, 0.5rem + 2.5vw, 3rem);
}

.container {
  max-width: var(--container-max);
  margin-inline: auto;
  padding-inline: var(--container-padding);
  width: 100%;
}
```

---

## Layout Patterns

### Auto-fit Grid

```css
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
  gap: var(--space-fluid-md);
}
```

### Sidebar Layout

```css
.app-layout {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 100dvh;
}

@media (min-width: 1024px) {
  .app-layout { grid-template-columns: 260px 1fr; }
}

.sidebar {
  position: fixed;
  inset: 0;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  width: 280px;
  background: var(--surface-0);
  border-right: 1px solid var(--gray-200);
}

.sidebar.open { transform: translateX(0); }

@media (min-width: 1024px) {
  .sidebar {
    position: sticky;
    top: 0;
    height: 100dvh;
    transform: none;
    width: auto;
  }
}
```

### Stack-to-Row

```css
.stack-to-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-fluid-sm);
}

@media (min-width: 640px) {
  .stack-to-row {
    flex-direction: row;
    align-items: center;
  }
}
```

---

## Responsive Navigation

### Bottom Nav (Mobile)

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  background: var(--surface-0);
  border-top: 1px solid var(--gray-200);
  padding: var(--space-2) 0;
  padding-bottom: env(safe-area-inset-bottom, var(--space-2));
  z-index: 40;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  min-width: 48px;
  min-height: 48px;
  justify-content: center;
}

@media (min-width: 1024px) {
  .bottom-nav { display: none; }
}
```

---

## Responsive Data Tables

```css
/* Mobile: card layout */
@media (max-width: 767px) {
  .responsive-table thead { display: none; }
  .responsive-table tr {
    display: block;
    padding: var(--space-4);
    margin-bottom: var(--space-3);
    border: 1px solid var(--gray-200);
    border-radius: var(--radius-md);
  }
  .responsive-table td {
    display: flex;
    justify-content: space-between;
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--gray-100);
  }
  .responsive-table td::before {
    content: attr(data-label);
    font-weight: 600;
    color: var(--text-secondary);
  }
}

/* Desktop: traditional table */
@media (min-width: 768px) {
  .responsive-table { border-collapse: collapse; }
  .responsive-table th,
  .responsive-table td {
    padding: var(--space-3) var(--space-4);
    text-align: left;
    border-bottom: 1px solid var(--gray-100);
  }
}
```

---

## Touch & Mobile UX

```css
.touch-target {
  min-width: 48px;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (hover: none) {
  .btn:hover { transform: none; box-shadow: var(--shadow-sm); }
}

@media (pointer: coarse) {
  .form-checkbox, .form-radio { width: 24px; height: 24px; }
  .list-item { padding: var(--space-4); }
}

/* Prevent iOS zoom on input focus */
@media (max-width: 767px) {
  input, select, textarea { font-size: 16px; }
}

.safe-area-padding {
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
  padding-bottom: env(safe-area-inset-bottom, 0);
}
```

---

## Responsive Utilities

```css
.hide-mobile { display: none; }
.show-mobile { display: block; }

@media (min-width: 768px) {
  .hide-mobile { display: block; }
  .show-mobile { display: none; }
}

.btn-full-mobile { width: 100%; }

@media (min-width: 640px) {
  .btn-full-mobile { width: auto; }
}
```

---

## useBreakpoint Hook

```typescript
import { useEffect, useState } from 'react';

const BREAKPOINTS = { sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 } as const;
type Breakpoint = keyof typeof BREAKPOINTS;

export function useBreakpoint(): Breakpoint | 'xs' {
  const [bp, setBp] = useState<Breakpoint | 'xs'>('xs');
  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= 1536) setBp('2xl');
      else if (w >= 1280) setBp('xl');
      else if (w >= 1024) setBp('lg');
      else if (w >= 768) setBp('md');
      else if (w >= 640) setBp('sm');
      else setBp('xs');
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return bp;
}

export function useIsMobile(): boolean {
  const bp = useBreakpoint();
  return bp === 'xs' || bp === 'sm';
}
```

---

## Responsive Images

```html
<picture>
  <source media="(min-width: 1024px)" srcset="/hero-desktop.webp" />
  <source media="(min-width: 640px)" srcset="/hero-tablet.webp" />
  <img src="/hero-mobile.webp" alt="Hero" loading="lazy" width="800" height="450" style="width:100%;height:auto;" />
</picture>
```

```css
.img-responsive { max-width: 100%; height: auto; display: block; }
.img-cover { width: 100%; height: 100%; object-fit: cover; }
.aspect-video { aspect-ratio: 16 / 9; }
.aspect-square { aspect-ratio: 1 / 1; }
```

---

## Checklist

### Foundation
- [ ] Mobile-first approach (`min-width` media queries)
- [ ] Breakpoint system defined and consistent
- [ ] Fluid typography with `clamp()`
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1" />`

### Layout
- [ ] Sidebar collapses on mobile (hamburger/overlay)
- [ ] Grids reflow properly
- [ ] Tables readable on mobile (card layout)
- [ ] Forms stack properly
- [ ] Modals full-screen on mobile

### Interaction
- [ ] Touch targets ≥ 48×48px
- [ ] No hover-only functionality on mobile
- [ ] Input font-size ≥ 16px (prevents iOS zoom)
- [ ] Safe area insets for notched devices

### Testing
- [ ] Tested 320px, 375px, 768px, 1024px, 1280px
- [ ] No horizontal scroll
- [ ] All text readable without zooming
- [ ] Tested landscape orientation

---

## Related Skills

- **professional-ui-ux**: Design tokens and visual polish
- **design-system**: Reusable responsive components
- **performance-optimization**: Mobile performance
- **pwa-implementation**: App-like mobile experiences
