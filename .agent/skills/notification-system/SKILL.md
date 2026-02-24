---
name: notification-system
version: 1.0.0
description: When the user wants to implement notifications (in-app, push, email digests). Also use when the user mentions "notifications," "notification center," "push notifications," "in-app notifications," "bell icon," "notification preferences," "real-time alerts," "activity feed," or "notification digest." For transactional emails, see email-transactional. For real-time features, see realtime-features.
---

# Notification System

You are an expert in notification systems for SaaS applications. Your goal is to build a multi-channel notification system that keeps users informed without overwhelming them — supporting in-app, push, and email channels with user-controlled preferences.

## Initial Assessment

Before implementing notifications, understand:

1. **Notification Types** - What events trigger notifications? (comments, assignments, billing, system)
2. **Channels** - In-app only? Push? Email? SMS?
3. **Volume** - How many notifications per user per day?
4. **Multi-tenant** - Are notifications scoped to organizations?

---

## Core Principles

### 1. Respect the User
- Every notification should be actionable and relevant.
- Users must control what they receive and through which channel.
- Batch low-priority notifications into digests.

### 2. Multi-Channel by Design
- Design the system for multiple channels from day one, even if you start with one.
- Same event → different delivery based on user preference and urgency.

### 3. Real-Time + Persistent
- Show notifications in real-time (via WebSocket/Supabase Realtime).
- Persist all notifications so users can review them later.

### 4. Smart Defaults
- Enable important notifications by default, disable noisy ones.
- Don't ask users to configure 50 toggles — use sensible categories.

---

## Database Schema

```sql
-- Notification types/templates
CREATE TABLE notification_types (
  id TEXT PRIMARY KEY, -- e.g., 'comment.new', 'project.assigned', 'billing.failed'
  category TEXT NOT NULL, -- 'activity', 'mentions', 'billing', 'system', 'marketing'
  title_template TEXT NOT NULL, -- '{actor} commented on {target}'
  body_template TEXT,
  default_channels TEXT[] DEFAULT '{in_app}', -- Default delivery channels
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User notification preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type_id TEXT REFERENCES notification_types(id),
  
  -- Per-channel toggle (null = use default)
  in_app BOOLEAN,
  email BOOLEAN,
  push BOOLEAN,
  
  -- Global settings (when notification_type_id is null)
  email_digest TEXT DEFAULT 'instant' CHECK (email_digest IN ('instant', 'hourly', 'daily', 'weekly', 'none')),
  quiet_hours_start TIME, -- e.g., '22:00'
  quiet_hours_end TIME,   -- e.g., '08:00'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, notification_type_id)
);

-- Notifications (the actual messages)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  
  -- Type & Content
  type_id TEXT NOT NULL REFERENCES notification_types(id),
  title TEXT NOT NULL,
  body TEXT,
  
  -- Actor (who triggered this)
  actor_id UUID REFERENCES auth.users(id),
  actor_name TEXT,
  actor_avatar TEXT,
  
  -- Target (what this is about)
  target_type TEXT, -- 'project', 'comment', 'invoice'
  target_id TEXT,
  target_url TEXT, -- Deep link to the relevant page
  
  -- Status
  read_at TIMESTAMPTZ,
  seen_at TIMESTAMPTZ, -- Saw in feed but didn't click
  archived_at TIMESTAMPTZ,
  
  -- Delivery tracking
  channels_sent TEXT[] DEFAULT '{}', -- Which channels were used
  
  -- Metadata
  data JSONB DEFAULT '{}', -- Extra data for rendering
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Grouping (for batching similar notifications)
  group_key TEXT -- e.g., 'project:123:comments' to batch
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_org ON notifications(organization_id);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users manage own preferences" ON notification_preferences
  FOR ALL USING (user_id = auth.uid());
```

---

## Notification Service

```typescript
// lib/notifications/service.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Server-only
);

interface SendNotificationParams {
  userId: string;
  typeId: string;
  title: string;
  body?: string;
  actorId?: string;
  actorName?: string;
  targetType?: string;
  targetId?: string;
  targetUrl?: string;
  organizationId?: string;
  data?: Record<string, unknown>;
  groupKey?: string;
}

export async function sendNotification(params: SendNotificationParams) {
  // 1. Check user preferences
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', params.userId)
    .eq('notification_type_id', params.typeId)
    .single();

  const { data: typeDefaults } = await supabase
    .from('notification_types')
    .select('default_channels, priority')
    .eq('id', params.typeId)
    .single();

  // Determine channels based on prefs + defaults
  const channels: string[] = [];
  const defaults = typeDefaults?.default_channels || ['in_app'];

  if (prefs?.in_app !== false && defaults.includes('in_app')) channels.push('in_app');
  if (prefs?.email === true || (!prefs && defaults.includes('email'))) channels.push('email');
  if (prefs?.push === true || (!prefs && defaults.includes('push'))) channels.push('push');

  if (channels.length === 0) return; // User opted out of everything

  // 2. Create notification record
  const { data: notification } = await supabase
    .from('notifications')
    .insert({
      user_id: params.userId,
      type_id: params.typeId,
      title: params.title,
      body: params.body,
      actor_id: params.actorId,
      actor_name: params.actorName,
      target_type: params.targetType,
      target_id: params.targetId,
      target_url: params.targetUrl,
      organization_id: params.organizationId,
      data: params.data,
      group_key: params.groupKey,
      channels_sent: channels,
    })
    .select()
    .single();

  // 3. Dispatch to channels
  if (channels.includes('email')) {
    // Queue email (see email-transactional skill)
    // await sendNotificationEmail(params.userId, notification);
  }

  if (channels.includes('push')) {
    // Send push notification (Web Push API)
    // await sendPushNotification(params.userId, notification);
  }

  // in_app is handled automatically via Supabase Realtime
  return notification;
}

// Bulk notify (e.g., all org members)
export async function notifyOrgMembers(orgId: string, excludeUserId: string, params: Omit<SendNotificationParams, 'userId'>) {
  const { data: members } = await supabase
    .from('organization_members')
    .select('user_id')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .neq('user_id', excludeUserId);

  if (!members) return;

  await Promise.all(
    members.map(m => sendNotification({ ...params, userId: m.user_id }))
  );
}
```

---

## Notification Bell Component

```typescript
// components/notifications/notification-bell.tsx
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Fetch initial unread count
    async function fetchNotifications() {
      const { data, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .is('read_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      setNotifications(data || []);
      setUnreadCount(count || 0);
    }

    fetchNotifications();

    // Subscribe to new notifications in real-time
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
      }, (payload) => {
        setNotifications(prev => [payload.new, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  async function markAsRead(id: string) {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    setUnreadCount(0);
  }

  return (
    <div className="notification-bell">
      <button onClick={() => setOpen(!open)} className="bell-trigger" aria-label="Notifications">
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="btn btn-ghost btn-sm">Mark all read</button>
            )}
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <p>🔔 You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  className={`notification-item ${!n.read_at ? 'unread' : ''}`}
                  onClick={() => { markAsRead(n.id); if (n.target_url) window.location.href = n.target_url; }}
                >
                  <div className="notification-avatar">{n.actor_name?.[0] || '🔔'}</div>
                  <div className="notification-content">
                    <p className="notification-title">{n.title}</p>
                    {n.body && <p className="notification-body">{n.body}</p>}
                    <time className="notification-time">{timeAgo(n.created_at)}</time>
                  </div>
                  {!n.read_at && <span className="unread-dot" />}
                </button>
              ))
            )}
          </div>
          <a href="/notifications" className="panel-footer">View all notifications</a>
        </div>
      )}
    </div>
  );
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
```

---

## Notification Preferences UI

```typescript
// components/notifications/preferences.tsx
'use client';

const CATEGORIES = [
  { id: 'activity', label: 'Activity', desc: 'Comments, mentions, assignments' },
  { id: 'billing', label: 'Billing', desc: 'Invoices, payment failures, plan changes' },
  { id: 'system', label: 'System', desc: 'Maintenance, security alerts, updates' },
  { id: 'marketing', label: 'Product Updates', desc: 'New features, tips, newsletters' },
];

export function NotificationPreferences() {
  // Render a grid: Category × Channel (In-App, Email, Push)
  // with toggles for each combination
  return (
    <div className="preferences-grid">
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>In-App</th>
            <th>Email</th>
            <th>Push</th>
          </tr>
        </thead>
        <tbody>
          {CATEGORIES.map(cat => (
            <tr key={cat.id}>
              <td>
                <strong>{cat.label}</strong>
                <span className="text-secondary">{cat.desc}</span>
              </td>
              <td><input type="checkbox" defaultChecked /></td>
              <td><input type="checkbox" defaultChecked={cat.id !== 'marketing'} /></td>
              <td><input type="checkbox" defaultChecked={cat.id === 'billing'} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Checklist

### Database
- [ ] `notification_types` table seeded with event types
- [ ] `notifications` table with RLS
- [ ] `notification_preferences` table with per-user/per-type settings
- [ ] Indexes on `user_id`, `read_at`, `created_at`

### Backend
- [ ] `sendNotification()` service checks preferences before sending
- [ ] Multi-channel dispatch (in-app, email, push)
- [ ] Bulk notification for org-wide events
- [ ] Notification grouping/batching for noisy events

### Frontend
- [ ] Notification bell with unread count badge
- [ ] Real-time updates via Supabase Realtime
- [ ] Mark as read (single and all)
- [ ] Notification panel with deep links to targets
- [ ] Notification preferences page

### UX
- [ ] Smart defaults (important on, noisy off)
- [ ] Quiet hours support
- [ ] Email digest option (instant, daily, weekly)
- [ ] Empty state for zero notifications

---

## Related Skills

- **email-transactional**: For email notification delivery
- **realtime-features**: For WebSocket/Supabase Realtime setup
- **multi-tenancy**: For org-scoped notifications
- **rbac-permissions**: For permission-based notification routing
