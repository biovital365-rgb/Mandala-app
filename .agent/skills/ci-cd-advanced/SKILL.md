---
name: ci-cd-advanced
version: 1.0.0
description: When the user wants to set up or improve CI/CD pipelines, automated testing in CI, preview deployments, or release workflows. Also use when the user mentions "CI/CD," "GitHub Actions," "pipeline," "automated tests," "preview deploy," "staging," "release process," "semantic versioning," "linting in CI," or "deployment automation." For deployment strategy, see deployment-strategy. For testing, see testing-strategy.
---

# Advanced CI/CD

You are an expert in continuous integration and deployment for modern web applications. Your goal is to help build robust CI/CD pipelines that automate testing, linting, security checks, preview deployments, and production releases — ensuring every merge is safe and every deploy is predictable.

## Initial Assessment

Before implementing, understand:

1. **Platform** - GitHub Actions, GitLab CI, Vercel, other?
2. **Stack** - Next.js, Node, Supabase, monorepo?
3. **Current State** - Any existing CI? Manual deploys?
4. **Requirements** - Preview deploys? Staging? Approval gates?

---

## Core Principles

### 1. Every Push Gets Tested
- No code merges without passing CI. Period.
- Lint, type-check, unit tests, and build on every PR.

### 2. Preview Before Merge
- Every PR gets a preview deployment with a unique URL.
- Reviewers can test the changes before approving.

### 3. Trunk-Based Development
- Merge small, merge often. Long-lived branches are bugs waiting to happen.
- Feature flags > feature branches for large changes.

### 4. Automate Everything
- If you do it twice, automate it. Manual steps are error-prone.
- Database migrations, cache invalidation, notifications — all automated.

---

## GitHub Actions Workflows

### CI Pipeline (Every PR)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}

  security-audit:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm audit --audit-level=high
        continue-on-error: true
      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          extra_args: --only-verified
```

### Database Migration Check

```yaml
  migration-check:
    name: Migration Check
    runs-on: ubuntu-latest
    if: contains(github.event.pull_request.labels.*.name, 'migration')
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase db lint
      - run: supabase db diff --linked
```

### Preview Deployment (Vercel)

```yaml
# .github/workflows/preview.yml
name: Preview Deploy

on:
  pull_request:
    branches: [main]

jobs:
  deploy-preview:
    name: Deploy Preview
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, unit-tests, build]
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        id: deploy
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Comment PR with preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `🚀 **Preview deployed!**\n\n${steps.deploy.outputs.preview-url}`
            })
```

### Production Release

```yaml
# .github/workflows/release.yml
name: Production Release

on:
  push:
    branches: [main]

jobs:
  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    environment: production  # Requires approval in GitHub settings
    steps:
      - uses: actions/checkout@v4

      # Run migrations first
      - uses: supabase/setup-cli@v1
      - run: supabase db push --linked
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}

      # Deploy application
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

      # Post-deploy
      - name: Notify team
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-type: application/json' \
            -d '{"text":"✅ Production deploy complete: ${{ github.sha }}"}'
```

---

## Branch Protection Rules

```
Repository Settings → Branches → Branch protection rules:

✅ Require pull request reviews (1+ approvals)
✅ Require status checks to pass:
   - lint-and-typecheck
   - unit-tests
   - build
✅ Require branches to be up to date
✅ Require linear history (squash merge)
❌ Allow force pushes (never)
❌ Allow deletions (never)
```

---

## Environment Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Preview    │    │   Staging   │    │ Production  │
│ (per PR)     │───▶│ (main)      │───▶│ (release)   │
│              │    │             │    │             │
│ PR branch    │    │ Auto-deploy │    │ Approval    │
│ Temp DB      │    │ Staging DB  │    │ Prod DB     │
│ Test keys    │    │ Test keys   │    │ Live keys   │
└─────────────┘    └─────────────┘    └─────────────┘
```

---

## package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint && eslint . --ext .ts,.tsx",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset",
    "db:diff": "supabase db diff",
    "prepare": "husky"
  }
}
```

---

## Pre-Commit Hooks (Husky + lint-staged)

```bash
# Setup
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,json,md}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
npx lint-staged
```

---

## Checklist

- [ ] CI runs lint, type-check, tests, and build on every PR
- [ ] Branch protection requires CI pass + review approval
- [ ] Preview deployments for every PR
- [ ] Production deploys require environment approval
- [ ] Database migrations automated in pipeline
- [ ] Security audit (npm audit, secret scanning)
- [ ] Test coverage reports generated
- [ ] Pre-commit hooks (lint-staged + husky)
- [ ] Slack/Discord notifications for deploys
- [ ] Concurrency control (cancel outdated runs)

---

## Related Skills

- **testing-strategy**: What tests to run in CI
- **deployment-strategy**: Deploy targets and strategies
- **security-hardening**: Secret scanning and dependency auditing
- **migration-upgrade-strategy**: Database migrations in CI
