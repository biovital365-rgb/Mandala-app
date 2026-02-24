---
name: data-export-import
version: 1.0.0
description: When the user wants to implement data export, import, bulk operations, or data portability features. Also use when the user mentions "CSV export," "data export," "bulk import," "data migration," "Excel export," "PDF export," "data portability," "import wizard," "file parsing," or "GDPR data export." For file uploads, see file-upload-storage. For background processing, see queue-background-jobs.
---

# Data Export & Import

You are an expert in data portability and bulk operations for SaaS applications. Your goal is to help build robust export and import features that handle large datasets gracefully — including CSV/Excel/JSON exports, bulk imports with validation, and GDPR-compliant data portability.

## Initial Assessment

Before implementing, understand:

1. **Formats** - CSV, Excel (XLSX), JSON, PDF?
2. **Volume** - Rows per export? Max import size?
3. **Complexity** - Simple flat data or nested/relational?
4. **Compliance** - GDPR data portability requirements?

---

## Core Principles

### 1. Async for Large Exports
- Small exports (<1000 rows): instant download.
- Large exports (1000+ rows): background job + notification when ready.

### 2. Validate Everything on Import
- Show a preview before committing.
- Report errors per row, don't fail the entire import.
- Let users fix and retry failed rows.

### 3. Streaming Over Buffering
- Don't load 100K rows into memory. Use streaming.
- Generate files in chunks, upload progressively.

### 4. Data Portability is a Feature
- Users own their data. Make it easy to export everything.
- GDPR Article 20 requires machine-readable export on request.

---

## Export Implementation

### CSV Export (Small, Instant)

```typescript
// app/api/export/projects/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const orgId = searchParams.get('orgId');

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, status, created_at, updated_at')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (!projects?.length) {
    return NextResponse.json({ error: 'No data to export' }, { status: 404 });
  }

  if (format === 'csv') {
    const csv = convertToCSV(projects);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="projects_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  }

  if (format === 'json') {
    return new Response(JSON.stringify(projects, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="projects_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  }

  return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
}

function convertToCSV(data: Record<string, any>[]): string {
  if (!data.length) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      // Escape commas and quotes
      const str = val === null || val === undefined ? '' : String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}
```

### Large Export (Background Job)

```typescript
// lib/export/large-export.ts
import { inngest } from '@/lib/inngest/client';

// Trigger export job
export async function requestExport(orgId: string, userId: string, resource: string) {
  // Create export record
  const { data: exportRecord } = await supabase.from('data_exports').insert({
    organization_id: orgId,
    requested_by: userId,
    resource,
    status: 'processing',
  }).select().single();

  // Queue background job
  await inngest.send({
    name: 'export/generate',
    data: { exportId: exportRecord.id, orgId, resource },
  });

  return exportRecord;
}

// Background job
export const generateExport = inngest.createFunction(
  { id: 'generate-export', concurrency: { limit: 3 } },
  { event: 'export/generate' },
  async ({ event, step }) => {
    const { exportId, orgId, resource } = event.data;

    // Stream data in batches
    const csvParts: string[] = [];
    let offset = 0;
    const batchSize = 5000;
    let isFirst = true;

    await step.run('generate-csv', async () => {
      while (true) {
        const { data } = await supabase
          .from(resource)
          .select('*')
          .eq('organization_id', orgId)
          .range(offset, offset + batchSize - 1);

        if (!data?.length) break;

        if (isFirst) {
          csvParts.push(Object.keys(data[0]).join(','));
          isFirst = false;
        }

        for (const row of data) {
          csvParts.push(Object.values(row).map(v => `"${String(v ?? '')}"`).join(','));
        }

        offset += batchSize;
        if (data.length < batchSize) break;
      }
    });

    // Upload to storage
    const fileUrl = await step.run('upload', async () => {
      const csvContent = csvParts.join('\n');
      const fileName = `exports/${exportId}.csv`;

      const { data } = await supabase.storage
        .from('exports')
        .upload(fileName, csvContent, { contentType: 'text/csv' });

      const { data: urlData } = supabase.storage
        .from('exports')
        .createSignedUrl(fileName, 86400); // 24h link

      return urlData?.signedUrl;
    });

    // Update record and notify
    await step.run('complete', async () => {
      await supabase.from('data_exports').update({
        status: 'completed',
        file_url: fileUrl,
        completed_at: new Date().toISOString(),
      }).eq('id', exportId);

      // Notify user (see notification-system)
    });
  }
);
```

---

## Import Implementation

### Import Wizard (CSV)

```typescript
// lib/import/csv-parser.ts
export interface ImportResult {
  success: number;
  failed: number;
  errors: { row: number; field: string; message: string; data: Record<string, any> }[];
  preview: Record<string, any>[];
}

export function parseCSV(content: string): Record<string, any>[] {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

  return lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
    const row: Record<string, any> = {};
    headers.forEach((header, i) => {
      row[header] = (values[i] || '').replace(/^"|"$/g, '').trim();
    });
    return row;
  });
}

export function validateImportRow(
  row: Record<string, any>,
  rowIndex: number,
  schema: Record<string, { required?: boolean; type?: string; maxLength?: number }>
): string[] {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = row[field];
    if (rules.required && (!value || value === '')) {
      errors.push(`Row ${rowIndex}: ${field} is required`);
    }
    if (rules.maxLength && value && String(value).length > rules.maxLength) {
      errors.push(`Row ${rowIndex}: ${field} exceeds ${rules.maxLength} characters`);
    }
  }

  return errors;
}
```

### Import API with Preview

```typescript
// app/api/import/preview/route.ts
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const content = await file.text();
  const rows = parseCSV(content);

  // Show first 5 rows as preview + total count
  return NextResponse.json({
    totalRows: rows.length,
    preview: rows.slice(0, 5),
    columns: Object.keys(rows[0] || {}),
  });
}

// app/api/import/execute/route.ts
export async function POST(request: Request) {
  const { rows, mapping, orgId } = await request.json();
  // mapping: { csvColumn: dbColumn }

  let success = 0;
  let failed = 0;
  const errors: any[] = [];

  for (let i = 0; i < rows.length; i++) {
    const mapped: Record<string, any> = { organization_id: orgId };
    for (const [csvCol, dbCol] of Object.entries(mapping)) {
      mapped[dbCol as string] = rows[i][csvCol];
    }

    const { error } = await supabase.from('projects').insert(mapped);
    if (error) {
      failed++;
      errors.push({ row: i + 1, error: error.message, data: rows[i] });
    } else {
      success++;
    }
  }

  return NextResponse.json({ success, failed, errors, total: rows.length });
}
```

---

## GDPR Data Export

```typescript
// app/api/gdpr/export-my-data/route.ts
export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Collect ALL user data
  const [profile, projects, activity, preferences] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('projects').select('*').eq('created_by', user.id),
    supabase.from('activity_logs').select('*').eq('user_id', user.id),
    supabase.from('notification_preferences').select('*').eq('user_id', user.id),
  ]);

  const exportData = {
    exportDate: new Date().toISOString(),
    user: { id: user.id, email: user.email },
    profile: profile.data,
    projects: projects.data,
    activityLog: activity.data,
    preferences: preferences.data,
  };

  return new Response(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="my-data-${new Date().toISOString().split('T')[0]}.json"`,
    },
  });
}
```

---

## Checklist

- [ ] CSV export for all major resources
- [ ] JSON export option
- [ ] Large exports handled via background jobs
- [ ] Export status tracking and download links
- [ ] CSV import with preview and validation
- [ ] Column mapping UI for imports
- [ ] Per-row error reporting on import failures
- [ ] GDPR data export endpoint (all user data)
- [ ] Export files auto-expire (24h signed URLs)
- [ ] Rate limiting on export/import endpoints

---

## Related Skills

- **queue-background-jobs**: Async export generation
- **file-upload-storage**: File handling and storage
- **legal-compliance**: GDPR data portability requirements
- **notification-system**: Notify when export is ready
