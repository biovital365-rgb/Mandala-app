---
name: migration-upgrade-strategy
version: 1.0.0
description: When the user wants to manage database migrations, schema evolution, data migrations, or application upgrade strategies. Also use when the user mentions "migration," "schema change," "database migration," "backward compatibility," "blue-green deploy," "zero-downtime migration," "data migration," or "version upgrade." For deployment, see deployment-strategy. For database design, see database-design.
---

# Migration & Upgrade Strategy

You are an expert in database migrations, schema evolution, and zero-downtime upgrade strategies for production SaaS applications. Your goal is to help safely evolve the database schema and application code without breaking existing users, losing data, or causing downtime.

## Initial Assessment

Before migrating, understand:

1. **Migration Type** - Schema change, data migration, or both?
2. **Risk Level** - Adding columns (low) vs renaming tables (high)?
3. **Downtime Tolerance** - Can we have maintenance windows or must it be zero-downtime?
4. **Rollback Plan** - How do we undo this if something goes wrong?

---

## Core Principles

### 1. Never Delete Data On Deploy
- Adding is safe. Removing is dangerous. Renaming is both.
- Use expand-contract pattern: add new → migrate data → remove old.
- Always have a rollback plan before executing.

### 2. Backward Compatible First
- New code must work with old schema AND new schema during transition.
- Deploy code first, then migrate schema (or vice versa, but never simultaneously).

### 3. Small, Incremental Changes
- One migration per concern. Don't combine adding a column with changing a constraint.
- Easier to review, easier to rollback, easier to debug.

### 4. Test Migrations on Production-Like Data
- Test with realistic data volumes. A migration that takes 100ms on 100 rows may lock for 10 minutes on 1M rows.
- Test rollback procedures, not just forward migrations.

---

## Migration Patterns

### Safe: Adding a Column

```sql
-- ✅ SAFE: Additive change, no lock
ALTER TABLE projects ADD COLUMN priority TEXT DEFAULT 'medium';

-- Add index CONCURRENTLY (no table lock on Postgres)
CREATE INDEX CONCURRENTLY idx_projects_priority ON projects(priority);
```

### Safe: Adding a Table

```sql
-- ✅ SAFE: New table, no impact on existing
CREATE TABLE project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Careful: Renaming a Column (Expand-Contract)

```sql
-- Step 1: Add new column (deploy with code that writes to BOTH)
ALTER TABLE projects ADD COLUMN display_name TEXT;

-- Step 2: Backfill data
UPDATE projects SET display_name = name WHERE display_name IS NULL;

-- Step 3: Deploy code that reads from new column
-- Step 4: (After all reads migrated) Drop old column
-- ALTER TABLE projects DROP COLUMN name; -- Only after full migration
```

### Careful: Changing Column Type

```sql
-- DON'T: ALTER COLUMN SET TYPE (locks table)
-- DO: Expand-contract pattern

-- Step 1: Add new column with desired type
ALTER TABLE projects ADD COLUMN max_size BIGINT;

-- Step 2: Backfill
UPDATE projects SET max_size = max_size_int::BIGINT;

-- Step 3: Swap in application code
-- Step 4: Drop old column later
```

### Dangerous: Removing a Column

```sql
-- NEVER do this directly in production!
-- Step 1: Stop reading from the column in code (deploy)
-- Step 2: Stop writing to the column in code (deploy)
-- Step 3: Wait for all old versions to drain
-- Step 4: Drop column
ALTER TABLE projects DROP COLUMN IF EXISTS legacy_status;
```

---

## Supabase Migration Workflow

```bash
# Create a new migration file
supabase migration new add_priority_to_projects

# Edit the generated SQL file:
# supabase/migrations/20240101000000_add_priority_to_projects.sql

# Apply locally
supabase db reset   # Resets local DB and applies all migrations

# Push to production
supabase db push    # Applies pending migrations to production

# If something goes wrong, create a rollback migration:
supabase migration new rollback_priority_column
```

### Migration File Template

```sql
-- supabase/migrations/YYYYMMDDHHMMSS_description.sql

-- Description: Add priority column to projects table
-- Risk: LOW (additive only)
-- Rollback: DROP COLUMN priority

-- Forward Migration
ALTER TABLE projects ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium'
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_priority 
  ON projects(priority);

-- Update RLS policies if needed
-- (none needed for this change)
```

---

## Data Migration Patterns

### Batch Processing (Large Tables)

```typescript
// scripts/migrate-data.ts
// For migrating large amounts of data without locking

async function migrateInBatches(batchSize: number = 1000) {
  let offset = 0;
  let processed = 0;
  
  while (true) {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name')
      .is('display_name', null) // Only unmigrated rows
      .range(offset, offset + batchSize - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;

    // Update in batch
    const updates = data.map(row => 
      supabase.from('projects')
        .update({ display_name: row.name })
        .eq('id', row.id)
    );

    await Promise.all(updates);
    processed += data.length;
    console.log(`Migrated ${processed} rows...`);

    if (data.length < batchSize) break; // Last batch
    offset += batchSize;
    
    // Small delay to avoid overwhelming the database
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`Migration complete: ${processed} rows processed`);
}
```

---

## Version Management

### Semantic Versioning for API + Schema

```
Database Schema: v34 (sequential migration number)
API Version: v1.2.0 (semver)
App Version: 2.5.1 (semver)

Compatibility Matrix:
  App v2.5.x works with Schema v33-v35
  API v1.x.x works with Schema v30+
```

### Feature Flags for Gradual Rollout

```typescript
// lib/features/flags.ts
export const FEATURE_FLAGS = {
  new_project_editor: {
    enabled: process.env.FF_NEW_EDITOR === 'true',
    rolloutPercent: 25, // 25% of users
  },
  v2_api: {
    enabled: true,
    allowlist: ['org_123', 'org_456'], // Specific orgs
  },
} as const;

export function isFeatureEnabled(flag: string, orgId?: string): boolean {
  const config = FEATURE_FLAGS[flag as keyof typeof FEATURE_FLAGS];
  if (!config) return false;
  if (!config.enabled) return false;
  if ('allowlist' in config && orgId) return config.allowlist.includes(orgId);
  if ('rolloutPercent' in config) {
    // Deterministic hash for consistent rollout
    const hash = orgId ? hashCode(orgId) % 100 : Math.random() * 100;
    return hash < config.rolloutPercent;
  }
  return true;
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
```

---

## Checklist

### Pre-Migration
- [ ] Migration tested on staging with production-like data
- [ ] Rollback script written and tested
- [ ] Backward compatibility verified (old code + new schema)
- [ ] Team notified of migration plan
- [ ] Backup taken before applying

### During Migration
- [ ] Monitor database performance during execution
- [ ] Verify no table locks on large tables
- [ ] Run data migrations in batches
- [ ] Check application error rates

### Post-Migration
- [ ] Verify all data migrated correctly (spot checks + counts)
- [ ] Old code paths removed (after transition period)
- [ ] Migration documented in changelog
- [ ] Monitoring confirms no regressions

---

## Related Skills

- **database-design**: Schema design patterns
- **deployment-strategy**: Blue-green deploys, rollback strategies
- **testing-strategy**: Migration testing in CI/CD
- **monitoring-observability**: Monitoring migration impact
