---
name: error-handling-logging
version: 1.0.0
description: When the user wants to implement centralized error handling, structured logging, or alerting. Also use when the user mentions "error handling," "logging," "Sentry," "error tracking," "error boundary," "structured logs," "observability," "alerting," "crash reporting," or "debug." For infrastructure monitoring, see monitoring-observability. For security-specific logging, see security-hardening.
---

# Error Handling & Logging

You are an expert in error management, structured logging, and observability for production SaaS. Your goal is to build a system where errors are caught gracefully, logged with full context, and surfaced proactively — never silently swallowed.

## Initial Assessment

Before implementing, understand:

1. **Current State** - Any error tracking? Console.log everywhere? Error boundaries?
2. **Scale** - How many users? Request volume? Error budget?
3. **Stack** - Next.js? Edge functions? Supabase? Third-party APIs?
4. **Requirements** - Real-time alerts? Compliance logging? Log retention?

---

## Core Principles

### 1. Never Swallow Errors
- Every `catch` block must log or rethrow. Empty catches are bugs.
- Users see friendly messages; developers see full context.

### 2. Structured Over Strings
- Log objects, not concatenated strings. `{ userId, action, error }` not `"User 123 failed to..."`.
- Structured logs are searchable, filterable, and alertable.

### 3. Context is King
- An error without context is useless. Always include: who, what, where, when.
- Request ID, user ID, tenant ID, action, input data (sanitized).

### 4. Graceful Degradation
- Show the user a recovery path, not a blank screen.
- Retry transient failures. Fail fast on permanent ones.
- Error boundaries catch React crashes; try/catch handles async.

---

## Error Classification

```typescript
// lib/errors/types.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true, // Expected error vs bug
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_ERROR', 401, true);
    this.name = 'AuthenticationError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'FORBIDDEN', 403, true);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` (${id})` : ''} not found`, 'NOT_FOUND', 404, true);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('Too many requests', 'RATE_LIMIT', 429, true, { retryAfter });
    this.name = 'RateLimitError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, originalError?: Error) {
    super(`${service} service error`, 'EXTERNAL_ERROR', 502, true, {
      service,
      originalMessage: originalError?.message,
    });
    this.name = 'ExternalServiceError';
  }
}
```

---

## Structured Logger

```typescript
// lib/logger/index.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  tenantId?: string;
  action?: string;
  duration?: number;
  error?: { name: string; message: string; stack?: string; code?: string };
  metadata?: Record<string, unknown>;
}

class Logger {
  private context: Partial<LogEntry> = {};

  withContext(ctx: Partial<LogEntry>): Logger {
    const child = new Logger();
    child.context = { ...this.context, ...ctx };
    return child;
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...this.context,
      metadata: meta,
    };

    // In production: send to log aggregator (Datadog, Axiom, etc.)
    // In development: pretty print to console
    if (process.env.NODE_ENV === 'production') {
      console[level === 'fatal' ? 'error' : level](JSON.stringify(entry));
    } else {
      const icon = { debug: '🔍', info: 'ℹ️', warn: '⚠️', error: '❌', fatal: '💀' }[level];
      console[level === 'fatal' ? 'error' : level](`${icon} [${level.toUpperCase()}] ${message}`, meta || '');
    }
  }

  debug(msg: string, meta?: Record<string, unknown>) { this.log('debug', msg, meta); }
  info(msg: string, meta?: Record<string, unknown>) { this.log('info', msg, meta); }
  warn(msg: string, meta?: Record<string, unknown>) { this.log('warn', msg, meta); }
  error(msg: string, error?: Error, meta?: Record<string, unknown>) {
    this.log('error', msg, {
      ...meta,
      error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
    });
  }
  fatal(msg: string, error?: Error, meta?: Record<string, unknown>) {
    this.log('fatal', msg, {
      ...meta,
      error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
    });
  }
}

export const logger = new Logger();
```

---

## Sentry Integration

```typescript
// lib/sentry/init.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  beforeSend(event, hint) {
    // Don't send operational errors (expected 4xx)
    const error = hint?.originalException;
    if (error instanceof AppError && error.isOperational) {
      return null;
    }
    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
  
  integrations: [
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
});
```

```typescript
// Usage: Capture with context
import * as Sentry from '@sentry/nextjs';

Sentry.setUser({ id: user.id, email: user.email });
Sentry.setTag('tenant', orgSlug);
Sentry.captureException(error, {
  extra: { action: 'createProject', input: sanitizedInput },
});
```

---

## API Error Handler

```typescript
// lib/errors/api-handler.ts
import { NextResponse } from 'next/server';
import { AppError } from './types';
import { logger } from '@/lib/logger';
import * as Sentry from '@sentry/nextjs';

export function handleApiError(error: unknown, context?: Record<string, unknown>): NextResponse {
  // Known operational error
  if (error instanceof AppError && error.isOperational) {
    logger.warn(error.message, { code: error.code, ...error.context, ...context });
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  // Unknown/programming error — this is a bug
  const err = error instanceof Error ? error : new Error(String(error));
  logger.fatal('Unhandled error', err, context);
  Sentry.captureException(err, { extra: context });

  return NextResponse.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Usage in API routes:
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // ... business logic ...
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error, { route: 'POST /api/projects' });
  }
}
```

---

## React Error Boundary

```typescript
// components/error-boundary.tsx
'use client';

import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button onClick={() => this.setState({ hasError: false })} className="btn btn-primary">
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

```typescript
// Next.js error.tsx (app router)
// app/error.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error); }, [error]);

  return (
    <div style={{ padding: '4rem', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
      <h1>Something went wrong</h1>
      <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem' }}>
        We&apos;ve been notified and are looking into it.
      </p>
      <button onClick={reset} className="btn btn-primary">Try Again</button>
    </div>
  );
}
```

---

## Async Error Patterns

```typescript
// lib/errors/safe-action.ts — Safe wrapper for async operations
export async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<[T, null] | [null, Error]> {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(`Safe async failed: ${context || 'unknown'}`, err);
    return [null, err];
  }
}

// Usage:
const [data, error] = await safeAsync(
  () => supabase.from('projects').select('*'),
  'fetch projects'
);
if (error) return handleApiError(error);
```

---

## Toast Notification System (Client Errors)

```typescript
// lib/toast.ts — Lightweight toast for user-facing errors
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast { id: string; type: ToastType; message: string; duration?: number }

let listeners: Array<(toasts: Toast[]) => void> = [];
let toasts: Toast[] = [];

function notify() { listeners.forEach(fn => fn([...toasts])); }

export const toast = {
  success: (msg: string) => addToast('success', msg),
  error: (msg: string) => addToast('error', msg, 6000),
  warning: (msg: string) => addToast('warning', msg),
  info: (msg: string) => addToast('info', msg),
  subscribe: (fn: (t: Toast[]) => void) => { listeners.push(fn); return () => { listeners = listeners.filter(l => l !== fn); }; },
};

function addToast(type: ToastType, message: string, duration = 4000) {
  const id = crypto.randomUUID();
  toasts.push({ id, type, message, duration });
  notify();
  setTimeout(() => { toasts = toasts.filter(t => t.id !== id); notify(); }, duration);
}
```

---

## Checklist

### Error Handling
- [ ] Custom error classes (AppError, ValidationError, etc.)
- [ ] Centralized API error handler
- [ ] React Error Boundaries at layout level
- [ ] Next.js `error.tsx` and `not-found.tsx` pages
- [ ] No empty catch blocks anywhere
- [ ] User-friendly error messages (no stack traces)

### Logging
- [ ] Structured logger with levels (debug, info, warn, error, fatal)
- [ ] Request context (requestId, userId, tenantId) in all logs
- [ ] Sensitive data scrubbed from logs
- [ ] Log JSON in production, pretty print in dev

### Monitoring
- [ ] Sentry (or equivalent) integrated
- [ ] Operational errors filtered (don't alert on 404s)
- [ ] User context attached to error reports
- [ ] Session replay enabled for error debugging
- [ ] Alert thresholds configured (error rate spike)

### Client
- [ ] Toast notification system for user-facing errors
- [ ] Loading/error states on all async operations
- [ ] Retry mechanisms for transient failures
- [ ] Offline detection and graceful messaging

---

## Related Skills

- **monitoring-observability**: Infrastructure-level monitoring and alerting
- **security-hardening**: Security event logging and incident response
- **testing-strategy**: Error path testing and edge case coverage
- **api-design**: API error response patterns and status codes
