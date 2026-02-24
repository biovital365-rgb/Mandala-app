# 📚 Catálogo de Skills — PasanakuYa-App

> **Total: 66 skills** | Última actualización: 2026-02-17  
> Cada skill es un archivo `.agent/skills/{nombre}/SKILL.md` que contiene guías de implementación production-ready con código, esquemas SQL, componentes React, checklists y mejores prácticas.

---

## Cómo Usar Este Catálogo

1. **Busca por categoría** la funcionalidad que necesitas implementar
2. **Lee el SKILL.md** correspondiente antes de comenzar
3. **Sigue el checklist** al final de cada skill para verificar completitud
4. **Revisa skills relacionados** para una implementación integral

---

## 🔧 Core Development (14 skills)

Skills fundamentales para construir la aplicación desde cero.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 1 | `auth-implementation` | 749 | Autenticación completa con Supabase Auth | Login, registro, OTP, sesiones, protección de rutas |
| 2 | `database-design` | 698 | Diseño de esquemas PostgreSQL + migraciones | Modelado de datos, relaciones, tipos, constraints |
| 3 | `api-design` | 418 | Diseño de APIs REST/GraphQL | Endpoints, validación, paginación, error handling |
| 4 | `web-architecture` | 618 | Arquitectura Next.js (App Router) | Estructura de carpetas, layouts, server components |
| 5 | `design-system` | 354 | Sistema de diseño con tokens y componentes | Variables CSS, componentes base, consistencia visual |
| 6 | `testing-strategy` | 475 | Estrategia de testing (unit, integration, e2e) | Jest, Testing Library, Playwright, coverage |
| 7 | `deployment-strategy` | 580 | Deploy a producción (Vercel, CI/CD) | Ambientes, preview deploys, rollbacks |
| 8 | `performance-optimization` | 307 | Optimización de rendimiento web | Core Web Vitals, lazy loading, bundle size |
| 9 | `pwa-implementation` | 429 | Progressive Web App | Service workers, offline, instalable, push |
| 10 | `realtime-features` | 401 | Funcionalidades en tiempo real | Supabase Realtime, WebSockets, presence |
| 11 | `file-upload-storage` | 443 | Upload y almacenamiento de archivos | Supabase Storage, imágenes, comprobantes |
| 12 | `email-transactional` | 344 | Emails transaccionales | Resend/SendGrid, templates, notificaciones |
| 13 | `ai-features` | 413 | Integración de IA | OpenAI, Gemini, embeddings, RAG |
| 14 | `monitoring-observability` | 405 | Monitoreo y observabilidad | Sentry, logging, métricas, alertas |

---

## 🔒 Security & Access Control (3 skills)

Protección de la aplicación y control de acceso.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 15 | `security-hardening` | 856 | Hardening de seguridad completo | OWASP, XSS, CSRF, CSP, rate limiting, secrets |
| 16 | `rbac-permissions` | 551 | Control de acceso basado en roles | Roles, permisos, feature flags, middleware autorización |
| 17 | `multi-tenancy` | 631 | Arquitectura multi-inquilino | Organizaciones, RLS por tenant, context, switcher |

---

## 💰 Billing & Revenue (4 skills)

Monetización, pagos y facturación.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 18 | `payment-integration` | 769 | Integración de pagos (Stripe) | Checkout, suscripciones, webhooks, customer portal |
| 19 | `advanced-billing-tax` | 187 | Facturación avanzada e impuestos | Stripe Tax, IVA, invoices, revenue recovery |
| 20 | `pricing-strategy` | 227 | Estrategia de pricing | Modelos de precio, tiers, A/B testing de precios |
| 21 | `api-monetization` | 357 | Monetización de APIs | API keys, rate limits, planes de API, webhooks HMAC |

---

## 🎨 Design & UX (3 skills)

Diseño visual, experiencia de usuario y accesibilidad.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 22 | `professional-ui-ux` | 776 | UI/UX profesional y premium | Glassmorphism, animaciones, dark mode, estética |
| 23 | `responsive-design` | 384 | Diseño responsive mobile-first | Breakpoints, fluid typography, touch UX, tablas |
| 24 | `accessibility-a11y` | 433 | Accesibilidad (WCAG AA) | ARIA, keyboard nav, focus trap, screen readers |

---

## 📊 Data & Analytics (3 skills)

Datos, métricas y exportación.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 25 | `analytics-tracking` | 307 | Tracking de eventos y comportamiento | Mixpanel, PostHog, funnels, eventos custom |
| 26 | `data-analytics-dashboard` | 343 | Dashboard de analytics SaaS | KPIs, MRR/ARR, churn, sparklines, métricas |
| 27 | `data-export-import` | 361 | Exportación e importación de datos | CSV, JSON, import wizard, GDPR export |

---

## 🔔 User Engagement (3 skills)

Retención, notificaciones y onboarding del producto.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 28 | `notification-system` | 447 | Sistema de notificaciones multi-canal | Push, email, in-app, WhatsApp, preferencias |
| 29 | `onboarding-product` | 485 | Onboarding del producto | Setup wizard, checklist, product tour, activación |
| 30 | `onboarding-cro` | 219 | CRO del onboarding | Optimización de flujos de activación |

---

## ⚙️ Operations & Infrastructure (8 skills)

DevOps, caché, colas, migraciones y operaciones.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 31 | `error-handling-logging` | 436 | Manejo de errores y logging | Error classes, structured logs, Sentry, toasts |
| 32 | `caching-strategy` | 313 | Estrategia de caché multi-capa | Redis, SWR, HTTP cache, CDN, materialized views |
| 33 | `queue-background-jobs` | 326 | Colas y jobs en background | Inngest, QStash, DB queue, retry, concurrency |
| 34 | `migration-upgrade-strategy` | 279 | Migraciones y upgrades | Safe migrations, expand-contract, feature flags |
| 35 | `saas-operations-admin` | 179 | Panel de admin y operaciones | Backoffice, user management, audit logs |
| 36 | `ci-cd-advanced` | 319 | CI/CD avanzado | GitHub Actions, preview deploy, branch protection |
| 37 | `cost-optimization` | 258 | Optimización de costos | Vercel/Supabase costs, unit economics, rendering |
| 38 | `disaster-recovery` | 336 | Recuperación ante desastres | Backups, PITR, restore, incident response |

---

## 🏪 Platform & Ecosystem (2 skills)

Marketplace, integraciones y white-labeling.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 39 | `marketplace-ecosystem` | 365 | Ecosistema y marketplace | Integraciones, OAuth, app store, partners |
| 40 | `white-labeling` | 346 | White-labeling por marca/tenant | CSS dinámico, logos, colores, dominios custom |

---

## 📣 Marketing & Growth (19 skills)

SEO, CRO, contenido, publicidad, referidos y growth.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 41 | `seo-audit` | 394 | Auditoría SEO completa | Meta tags, sitemap, robots, performance, schema |
| 42 | `programmatic-seo` | 236 | SEO programático | Páginas generadas, templates, long-tail keywords |
| 43 | `schema-markup` | 176 | Schema markup (JSON-LD) | Rich snippets, structured data, FAQ schema |
| 44 | `content-strategy` | 356 | Estrategia de contenido | Blog, pillar pages, calendario editorial |
| 45 | `copywriting` | 251 | Copywriting persuasivo | Headlines, CTAs, landing pages, tono de voz |
| 46 | `copy-editing` | 446 | Edición y revisión de copy | Consistencia, claridad, guía de estilo |
| 47 | `social-content` | 277 | Contenido para redes sociales | Posts, carousels, engagement, scheduling |
| 48 | `email-sequence` | 306 | Secuencias de email marketing | Onboarding drip, nurture, win-back, lifecycle |
| 49 | `referral-program` | 254 | Programa de referidos | Viral loops, incentivos, tracking, dashboards |
| 50 | `paid-ads` | 313 | Publicidad pagada | Google Ads, Meta Ads, retargeting, ROI |
| 51 | `page-cro` | 181 | CRO de páginas | Optimización de landing pages, heat maps |
| 52 | `form-cro` | 428 | CRO de formularios | Multi-step forms, validación, conversión |
| 53 | `popup-cro` | 452 | CRO de popups | Exit-intent, timed, scroll-triggered, A/B |
| 54 | `signup-flow-cro` | 358 | CRO del flujo de registro | Social login, progressive profiling, friction |
| 55 | `paywall-upgrade-cro` | 225 | CRO del upgrade/paywall | Free→paid conversion, pricing page, urgency |
| 56 | `ab-test-setup` | 265 | Setup de A/B testing | Posthog, feature flags, statistical significance |
| 57 | `launch-strategy` | 351 | Estrategia de lanzamiento | Pre-launch, launch day, Product Hunt, PR |
| 58 | `free-tool-strategy` | 177 | Estrategia de herramientas gratuitas | Lead magnets, calculadoras, generadores |
| 59 | `marketing-ideas` | 166 | Ideas de marketing creativo | Guerrilla, partnerships, community, growth hacks |

---

## 🛡️ Business & Compliance (5 skills)

Legal, localización, soporte al cliente y contexto de marca.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 60 | `legal-compliance` | 197 | Cumplimiento legal y regulatorio | GDPR, privacy policy, terms, cookies, ASFI |
| 61 | `localization-i18n` | 185 | Internacionalización y localización | Multi-idioma, i18next, RTL, currency, date |
| 62 | `customer-support-success` | 184 | Soporte y éxito del cliente | Help desk, FAQ, NPS, churn reduction |
| 63 | `competitor-alternatives` | 254 | Análisis competitivo | Comparativas, diferenciación, positioning |
| 64 | `marketing-psychology` | 454 | Psicología del marketing | Urgencia, social proof, anchoring, FOMO |
| 65 | `product-marketing-context` | 240 | Contexto de producto y marketing | Brand voice, positioning, ICP, messaging |

---

## 🔨 Meta (1 skill)

Skill para crear otros skills.

| # | Skill | Líneas | Descripción | Cuándo Usar |
|:-:|-------|:------:|-------------|-------------|
| 66 | `skill-creator` | 579 | Generador de skills | Crear nuevos skills siguiendo estándares de calidad |

---

## 📊 Estadísticas Totales

| Métrica | Valor |
|---------|:-----:|
| **Total de skills** | 66 |
| **Total de líneas** | ~24,500+ |
| **Categorías** | 10 |
| **Skill más grande** | `security-hardening` (856 líneas) |
| **Skill más pequeño** | `marketing-ideas` (166 líneas) |
| **Promedio por skill** | ~370 líneas |

---

## 🗺️ Mapa de Skills para PasanakuYa MVP

Los skills más relevantes para el MVP de PasanakuYa, en orden de implementación:

### Fase 1: Fundación
1. `web-architecture` → Estructura del proyecto Next.js
2. `database-design` → Esquema de PostgreSQL/Supabase
3. `auth-implementation` → Login con OTP por celular
4. `design-system` → Tokens, colores, tipografía
5. `professional-ui-ux` → Estética premium mobile-first

### Fase 2: Core Features
6. `api-design` → Endpoints para pasanakus, pagos, miembros
7. `realtime-features` → Chat grupal y actualizaciones en vivo
8. `file-upload-storage` → Comprobantes de pago (fotos)
9. `notification-system` → Push + WhatsApp reminders
10. `responsive-design` → Mobile-first responsivo

### Fase 3: Confianza y Seguridad
11. `security-hardening` → RLS, rate limiting, XSS/CSRF
12. `rbac-permissions` → Roles: organizador vs participante
13. `error-handling-logging` → Manejo de errores, Sentry

### Fase 4: Growth
14. `onboarding-product` → Setup wizard, tutorial
15. `analytics-tracking` → Eventos, funnels, retención
16. `referral-program` → "Invita amigos, gana Pro gratis"
17. `signup-flow-cro` → Optimización del registro

### Fase 5: Monetización
18. `payment-integration` → PasanakuYa Pro (suscripción)
19. `pricing-strategy` → Free vs Pro vs Business
20. `paywall-upgrade-cro` → Conversión free→paid

### Fase 6: Escala
21. `multi-tenancy` → Organizaciones / cooperativas
22. `white-labeling` → Marca custom para B2B
23. `deployment-strategy` → CI/CD, preview deploys
24. `caching-strategy` → Performance a escala
25. `disaster-recovery` → Backups, incident response

---

*Este catálogo se actualiza conforme se crean o modifican skills.*
