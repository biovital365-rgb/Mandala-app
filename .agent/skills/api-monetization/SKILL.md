---
name: api-monetization
version: 1.0.0
description: When the user wants to expose a public API for external developers, monetize API access, or build developer tools. Also use when the user mentions "API keys," "developer portal," "API rate limits," "API versioning," "developer docs," "API monetization," "webhooks for clients," "public API," or "API pricing." For internal API design, see api-design. For billing, see payment-integration.
---

# API Monetization

You are an expert in API product management and developer experience. Your goal is to help build a monetized API platform with key management, per-plan rate limiting, versioning, developer documentation, and webhook subscriptions — turning your SaaS into a platform.

## Initial Assessment

Before implementing, understand:

1. **API Scope** - What resources/actions will the API expose?
2. **Audience** - Internal devs, partners, or public developers?
3. **Monetization** - Free tier? Pay per request? Plan-based access?
4. **Current State** - Existing API routes? Authentication method?

---

## Core Principles

### 1. API-First Design
- The API is a product, not an afterthought. It deserves its own roadmap.
- Every feature should be API-accessible before building UI.

### 2. Developer Experience is UX
- Clear docs, consistent naming, helpful errors, and quick onboarding.
- A developer who can't integrate in 30 minutes will leave.

### 3. Versioning from Day One
- Never break existing integrations. Version your API.
- Support at least N-1 versions. Deprecate with long notice.

### 4. Rate Limits Protect Everyone
- Rate limits by plan prevent abuse and fund infrastructure.
- Always communicate limits clearly in headers and docs.

---

## API Key Management

### Database Schema

```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Key details
  name TEXT NOT NULL, -- User-defined label: "Production", "Testing"
  key_hash TEXT UNIQUE NOT NULL, -- SHA-256 hash of the key (never store plaintext)
  key_prefix TEXT NOT NULL, -- First 8 chars for identification: "pk_live_a1b2..."
  
  -- Permissions
  scopes TEXT[] DEFAULT '{read}', -- 'read', 'write', 'admin'
  
  -- Limits
  rate_limit_per_minute INTEGER DEFAULT 60,
  rate_limit_per_day INTEGER DEFAULT 10000,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_org ON api_keys(organization_id);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys FORCE ROW LEVEL SECURITY;

CREATE POLICY "Org members manage keys" ON api_keys
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
```

### Key Generation

```typescript
// lib/api-keys/generate.ts
import { randomBytes, createHash } from 'crypto';

export function generateApiKey(environment: 'live' | 'test' = 'live'): {
  key: string;      // Full key (show once, never store)
  keyHash: string;   // SHA-256 hash (store in DB)
  keyPrefix: string; // First 8 chars (for identification)
} {
  const prefix = environment === 'live' ? 'pk_live_' : 'pk_test_';
  const random = randomBytes(32).toString('base64url');
  const key = `${prefix}${random}`;
  const keyHash = createHash('sha256').update(key).digest('hex');
  const keyPrefix = key.substring(0, 16);

  return { key, keyHash, keyPrefix };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}
```

---

## API Authentication Middleware

```typescript
// lib/api-keys/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { hashApiKey } from './generate';
import { createClient } from '@supabase/supabase-js';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface ApiContext {
  organizationId: string;
  keyId: string;
  scopes: string[];
  plan: string;
}

export async function authenticateApiKey(request: NextRequest): Promise<ApiContext | NextResponse> {
  // Extract key from header
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Missing API key. Include: Authorization: Bearer pk_live_...' } },
      { status: 401 }
    );
  }

  const apiKey = authHeader.replace('Bearer ', '');
  const keyHash = hashApiKey(apiKey);

  // Lookup key
  const { data: keyRecord } = await supabase
    .from('api_keys')
    .select('id, organization_id, scopes, rate_limit_per_minute, status, expires_at, organizations(plan)')
    .eq('key_hash', keyHash)
    .single();

  if (!keyRecord || keyRecord.status !== 'active') {
    return NextResponse.json(
      { error: { code: 'INVALID_KEY', message: 'Invalid or revoked API key' } },
      { status: 401 }
    );
  }

  // Check expiration
  if (keyRecord.expires_at && new Date(keyRecord.expires_at) < new Date()) {
    return NextResponse.json(
      { error: { code: 'KEY_EXPIRED', message: 'API key has expired' } },
      { status: 401 }
    );
  }

  // Rate limiting per key
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(keyRecord.rate_limit_per_minute, '1 m'),
    prefix: `api:${keyRecord.id}`,
  });

  const { success, remaining, reset } = await ratelimit.limit(keyRecord.id);
  if (!success) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMIT', message: 'Rate limit exceeded' } },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(keyRecord.rate_limit_per_minute),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    );
  }

  // Update last_used_at (fire and forget)
  supabase.from('api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', keyRecord.id);

  return {
    organizationId: keyRecord.organization_id,
    keyId: keyRecord.id,
    scopes: keyRecord.scopes,
    plan: (keyRecord.organizations as any)?.plan || 'free',
  };
}
```

---

## API Versioning

```typescript
// app/api/v1/projects/route.ts — Version 1
export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (auth instanceof NextResponse) return auth;

  // V1 response format
  const { data } = await supabase
    .from('projects')
    .select('id, name, status, created_at')
    .eq('organization_id', auth.organizationId);

  return NextResponse.json({
    data,
    meta: { total: data?.length || 0, version: 'v1' },
  }, {
    headers: {
      'X-API-Version': 'v1',
      'X-RateLimit-Remaining': '...',
    },
  });
}
```

```
API URL Structure:
  /api/v1/projects        — List projects
  /api/v1/projects/:id    — Get project
  /api/v1/projects        — Create project (POST)
  /api/v1/webhooks        — Manage webhook subscriptions

Versioning Strategy:
  - Major version in URL path (/v1/, /v2/)
  - Minor/patch changes are backward-compatible (no version bump)
  - Deprecation: announce 6 months ahead, sunset 12 months
  - Support N-1 versions minimum
```

---

## Webhook Subscriptions (for API consumers)

```sql
CREATE TABLE webhook_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url TEXT NOT NULL, -- Customer's webhook endpoint
  events TEXT[] NOT NULL, -- ['project.created', 'project.updated']
  secret TEXT NOT NULL, -- For signature verification
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'disabled')),
  failure_count INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

```typescript
// lib/webhooks/dispatch.ts
import { createHmac } from 'crypto';

export async function dispatchWebhook(orgId: string, event: string, payload: any) {
  const { data: subscriptions } = await supabase
    .from('webhook_subscriptions')
    .select('*')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .contains('events', [event]);

  if (!subscriptions?.length) return;

  for (const sub of subscriptions) {
    const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
    const signature = createHmac('sha256', sub.secret).update(body).digest('hex');

    try {
      const response = await fetch(sub.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
        },
        body,
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      await supabase.from('webhook_subscriptions')
        .update({ last_triggered_at: new Date().toISOString(), failure_count: 0 })
        .eq('id', sub.id);
    } catch (error) {
      // Increment failure count, disable after 10 consecutive failures
      const newCount = sub.failure_count + 1;
      await supabase.from('webhook_subscriptions')
        .update({
          failure_count: newCount,
          status: newCount >= 10 ? 'disabled' : 'active',
        })
        .eq('id', sub.id);
    }
  }
}
```

---

## Plan-Based API Limits

```typescript
// lib/api-keys/plan-limits.ts
export const API_PLAN_LIMITS = {
  free:       { requestsPerMinute: 20,   requestsPerDay: 1000,    webhooks: 1,  scopes: ['read'] },
  starter:    { requestsPerMinute: 60,   requestsPerDay: 10000,   webhooks: 5,  scopes: ['read', 'write'] },
  pro:        { requestsPerMinute: 300,  requestsPerDay: 100000,  webhooks: 20, scopes: ['read', 'write', 'admin'] },
  enterprise: { requestsPerMinute: 1000, requestsPerDay: -1,      webhooks: -1, scopes: ['read', 'write', 'admin'] },
} as const;
```

---

## Checklist

- [ ] API key generation, hashing, and storage
- [ ] Bearer token authentication middleware
- [ ] Per-key rate limiting with plan-based limits
- [ ] API versioning (URL path: /v1/)
- [ ] Standard error response format
- [ ] Rate limit headers on every response
- [ ] Webhook subscriptions with HMAC signing
- [ ] API key management UI (create, revoke, view usage)
- [ ] Developer documentation page
- [ ] Usage tracking and analytics per key

---

## Related Skills

- **api-design**: Internal API patterns and best practices
- **security-hardening**: API security, rate limiting, CORS
- **rbac-permissions**: Scoped API access by role/plan
- **payment-integration**: Linking API tiers to subscription plans
