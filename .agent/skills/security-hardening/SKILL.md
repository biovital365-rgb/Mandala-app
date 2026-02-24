---
name: security-hardening
version: 2.0.0
description: When the user wants to secure their application against attacks and vulnerabilities. Also use when the user mentions "security," "OWASP," "XSS," "CSRF," "rate limiting," "RLS," "authorization," "CSP," "CORS," "secrets management," "dependency audit," "penetration testing," or "vulnerability." For authentication setup, see auth-implementation. For legal/privacy compliance, see legal-compliance.
---

# Security Hardening

You are an expert in web application security following OWASP guidelines and modern security best practices. Your goal is to help build defense-in-depth security that protects user data, prevents attacks, and meets compliance requirements for production SaaS applications.

## Initial Assessment

**Check for existing project context first:**
Review existing security configurations, middleware, environment variables, and dependency list before recommending changes.

Before hardening, understand:

1. **Application Profile**
   - What sensitive data is handled (PII, financial, health)?
   - What authentication system is in use?
   - Are there public-facing APIs?
   - Is the app multi-tenant?

2. **Current Threat Surface**
   - Where are external inputs accepted (forms, APIs, file uploads)?
   - What third-party services are integrated?
   - Are there admin/privileged routes?

3. **Compliance Requirements**
   - GDPR, CCPA, SOC 2, HIPAA?
   - Industry-specific regulations?
   - Data residency requirements?

---

## Core Principles

### 1. Defense in Depth
Multiple security layers — no single point of failure.
- Client-side validation (UX, not security)
- Server-side validation (actual security)
- Database-level security (RLS)
- Network-level security (headers, TLS)

### 2. Least Privilege
Grant minimum permissions required.
- Users see only their data
- API keys have minimal scopes
- Service accounts are scoped
- Admin access is audited

### 3. Fail Secure
When something goes wrong, deny access.
- Default deny on RLS policies
- Catch blocks should not expose data
- Errors should be logged, not displayed
- Session timeouts should redirect to login

### 4. Security by Default
Secure from the start, not bolted on after.
- RLS enabled on every table from day one
- HTTPS enforced everywhere
- Secrets never in code
- Dependencies audited regularly

---

## OWASP Top 10 Protection

### 1. Broken Access Control (A01)

```sql
-- RLS: Users can only access their own data
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts FORCE ROW LEVEL SECURITY;

-- Explicit allow policy (not deny)
CREATE POLICY "Owner access only" ON posts
  FOR ALL USING (user_id = auth.uid());

-- Admin access with audit
CREATE POLICY "Admins full access" ON posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

```typescript
// Server-side authorization check (never trust client)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // RLS handles data filtering, but also verify ownership for sensitive ops
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
```

### 2. Injection Prevention (A03)

```typescript
// ✅ GOOD: Parameterized queries (Supabase handles this automatically)
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('email', email); // Automatically parameterized

// ❌ BAD: String concatenation (NEVER do this)
// const { data } = await supabase.rpc('search', { query: `%${userInput}%` });

// ✅ GOOD: Sanitize dynamic RPC inputs
const sanitizedInput = userInput.replace(/[%_]/g, '\\$&');
const { data } = await supabase.rpc('search_posts', { 
  search_term: sanitizedInput 
});
```

### 3. XSS Prevention (A07)

```typescript
// React escapes by default — avoid dangerouslySetInnerHTML
// If you MUST render user HTML, sanitize it first
import DOMPurify from 'dompurify';

function UserContent({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
  });
  
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}

// For URL-based XSS prevention
function SafeLink({ url, children }: { url: string; children: React.ReactNode }) {
  const isValid = /^https?:\/\//.test(url); // Only allow http/https
  if (!isValid) return <span>{children}</span>;
  return <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>;
}
```

### 4. CSRF Protection (A05)

```typescript
// Next.js Server Actions have built-in CSRF protection
// For custom API routes, use token-based validation

// lib/csrf.ts
import { randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return token === storedToken; // Use timing-safe comparison in production
}
```

---

## Security Headers

```javascript
// next.config.js — Comprehensive security headers
const securityHeaders = [
  // Prevent MIME type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },
  // XSS filter (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Force HTTPS for 2 years
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Control referrer information
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Prevent Adobe Flash/PDF embedding
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  // DNS prefetch control
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  // Permissions policy (restrict browser features)
  { 
    key: 'Permissions-Policy', 
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' 
  },
];

/** @type {import('next').NextConfig} */
module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

### Content Security Policy (CSP)

```javascript
// next.config.js — CSP configuration
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.supabase.co https://*.stripe.com;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://www.google-analytics.com;
  frame-src https://js.stripe.com https://hooks.stripe.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

// Add to security headers array:
{ key: 'Content-Security-Policy', value: ContentSecurityPolicy.replace(/\n/g, '') }
```

---

## CORS Configuration

```typescript
// middleware.ts — CORS handling for API routes
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL!,
  // Add other allowed origins
];

export function handleCORS(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  
  // Preflight request
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Max-Age', '86400');
    }
    return response;
  }

  return null; // Let the request through
}

// In API routes — add CORS headers to responses
function addCORSHeaders(response: NextResponse, origin: string | null): NextResponse {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  return response;
}
```

---

## Rate Limiting

```typescript
// lib/rate-limit.ts — Production-grade rate limiting
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different limiters for different endpoints
export const rateLimiters = {
  // General API: 60 requests per minute
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'rl:api',
  }),
  // Auth endpoints: 5 attempts per 15 minutes
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'rl:auth',
  }),
  // Sensitive operations: 3 per hour
  sensitive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'rl:sensitive',
  }),
};

// Helper to get client IP
export function getClientIP(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Usage in middleware or API routes
export async function checkRateLimit(
  request: Request, 
  limiter: keyof typeof rateLimiters = 'api'
) {
  const ip = getClientIP(request);
  const { success, remaining, reset } = await rateLimiters[limiter].limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }
  return null; // Rate limit passed
}
```

---

## Input Validation

```typescript
// lib/validation/schemas.ts — Centralized validation schemas
import { z } from 'zod';

// Reusable validators
const email = z.string().email('Invalid email format').max(255);
const password = z.string()
  .min(8, 'Minimum 8 characters')
  .max(128, 'Maximum 128 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Must contain a special character');
const name = z.string().min(2).max(100).regex(/^[\p{L}\s'-]+$/u, 'Invalid characters');
const uuid = z.string().uuid('Invalid ID format');
const url = z.string().url('Invalid URL').max(2048);
const phone = z.string().regex(/^\+?[1-9]\d{6,14}$/, 'Invalid phone number');

// Schema factory with reusable fields
export const schemas = {
  signup: z.object({ email, password, name }),
  login: z.object({ email, password: z.string().min(1) }),
  updateProfile: z.object({
    full_name: name.optional(),
    avatar_url: url.optional(),
    bio: z.string().max(500).optional(),
  }),
  createPost: z.object({
    title: z.string().min(1).max(200),
    content: z.string().min(1).max(50000),
    status: z.enum(['draft', 'published']).default('draft'),
  }),
};

// Generic validation helper for API routes
export function validateBody<T extends z.ZodSchema>(schema: T, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    return { 
      success: false as const, 
      error: result.error.flatten(),
    };
  }
  return { success: true as const, data: result.data as z.infer<T> };
}
```

---

## Secrets Management

### Environment Variable Security

```typescript
// lib/env.ts — Validate ALL env vars at startup
import { z } from 'zod';

const envSchema = z.object({
  // Public (safe for client)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),

  // Private (server only — NEVER expose these)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  RESEND_API_KEY: z.string().min(1),
});

// Validate on import — app won't start with missing vars
export const env = envSchema.parse(process.env);
```

### Secret Key Practices

```
✅ DO:
- Store secrets in environment variables
- Use .env.local (gitignored) for local development
- Use platform env vars for production (Vercel, etc.)
- Rotate keys periodically
- Use different keys per environment (dev/staging/prod)
- Validate env vars at startup

❌ DON'T:
- Commit .env files to git
- Use NEXT_PUBLIC_ prefix for secret keys
- Log environment variables
- Share keys via chat/email
- Use the same keys in dev and production
- Hardcode keys anywhere in code
```

### .gitignore Security

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# Keys and certificates
*.pem
*.key
*.cert
*.p12

# IDE files that may contain secrets
.idea/
.vscode/settings.json
```

---

## RLS Patterns (Comprehensive)

```sql
-- 1. Force RLS on ALL tables (including for table owner)
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensitive_data FORCE ROW LEVEL SECURITY;

-- 2. Role-based access with helper function
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'anonymous'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 3. Multi-tenant organization access
CREATE POLICY "Org members access" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = projects.org_id
        AND user_id = auth.uid()
    )
  );

-- 4. Write access with role check
CREATE POLICY "Org admins can edit" ON projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = projects.org_id
        AND user_id = auth.uid()
        AND role IN ('admin', 'owner')
    )
  );

-- 5. Row-level data isolation for multi-tenant
CREATE POLICY "Tenant isolation" ON customer_data
  FOR ALL USING (
    tenant_id = (
      SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 6. Time-based access (e.g., subscription expiry)
CREATE POLICY "Active subscription only" ON premium_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM subscriptions
      WHERE user_id = auth.uid()
        AND status = 'active'
        AND current_period_end > NOW()
    )
  );
```

---

## Dependency Security

### Automated Auditing

```json
// package.json — Add audit scripts
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "audit:ci": "npm audit --audit-level=high",
    "deps:check": "npx npm-check-updates",
    "deps:outdated": "npm outdated"
  }
}
```

```yaml
# .github/workflows/security.yml — Automated security checks
name: Security Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 6 * * 1' # Weekly on Monday at 6 AM

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=high
      - name: Check for known vulnerabilities
        run: npx better-npm-audit audit --level high
```

---

## File Upload Security

```typescript
// lib/security/file-upload.ts
const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size: ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: `File type not allowed: ${file.type}` };
  }

  // Check extension
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File extension not allowed: ${ext}` };
  }

  // Check for double extensions (malicious: file.php.jpg)
  const parts = file.name.split('.');
  if (parts.length > 2) {
    return { valid: false, error: 'File has multiple extensions' };
  }

  return { valid: true };
}

// Generate safe filename (prevent path traversal)
export function safeFilename(originalName: string): string {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}
```

---

## API Security Patterns

```typescript
// lib/security/api-guard.ts — Comprehensive API protection
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/rate-limit';

interface GuardOptions {
  requireAuth?: boolean;
  requireRole?: string[];
  rateLimit?: 'api' | 'auth' | 'sensitive';
}

export function withSecurity(handler: Function, options: GuardOptions = {}) {
  return async (request: Request, context?: any) => {
    // 1. Rate limiting
    if (options.rateLimit) {
      const rateLimitResult = await checkRateLimit(request, options.rateLimit);
      if (rateLimitResult) return rateLimitResult;
    }

    // 2. Authentication
    if (options.requireAuth) {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // 3. Authorization (role check)
      if (options.requireRole?.length) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (!profile || !options.requireRole.includes(profile.role)) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
      }
    }

    // 4. Execute handler
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Error:', error);
      // Never expose internal errors to client
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Usage:
// export const GET = withSecurity(myHandler, { requireAuth: true, rateLimit: 'api' });
// export const DELETE = withSecurity(deleteHandler, { requireAuth: true, requireRole: ['admin'], rateLimit: 'sensitive' });
```

---

## Session Security

```typescript
// Cookie security configuration for Supabase
const cookieOptions = {
  httpOnly: true,       // Prevent JavaScript access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'lax' as const,  // CSRF protection
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

// Session timeout handling
export function isSessionExpired(lastActivity: Date, maxIdleMinutes: number = 30): boolean {
  const now = new Date();
  const diff = (now.getTime() - lastActivity.getTime()) / (1000 * 60);
  return diff > maxIdleMinutes;
}
```

---

## Security Monitoring & Incident Response

### Error Logging (without exposing secrets)

```typescript
// lib/security/logger.ts
export function logSecurityEvent(event: {
  type: 'auth_failure' | 'rate_limit' | 'forbidden' | 'suspicious' | 'data_access';
  ip: string;
  userId?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}) {
  // In production, send to Sentry, Datadog, or dedicated SIEM
  console.warn(`[SECURITY][${event.severity.toUpperCase()}]`, {
    type: event.type,
    ip: event.ip,
    userId: event.userId || 'anonymous',
    details: event.details,
    timestamp: new Date().toISOString(),
  });
  
  // For critical events, trigger alerts
  if (event.severity === 'critical') {
    // Send alert to Slack, PagerDuty, email, etc.
  }
}
```

### Incident Response Checklist

```
1. DETECT — Identify the incident
   - [ ] What was compromised?
   - [ ] When did it start?
   - [ ] What data was affected?

2. CONTAIN — Stop the bleeding
   - [ ] Revoke compromised API keys
   - [ ] Block suspicious IPs
   - [ ] Disable compromised accounts
   - [ ] Force password resets if needed

3. ERADICATE — Fix the root cause
   - [ ] Patch the vulnerability
   - [ ] Update dependencies
   - [ ] Rotate all potentially compromised secrets

4. RECOVER — Restore normal operations
   - [ ] Deploy fixes
   - [ ] Verify systems are clean
   - [ ] Monitor for recurrence

5. LEARN — Prevent recurrence
   - [ ] Document the incident
   - [ ] Update security procedures
   - [ ] Add monitoring/alerts for this vector
```

---

## Security Checklist

### Authentication
- [ ] Password strength enforced (8+ chars, uppercase, number, special)
- [ ] Email verification required before access
- [ ] Rate limiting on login/signup (5 attempts per 15 min)
- [ ] Session timeout configured (30 min idle, 7 day max)
- [ ] Password reset tokens expire in 1 hour
- [ ] Failed login attempts are logged

### Authorization
- [ ] RLS enabled AND forced on all tables
- [ ] API routes validate user authentication server-side
- [ ] Role-based access control implemented
- [ ] Service role key used only in server-side code
- [ ] Admin routes have separate middleware checks

### Data Protection
- [ ] Input validation with Zod on every endpoint
- [ ] HTTPS enforced (HSTS header)
- [ ] Secrets stored in environment variables only
- [ ] `.env` files in `.gitignore`
- [ ] No secrets in console.log or error messages
- [ ] File uploads validated (type, size, extension)
- [ ] User content sanitized (DOMPurify for HTML)

### Headers & Network
- [ ] CSP configured and tested
- [ ] Security headers set (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] CORS restricted to known origins
- [ ] Rate limiting on all public endpoints
- [ ] API responses don't leak internal details

### Dependencies
- [ ] `npm audit` runs in CI pipeline
- [ ] No high/critical vulnerabilities in dependencies
- [ ] Dependencies updated regularly
- [ ] Lock file committed (package-lock.json)

### Monitoring
- [ ] Security events are logged
- [ ] Failed auth attempts trigger alerts at threshold
- [ ] Error tracking configured (Sentry)
- [ ] Audit logs for admin actions

---

## Output Format

When hardening security, provide:

### 1. Vulnerability Assessment
- List of identified risks (High/Medium/Low)
- Current vs. recommended state

### 2. Implementation Code
- Security headers configuration
- Rate limiting setup
- Input validation schemas
- RLS policies

### 3. Security Checklist
- Items completed and remaining
- Priority order for remaining items

### 4. Monitoring Plan
- What to log and alert on
- Incident response steps

---

## Task-Specific Questions

1. What sensitive data does the application handle?
2. Are there public-facing API endpoints?
3. What authentication method is in use?
4. Do you have compliance requirements (GDPR, SOC 2, etc.)?
5. Is there an existing error tracking solution (Sentry, etc.)?
6. Are there admin/privileged routes that need extra protection?

---

## Related Skills

- **auth-implementation**: For authentication setup and session management
- **database-design**: For RLS policies and data security
- **deployment-strategy**: For secure deployment and environment management
- **legal-compliance**: For GDPR, CCPA and privacy requirements
- **saas-operations-admin**: For admin security and audit logging
- **monitoring-observability**: For security monitoring and alerting
