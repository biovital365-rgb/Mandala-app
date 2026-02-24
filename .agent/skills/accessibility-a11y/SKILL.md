---
name: accessibility-a11y
version: 1.0.0
description: When the user wants to ensure their application is accessible to all users, including those with disabilities. Also use when the user mentions "accessibility," "a11y," "WCAG," "screen reader," "ARIA," "keyboard navigation," "color contrast," "focus management," "alt text," or "assistive technology." For visual design, see professional-ui-ux. For responsive layout, see responsive-design.
---

# Accessibility (a11y)

You are an expert in web accessibility and WCAG compliance. Your goal is to help build interfaces that are usable by everyone — including users with visual, auditory, motor, and cognitive disabilities — while meeting WCAG 2.1 AA standards as a minimum.

## Initial Assessment

Before auditing/implementing, understand:

1. **Compliance Level** - WCAG AA (most SaaS) or AAA (government/healthcare)?
2. **Current State** - Any existing accessibility work? Known issues?
3. **Legal Requirements** - ADA, Section 508, EN 301 549, or other?
4. **User Base** - Known users with assistive technology?

---

## Core Principles

### 1. Accessibility is Not Optional
- ~15% of the world's population has a disability. It's your users.
- In many jurisdictions, accessibility is legally required.
- Accessible design improves UX for ALL users (e.g., keyboard shortcuts).

### 2. Semantic HTML First
- Use the correct HTML element before reaching for ARIA.
- `<button>` not `<div onclick>`. `<nav>` not `<div class="nav">`.
- ARIA is a polyfill for missing semantics, not a replacement.

### 3. Test with Real Tools
- Tab through every page. Can you use the entire app with keyboard only?
- Use a screen reader (VoiceOver, NVDA). Does it make sense?
- Automated tools catch ~30% of issues. Manual testing catches the rest.

### 4. Progressive Enhancement
- Core functionality works without JavaScript.
- Content is accessible without CSS.
- Interactions work with keyboard, mouse, and touch.

---

## Semantic HTML Reference

```html
<!-- ✅ Correct semantic structure -->
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/projects" aria-current="page">Projects</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <h1>Projects</h1> <!-- Only ONE h1 per page -->
  
  <section aria-labelledby="active-projects-heading">
    <h2 id="active-projects-heading">Active Projects</h2>
    <!-- content -->
  </section>
  
  <section aria-labelledby="archived-heading">
    <h2 id="archived-heading">Archived</h2>
    <!-- content -->
  </section>
</main>

<aside aria-label="Sidebar">
  <!-- secondary content -->
</aside>

<footer>
  <!-- footer content -->
</footer>
```

---

## Color & Contrast

```css
/* WCAG AA Contrast Ratios:
   - Normal text: 4.5:1 minimum
   - Large text (18px+ or 14px+ bold): 3:1 minimum
   - UI components & graphics: 3:1 minimum
*/

:root {
  /* ✅ High-contrast color pairs */
  --text-on-light: hsl(220, 20%, 15%);    /* #222 on white = 14.7:1 */
  --text-secondary: hsl(220, 10%, 40%);   /* gray on white = 7.3:1 */
  --text-on-primary: hsl(0, 0%, 100%);    /* white on primary */
  
  /* ❌ Common failures */
  /* --light-gray-text: hsl(0, 0%, 75%); /* gray on white = 2.2:1 FAIL */
  /* --yellow-on-white: hsl(45, 100%, 50%); /* yellow on white = 1.1:1 FAIL */
}

/* Focus indicators MUST be visible */
:focus-visible {
  outline: 3px solid var(--primary-500);
  outline-offset: 2px;
}

/* Never hide focus for keyboard users */
/* :focus { outline: none; } ← NEVER DO THIS without focus-visible fallback */
```

### Contrast Checker Utility

```typescript
// lib/a11y/contrast.ts
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = rgb.map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Usage: getContrastRatio('#ffffff', '#333333') → 12.63 (passes AA)
```

---

## Keyboard Navigation

```css
/* Skip to main content link */
.skip-link {
  position: absolute;
  top: -100%;
  left: 1rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-500);
  color: white;
  border-radius: var(--radius-md);
  z-index: 100;
  font-weight: 600;
}

.skip-link:focus {
  top: 1rem;
}
```

```html
<!-- Add as first element in <body> -->
<a href="#main-content" class="skip-link">Skip to main content</a>
```

### Focus Trap for Modals

```typescript
// hooks/use-focus-trap.ts
import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    // Focus first element
    firstEl?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }

      // Close on Escape
      if (e.key === 'Escape') {
        container.dispatchEvent(new CustomEvent('close'));
      }
    }

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
```

---

## ARIA Patterns

### Accessible Modal

```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Delete Project</h2>
  <p id="modal-description">This will permanently delete the project and all its data.</p>
  <button>Cancel</button>
  <button>Delete</button>
</div>
```

### Accessible Dropdown Menu

```html
<div class="dropdown">
  <button
    id="menu-button"
    aria-haspopup="true"
    aria-expanded="false"
    aria-controls="menu-list"
  >
    Options ▾
  </button>
  <ul
    id="menu-list"
    role="menu"
    aria-labelledby="menu-button"
    hidden
  >
    <li role="menuitem" tabindex="-1">Edit</li>
    <li role="menuitem" tabindex="-1">Duplicate</li>
    <li role="separator"></li>
    <li role="menuitem" tabindex="-1">Delete</li>
  </ul>
</div>
```

### Live Regions (Dynamic Content Announcements)

```html
<!-- Screen reader announces changes automatically -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="status-announcer">
  <!-- JS updates this: "Project saved successfully" -->
</div>

<!-- For urgent alerts -->
<div role="alert">
  <p>Your session will expire in 5 minutes.</p>
</div>
```

```typescript
// Announce to screen readers programmatically
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const el = document.getElementById('status-announcer');
  if (el) {
    el.setAttribute('aria-live', priority);
    el.textContent = message;
    // Reset after announcement
    setTimeout(() => { el.textContent = ''; }, 1000);
  }
}

// Usage: announce('Project saved successfully');
// Usage: announce('Error: Please fix the form', 'assertive');
```

---

## Screen Reader Utilities

```css
/* Visually hidden but accessible to screen readers */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Show on focus (for skip links) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

---

## Forms Accessibility

```html
<!-- ✅ Accessible form -->
<form novalidate>
  <div class="form-group">
    <label for="email">Email address <span aria-hidden="true">*</span></label>
    <input
      id="email"
      type="email"
      required
      aria-required="true"
      aria-describedby="email-hint email-error"
      aria-invalid="false"
      autocomplete="email"
    />
    <p id="email-hint" class="hint">We'll never share your email.</p>
    <p id="email-error" class="error" role="alert" hidden>Please enter a valid email.</p>
  </div>

  <fieldset>
    <legend>Notification preferences</legend>
    <div>
      <input type="checkbox" id="email-notif" />
      <label for="email-notif">Email notifications</label>
    </div>
    <div>
      <input type="checkbox" id="push-notif" />
      <label for="push-notif">Push notifications</label>
    </div>
  </fieldset>

  <button type="submit">Save preferences</button>
</form>
```

---

## Automated Testing

```typescript
// Install: npm install -D axe-core @axe-core/react

// In development — React overlay
// lib/a11y/dev-tools.ts
if (process.env.NODE_ENV === 'development') {
  import('@axe-core/react').then(axe => {
    const React = require('react');
    const ReactDOM = require('react-dom');
    axe.default(React, ReactDOM, 1000);
  });
}

// In testing — jest/vitest
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

test('form is accessible', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Checklist

### Structure
- [ ] Semantic HTML elements (nav, main, section, article, aside)
- [ ] Single `<h1>` per page with proper heading hierarchy
- [ ] Skip-to-main-content link
- [ ] Landmark regions with labels
- [ ] Language attribute on `<html>` tag

### Visual
- [ ] Color contrast ≥ 4.5:1 for text, ≥ 3:1 for UI components
- [ ] Information not conveyed by color alone
- [ ] Focus indicators visible (`:focus-visible`)
- [ ] Text resizable to 200% without breaking layout

### Interaction
- [ ] All functionality available via keyboard
- [ ] Focus trap in modals and dialogs
- [ ] Escape key closes overlays
- [ ] No keyboard traps
- [ ] Touch targets ≥ 44×44px

### Content
- [ ] All images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] Form inputs have visible labels
- [ ] Error messages are associated with inputs (`aria-describedby`)
- [ ] Live regions for dynamic content (`aria-live`)

### Testing
- [ ] axe-core automated checks pass
- [ ] Manual keyboard navigation test
- [ ] Screen reader test (VoiceOver/NVDA)
- [ ] Tested with browser zoom at 200%

---

## Related Skills

- **professional-ui-ux**: Design tokens and color contrast
- **responsive-design**: Touch targets and viewport scaling
- **testing-strategy**: Accessibility testing in CI
- **legal-compliance**: ADA and WCAG compliance requirements
