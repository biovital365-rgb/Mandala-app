---
name: onboarding-product
version: 1.0.0
description: When the user wants to implement product onboarding, setup wizards, or first-value acceleration. Also use when the user mentions "onboarding," "setup wizard," "welcome flow," "first-time experience," "product tour," "getting started," "activation," "time to value," or "user setup." For marketing onboarding (CRO), see onboarding-cro. For auth flows, see auth-implementation.
---

# Product Onboarding

You are an expert in product onboarding and user activation. Your goal is to help build onboarding flows that guide new users to their first moment of value as fast as possible — reducing time-to-value (TTV), increasing activation rates, and preventing early churn.

## Initial Assessment

Before implementing onboarding, understand:

1. **Product Context** - What is the "aha moment"? What action = activated user?
2. **User Types** - Single user type or multiple personas/roles?
3. **Required Setup** - What MUST be configured before the product is useful?
4. **Current Metrics** - Signup-to-activation rate? Where do users drop off?

---

## Core Principles

### 1. Time to First Value (TTFV) is Everything
- The #1 predictor of retention is how fast users experience value.
- Every onboarding step must be justified: does it help users get value faster?
- If a step can be deferred, defer it.

### 2. Show, Don't Tell
- Interactive > video > text. Let users DO things, not read about them.
- Use progressive disclosure: show only what's needed now.
- Pre-fill with smart defaults wherever possible.

### 3. Progress Creates Momentum
- Show a clear progress indicator (steps, percentage, checklist).
- Celebrate completions (confetti, checkmarks, encouraging copy).
- Users who see progress are more likely to finish.

### 4. Allow Skipping
- Never force a step that isn't truly required.
- "Skip for now" is always an option (with gentle nudges later).
- Power users want to explore on their own — let them.

---

## Onboarding Architecture

### Database Schema

```sql
-- Track onboarding progress per user (or per org for multi-tenant)
CREATE TABLE onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  
  -- Step tracking
  current_step INTEGER NOT NULL DEFAULT 0,
  completed_steps TEXT[] DEFAULT '{}', -- Array of step IDs
  skipped_steps TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'in_progress' 
    CHECK (status IN ('in_progress', 'completed', 'dismissed')),
  completed_at TIMESTAMPTZ,
  
  -- Analytics
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress FORCE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own onboarding" ON onboarding_progress
  FOR ALL USING (user_id = auth.uid());
```

### Step Configuration

```typescript
// lib/onboarding/steps.ts
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  required: boolean;
  component: string; // Component to render for this step
  isComplete: (context: OnboardingContext) => boolean | Promise<boolean>;
  estimatedMinutes?: number;
}

export interface OnboardingContext {
  user: { id: string; email: string; full_name?: string };
  organization?: { id: string; name?: string };
  hasProfile: boolean;
  hasOrganization: boolean;
  hasFirstProject: boolean;
  hasInvitedTeam: boolean;
  hasConnectedIntegration: boolean;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'profile',
    title: 'Complete your profile',
    description: 'Add your name and avatar',
    icon: '👤',
    required: true,
    component: 'ProfileStep',
    isComplete: (ctx) => ctx.hasProfile,
    estimatedMinutes: 1,
  },
  {
    id: 'organization',
    title: 'Create your workspace',
    description: 'Set up your team workspace',
    icon: '🏢',
    required: true,
    component: 'OrganizationStep',
    isComplete: (ctx) => ctx.hasOrganization,
    estimatedMinutes: 1,
  },
  {
    id: 'first-project',
    title: 'Create your first project',
    description: 'Start with a project to see the magic',
    icon: '🚀',
    required: true,
    component: 'FirstProjectStep',
    isComplete: (ctx) => ctx.hasFirstProject,
    estimatedMinutes: 2,
  },
  {
    id: 'invite-team',
    title: 'Invite your team',
    description: 'Collaboration makes everything better',
    icon: '👥',
    required: false,
    component: 'InviteTeamStep',
    isComplete: (ctx) => ctx.hasInvitedTeam,
    estimatedMinutes: 1,
  },
  {
    id: 'integration',
    title: 'Connect an integration',
    description: 'Link your existing tools',
    icon: '🔗',
    required: false,
    component: 'IntegrationStep',
    isComplete: (ctx) => ctx.hasConnectedIntegration,
    estimatedMinutes: 3,
  },
];
```

---

## Setup Wizard Component

```typescript
// components/onboarding/setup-wizard.tsx
'use client';

import { useState, useEffect } from 'react';
import { ONBOARDING_STEPS, type OnboardingContext } from '@/lib/onboarding/steps';
import { createClient } from '@/lib/supabase/client';

export function SetupWizard({ context }: { context: OnboardingContext }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const supabase = createClient();

  const steps = ONBOARDING_STEPS;
  const progress = Math.round((completedSteps.length / steps.length) * 100);
  const activeStep = steps[currentStep];

  async function completeStep(stepId: string) {
    const updated = [...completedSteps, stepId];
    setCompletedSteps(updated);

    await supabase.from('onboarding_progress').upsert({
      user_id: context.user.id,
      completed_steps: updated,
      current_step: currentStep + 1,
      last_interaction_at: new Date().toISOString(),
      ...(updated.length === steps.length ? {
        status: 'completed',
        completed_at: new Date().toISOString(),
      } : {}),
    });

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }

  async function skipStep(stepId: string) {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
    await supabase.from('onboarding_progress').upsert({
      user_id: context.user.id,
      skipped_steps: [stepId],
      current_step: currentStep + 1,
    });
  }

  return (
    <div className="setup-wizard">
      {/* Progress bar */}
      <div className="wizard-header">
        <h2>Welcome! Let&apos;s get you set up</h2>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p className="progress-text">{progress}% complete</p>
      </div>

      {/* Step indicators */}
      <div className="step-indicators">
        {steps.map((step, i) => (
          <button
            key={step.id}
            className={`step-indicator ${i === currentStep ? 'active' : ''} ${completedSteps.includes(step.id) ? 'completed' : ''}`}
            onClick={() => setCurrentStep(i)}
          >
            <span className="step-icon">
              {completedSteps.includes(step.id) ? '✓' : step.icon}
            </span>
            <span className="step-title">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Active step content */}
      <div className="step-content">
        <h3>{activeStep.title}</h3>
        <p>{activeStep.description}</p>
        {activeStep.estimatedMinutes && (
          <span className="time-estimate">~{activeStep.estimatedMinutes} min</span>
        )}
        {/* Render step-specific component here */}
        <div className="step-component">
          {/* Dynamic component rendering based on activeStep.component */}
        </div>
        <div className="step-actions">
          <button onClick={() => completeStep(activeStep.id)} className="btn btn-primary">
            Complete & Continue
          </button>
          {!activeStep.required && (
            <button onClick={() => skipStep(activeStep.id)} className="btn btn-ghost">
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Dashboard Checklist Widget

```typescript
// components/onboarding/checklist-widget.tsx
'use client';

import { ONBOARDING_STEPS } from '@/lib/onboarding/steps';
import { useState } from 'react';

interface ChecklistProps {
  completedSteps: string[];
  onStepClick: (stepId: string) => void;
  onDismiss: () => void;
}

export function OnboardingChecklist({ completedSteps, onStepClick, onDismiss }: ChecklistProps) {
  const [expanded, setExpanded] = useState(true);
  const remaining = ONBOARDING_STEPS.filter(s => !completedSteps.includes(s.id));
  const progress = Math.round(
    (completedSteps.length / ONBOARDING_STEPS.length) * 100
  );

  if (remaining.length === 0) return null; // All done!

  return (
    <div className="checklist-widget card">
      <div className="checklist-header" onClick={() => setExpanded(!expanded)}>
        <div>
          <h4>Getting Started</h4>
          <p>{remaining.length} steps remaining</p>
        </div>
        <div className="progress-ring">
          <svg viewBox="0 0 36 36" width="48" height="48">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="var(--gray-200)" strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="var(--primary-500)" strokeWidth="3"
              strokeDasharray={`${progress}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <span>{progress}%</span>
        </div>
      </div>

      {expanded && (
        <div className="checklist-items">
          {ONBOARDING_STEPS.map(step => (
            <button
              key={step.id}
              className={`checklist-item ${completedSteps.includes(step.id) ? 'completed' : ''}`}
              onClick={() => onStepClick(step.id)}
            >
              <span className="check-icon">
                {completedSteps.includes(step.id) ? '✅' : '○'}
              </span>
              <div>
                <span className="item-title">{step.title}</span>
                <span className="item-desc">{step.description}</span>
              </div>
              {step.estimatedMinutes && !completedSteps.includes(step.id) && (
                <span className="item-time">~{step.estimatedMinutes}m</span>
              )}
            </button>
          ))}
          <button onClick={onDismiss} className="btn btn-ghost btn-sm">
            Dismiss checklist
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Tooltips & Product Tours

```typescript
// components/onboarding/tooltip-tour.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

interface TourStep {
  target: string; // CSS selector
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  { target: '#sidebar-projects', title: 'Your Projects', content: 'All your projects live here. Click to switch between them.', position: 'right' },
  { target: '#btn-create-project', title: 'Create a Project', content: 'Start here to create your first project.', position: 'bottom' },
  { target: '#sidebar-settings', title: 'Settings', content: 'Manage your account, team, and billing here.', position: 'right' },
];

export function ProductTour({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const current = TOUR_STEPS[step];

  useEffect(() => {
    const el = document.querySelector(current.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2,
      });
      el.classList.add('tour-highlight');
      return () => el.classList.remove('tour-highlight');
    }
  }, [step, current.target]);

  return (
    <>
      <div className="tour-overlay" />
      <div className="tour-tooltip" style={{ top: position.top, left: position.left }}>
        <div className="tour-step-count">Step {step + 1} of {TOUR_STEPS.length}</div>
        <h4>{current.title}</h4>
        <p>{current.content}</p>
        <div className="tour-actions">
          {step > 0 && <button onClick={() => setStep(step - 1)} className="btn btn-ghost btn-sm">Back</button>}
          {step < TOUR_STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="btn btn-primary btn-sm">Next</button>
          ) : (
            <button onClick={onComplete} className="btn btn-primary btn-sm">Done! 🎉</button>
          )}
        </div>
      </div>
    </>
  );
}
```

---

## Activation Tracking

```typescript
// lib/onboarding/activation.ts
import { createClient } from '@/lib/supabase/server';

export interface ActivationMetrics {
  signedUp: boolean;
  completedProfile: boolean;
  createdFirstProject: boolean;
  invitedTeammate: boolean;
  usedCoreFeature: boolean;
  returnedDay2: boolean;
}

export async function getActivationStatus(userId: string): Promise<ActivationMetrics> {
  const supabase = createClient();

  const [profile, projects, members] = await Promise.all([
    supabase.from('profiles').select('full_name, avatar_url').eq('id', userId).single(),
    supabase.from('projects').select('id', { count: 'exact', head: true }).eq('created_by', userId),
    supabase.from('organization_members').select('id', { count: 'exact', head: true }).eq('invited_by', userId),
  ]);

  return {
    signedUp: true,
    completedProfile: !!(profile.data?.full_name && profile.data?.avatar_url),
    createdFirstProject: (projects.count ?? 0) > 0,
    invitedTeammate: (members.count ?? 0) > 0,
    usedCoreFeature: false, // Define based on your product's core action
    returnedDay2: false, // Check login timestamps
  };
}
```

---

## Checklist

### Setup
- [ ] Onboarding steps defined with clear completion criteria
- [ ] `onboarding_progress` table created with RLS
- [ ] Setup wizard component built and tested
- [ ] Dashboard checklist widget implemented

### UX
- [ ] Progress indicator shows clear advancement
- [ ] All non-required steps are skippable
- [ ] Smart defaults pre-filled where possible
- [ ] Celebration on completion (confetti, encouraging copy)
- [ ] Mobile-responsive onboarding flow

### Persistence
- [ ] Progress saved to database (survives page refresh, logout)
- [ ] "Skip for now" nudges appear later
- [ ] Dismissed checklist stays dismissed
- [ ] Completed users never see onboarding again

### Analytics
- [ ] Step completion rates tracked
- [ ] Time-to-activation measured
- [ ] Drop-off points identified
- [ ] A/B test framework for step ordering

---

## Related Skills

- **onboarding-cro**: Marketing-side signup flow optimization
- **auth-implementation**: User registration and authentication
- **multi-tenancy**: Organization creation during onboarding
- **email-transactional**: Welcome emails and onboarding drips
- **analytics-tracking**: Tracking activation events
