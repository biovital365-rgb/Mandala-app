---
name: marketplace-ecosystem
version: 1.0.0
description: When the user wants to build integrations, plugins, an app store, or partner ecosystem around their SaaS. Also use when the user mentions "marketplace," "app store," "integrations," "plugins," "third-party apps," "partner API," "Zapier," "embeddable widgets," "OAuth for partners," or "ecosystem." For internal API design, see api-design. For API monetization, see api-monetization.
---

# Marketplace & Ecosystem

You are an expert in platform ecosystem design for SaaS products. Your goal is to help build a marketplace and integration framework that transforms a standalone product into a platform — enabling third-party developers, partners, and native integrations to extend the product's capabilities.

## Initial Assessment

Before implementing, understand:

1. **Ecosystem Stage** - Starting with native integrations or building for external devs?
2. **Integration Types** - Pre-built connectors, Zapier, custom plugins, embedded apps?
3. **Business Model** - Free integrations, revenue share, or developer fees?
4. **Technical Scope** - Simple webhooks, full plugin API, or embedded iframe apps?

---

## Core Principles

### 1. Start with Integrations, Not a Marketplace
- Build 5-10 native integrations first. Learn the patterns.
- Only build a full marketplace when there's developer demand.

### 2. Good APIs Make Good Ecosystems
- Your public API IS your platform. Make it excellent first.
- Every integration you build should use the same API that partners use.
- If you need a special internal API, that's a sign your public API is incomplete.

### 3. Security & Sandboxing
- Third-party code is untrusted. Isolate and limit access.
- OAuth scopes for partner apps. Rate limits per integration.
- Users must explicitly approve what each integration can access.

### 4. Make Developers Successful
- Great docs, SDKs, sandbox environments, and responsive support.
- If developers can't build in a weekend, your platform is too complex.

---

## Integration Tiers

### Tier 1: Native Integrations (Built by You)

```typescript
// lib/integrations/registry.ts
export interface IntegrationDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'communication' | 'storage' | 'analytics' | 'crm' | 'automation' | 'payment';
  requiredScopes: string[];
  configFields: ConfigField[];
  setupGuideUrl: string;
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'toggle';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

export const NATIVE_INTEGRATIONS: IntegrationDefinition[] = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Get notifications in your Slack channels',
    icon: '/integrations/slack.svg',
    category: 'communication',
    requiredScopes: ['notifications:read'],
    configFields: [
      { key: 'webhook_url', label: 'Webhook URL', type: 'text', required: true, placeholder: 'https://hooks.slack.com/...' },
      { key: 'channel', label: 'Channel', type: 'text', required: true, placeholder: '#general' },
    ],
    setupGuideUrl: '/docs/integrations/slack',
  },
  {
    id: 'google-drive',
    name: 'Google Drive',
    description: 'Sync files and documents with Google Drive',
    icon: '/integrations/google-drive.svg',
    category: 'storage',
    requiredScopes: ['files:read', 'files:write'],
    configFields: [
      { key: 'folder_id', label: 'Folder ID', type: 'text', required: false, placeholder: 'Leave empty for root' },
    ],
    setupGuideUrl: '/docs/integrations/google-drive',
  },
];
```

### Tier 2: Zapier / Make.com (No-Code)

```typescript
// Zapier integration via triggers and actions
// This lives in your Zapier developer account, not your codebase

// 1. Define Triggers (Zapier polls your API or you push via webhooks)
// Example: "New Project Created" trigger
// Zapier polls: GET /api/v1/projects?created_after={last_poll_time}

// 2. Define Actions (Zapier calls your API)
// Example: "Create Task" action
// Zapier calls: POST /api/v1/tasks with body from user's Zap

// In your app, provide Zapier-friendly endpoints:
// app/api/v1/zapier/triggers/new-project/route.ts
export async function GET(request: Request) {
  const apiContext = await authenticateApiKey(request);
  const since = new URL(request.url).searchParams.get('since');
  
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', apiContext.organizationId)
    .gt('created_at', since || new Date(0).toISOString())
    .order('created_at', { ascending: false })
    .limit(20);
  
  return NextResponse.json(data); // Zapier expects an array
}
```

### Tier 3: Partner/Third-Party Apps (Full Platform)

```sql
-- Marketplace apps (third-party)
CREATE TABLE marketplace_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- App details
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  icon_url TEXT,
  screenshots TEXT[],
  category TEXT NOT NULL,
  
  -- Technical
  redirect_uri TEXT NOT NULL, -- OAuth redirect
  scopes TEXT[] NOT NULL, -- Requested permissions
  webhook_url TEXT, -- Where to send events
  
  -- Marketplace
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'suspended')),
  pricing_model TEXT DEFAULT 'free' CHECK (pricing_model IN ('free', 'one_time', 'monthly')),
  price_cents INTEGER DEFAULT 0,
  install_count INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- App installations per organization
CREATE TABLE app_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  app_id UUID NOT NULL REFERENCES marketplace_apps(id),
  
  installed_by UUID REFERENCES auth.users(id),
  granted_scopes TEXT[] NOT NULL,
  config JSONB DEFAULT '{}',
  
  -- OAuth tokens
  access_token_hash TEXT, -- Encrypted
  refresh_token_hash TEXT,
  token_expires_at TIMESTAMPTZ,
  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'uninstalled')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, app_id)
);
```

---

## OAuth for Partner Apps

```typescript
// app/api/oauth/authorize/route.ts
// OAuth 2.0 Authorization Code flow for marketplace apps

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientId = searchParams.get('client_id');     // App ID
  const redirectUri = searchParams.get('redirect_uri');
  const scopes = searchParams.get('scope')?.split(' ') || [];
  const state = searchParams.get('state');

  // Validate app exists
  const { data: app } = await supabase
    .from('marketplace_apps')
    .select('name, icon_url, scopes')
    .eq('id', clientId)
    .eq('status', 'published')
    .single();

  if (!app) return NextResponse.json({ error: 'Invalid app' }, { status: 400 });

  // Show authorization page to user
  // (In practice, redirect to a consent page component)
  // The consent page shows: "App X wants access to: [scopes]"
  // User clicks "Authorize" → generates auth code → redirects back
}

// app/api/oauth/token/route.ts
// Exchange auth code for access token
export async function POST(request: Request) {
  const body = await request.json();
  const { code, client_id, client_secret, redirect_uri } = body;

  // Validate auth code, generate access + refresh tokens
  // Store hashed tokens in app_installations
  // Return tokens to the partner app

  return NextResponse.json({
    access_token: '...',
    refresh_token: '...',
    token_type: 'Bearer',
    expires_in: 3600,
    scope: 'projects:read projects:write',
  });
}
```

---

## Integration UI (App Store Page)

```typescript
// components/integrations/app-card.tsx
interface AppCardProps {
  app: {
    id: string;
    name: string;
    shortDescription: string;
    iconUrl: string;
    category: string;
    installCount: number;
    rating: number;
    pricingModel: string;
    installed: boolean;
  };
  onInstall: (appId: string) => void;
}

export function AppCard({ app, onInstall }: AppCardProps) {
  return (
    <div className="app-card card">
      <div className="app-card-header">
        <img src={app.iconUrl} alt={app.name} className="app-icon" />
        <div>
          <h3>{app.name}</h3>
          <span className="app-category">{app.category}</span>
        </div>
      </div>
      <p className="app-description">{app.shortDescription}</p>
      <div className="app-card-footer">
        <div className="app-stats">
          <span>⭐ {app.rating}</span>
          <span>📥 {app.installCount.toLocaleString()}</span>
        </div>
        <button
          onClick={() => onInstall(app.id)}
          className={`btn ${app.installed ? 'btn-ghost' : 'btn-primary'} btn-sm`}
          disabled={app.installed}
        >
          {app.installed ? '✓ Installed' : app.pricingModel === 'free' ? 'Install Free' : `Install · $${app.priceCents / 100}/mo`}
        </button>
      </div>
    </div>
  );
}
```

---

## Event System for Integrations

```typescript
// lib/integrations/events.ts
// When something happens in your app, dispatch to installed integrations

export async function dispatchIntegrationEvent(
  orgId: string,
  event: string,
  payload: Record<string, any>
) {
  // Get all active installations that listen to this event
  const { data: installations } = await supabase
    .from('app_installations')
    .select('*, marketplace_apps(webhook_url)')
    .eq('organization_id', orgId)
    .eq('status', 'active');

  for (const install of installations || []) {
    const webhookUrl = (install.marketplace_apps as any)?.webhook_url;
    if (!webhookUrl) continue;

    // Send event via background job (see queue-background-jobs)
    await enqueueJob('deliver-webhook', {
      url: webhookUrl,
      event,
      payload: {
        ...payload,
        organization_id: orgId,
        timestamp: new Date().toISOString(),
      },
      installationId: install.id,
    });
  }
}

// Usage in your app:
// After creating a project:
await dispatchIntegrationEvent(orgId, 'project.created', { project });
```

---

## Marketplace Growth Strategy

| Phase | Focus | Actions |
|-------|-------|---------|
| **Phase 1** | Native integrations | Build top 5-10 integrations in-house |
| **Phase 2** | Zapier/Make | Enable no-code automation |
| **Phase 3** | Public API | Launch developer portal and docs |
| **Phase 4** | Partner program | Invite strategic partners to build |
| **Phase 5** | Open marketplace | Accept submissions, revenue share |

---

## Checklist

- [ ] Native integrations built for top 5 tools
- [ ] Integration registry with config management
- [ ] Installation/uninstallation flow
- [ ] Zapier-compatible API endpoints
- [ ] OAuth 2.0 flow for partner apps
- [ ] Webhook event dispatch system
- [ ] App marketplace UI (browse, search, install)
- [ ] Developer portal with docs and sandbox
- [ ] App review process for marketplace submissions
- [ ] Usage analytics per integration

---

## Related Skills

- **api-design**: Public API patterns and documentation
- **api-monetization**: Monetizing API access and partner apps
- **security-hardening**: OAuth security, scope validation
- **queue-background-jobs**: Async webhook delivery
- **notification-system**: Integration event notifications
