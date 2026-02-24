---
name: white-labeling
version: 1.0.0
description: When the user wants to enable white-labeling, custom branding per tenant, or reseller features. Also use when the user mentions "white-label," "custom branding," "reseller," "branded portal," "custom logo," "tenant branding," "custom domain per customer," "brand customization," or "partner branding." For multi-tenant architecture, see multi-tenancy. For design tokens, see professional-ui-ux.
---

# White-Labeling

You are an expert in white-label SaaS architecture. Your goal is to help build a system where each tenant can customize the look, feel, and branding of the application — from logos and colors to custom domains — enabling reseller and enterprise use cases.

## Initial Assessment

Before implementing, understand:

1. **Scope** - Logo + colors only? Full rebrand? Custom domain?
2. **Audience** - enterprises wanting their brand, or resellers?
3. **Current Architecture** - Multi-tenant ready? CSS variables in place?
4. **Plan Gating** - Which plans get white-labeling?

---

## Core Principles

### 1. CSS Variables as the Customization Layer
- All visual properties must flow through CSS custom properties.
- Override at the tenant level, everything cascades automatically.

### 2. Configuration Over Code
- Branding changes must NEVER require code changes or redeployment.
- Store everything in the database, apply at runtime.

### 3. Safe Defaults
- If a tenant hasn't configured branding, show your default brand.
- Validate all inputs (colors, images) to prevent broken UIs.

### 4. Clear Boundaries
- Define what's customizable and what isn't.
- The structure/layout stays consistent; colors, logos, and text change.

---

## Database Schema

```sql
-- Tenant branding configuration
CREATE TABLE organization_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Identity
  company_name TEXT,
  logo_url TEXT,            -- Main logo (navbar)
  logo_dark_url TEXT,       -- Logo for dark backgrounds
  favicon_url TEXT,         -- Custom favicon
  
  -- Colors (HSL values for flexibility)
  primary_color TEXT DEFAULT '220 90% 56%',   -- hsl values without hsl()
  secondary_color TEXT,
  accent_color TEXT,
  
  -- Surfaces
  bg_color TEXT,            -- Background override
  surface_color TEXT,       -- Card/surface override
  
  -- Typography
  font_family TEXT,         -- Google Font name: 'Inter', 'Poppins'
  heading_font_family TEXT, -- Optional different heading font
  
  -- Custom domain
  custom_domain TEXT UNIQUE, -- e.g., app.clientbrand.com
  domain_verified BOOLEAN DEFAULT FALSE,
  
  -- Email branding
  email_from_name TEXT,     -- "ClientBrand Team"
  email_logo_url TEXT,
  email_footer_text TEXT,
  
  -- Login page
  login_bg_image_url TEXT,
  login_tagline TEXT,
  
  -- Advanced
  custom_css TEXT,          -- Enterprise only: custom CSS snippet
  hide_powered_by BOOLEAN DEFAULT FALSE, -- Hide "Powered by YourSaaS"
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organization_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_branding FORCE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage branding" ON organization_branding
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );
```

---

## Dynamic Theme Application

```typescript
// lib/branding/apply-theme.ts
interface BrandingConfig {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  bgColor?: string;
  surfaceColor?: string;
  fontFamily?: string;
  headingFontFamily?: string;
  logoUrl?: string;
  customCss?: string;
}

export function applyBranding(config: BrandingConfig) {
  const root = document.documentElement;

  if (config.primaryColor) {
    root.style.setProperty('--primary-500', `hsl(${config.primaryColor})`);
    // Auto-generate shades
    const [h, s] = config.primaryColor.split(' ');
    root.style.setProperty('--primary-50', `hsl(${h} ${s} 95%)`);
    root.style.setProperty('--primary-100', `hsl(${h} ${s} 90%)`);
    root.style.setProperty('--primary-200', `hsl(${h} ${s} 80%)`);
    root.style.setProperty('--primary-300', `hsl(${h} ${s} 70%)`);
    root.style.setProperty('--primary-400', `hsl(${h} ${s} 63%)`);
    root.style.setProperty('--primary-600', `hsl(${h} ${s} 48%)`);
    root.style.setProperty('--primary-700', `hsl(${h} ${s} 40%)`);
    root.style.setProperty('--primary-800', `hsl(${h} ${s} 30%)`);
    root.style.setProperty('--primary-900', `hsl(${h} ${s} 20%)`);
  }

  if (config.bgColor) root.style.setProperty('--bg-primary', `hsl(${config.bgColor})`);
  if (config.surfaceColor) root.style.setProperty('--surface-0', `hsl(${config.surfaceColor})`);

  // Load custom font
  if (config.fontFamily) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${config.fontFamily.replace(' ', '+')}:wght@400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    root.style.setProperty('--font-body', `'${config.fontFamily}', system-ui, sans-serif`);
  }

  if (config.headingFontFamily) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${config.headingFontFamily.replace(' ', '+')}:wght@600;700;800&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    root.style.setProperty('--font-heading', `'${config.headingFontFamily}', system-ui, sans-serif`);
  }

  // Inject custom CSS (enterprise only, sanitized)
  if (config.customCss) {
    let style = document.getElementById('custom-brand-css');
    if (!style) {
      style = document.createElement('style');
      style.id = 'custom-brand-css';
      document.head.appendChild(style);
    }
    style.textContent = config.customCss;
  }
}
```

### Server-Side Theme (for SSR/SEO)

```typescript
// app/app/[orgSlug]/layout.tsx
import { getBranding } from '@/lib/branding/get';

export async function generateMetadata({ params }: { params: { orgSlug: string } }) {
  const branding = await getBranding(params.orgSlug);
  return {
    title: branding?.company_name || 'MyApp',
    icons: branding?.favicon_url ? [{ rel: 'icon', url: branding.favicon_url }] : undefined,
  };
}

export default async function OrgLayout({ children, params }: { children: React.ReactNode; params: { orgSlug: string } }) {
  const branding = await getBranding(params.orgSlug);

  // Generate CSS variables for SSR
  const cssVars = branding?.primaryColor
    ? `--primary-500: hsl(${branding.primaryColor});`
    : '';

  return (
    <div style={{ cssText: cssVars } as any}>
      {children}
    </div>
  );
}
```

---

## Custom Domain Setup

```typescript
// middleware.ts — Route custom domains to the right org
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  // Skip for main domain
  if (hostname === 'myapp.com' || hostname === 'www.myapp.com') {
    return NextResponse.next();
  }

  // Check if this is a custom domain
  const { data: branding } = await supabase
    .from('organization_branding')
    .select('organization_id, organizations(slug)')
    .eq('custom_domain', hostname)
    .eq('domain_verified', true)
    .single();

  if (branding) {
    // Rewrite to the org's path
    const orgSlug = (branding.organizations as any).slug;
    const url = request.nextUrl.clone();
    url.pathname = `/app/${orgSlug}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
```

### DNS Verification

```typescript
// app/api/branding/verify-domain/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { domain, orgId } = await request.json();

  // Verify CNAME points to our service
  try {
    const dns = await fetch(`https://dns.google/resolve?name=${domain}&type=CNAME`);
    const result = await dns.json();
    const cname = result?.Answer?.[0]?.data;

    if (cname?.includes('cname.vercel-dns.com')) {
      await supabase.from('organization_branding')
        .update({ domain_verified: true })
        .eq('organization_id', orgId);
      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({
      verified: false,
      instruction: `Add a CNAME record: ${domain} → cname.vercel-dns.com`,
    });
  } catch {
    return NextResponse.json({ verified: false, error: 'DNS lookup failed' });
  }
}
```

---

## Branding Settings UI

```typescript
// components/settings/branding-form.tsx
'use client';

export function BrandingForm({ branding }: { branding: any }) {
  return (
    <form className="branding-form">
      <section>
        <h3>Identity</h3>
        <div className="form-group">
          <label htmlFor="company_name">Company Name</label>
          <input id="company_name" defaultValue={branding?.company_name} />
        </div>
        <div className="form-group">
          <label>Logo</label>
          {/* File upload component */}
          <p className="hint">Recommended: SVG or PNG, 200×50px</p>
        </div>
      </section>

      <section>
        <h3>Colors</h3>
        <div className="color-grid">
          <div className="form-group">
            <label htmlFor="primary_color">Primary Color</label>
            <input type="color" id="primary_color" />
            <p className="hint">Buttons, links, and accents</p>
          </div>
        </div>
        {/* Live preview */}
        <div className="brand-preview">
          <h4>Preview</h4>
          <button className="btn btn-primary">Sample Button</button>
          <a href="#">Sample Link</a>
        </div>
      </section>

      <section>
        <h3>Custom Domain</h3>
        <input placeholder="app.yourbrand.com" defaultValue={branding?.custom_domain} />
        <p className="hint">CNAME your domain to cname.vercel-dns.com</p>
        <button type="button" className="btn btn-ghost">Verify Domain</button>
      </section>

      <button type="submit" className="btn btn-primary">Save Branding</button>
    </form>
  );
}
```

---

## Checklist

- [ ] CSS variables system in place for all visual properties
- [ ] Branding configuration stored in database
- [ ] Tenant branding applied on page load (client + SSR)
- [ ] Logo, favicon, and color customization working
- [ ] Custom font loading from Google Fonts
- [ ] Custom domain routing via middleware
- [ ] DNS verification flow
- [ ] Branding settings UI with live preview
- [ ] Email templates use tenant branding
- [ ] "Powered by" badge configurable (hide on enterprise plans)
- [ ] Branding changes don't require redeploy

---

## Related Skills

- **multi-tenancy**: Tenant isolation and organization structure
- **professional-ui-ux**: Design token system (CSS variables)
- **deployment-strategy**: Custom domain DNS configuration
- **rbac-permissions**: Plan-gating white-label features
