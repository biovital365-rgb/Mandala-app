---
name: caching-strategy
version: 1.0.0
description: When the user wants to implement caching for performance. Also use when the user mentions "caching," "Redis," "CDN," "cache invalidation," "stale-while-revalidate," "ISR," "edge caching," "memoization," "cache headers," or "response caching." For general performance, see performance-optimization. For database queries, see database-design.
---

# Caching Strategy

You are an expert in caching strategies for web applications. Your goal is to help implement a multi-layer caching system that dramatically improves response times and reduces database load — from browser cache to CDN to application cache to database query cache.

## Initial Assessment

Before implementing caching, understand:

1. **Hot Paths** - Which routes/queries are called most frequently?
2. **Data Freshness** - How stale can data be? (real-time vs minutes vs hours)
3. **Data Volume** - How large are cached objects?
4. **Infrastructure** - Do you have Redis/Upstash? CDN (Vercel, Cloudflare)?

---

## Core Principles

### 1. Cache Close to the Consumer
- Browser > CDN Edge > Application > Database
- The closer to the user, the faster the response.

### 2. There Are Only Two Hard Problems
- Cache invalidation and naming things. Focus on invalidation strategy first.
- Prefer time-based expiry (TTL) for simplicity. Use event-based invalidation for critical data.

### 3. Cache What's Expensive to Compute
- Database aggregations, API calls to third parties, rendered HTML.
- Don't cache what's already fast — profile first.

### 4. Stale-While-Revalidate is King
- Serve stale data instantly, refresh in the background.
- Best UX: fast response + eventually fresh data.

---

## Caching Layers

### Layer 1: Browser Cache (HTTP Headers)

```typescript
// next.config.js — Static assets (immutable)
module.exports = {
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
};
```

```typescript
// API routes — Dynamic data
export async function GET() {
  const data = await fetchData();
  return NextResponse.json(data, {
    headers: {
      // Revalidate every 60s, serve stale for up to 5 min
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

### Layer 2: CDN / Edge Cache (Vercel, Cloudflare)

```typescript
// Next.js ISR (Incremental Static Regeneration)
// app/pricing/page.tsx
export const revalidate = 3600; // Revalidate every hour

export default async function PricingPage() {
  const plans = await getPlans(); // Cached at edge
  return <PricingUI plans={plans} />;
}

// On-demand revalidation (when pricing changes)
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request: Request) {
  const { path, tag, secret } = await request.json();
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }
  if (tag) revalidateTag(tag);
  if (path) revalidatePath(path);
  return NextResponse.json({ revalidated: true });
}
```

### Layer 3: Application Cache (Redis/Upstash)

```typescript
// lib/cache/redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface CacheOptions {
  ttl?: number; // seconds
  tags?: string[]; // for group invalidation
}

export async function cached<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { ttl = 300 } = options; // Default 5 min

  // Try cache first
  const cachedValue = await redis.get<T>(key);
  if (cachedValue !== null && cachedValue !== undefined) {
    return cachedValue;
  }

  // Cache miss — compute and store
  const value = await fn();
  await redis.set(key, JSON.stringify(value), { ex: ttl });

  // Store tag → key mappings for group invalidation
  if (options.tags) {
    for (const tag of options.tags) {
      await redis.sadd(`tag:${tag}`, key);
      await redis.expire(`tag:${tag}`, ttl * 2);
    }
  }

  return value;
}

export async function invalidateTag(tag: string): Promise<void> {
  const keys = await redis.smembers(`tag:${tag}`);
  if (keys.length > 0) {
    await redis.del(...keys, `tag:${tag}`);
  }
}

export async function invalidateKey(key: string): Promise<void> {
  await redis.del(key);
}

// Usage:
// const projects = await cached(
//   `org:${orgId}:projects`,
//   () => supabase.from('projects').select('*').eq('organization_id', orgId),
//   { ttl: 120, tags: [`org:${orgId}`] }
// );
```

### Layer 4: In-Memory Cache (React/Server)

```typescript
// lib/cache/memory.ts — Simple in-process cache for server components
const cache = new Map<string, { value: any; expiry: number }>();

export function memoize<T>(key: string, fn: () => T, ttlMs: number = 60000): T {
  const cached = cache.get(key);
  if (cached && cached.expiry > Date.now()) {
    return cached.value as T;
  }
  const value = fn();
  cache.set(key, { value, expiry: Date.now() + ttlMs });
  return value;
}

// React: unstable_cache (Next.js built-in)
import { unstable_cache } from 'next/cache';

const getCachedPlans = unstable_cache(
  async () => {
    return await supabase.from('plans').select('*');
  },
  ['plans'], // cache key
  { revalidate: 3600, tags: ['plans'] } // 1hr TTL
);
```

### Layer 5: Database Query Cache

```sql
-- Materialized views for expensive aggregations
CREATE MATERIALIZED VIEW org_usage_stats AS
SELECT 
  organization_id,
  COUNT(DISTINCT p.id) as project_count,
  COUNT(DISTINCT m.user_id) as member_count,
  SUM(COALESCE(p.storage_used_mb, 0)) as total_storage_mb
FROM organizations o
LEFT JOIN projects p ON p.organization_id = o.id
LEFT JOIN organization_members m ON m.organization_id = o.id
GROUP BY o.id;

-- Refresh periodically (e.g., via cron)
REFRESH MATERIALIZED VIEW CONCURRENTLY org_usage_stats;

-- Index the materialized view
CREATE UNIQUE INDEX idx_org_usage_stats ON org_usage_stats(organization_id);
```

---

## Cache Invalidation Patterns

### Event-Based (Critical Data)

```typescript
// After creating a project, invalidate the org's project cache
async function createProject(orgId: string, data: any) {
  const result = await supabase.from('projects').insert(data);
  
  // Invalidate caches
  await invalidateTag(`org:${orgId}`);
  await invalidateKey(`org:${orgId}:projects`);
  
  return result;
}
```

### Time-Based (TTL)

```typescript
// Data that can be slightly stale
const analytics = await cached(
  `org:${orgId}:analytics:${range}`,
  () => computeAnalytics(orgId, range),
  { ttl: 300 } // 5 minute cache
);
```

### Stale-While-Revalidate

```typescript
// Serve stale data, refresh in background
export async function swr<T>(key: string, fn: () => Promise<T>, ttl: number = 300): Promise<T> {
  const cachedValue = await redis.get<{ value: T; timestamp: number }>(key);
  
  if (cachedValue) {
    const age = (Date.now() - cachedValue.timestamp) / 1000;
    if (age > ttl) {
      // Stale — refresh in background
      fn().then(async (freshValue) => {
        await redis.set(key, JSON.stringify({ value: freshValue, timestamp: Date.now() }));
      });
    }
    return cachedValue.value; // Return stale data immediately
  }
  
  // Cache miss — fetch and store
  const value = await fn();
  await redis.set(key, JSON.stringify({ value, timestamp: Date.now() }));
  return value;
}
```

---

## Cache Key Naming Convention

```
Format: {scope}:{identifier}:{resource}:{variant}

Examples:
  org:abc123:projects              — All projects for org
  org:abc123:projects:count        — Project count
  user:xyz:preferences             — User preferences
  global:plans                     — Pricing plans (shared)
  api:key123:ratelimit             — API rate limit counter
  page:/pricing:html               — Rendered page HTML
```

---

## Checklist

- [ ] HTTP cache headers set on static assets and API responses
- [ ] CDN/Edge caching configured (ISR or cache headers)
- [ ] Redis/Upstash cache for hot database queries
- [ ] Cache invalidation on write operations
- [ ] Stale-while-revalidate for non-critical data
- [ ] Cache key naming convention established
- [ ] Cache hit/miss monitoring
- [ ] Cache warming for cold starts (optional)
- [ ] Materialized views for expensive aggregations

---

## Related Skills

- **performance-optimization**: Broader performance strategies
- **database-design**: Query optimization and indexes
- **deployment-strategy**: CDN and edge deployment
- **api-monetization**: Rate limiting with Redis
