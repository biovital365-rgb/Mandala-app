---
name: data-analytics-dashboard
version: 1.0.0
description: When the user wants to implement internal business metrics, KPI dashboards, or SaaS analytics. Also use when the user mentions "MRR," "ARR," "churn rate," "LTV," "CAC," "cohort analysis," "revenue dashboard," "business metrics," "KPIs," or "SaaS metrics." For user-facing analytics, see analytics-tracking. For admin panels, see saas-operations-admin.
---

# Data Analytics Dashboard

You are an expert in SaaS business intelligence and metrics. Your goal is to help build internal dashboards that track the metrics that matter — MRR, churn, LTV, CAC, activation rates, and cohort analysis — giving founders and operators real-time visibility into business health.

## Initial Assessment

Before implementing, understand:

1. **Business Stage** - Pre-revenue, early, growth, or scale?
2. **Data Sources** - Stripe, Supabase, Google Analytics, custom events?
3. **Key Decisions** - What decisions will this data inform?
4. **Audience** - Founder only, team, or investors?

---

## Core Principles

### 1. Metrics That Drive Decisions
- Every metric on the dashboard should answer a question that leads to an action.
- Vanity metrics (total signups ever) have no place. Focus on rates and trends.

### 2. Single Source of Truth
- Stripe is the source of truth for revenue. Supabase for usage. Don't duplicate.
- Calculate derived metrics (LTV, CAC) from authoritative sources.

### 3. Time-Series First
- Show trends, not snapshots. A number without context is meaningless.
- Compare to previous period (MoM, WoW, YoY).

### 4. Real-Time Where It Matters
- Revenue and signups: daily refresh is fine.
- Active users and errors: real-time or near-real-time.

---

## Essential SaaS Metrics

### Revenue Metrics

```typescript
// lib/analytics/revenue.ts
import { stripe } from '@/lib/stripe/server';

export async function getRevenueMetrics(startDate: Date, endDate: Date) {
  // MRR from active subscriptions
  const subscriptions = await stripe.subscriptions.list({
    status: 'active',
    limit: 100,
    expand: ['data.items.data.price'],
  });

  let mrr = 0;
  for (const sub of subscriptions.data) {
    for (const item of sub.items.data) {
      const amount = item.price.unit_amount || 0;
      const interval = item.price.recurring?.interval;
      // Normalize to monthly
      if (interval === 'year') mrr += amount / 12;
      else if (interval === 'month') mrr += amount;
    }
  }
  mrr = mrr / 100; // Convert cents to dollars

  // ARR
  const arr = mrr * 12;

  // New MRR (subscriptions created this period)
  const newSubs = await stripe.subscriptions.list({
    created: { gte: Math.floor(startDate.getTime() / 1000), lte: Math.floor(endDate.getTime() / 1000) },
    limit: 100,
  });

  let newMrr = 0;
  for (const sub of newSubs.data) {
    for (const item of sub.items.data) {
      const amount = item.price?.unit_amount || 0;
      if (item.price?.recurring?.interval === 'year') newMrr += amount / 12;
      else newMrr += amount;
    }
  }
  newMrr = newMrr / 100;

  // Churned MRR
  const canceledSubs = await stripe.subscriptions.list({
    status: 'canceled',
    created: { gte: Math.floor(startDate.getTime() / 1000) },
    limit: 100,
  });

  let churnedMrr = 0;
  for (const sub of canceledSubs.data) {
    for (const item of sub.items.data) {
      const amount = item.price?.unit_amount || 0;
      if (item.price?.recurring?.interval === 'year') churnedMrr += amount / 12;
      else churnedMrr += amount;
    }
  }
  churnedMrr = churnedMrr / 100;

  const netNewMrr = newMrr - churnedMrr;

  return { mrr, arr, newMrr, churnedMrr, netNewMrr };
}
```

### Customer Metrics

```typescript
// lib/analytics/customers.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getCustomerMetrics(startDate: Date, endDate: Date) {
  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();

  // Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // New signups this period
  const { count: newSignups } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startISO)
    .lte('created_at', endISO);

  // Active users (logged in this period)
  const { count: activeUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('last_sign_in_at', startISO);

  // Paying customers
  const { count: payingCustomers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .in('status', ['active', 'trialing']);

  // Conversion rate
  const conversionRate = totalUsers ? ((payingCustomers || 0) / totalUsers) * 100 : 0;

  return {
    totalUsers: totalUsers || 0,
    newSignups: newSignups || 0,
    activeUsers: activeUsers || 0,
    payingCustomers: payingCustomers || 0,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
}
```

### Churn Analysis

```typescript
// lib/analytics/churn.ts
export async function getChurnMetrics(period: 'month' | 'week' = 'month') {
  const now = new Date();
  const periodStart = new Date(now);
  if (period === 'month') periodStart.setMonth(periodStart.getMonth() - 1);
  else periodStart.setDate(periodStart.getDate() - 7);

  const prevPeriodStart = new Date(periodStart);
  if (period === 'month') prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1);
  else prevPeriodStart.setDate(prevPeriodStart.getDate() - 7);

  // Subscribers at start of period
  const { count: startCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .in('status', ['active', 'trialing'])
    .lte('created_at', periodStart.toISOString());

  // Canceled during period
  const { count: canceledCount } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'canceled')
    .gte('canceled_at', periodStart.toISOString())
    .lte('canceled_at', now.toISOString());

  const churnRate = startCount ? ((canceledCount || 0) / startCount) * 100 : 0;

  return {
    subscribersAtStart: startCount || 0,
    canceledThisPeriod: canceledCount || 0,
    churnRate: Math.round(churnRate * 100) / 100,
    retentionRate: Math.round((100 - churnRate) * 100) / 100,
  };
}
```

---

## Dashboard API Route

```typescript
// app/api/admin/analytics/route.ts
import { getRevenueMetrics } from '@/lib/analytics/revenue';
import { getCustomerMetrics } from '@/lib/analytics/customers';
import { getChurnMetrics } from '@/lib/analytics/churn';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // TODO: Verify admin access (see rbac-permissions)
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || '30d';

  const endDate = new Date();
  const startDate = new Date();
  if (range === '7d') startDate.setDate(startDate.getDate() - 7);
  else if (range === '30d') startDate.setDate(startDate.getDate() - 30);
  else if (range === '90d') startDate.setDate(startDate.getDate() - 90);

  const [revenue, customers, churn] = await Promise.all([
    getRevenueMetrics(startDate, endDate),
    getCustomerMetrics(startDate, endDate),
    getChurnMetrics(),
  ]);

  return NextResponse.json({
    period: { start: startDate.toISOString(), end: endDate.toISOString(), range },
    revenue,
    customers,
    churn,
  });
}
```

---

## Dashboard UI Components

### KPI Card

```typescript
// components/analytics/kpi-card.tsx
interface KPICardProps {
  title: string;
  value: string | number;
  change?: number; // % change from previous period
  prefix?: string; // e.g., '$'
  suffix?: string; // e.g., '%'
  icon?: string;
}

export function KPICard({ title, value, change, prefix, suffix, icon }: KPICardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="kpi-card card">
      <div className="kpi-header">
        <span className="kpi-icon">{icon}</span>
        <span className="kpi-title">{title}</span>
      </div>
      <div className="kpi-value">
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>
      {change !== undefined && (
        <div className={`kpi-change ${isPositive ? 'positive' : ''} ${isNegative ? 'negative' : ''}`}>
          {isPositive ? '↑' : isNegative ? '↓' : '→'} {Math.abs(change)}% vs prev period
        </div>
      )}
    </div>
  );
}
```

### Metric Chart (lightweight)

```typescript
// components/analytics/sparkline.tsx
export function Sparkline({ data, color = 'var(--primary-500)' }: { data: number[]; color?: string }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 200;
  const height = 50;

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}
```

---

## Metric Definitions Reference

| Metric | Formula | Good Target |
|--------|---------|-------------|
| **MRR** | Sum of all monthly subscription revenue | Growing MoM |
| **ARR** | MRR × 12 | $1M+ for Series A |
| **Net Revenue Retention** | (Start MRR + Expansion - Churn) / Start MRR | >100% |
| **Churn Rate** | Canceled / Start of Period × 100 | <5% monthly |
| **LTV** | ARPU / Monthly Churn Rate | LTV > 3× CAC |
| **CAC** | Total Sales+Marketing Cost / New Customers | CAC < LTV/3 |
| **ARPU** | Total Revenue / Active Customers | Growing |
| **Activation Rate** | Activated Users / Signups × 100 | >40% |
| **Quick Ratio** | (New MRR + Expansion) / (Churn + Contraction) | >4 |

---

## Checklist

- [ ] Revenue metrics from Stripe (MRR, ARR, Net New MRR)
- [ ] Customer metrics from database (signups, active, paying)
- [ ] Churn analysis (rate, reasons, trend)
- [ ] KPI cards with period-over-period comparison
- [ ] Date range selector (7d, 30d, 90d, custom)
- [ ] Chart visualizations for trends
- [ ] Admin-only access (RBAC protected)
- [ ] Data caching to avoid Stripe API limits

---

## Related Skills

- **saas-operations-admin**: Admin panel context for metrics dashboards
- **analytics-tracking**: User-facing product analytics
- **payment-integration**: Stripe data source for revenue metrics
- **rbac-permissions**: Admin-only access to business metrics
