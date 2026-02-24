---
name: disaster-recovery
version: 1.0.0
description: When the user wants to implement backup strategies, disaster recovery plans, or business continuity. Also use when the user mentions "backup," "disaster recovery," "data loss," "recovery point," "recovery time," "database backup," "point-in-time recovery," "failover," "incident response," or "business continuity." For security incidents, see security-hardening. For monitoring, see monitoring-observability.
---

# Disaster Recovery

You are an expert in disaster recovery and business continuity for SaaS applications. Your goal is to help build resilient systems with clear backup strategies, recovery procedures, and incident playbooks — so that when things go wrong (and they will), recovery is fast and data loss is minimal.

## Initial Assessment

Before implementing, understand:

1. **RTO/RPO Targets** - How much downtime is acceptable? How much data loss?
2. **Data Criticality** - What data absolutely cannot be lost?
3. **Infrastructure** - Supabase managed? Self-hosted? Multi-region?
4. **Compliance** - Backup retention requirements?

---

## Core Principles

### 1. Define RTO and RPO First
- **RTO** (Recovery Time Objective): Max acceptable downtime. "We must be back up in X hours."
- **RPO** (Recovery Point Objective): Max acceptable data loss. "We can lose at most X minutes of data."
- These numbers drive every architectural decision.

### 2. Backups Are Not Backups Until Tested
- An untested backup is Schrödinger's backup — it might work, it might not.
- Test restores quarterly. Automate restore tests monthly.

### 3. Plan for Humans, Not Just Machines
- The biggest disaster risk is human error (accidental DELETE, bad migration).
- Point-in-time recovery is more valuable than daily snapshots.

### 4. Document Everything
- During a disaster, you won't remember the steps. Write them down now.
- Runbooks with exact commands, not conceptual guides.

---

## Recovery Targets by Tier

| Tier | Data Type | RTO | RPO | Strategy |
|------|----------|-----|-----|----------|
| **Tier 1** | User data, transactions, billing | 1 hour | 5 minutes | PITR + streaming replication |
| **Tier 2** | Settings, preferences, configs | 4 hours | 1 hour | Daily backups + WAL archiving |
| **Tier 3** | Analytics, logs, activity | 24 hours | 24 hours | Daily snapshots |
| **Tier 4** | Cached data, temp files | N/A | N/A | Regenerate on demand |

---

## Supabase Backup Strategy

### Built-in Backups

```
Supabase provides:
- Free plan: No backups (you're on your own!)
- Pro plan: Daily backups, 7-day retention
- Enterprise: Point-in-time recovery (PITR)

⚠️ Free plan users: YOU MUST implement your own backups.
```

### Custom Backup Script

```typescript
// scripts/backup-database.ts
// Run via cron job or CI/CD schedule

import { exec } from 'child_process';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL!; // postgresql://...
const BACKUP_BUCKET = 'backups';

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `backup-${timestamp}.sql`;

  // pg_dump (requires pg tools installed)
  await new Promise<void>((resolve, reject) => {
    exec(
      `pg_dump "${SUPABASE_DB_URL}" --no-owner --no-privileges -F c -f /tmp/${filename}`,
      (error) => {
        if (error) reject(error);
        else resolve();
      }
    );
  });

  // Upload to Supabase storage (or S3, GCS, etc.)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const fs = require('fs');
  const fileBuffer = fs.readFileSync(`/tmp/${filename}`);

  await supabase.storage
    .from(BACKUP_BUCKET)
    .upload(`db/${filename}`, fileBuffer, {
      contentType: 'application/octet-stream',
    });

  console.log(`✅ Backup completed: ${filename}`);

  // Clean up old backups (keep last 30)
  await cleanOldBackups(supabase, 30);
}

async function cleanOldBackups(supabase: any, keepLast: number) {
  const { data: files } = await supabase.storage
    .from(BACKUP_BUCKET)
    .list('db', { sortBy: { column: 'created_at', order: 'asc' } });

  if (files && files.length > keepLast) {
    const toDelete = files.slice(0, files.length - keepLast);
    for (const file of toDelete) {
      await supabase.storage.from(BACKUP_BUCKET).remove([`db/${file.name}`]);
    }
    console.log(`🗑️ Cleaned ${toDelete.length} old backups`);
  }
}

backupDatabase().catch(console.error);
```

### Automated Backup with GitHub Actions

```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch: # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install PostgreSQL client
        run: sudo apt-get install -y postgresql-client

      - name: Create backup
        run: |
          pg_dump "${{ secrets.SUPABASE_DB_URL }}" \
            --no-owner --no-privileges \
            -F c -f backup.sql

      - name: Upload to storage
        run: node scripts/upload-backup.js
        env:
          SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}

      - name: Notify on failure
        if: failure()
        run: |
          curl -X POST "${{ secrets.SLACK_WEBHOOK }}" \
            -H 'Content-type: application/json' \
            -d '{"text":"❌ Database backup FAILED! Check logs."}'
```

---

## Restore Procedures

### Full Database Restore

```bash
# 1. Download the backup
supabase storage download backups/db/backup-2024-01-15.sql -o ./restore.sql

# 2. Connect to the database
psql "$SUPABASE_DB_URL"

# 3. Restore (CAUTION: this replaces existing data)
pg_restore --clean --no-owner --no-privileges -d "$SUPABASE_DB_URL" restore.sql

# 4. Verify data integrity
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) FROM profiles;"
psql "$SUPABASE_DB_URL" -c "SELECT COUNT(*) FROM organizations;"
```

### Point-in-Time Recovery (Supabase Pro+)

```
1. Go to Supabase Dashboard → Database → Backups
2. Select "Point in Time Recovery"
3. Choose the exact timestamp to recover to
4. Supabase creates a new project with the recovered data
5. Verify data, then swap connections
```

### Single Table Recovery

```bash
# Dump a single table from backup
pg_restore -t projects -F c restore.sql > projects_only.sql

# Restore into a temp table first
psql "$SUPABASE_DB_URL" -c "CREATE TABLE projects_recovery AS SELECT * FROM projects WHERE false;"
psql "$SUPABASE_DB_URL" < projects_only.sql

# Verify, then swap
# ALTER TABLE projects RENAME TO projects_old;
# ALTER TABLE projects_recovery RENAME TO projects;
```

---

## Incident Response Runbook

```markdown
## 🚨 Incident Response Steps

### 1. Detect (0-5 min)
- [ ] Monitoring alert received
- [ ] Acknowledged by on-call engineer
- [ ] Initial assessment: severity level (P1-P4)

### 2. Assess (5-15 min)
- [ ] What is affected? (users, data, revenue?)
- [ ] How many users impacted?
- [ ] Is data at risk?
- [ ] What changed recently? (deploys, migrations, config)

### 3. Communicate (15-20 min)
- [ ] Internal: Slack #incidents channel updated
- [ ] Status page updated (if customer-facing)
- [ ] Affected customers notified (if P1/P2)

### 4. Mitigate (ASAP)
- [ ] Can we rollback the last deploy? → Do it
- [ ] Can we revert the last migration? → Do it
- [ ] Can we switch to read-only mode? → Consider it
- [ ] Can we restore from backup? → Last resort

### 5. Resolve
- [ ] Root cause identified
- [ ] Fix deployed and verified
- [ ] Data integrity confirmed
- [ ] Monitoring confirms normal operation

### 6. Post-Mortem (within 48h)
- [ ] Timeline of events documented
- [ ] Root cause analysis completed
- [ ] Action items identified and assigned
- [ ] Runbook updated if needed
```

---

## Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks: Record<string, boolean> = {};

  // Database check
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    checks.database = !error;
  } catch { checks.database = false; }

  // Storage check
  try {
    const { error } = await supabase.storage.from('public').list('', { limit: 1 });
    checks.storage = !error;
  } catch { checks.storage = false; }

  // External services
  try {
    const res = await fetch('https://api.stripe.com/v1/charges?limit=1', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
    checks.stripe = res.ok;
  } catch { checks.stripe = false; }

  const allHealthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    { status: allHealthy ? 'healthy' : 'degraded', checks, timestamp: new Date().toISOString() },
    { status: allHealthy ? 200 : 503 }
  );
}
```

---

## Checklist

### Backups
- [ ] Automated daily database backups
- [ ] Backup stored externally (not just Supabase)
- [ ] Backup retention policy defined (30/60/90 days)
- [ ] File/storage backups configured
- [ ] Backup encryption at rest

### Recovery
- [ ] Restore procedure documented with exact commands
- [ ] Restore tested at least quarterly
- [ ] PITR enabled (Supabase Pro+)
- [ ] Single-table recovery procedure documented
- [ ] Recovery time measured and within RTO target

### Monitoring
- [ ] Health check endpoint (/api/health)
- [ ] Uptime monitoring (external: UptimeRobot, Better Stack)
- [ ] Backup job success/failure alerts
- [ ] Database size and growth monitoring

### Incident Response
- [ ] Incident response runbook written
- [ ] On-call rotation defined
- [ ] Communication templates ready (status page, email)
- [ ] Post-mortem template available
- [ ] Rollback procedure documented

---

## Related Skills

- **security-hardening**: Security incident response
- **monitoring-observability**: Alerting and uptime monitoring
- **deployment-strategy**: Rollback procedures
- **migration-upgrade-strategy**: Migration rollback plans
