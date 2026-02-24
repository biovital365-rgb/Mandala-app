---
name: multi-tenancy
version: 1.0.0
description: When the user wants to implement multi-tenant architecture for a SaaS application. Also use when the user mentions "multi-tenant," "tenant isolation," "organizations," "workspaces," "team accounts," "white-labeling," "subdomain routing," "data isolation," or "tenant-aware queries." For user-level access control, see rbac-permissions. For database schema patterns, see database-design.
---

# Multi-Tenancy Architecture

You are an expert in SaaS multi-tenant architecture. Your goal is to help build a scalable, secure multi-tenant system that supports organization-level isolation, team management, subdomain routing, and plan-based feature gating — all while maintaining data integrity and performance at scale.

## Initial Assessment

**Check for existing project context first:**
Review existing database schema, auth setup, and any organization/team models before making changes.

Before implementing multi-tenancy, understand:

1. **Tenancy Model**
   - Shared database with row-level isolation? (most common)
   - Schema-per-tenant? (rare, high isolation)
   - Database-per-tenant? (enterprise, maximum isolation)
   - Hybrid approach?

2. **Tenant Structure**
   - Are tenants "organizations," "workspaces," "teams," or "accounts"?
   - Can a user belong to multiple tenants?
   - Is there a hierarchy (org → team → project)?

3. **Isolation Requirements**
   - How strict must data isolation be? (financial SaaS = very strict)
   - Do tenants need separate subdomains?
   - Are there compliance requirements (SOC 2, HIPAA)?

4. **Scale Expectations**
   - Hundreds or millions of tenants?
   - Data volume per tenant?
   - Geographic distribution?

---

## Core Principles

### 1. Data Isolation is Sacred
- A tenant should NEVER see another tenant's data — this is a non-negotiable security requirement.
- Every query must be tenant-scoped. Use RLS as the ultimate safety net.
- Test isolation explicitly: "Can User A see Tenant B's data?"

### 2. Tenant Context is Global
- The current tenant should be available throughout the request lifecycle.
- Avoid passing `tenantId` through every function — use middleware/context.
- The tenant context must be set BEFORE any database operation.

### 3. Design for the 80% Case
- Most SaaS apps need shared-database with RLS (simplest, cheapest, scales well).
- Only use schema/database-per-tenant if you have explicit compliance or performance requirements.
- Start simple, migrate to more isolation if needed.

### 4. Plan-Aware Architecture
- Tenant capabilities should be driven by their subscription plan.
- Feature gating, usage limits, and permissions should cascade from the tenant's plan.
- See **rbac-permissions** for fine-grained access control within a tenant.

---

## Database Schema

### Core Tables

```sql
-- Organizations (Tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL-friendly identifier (subdomain, path)
  logo_url TEXT,
  
  -- Plan & Billing
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  
  -- Settings
  settings JSONB DEFAULT '{}',
  custom_domain TEXT UNIQUE, -- For white-labeling
  
  -- Limits (driven by plan)
  max_members INTEGER NOT NULL DEFAULT 5,
  max_projects INTEGER NOT NULL DEFAULT 3,
  max_storage_mb INTEGER NOT NULL DEFAULT 500,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Organization Members (User ↔ Tenant relationship)
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer', 'billing')),
  
  -- Invitation tracking
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'suspended')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id)
);

-- Indexes
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_custom_domain ON organizations(custom_domain);
```

### Tenant-Aware Resource Tables

```sql
-- Example: Projects scoped to a tenant
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVERY tenant-scoped table MUST have organization_id + index
CREATE INDEX idx_projects_org ON projects(organization_id);
```

---

## Row-Level Security (RLS)

```sql
-- Enable RLS on ALL tenant-scoped tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members FORCE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;

-- Helper: Get user's organizations
CREATE OR REPLACE FUNCTION auth.user_organizations()
RETURNS SETOF UUID AS $$
  SELECT organization_id 
  FROM public.organization_members 
  WHERE user_id = auth.uid() 
    AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: Check user's role in an org
CREATE OR REPLACE FUNCTION auth.user_org_role(org_id UUID)
RETURNS TEXT AS $$
  SELECT role 
  FROM public.organization_members 
  WHERE user_id = auth.uid() 
    AND organization_id = org_id
    AND status = 'active';
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations: Members can view their orgs
CREATE POLICY "Members can view org" ON organizations
  FOR SELECT USING (id IN (SELECT auth.user_organizations()));

-- Organization Members: Members can view co-members
CREATE POLICY "Members can view members" ON organization_members
  FOR SELECT USING (organization_id IN (SELECT auth.user_organizations()));

-- Only admins/owners can invite
CREATE POLICY "Admins can invite" ON organization_members
  FOR INSERT WITH CHECK (
    auth.user_org_role(organization_id) IN ('owner', 'admin')
  );

-- Projects: Tenant isolation
CREATE POLICY "Tenant access to projects" ON projects
  FOR SELECT USING (organization_id IN (SELECT auth.user_organizations()));

CREATE POLICY "Members can create projects" ON projects
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT auth.user_organizations())
    AND auth.user_org_role(organization_id) IN ('owner', 'admin', 'member')
  );
```

---

## Tenant Context Middleware

```typescript
// lib/tenant/context.ts
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface TenantContext {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    settings: Record<string, any>;
    max_members: number;
    max_projects: number;
  };
  membership: {
    role: 'owner' | 'admin' | 'member' | 'viewer' | 'billing';
    user_id: string;
  };
}

export async function getTenantContext(slug: string): Promise<TenantContext> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');

  // Get org + membership in a single query
  const { data: org, error } = await supabase
    .from('organizations')
    .select(`
      id, name, slug, plan, settings, max_members, max_projects,
      organization_members!inner(role, user_id)
    `)
    .eq('slug', slug)
    .eq('organization_members.user_id', user.id)
    .eq('organization_members.status', 'active')
    .single();

  if (error || !org) redirect('/select-org');

  return {
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      settings: org.settings,
      max_members: org.max_members,
      max_projects: org.max_projects,
    },
    membership: {
      role: org.organization_members[0].role,
      user_id: user.id,
    },
  };
}
```

### React Context Provider

```typescript
// contexts/tenant-context.tsx
'use client';

import { createContext, useContext } from 'react';
import type { TenantContext } from '@/lib/tenant/context';

const TenantCtx = createContext<TenantContext | null>(null);

export function TenantProvider({ 
  children, 
  value 
}: { 
  children: React.ReactNode; 
  value: TenantContext 
}) {
  return <TenantCtx.Provider value={value}>{children}</TenantCtx.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantCtx);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}

export function useIsAdmin() {
  const { membership } = useTenant();
  return membership.role === 'owner' || membership.role === 'admin';
}

export function usePlan() {
  const { organization } = useTenant();
  return organization.plan;
}
```

---

## Routing Patterns

### Path-Based Routing (Recommended)

```
/app/[orgSlug]/dashboard
/app/[orgSlug]/projects
/app/[orgSlug]/settings
```

```typescript
// app/app/[orgSlug]/layout.tsx
import { getTenantContext } from '@/lib/tenant/context';
import { TenantProvider } from '@/contexts/tenant-context';

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgSlug: string };
}) {
  const tenant = await getTenantContext(params.orgSlug);

  return (
    <TenantProvider value={tenant}>
      <div className="org-layout">
        <OrgSidebar />
        <main>{children}</main>
      </div>
    </TenantProvider>
  );
}
```

### Subdomain Routing (Advanced)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const subdomain = hostname.split('.')[0];
  
  // Skip for main domain, www, api, etc.
  const reservedSubdomains = ['www', 'api', 'app', 'admin', 'docs'];
  if (reservedSubdomains.includes(subdomain)) return NextResponse.next();
  
  // Rewrite subdomain to path-based route
  const url = request.nextUrl.clone();
  url.pathname = `/app/${subdomain}${url.pathname}`;
  return NextResponse.rewrite(url);
}
```

---

## Organization Switcher

```typescript
// components/org-switcher.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useTenant } from '@/contexts/tenant-context';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface OrgOption {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export function OrgSwitcher() {
  const { organization } = useTenant();
  const [orgs, setOrgs] = useState<OrgOption[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadOrgs() {
      const { data } = await supabase
        .from('organization_members')
        .select('role, organizations(id, name, slug)')
        .eq('status', 'active');
      
      if (data) {
        setOrgs(data.map(m => ({
          id: (m.organizations as any).id,
          name: (m.organizations as any).name,
          slug: (m.organizations as any).slug,
          role: m.role,
        })));
      }
    }
    loadOrgs();
  }, [supabase]);

  function switchOrg(slug: string) {
    router.push(`/app/${slug}/dashboard`);
    setOpen(false);
  }

  return (
    <div className="org-switcher">
      <button onClick={() => setOpen(!open)} className="org-switcher-trigger">
        <span className="org-avatar">{organization.name[0]}</span>
        <span className="org-name">{organization.name}</span>
        <span className="chevron">▾</span>
      </button>
      
      {open && (
        <div className="org-switcher-dropdown">
          {orgs.map(org => (
            <button
              key={org.id}
              onClick={() => switchOrg(org.slug)}
              className={`org-option ${org.id === organization.id ? 'active' : ''}`}
            >
              <span className="org-avatar">{org.name[0]}</span>
              <div>
                <span className="org-name">{org.name}</span>
                <span className="org-role">{org.role}</span>
              </div>
            </button>
          ))}
          <hr />
          <button onClick={() => router.push('/create-org')} className="org-option create">
            + Create Organization
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Plan-Based Feature Gating

```typescript
// lib/tenant/plan-limits.ts
export const PLAN_LIMITS = {
  free: {
    maxMembers: 3,
    maxProjects: 2,
    maxStorageMb: 100,
    features: ['basic_reports'],
  },
  starter: {
    maxMembers: 10,
    maxProjects: 10,
    maxStorageMb: 1000,
    features: ['basic_reports', 'api_access', 'custom_branding'],
  },
  pro: {
    maxMembers: 50,
    maxProjects: 100,
    maxStorageMb: 10000,
    features: ['basic_reports', 'api_access', 'custom_branding', 'advanced_analytics', 'priority_support', 'sso'],
  },
  enterprise: {
    maxMembers: -1, // unlimited
    maxProjects: -1,
    maxStorageMb: -1,
    features: ['basic_reports', 'api_access', 'custom_branding', 'advanced_analytics', 'priority_support', 'sso', 'audit_logs', 'custom_domain', 'dedicated_support'],
  },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export function canUseFeature(plan: PlanName, feature: string): boolean {
  return PLAN_LIMITS[plan].features.includes(feature);
}

export function isWithinLimit(plan: PlanName, metric: 'maxMembers' | 'maxProjects' | 'maxStorageMb', current: number): boolean {
  const limit = PLAN_LIMITS[plan][metric];
  return limit === -1 || current < limit; // -1 = unlimited
}
```

```typescript
// components/feature-gate.tsx
'use client';

import { usePlan } from '@/contexts/tenant-context';
import { canUseFeature } from '@/lib/tenant/plan-limits';
import type { PlanName } from '@/lib/tenant/plan-limits';

interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const plan = usePlan() as PlanName;
  
  if (!canUseFeature(plan, feature)) {
    return fallback || (
      <div className="feature-locked">
        <p>🔒 This feature requires a higher plan</p>
        <a href="/pricing">Upgrade Now</a>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## Invitation & Team Management

```typescript
// app/api/org/[orgId]/invite/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { orgId: string } }) {
  const supabase = createClient();
  const { email, role } = await request.json();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check inviter is admin/owner
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', params.orgId)
    .eq('user_id', user.id)
    .single();

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  // Check member limit
  const { count } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', params.orgId)
    .eq('status', 'active');

  const { data: org } = await supabase
    .from('organizations')
    .select('max_members')
    .eq('id', params.orgId)
    .single();

  if (org && count !== null && count >= org.max_members) {
    return NextResponse.json({ error: 'Member limit reached. Upgrade your plan.' }, { status: 403 });
  }

  // Create invitation
  // In production: send email, create invite token, handle expiry
  const { error } = await supabase.from('organization_members').insert({
    organization_id: params.orgId,
    user_id: null, // Will be set when user accepts
    role: role || 'member',
    status: 'invited',
    invited_by: user.id,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // TODO: Send invitation email via email-transactional skill
  return NextResponse.json({ success: true });
}
```

---

## Checklist

### Database
- [ ] `organizations` table created with plan, slug, limits
- [ ] `organization_members` table with role and status
- [ ] All resource tables have `organization_id` column + index
- [ ] RLS enabled and FORCED on every tenant-scoped table
- [ ] Helper functions for `user_organizations()` and `user_org_role()`

### Routing
- [ ] Path-based routing (`/app/[orgSlug]/...`) implemented
- [ ] Tenant context loaded in layout and provided via React context
- [ ] Organization switcher component working
- [ ] Redirect to org selector when no org is active

### Security
- [ ] RLS policies prevent cross-tenant data access
- [ ] API routes validate tenant membership before any operation
- [ ] Invitation flow checks member limits
- [ ] Role checks prevent unauthorized admin actions

### Features
- [ ] Plan-based feature gating implemented
- [ ] Usage limits enforced (members, projects, storage)
- [ ] Organization settings page (name, logo, billing)
- [ ] Team management (invite, remove, change role)

---

## Task-Specific Questions

1. What do you call your tenants? (organizations, workspaces, teams, accounts)
2. Can users belong to multiple tenants simultaneously?
3. What level of data isolation is required?
4. Do you need subdomain routing or path-based routing?
5. What plan tiers exist and what are the limits?
6. Do you need white-labeling (custom domain, custom branding)?

---

## Related Skills

- **rbac-permissions**: For fine-grained access control within a tenant
- **database-design**: For schema design patterns and migrations
- **security-hardening**: For RLS and data protection
- **auth-implementation**: For user authentication and session management
- **payment-integration**: For tenant-level subscription billing
- **advanced-billing-tax**: For organization-level invoicing and tax
