---
name: cost-optimization
version: 1.0.0
description: When the user wants to optimize infrastructure costs, reduce cloud spending, or improve unit economics. Also use when the user mentions "cost optimization," "cloud costs," "Vercel billing," "Supabase limits," "serverless costs," "database costs," "bandwidth," "edge functions," "function invocations," or "infrastructure budget." For performance, see performance-optimization. For caching, see caching-strategy.
---

# Cost Optimization

You are an expert in SaaS infrastructure cost management. Your goal is to help optimize cloud spending across Vercel, Supabase, Stripe, and third-party services — ensuring the application scales profitably without overspending on infrastructure.

## Initial Assessment

Before optimizing, understand:

1. **Current Spend** - Monthly costs per service? Growth trajectory?
2. **Architecture** - Serverless, server, or hybrid? Edge functions?
3. **Traffic Patterns** - Consistent or spiky? Geographic distribution?
4. **Unit Economics** - Revenue per user vs infrastructure cost per user?

---

## Core Principles

### 1. Measure Before Optimizing
- Don't guess where costs are. Monitor billing dashboards first.
- You can't optimize what you don't measure.

### 2. Cost Per User is Your North Star
- Total costs don't matter as much as cost per active user.
- If you spend $500/mo serving 10,000 users = $0.05/user = great.
- If you spend $500/mo serving 50 users = $10/user = problem.

### 3. Free Tiers Are Your Friend
- Vercel: 100GB bandwidth, 100 hours edge, unlimited deploys.
- Supabase: 500MB DB, 1GB storage, 50K monthly active users.
- Stripe: No monthly fee, 2.9% + $0.30 per transaction.
- Maximize free tiers before scaling to paid plans.

### 4. Cache Aggressively
- Every cached response is a database query you didn't make.
- CDN-cached pages cost ~$0. Dynamic server-rendered pages cost ~$0.001-$0.01 each.

---

## Vercel Cost Optimization

### Function Invocations

```typescript
// ❌ Expensive: Server-side rendering everything
// Every page view = function invocation = $$$

// ✅ Cheap: Static generation + ISR
// app/pricing/page.tsx
export const revalidate = 3600; // Static for 1 hour

// ✅ Cheap: Client-side data fetching for dynamic content
// Serve static shell, fetch data client-side
'use client';
export default function Dashboard() {
  const { data } = useSWR('/api/stats', fetcher);
  // Static shell + dynamic data = minimal function calls
}
```

### Bandwidth

```typescript
// next.config.js — Optimize images and assets
module.exports = {
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400, // Cache images for 1 day
    deviceSizes: [640, 768, 1024, 1280], // Limit generated sizes
  },
  compress: true, // gzip compression
};
```

### Edge vs Serverless

```typescript
// Use edge runtime for light tasks (faster + cheaper)
export const runtime = 'edge'; // Cheaper than Node.js runtime

// Use Node.js runtime only when you need:
// - npm packages that don't work in edge
// - File system access
// - Long-running operations (>25s)
export const runtime = 'nodejs';
```

---

## Supabase Cost Optimization

### Database Size

```sql
-- Check table sizes
SELECT 
  schemaname || '.' || tablename AS table,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS total_size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- Clean up: Archive old data
CREATE TABLE archived_logs AS 
SELECT * FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days';
DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Clean up: Remove unused indexes
SELECT indexrelname, idx_scan, pg_size_pretty(pg_relation_size(indexrelid))
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### Realtime Connections

```typescript
// ❌ Expensive: Open channel for every component
useEffect(() => {
  const channel = supabase.channel('anything'); // Each = connection
  // ...
}, []);

// ✅ Efficient: Share channels, unsubscribe when not needed
// Centralize real-time subscriptions
// Only subscribe to what you actively display
```

### Edge Functions

```typescript
// Supabase Edge Functions are billed per invocation
// Minimize by:
// 1. Batching operations
// 2. Using database triggers instead of edge functions
// 3. Caching results with Redis/Upstash

// ❌ Edge function called on every page view
// ✅ Edge function called on write operations only, cache reads
```

---

## Database Query Optimization

```sql
-- Use EXPLAIN ANALYZE to find slow queries
EXPLAIN ANALYZE SELECT * FROM projects WHERE organization_id = '...';

-- Add indexes for commonly filtered columns
CREATE INDEX CONCURRENTLY idx_projects_org_status 
  ON projects(organization_id, status);

-- Use partial indexes for common filters
CREATE INDEX idx_active_subs ON subscriptions(organization_id) 
  WHERE status = 'active';

-- Avoid SELECT * — only fetch needed columns
-- ❌ SELECT * FROM projects  
-- ✅ SELECT id, name, status FROM projects
```

---

## Third-Party Service Costs

| Service | Free Tier | Cost Trigger | Optimization |
|---------|-----------|-------------|--------------|
| **Vercel** | 100GB BW, 100h compute | High traffic, SSR pages | ISR, edge cache, image optimization |
| **Supabase** | 500MB DB, 50K MAU | Large tables, realtime | Archive old data, optimize queries |
| **Stripe** | No monthly fee | Transaction volume | Batch operations, cache plan data |
| **Upstash Redis** | 10K commands/day | Cache misses, high reads | Efficient key design, TTLs |
| **Resend** | 100 emails/day | Transactional emails | Batch digests, suppress low-value |
| **Sentry** | 5K events/month | Error volume | Filter operational errors, sample |
| **Inngest** | 50K steps/month | Background jobs | Batch operations, reduce steps |

---

## Cost Monitoring

```typescript
// lib/costs/monitor.ts
// Track costs per service monthly

export interface CostReport {
  month: string;
  services: {
    vercel: { bandwidth: number; functions: number; total: number };
    supabase: { database: number; storage: number; total: number };
    stripe: { fees: number; total: number };
    other: { [service: string]: number };
  };
  totalCost: number;
  activeUsers: number;
  costPerUser: number;
  revenue: number;
  grossMargin: number; // (revenue - cost) / revenue
}

// Target gross margins for SaaS:
// Infrastructure costs should be < 20% of revenue
// Healthy SaaS = 70-80% gross margin
// If infra > 30% of revenue, optimize aggressively
```

---

## Cost Decision Framework

```
When deciding on architecture:

1. Will this page change frequently?
   - No → Static Generation (cheapest)
   - Rarely → ISR (cheap)
   - Often → Server-side + cache (moderate)
   - Real-time → Client-side fetch (variable)

2. Can this be done at build time?
   - Yes → Do it at build time (free after build)
   - No → Can it be cached? → Cache it
   - No → Server function (costs per invocation)

3. Do I need a database query for this?
   - Can I cache the result? → Cache it (5 min TTL)
   - Is it user-specific? → Client-side fetch with SWR
   - Is it expensive? → Background job + materialized view
```

---

## Checklist

- [ ] Current costs per service documented
- [ ] Cost per active user calculated
- [ ] Static generation used where possible (ISR)
- [ ] Images optimized (WebP/AVIF, responsive sizes)
- [ ] Database queries optimized (indexes, no SELECT *)
- [ ] Old data archived or deleted
- [ ] Caching strategy implemented (see caching-strategy)
- [ ] Edge runtime used for lightweight functions
- [ ] Sentry configured to filter/sample appropriately
- [ ] Monthly cost review process established
- [ ] Alerts for cost spikes on all services

---

## Related Skills

- **caching-strategy**: Reduce database and API calls
- **performance-optimization**: Faster = fewer resources = cheaper
- **deployment-strategy**: Choosing the right deployment model
- **data-analytics-dashboard**: Track unit economics
