---
name: rbac-permissions
version: 1.0.0
description: When the user wants to implement role-based access control, permissions, or feature flags by plan. Also use when the user mentions "roles," "permissions," "RBAC," "access control," "feature flags," "user roles," "admin access," "role assignment," "scoped access," "capabilities," or "authorization." For authentication, see auth-implementation. For tenant-level isolation, see multi-tenancy.
---

# RBAC & Permissions

You are an expert in authorization systems and role-based access control for SaaS applications. Your goal is to build a flexible, maintainable permission system that controls who can do what — from simple role checks to granular resource-level permissions and plan-based feature gating.

## Initial Assessment

Before implementing, understand:

1. **Access Model** - Simple roles (admin/member) or granular permissions?
2. **Scope** - App-level roles, org-level roles, or resource-level?
3. **Plan Gating** - Do features depend on subscription plan?
4. **Complexity** - How many distinct roles and permissions?

---

## Core Principles

### 1. Deny by Default
- If no explicit permission is granted, access is denied.
- Whitelist what's allowed, never blacklist what's forbidden.
- New features are restricted until explicitly permitted.

### 2. Roles Are Groups of Permissions
- Roles are convenient labels; permissions are the atomic units.
- A "member" role = a predefined set of permissions.
- Custom roles = user-defined set of permissions (enterprise feature).

### 3. Check at Every Layer
- Client-side checks for UX (hide buttons, disable features).
- Server-side checks for SECURITY (validate in API routes).
- Database checks for INTEGRITY (RLS policies).
- Never rely on client-side checks alone.

### 4. Separate Auth from Authz
- Authentication = "Who are you?" (handled by auth-implementation)
- Authorization = "What can you do?" (handled here)
- Keep these concerns cleanly separated.

---

## Permission Architecture

### Role & Permission Definition

```typescript
// lib/permissions/types.ts

// Actions that can be performed
export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage';

// Resources in the system
export type Resource =
  | 'project'
  | 'member'
  | 'settings'
  | 'billing'
  | 'api_key'
  | 'integration'
  | 'analytics'
  | 'audit_log';

// A permission is an action on a resource
export type Permission = `${Resource}:${Action}`;

// Role definitions with their permissions
export const ROLES = {
  owner: {
    label: 'Owner',
    description: 'Full access. Can delete org and transfer ownership.',
    permissions: ['*'] as const, // Wildcard = all permissions
  },
  admin: {
    label: 'Admin',
    description: 'Manage members, settings, and all resources.',
    permissions: [
      'project:manage',
      'member:manage',
      'settings:manage',
      'billing:read',
      'api_key:manage',
      'integration:manage',
      'analytics:read',
      'audit_log:read',
    ] as const,
  },
  member: {
    label: 'Member',
    description: 'Create and manage own resources.',
    permissions: [
      'project:create', 'project:read', 'project:update',
      'member:read',
      'settings:read',
      'integration:read',
      'analytics:read',
    ] as const,
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to resources.',
    permissions: [
      'project:read',
      'member:read',
      'settings:read',
      'analytics:read',
    ] as const,
  },
  billing: {
    label: 'Billing Manager',
    description: 'Manage billing and invoices only.',
    permissions: [
      'billing:manage',
      'settings:read',
    ] as const,
  },
} as const;

export type RoleName = keyof typeof ROLES;
```

### Permission Checker

```typescript
// lib/permissions/check.ts
import { ROLES, type RoleName, type Permission } from './types';

export function hasPermission(role: RoleName, permission: Permission): boolean {
  const roleConfig = ROLES[role];
  if (!roleConfig) return false;

  // Owner has wildcard access
  if (roleConfig.permissions.includes('*' as any)) return true;

  // Check exact permission
  if ((roleConfig.permissions as readonly string[]).includes(permission)) return true;

  // Check 'manage' wildcard (manage = create + read + update + delete)
  const [resource, action] = permission.split(':') as [string, string];
  const managePermission = `${resource}:manage`;
  if ((roleConfig.permissions as readonly string[]).includes(managePermission)) return true;

  return false;
}

export function can(role: RoleName, action: string, resource: string): boolean {
  return hasPermission(role, `${resource}:${action}` as Permission);
}

// Check multiple permissions (AND logic)
export function hasAllPermissions(role: RoleName, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

// Check any permission (OR logic)
export function hasAnyPermission(role: RoleName, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}
```

---

## Plan-Based Feature Gating

```typescript
// lib/permissions/features.ts

export interface FeatureDefinition {
  id: string;
  label: string;
  description: string;
  plans: string[]; // Which plans include this feature
}

export const FEATURES: Record<string, FeatureDefinition> = {
  basic_reports: {
    id: 'basic_reports',
    label: 'Basic Reports',
    description: 'Standard project reports',
    plans: ['free', 'starter', 'pro', 'enterprise'],
  },
  advanced_analytics: {
    id: 'advanced_analytics',
    label: 'Advanced Analytics',
    description: 'Custom dashboards, cohort analysis, exports',
    plans: ['pro', 'enterprise'],
  },
  api_access: {
    id: 'api_access',
    label: 'API Access',
    description: 'REST API and API keys',
    plans: ['starter', 'pro', 'enterprise'],
  },
  sso: {
    id: 'sso',
    label: 'SSO / SAML',
    description: 'Single sign-on with corporate identity providers',
    plans: ['enterprise'],
  },
  custom_domain: {
    id: 'custom_domain',
    label: 'Custom Domain',
    description: 'Use your own domain for the workspace',
    plans: ['enterprise'],
  },
  audit_logs: {
    id: 'audit_logs',
    label: 'Audit Logs',
    description: 'Track all user actions for compliance',
    plans: ['pro', 'enterprise'],
  },
  priority_support: {
    id: 'priority_support',
    label: 'Priority Support',
    description: 'Faster response times and dedicated support',
    plans: ['pro', 'enterprise'],
  },
};

export function isFeatureAvailable(featureId: string, plan: string): boolean {
  const feature = FEATURES[featureId];
  if (!feature) return false;
  return feature.plans.includes(plan);
}

export function getAvailableFeatures(plan: string): FeatureDefinition[] {
  return Object.values(FEATURES).filter(f => f.plans.includes(plan));
}

export function getLockedFeatures(plan: string): FeatureDefinition[] {
  return Object.values(FEATURES).filter(f => !f.plans.includes(plan));
}
```

---

## Server-Side Authorization Middleware

```typescript
// lib/permissions/middleware.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { hasPermission, type Permission, type RoleName } from './check';
import { isFeatureAvailable } from './features';

interface AuthzOptions {
  permission?: Permission;
  feature?: string;
  orgIdParam?: string; // Which route param contains the org ID
}

export function withAuthz(handler: Function, options: AuthzOptions) {
  return async (request: Request, context?: any) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get org context
    const orgId = context?.params?.[options.orgIdParam || 'orgId'];
    if (orgId) {
      const { data: membership } = await supabase
        .from('organization_members')
        .select('role, organizations(plan)')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (!membership) {
        return NextResponse.json({ error: 'Not a member of this organization' }, { status: 403 });
      }

      // Check role permission
      if (options.permission && !hasPermission(membership.role as RoleName, options.permission)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      // Check feature availability
      const plan = (membership.organizations as any)?.plan;
      if (options.feature && plan && !isFeatureAvailable(options.feature, plan)) {
        return NextResponse.json(
          { error: 'This feature requires a plan upgrade', code: 'PLAN_REQUIRED' },
          { status: 403 }
        );
      }
    }

    return handler(request, context);
  };
}

// Usage:
// export const POST = withAuthz(createProjectHandler, {
//   permission: 'project:create',
//   orgIdParam: 'orgId',
// });
//
// export const GET = withAuthz(getAnalyticsHandler, {
//   permission: 'analytics:read',
//   feature: 'advanced_analytics',
//   orgIdParam: 'orgId',
// });
```

---

## React Permission Components

```typescript
// components/auth/permission-gate.tsx
'use client';

import { useTenant } from '@/contexts/tenant-context';
import { hasPermission, type Permission, type RoleName } from '@/lib/permissions/check';

// Hide UI elements the user doesn't have permission for
export function Can({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { membership } = useTenant();
  
  if (!hasPermission(membership.role as RoleName, permission)) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
}

// Usage:
// <Can permission="member:manage">
//   <button>Invite Member</button>
// </Can>
//
// <Can permission="billing:manage" fallback={<p>Contact your admin for billing</p>}>
//   <BillingSettings />
// </Can>
```

```typescript
// components/auth/feature-gate.tsx
'use client';

import { useTenant } from '@/contexts/tenant-context';
import { isFeatureAvailable } from '@/lib/permissions/features';

export function Feature({
  id,
  children,
  fallback,
}: {
  id: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { organization } = useTenant();

  if (!isFeatureAvailable(id, organization.plan)) {
    return fallback || (
      <div className="feature-locked card">
        <span className="lock-icon">🔒</span>
        <p>Available on a higher plan</p>
        <a href="/pricing" className="btn btn-primary btn-sm">Upgrade</a>
      </div>
    );
  }

  return <>{children}</>;
}

// Usage:
// <Feature id="advanced_analytics">
//   <AnalyticsDashboard />
// </Feature>
```

```typescript
// hooks/use-permissions.ts
import { useTenant } from '@/contexts/tenant-context';
import { hasPermission, can, type Permission, type RoleName } from '@/lib/permissions/check';
import { isFeatureAvailable } from '@/lib/permissions/features';

export function usePermissions() {
  const { membership, organization } = useTenant();
  const role = membership.role as RoleName;

  return {
    role,
    can: (action: string, resource: string) => can(role, action, resource),
    hasPermission: (perm: Permission) => hasPermission(role, perm),
    hasFeature: (featureId: string) => isFeatureAvailable(featureId, organization.plan),
    isOwner: role === 'owner',
    isAdmin: role === 'owner' || role === 'admin',
    isMember: ['owner', 'admin', 'member'].includes(role),
  };
}

// Usage:
// const { can, hasFeature, isAdmin } = usePermissions();
// if (can('create', 'project')) { ... }
// if (hasFeature('sso')) { ... }
```

---

## Database RLS with Permissions

```sql
-- Helper: Check if user can perform action on resource in org
CREATE OR REPLACE FUNCTION auth.can_perform(
  org_id UUID,
  required_roles TEXT[]
) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = auth.uid()
      AND organization_id = org_id
      AND status = 'active'
      AND role = ANY(required_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Example: Only admins/owners can modify settings
CREATE POLICY "Admins can update org settings" ON organizations
  FOR UPDATE USING (
    auth.can_perform(id, ARRAY['owner', 'admin'])
  );

-- Example: Members can create, but only admins can delete
CREATE POLICY "Members can create projects" ON projects
  FOR INSERT WITH CHECK (
    auth.can_perform(organization_id, ARRAY['owner', 'admin', 'member'])
  );

CREATE POLICY "Admins can delete projects" ON projects
  FOR DELETE USING (
    auth.can_perform(organization_id, ARRAY['owner', 'admin'])
  );

-- Example: Viewers can only read
CREATE POLICY "All roles can read projects" ON projects
  FOR SELECT USING (
    auth.can_perform(organization_id, ARRAY['owner', 'admin', 'member', 'viewer'])
  );
```

---

## Role Management UI

```typescript
// components/settings/role-manager.tsx
'use client';

import { ROLES, type RoleName } from '@/lib/permissions/types';
import { usePermissions } from '@/hooks/use-permissions';

interface MemberRowProps {
  member: { id: string; user_id: string; name: string; email: string; role: RoleName };
  onRoleChange: (memberId: string, newRole: RoleName) => void;
  onRemove: (memberId: string) => void;
}

export function MemberRow({ member, onRoleChange, onRemove }: MemberRowProps) {
  const { isAdmin, isOwner } = usePermissions();
  const assignableRoles = Object.entries(ROLES)
    .filter(([key]) => {
      if (!isOwner && key === 'owner') return false; // Only owners can assign owner
      return true;
    });

  return (
    <tr>
      <td>{member.name}</td>
      <td>{member.email}</td>
      <td>
        {isAdmin ? (
          <select
            value={member.role}
            onChange={(e) => onRoleChange(member.id, e.target.value as RoleName)}
            disabled={member.role === 'owner' && !isOwner}
          >
            {assignableRoles.map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        ) : (
          <span>{ROLES[member.role].label}</span>
        )}
      </td>
      <td>
        {isAdmin && member.role !== 'owner' && (
          <button onClick={() => onRemove(member.id)} className="btn btn-ghost btn-sm text-error">
            Remove
          </button>
        )}
      </td>
    </tr>
  );
}
```

---

## Checklist

### Core
- [ ] Roles defined with clear permission sets
- [ ] Permission checker functions (`can`, `hasPermission`)
- [ ] Feature definitions mapped to plans
- [ ] Roles documented with descriptions

### Server-Side
- [ ] Authorization middleware for API routes
- [ ] RLS policies use role-based helper function
- [ ] Feature gating checks plan on server
- [ ] No client-only security checks

### Client-Side
- [ ] `<Can>` component hides unauthorized UI
- [ ] `<Feature>` component gates plan-locked features
- [ ] `usePermissions()` hook for conditional logic
- [ ] Upgrade prompts for locked features

### Management
- [ ] Role assignment UI for admins
- [ ] Role change audit trail
- [ ] Owner transfer flow
- [ ] Bulk role updates

---

## Related Skills

- **auth-implementation**: User authentication and session management
- **multi-tenancy**: Organization-level tenant isolation
- **security-hardening**: RLS policies and data protection
- **payment-integration**: Plan-based feature access tied to billing
- **saas-operations-admin**: Admin panel for managing roles
