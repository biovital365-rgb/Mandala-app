---
name: queue-background-jobs
version: 1.0.0
description: When the user wants to implement background processing, async tasks, or job queues. Also use when the user mentions "background jobs," "queue," "async tasks," "worker," "job processing," "cron jobs," "scheduled tasks," "email queue," "report generation," "retry logic," or "task scheduling." For real-time features, see realtime-features. For monitoring, see monitoring-observability.
---

# Queue & Background Jobs

You are an expert in asynchronous processing and job queue systems. Your goal is to help build reliable background job infrastructure for tasks that shouldn't block the user — email sending, report generation, webhook delivery, data processing, and scheduled maintenance.

## Initial Assessment

Before implementing, understand:

1. **Use Cases** - What tasks need to run in the background?
2. **Volume** - How many jobs per hour/day?
3. **Reliability** - Can jobs be lost or must they be guaranteed?
4. **Infrastructure** - Serverless (Vercel) or server-based? Budget for Redis/queues?

---

## Core Principles

### 1. Respond Fast, Process Later
- User-facing requests should return in <200ms.
- Anything that takes >1s belongs in a background job.
- Show immediate feedback, process asynchronously.

### 2. At-Least-Once Delivery
- Jobs should be processed at least once. Design handlers to be idempotent.
- Use unique job IDs to prevent duplicate processing.

### 3. Retry with Backoff
- Transient failures are normal. Retry with exponential backoff.
- After max retries, move to dead letter queue for manual review.

### 4. Observability
- Log every job: queued, started, completed, failed.
- Track processing time, success rate, queue depth.

---

## Architecture Options

### Option A: Serverless Queues (Recommended for Vercel)

**Inngest** — Event-driven, serverless-native:

```typescript
// lib/inngest/client.ts
import { Inngest } from 'inngest';

export const inngest = new Inngest({ id: 'my-saas-app' });
```

```typescript
// lib/inngest/functions.ts
import { inngest } from './client';

// Define a background function
export const sendWelcomeEmail = inngest.createFunction(
  {
    id: 'send-welcome-email',
    retries: 3,
  },
  { event: 'user/signed.up' },
  async ({ event, step }) => {
    const { userId, email, name } = event.data;

    // Step 1: Get user details
    const user = await step.run('get-user', async () => {
      return await supabase.from('profiles').select('*').eq('id', userId).single();
    });

    // Step 2: Send email (auto-retried on failure)
    await step.run('send-email', async () => {
      await resend.emails.send({
        from: 'welcome@myapp.com',
        to: email,
        subject: `Welcome to MyApp, ${name}!`,
        html: getWelcomeTemplate(user.data),
      });
    });

    // Step 3: Update profile
    await step.run('mark-welcome-sent', async () => {
      await supabase.from('profiles')
        .update({ welcome_email_sent: true })
        .eq('id', userId);
    });
  }
);

// Scheduled/cron job
export const dailyDigest = inngest.createFunction(
  { id: 'daily-digest' },
  { cron: '0 9 * * *' }, // Every day at 9 AM
  async ({ step }) => {
    const users = await step.run('get-users', async () => {
      return await supabase.from('profiles')
        .select('id, email')
        .eq('digest_enabled', true);
    });

    // Fan out: send digest to each user
    for (const user of users.data || []) {
      await step.run(`digest-${user.id}`, async () => {
        const activity = await getActivity(user.id, '24h');
        if (activity.length > 0) {
          await sendDigestEmail(user.email, activity);
        }
      });
    }
  }
);

// Report generation (long-running)
export const generateReport = inngest.createFunction(
  {
    id: 'generate-report',
    retries: 2,
    concurrency: { limit: 5 }, // Max 5 concurrent reports
  },
  { event: 'report/requested' },
  async ({ event, step }) => {
    const { reportId, orgId, type } = event.data;

    // Update status
    await step.run('mark-processing', async () => {
      await supabase.from('reports')
        .update({ status: 'processing' })
        .eq('id', reportId);
    });

    // Generate (may take minutes)
    const result = await step.run('generate', async () => {
      return await generateReportData(orgId, type);
    });

    // Upload to storage
    const fileUrl = await step.run('upload', async () => {
      return await uploadToStorage(result, `reports/${reportId}.pdf`);
    });

    // Mark complete
    await step.run('mark-complete', async () => {
      await supabase.from('reports')
        .update({ status: 'completed', file_url: fileUrl })
        .eq('id', reportId);
    });
  }
);
```

```typescript
// app/api/inngest/route.ts — Inngest endpoint
import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest/client';
import { sendWelcomeEmail, dailyDigest, generateReport } from '@/lib/inngest/functions';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendWelcomeEmail, dailyDigest, generateReport],
});
```

### Option B: Upstash QStash (HTTP-based)

```typescript
// lib/queue/qstash.ts
import { Client } from '@upstash/qstash';

const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

// Enqueue a job
export async function enqueueJob(endpoint: string, body: any, options?: {
  delay?: string; // "30s", "5m", "1h"
  retries?: number;
  callback?: string;
}) {
  return await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/${endpoint}`,
    body,
    retries: options?.retries ?? 3,
    delay: options?.delay,
    callback: options?.callback,
  });
}

// Usage:
// await enqueueJob('send-email', { to: 'user@example.com', template: 'welcome' });
// await enqueueJob('generate-report', { orgId, type: 'monthly' }, { delay: '5m' });
```

```typescript
// app/api/jobs/send-email/route.ts — Job handler
import { verifySignatureAppRouter } from '@upstash/qstash/nextjs';

async function handler(request: Request) {
  const body = await request.json();
  // Process the job...
  await sendEmail(body.to, body.template);
  return new Response('OK');
}

// Verify QStash signature to prevent unauthorized calls
export const POST = verifySignatureAppRouter(handler);
```

### Option C: Database-Backed Queue (Simple, No Extra Service)

```sql
CREATE TABLE job_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'send_email', 'generate_report'
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_pending ON job_queue(scheduled_at) WHERE status = 'pending';
```

```typescript
// lib/queue/db-queue.ts
export async function enqueue(type: string, payload: any, delay?: number) {
  const scheduledAt = delay 
    ? new Date(Date.now() + delay * 1000).toISOString()
    : new Date().toISOString();

  return supabase.from('job_queue').insert({
    type,
    payload,
    scheduled_at: scheduledAt,
  });
}

// Process jobs (called by cron or Vercel cron)
export async function processJobs(batchSize: number = 10) {
  // Claim jobs atomically
  const { data: jobs } = await supabase.rpc('claim_jobs', {
    batch_size: batchSize,
  });

  for (const job of jobs || []) {
    try {
      await processJob(job);
      await supabase.from('job_queue')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', job.id);
    } catch (error) {
      const attempts = job.attempts + 1;
      await supabase.from('job_queue')
        .update({
          status: attempts >= job.max_attempts ? 'dead' : 'pending',
          attempts,
          error: (error as Error).message,
          scheduled_at: new Date(Date.now() + Math.pow(2, attempts) * 1000).toISOString(),
        })
        .eq('id', job.id);
    }
  }
}
```

---

## Triggering Jobs

```typescript
// Trigger from API routes
export async function POST(request: Request) {
  const body = await request.json();
  const project = await createProject(body);

  // Fire and forget — don't await
  inngest.send({ name: 'project/created', data: { projectId: project.id, orgId: body.orgId } });

  return NextResponse.json(project); // Respond immediately
}
```

---

## Common Job Types for SaaS

| Job Type | Trigger | Priority | Typical Duration |
|----------|---------|----------|-----------------|
| Welcome email | User signup | High | <5s |
| Invoice generation | Subscription created | High | <10s |
| Report generation | User request | Medium | 10s-5min |
| Data export (CSV) | User request | Medium | 10s-10min |
| Webhook delivery | Event | High | <5s |
| Daily digest email | Cron (9 AM) | Low | 1-30min |
| Cleanup expired data | Cron (midnight) | Low | 1-10min |
| Analytics aggregation | Cron (hourly) | Low | 1-5min |
| Thumbnail generation | Image upload | Medium | 5-30s |

---

## Checklist

- [ ] Background job infrastructure chosen (Inngest/QStash/DB queue)
- [ ] Job handlers are idempotent (safe to retry)
- [ ] Retry with exponential backoff configured
- [ ] Dead letter queue for failed jobs
- [ ] Job status tracking (pending → processing → completed/failed)
- [ ] Concurrency limits to prevent overload
- [ ] Cron jobs for scheduled tasks
- [ ] Monitoring: queue depth, processing time, error rate
- [ ] Graceful shutdown handling

---

## Related Skills

- **email-transactional**: Email sending patterns
- **notification-system**: Notification dispatch as async jobs
- **monitoring-observability**: Job monitoring and alerting
- **performance-optimization**: Moving slow work to background
