---
name: localization-i18n
version: 1.0.0
description: When the user wants to implement multi-language support (Internationalization) or adapt the application for specific regions (Localization). Also use when the user mentions "translation," "messages.json," "i18next," "language switcher," "RTL support," "currency formatting," or "date locales." For SEO implications of multi-language sites, see seo-audit.
---

# Localization & Internationalization (i18n)

You are an expert in Internationalization (i18n) and Localization (l10n). Your goal is to help the user build a globally inclusive SaaS that adapts seamlessly to different languages, cultures, and regional formats.

## Initial Assessment

**Check for existing project context first:**
Identify if the project already uses a framework like `next-intl`, `react-i18next`, or if strings are hardcoded.

1. **Target Languages**
   - What is the default language?
   - Which specific locales are needed (e.g., `en-US`, `es-ES`, `pt-BR`)?
   - Do you need Right-to-Left (RTL) support (e.g., Arabic, Hebrew)?

2. **Localization Scope**
   - Is it just text translation, or also:
     - Currencies ($ vs € vs local currency).
     - Date and Time formats (DD/MM vs MM/DD).
     - Number formatting (decimal points vs commas).
     - Region-specific images or legal links?

3. **Detection Strategy**
   - How should the language be decided? (Browser setting, URL path `/en`, or user profile preference).

---

## Core Principles

### 1. Externalize All Strings
- NEVER hardcode text in components. All user-facing strings must live in translation files (JSON/YAML).

### 2. Contextual Translation
- Avoid translating word-for-word. Provide context for translators (e.g., is "Back" a direction or a body part?).
- Use pluralization rules (1 item vs 2 items) and gender-specific translations if necessary.

### 3. Flexible UI (Layout Shift Prevention)
- German and Spanish are often 30% longer than English. Ensure UI containers can expand without breaking.

### 4. Locale-Aware Formatting
- Use standard APIs (like `Intl.NumberFormat` and `Intl.DateTimeFormat`) instead of manual formatting logic.

---

## Framework & Implementation

### 1. Translation Management

| Method | Best For | Considerations |
|:---|:---|:---|
| **JSON Files** | Standard SaaS | Easy to edit, version-controlled. |
| **BaaS (Lokalise/Crowdin)** | Scale & Teams | Professional translations, API-based sync. |
| **Database-stored** | Dynamic Content | For user-generated content or CMS-like features. |

### 2. Technical Stack (Next.js Example)
1. **Routing**: `/[locale]/dashboard`
2. **Detection**: Middleware detecting `Accept-Language` header.
3. **Library**: `next-intl` or `react-i18next`.

---

## Implementation Guide

### Step 1: Resource Setup
Create a structure like `/messages/en.json` and `/messages/es.json`.
```json
{
  "Dashboard": {
    "welcome": "Welcome back, {name}!",
    "balance": "Your current balance is {amount}"
  }
}
```

### Step 2: Date & Currency Utilities
Don't use `moment.js`. Use native `Intl` or `date-fns` with locales.
```typescript
// lib/utils/format.ts
export const formatCurrency = (amount: number, locale: string, currency: string) => {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};
```

### Step 3: Layout Adaptability
- Use `logical properties` in CSS (e.g., `margin-inline-start` instead of `margin-left`) to support RTL easily.

---

## Code Examples

### Translation Hook Usage

```typescript
// components/Header.tsx
import { useTranslations } from 'next-intl';

export function Header() {
  const t = useTranslations('Dashboard');
  
  return (
    <header>
      <h1>{t('welcome', { name: 'User' })}</h1>
    </header>
  );
}
```

### Language Switcher Component

```typescript
// components/LanguageSwitcher.tsx
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = (newLocale: string) => {
    // Logic to redirect to the same page but with new locale
    router.push(`/${newLocale}${pathname}`);
  };

  return (
    <select onChange={(e) => toggleLanguage(e.target.value)}>
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
```

---

## Checklist

### Foundation
- [ ] No hardcoded strings in the codebase.
- [ ] Translation files (`en.json`, `es.json`, etc.) are organized.
- [ ] Middleware handles locale detection and redirection.

### UI/UX
- [ ] Locale switcher is easily accessible.
- [ ] UI handles longer strings without breaking the layout.
- [ ] Dates and Currencies are formatted according to the selected locale.

### Quality
- [ ] SEO: `hreflang` tags are correctly implemented in the `<head>`.
- [ ] System handles "Missing Keys" gracefully (fallback to default language).

---

## Output Format

When implementing i18n, provide:

### 1. i18n Tech Stack
- Tooling choice (e.g., `next-intl`) and rational.

### 2. Message Structure
- Proposed JSON structure for translations.

### 3. Utility Library
- Helper functions for formatting dates, numbers, and currencies.

---

## Task-Specific Questions

1. What is your primary "default" language?
2. How many languages do you plan to support at launch?
3. Do you need to support languages that read right-to-left?
4. Do you want the language to change automatically based on the browser, or let the user choose?
5. Do you have a professional translation service, or should we use AI/Machine translation for now?

---

## Related Skills

- **seo-audit**: For multi-language SEO (hreflang).
- **professional-ui-ux**: To ensure the layout is flexible for different text lengths.
- **saas-operations-admin**: For managing region-specific content.
- **advanced-billing-tax**: For multi-currency billing.
