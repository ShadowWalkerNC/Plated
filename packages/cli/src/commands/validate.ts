// Plated CLI -- validate command: check a project file for structural errors
import { readFile } from 'node:fs/promises';
import { resolve }  from 'node:path';
import { isValidTheme } from '@plated/generator';
import type { ProjectSchema } from '@plated/types';

const KNOWN_BUSINESS_TYPES = [
  'restaurant', 'cafe', 'bar', 'bakery', 'catering',
  'food-truck', 'food-stand', 'ghost-kitchen',
] as const;

interface Check {
  label:   string;
  pass:    boolean;
  detail?: string | undefined;
}

export async function cmdValidate(args: string[]): Promise<void> {
  const flags      = parseFlags(args);
  const projectFile = flags['--project'] ?? flags['-p'] ?? await findProjectFile();
  const absPath    = resolve(projectFile);

  console.log(`\uD83D\uDD0D Validating: ${absPath}\n`);

  // -- 1. Parse JSON ---------------------------------------------------------
  let schema: ProjectSchema;
  try {
    const raw = await readFile(absPath, 'utf-8');
    schema = JSON.parse(raw) as ProjectSchema;
  } catch (err) {
    console.error(`\u274c Could not parse project file: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const checks: Check[] = [];

  // -- 2. Schema version -----------------------------------------------------
  checks.push({
    label:  'schemaVersion is 2.0',
    pass:   schema.schemaVersion === '2.0',
    detail: schema.schemaVersion !== '2.0' ? `Found: "${schema.schemaVersion}"` : undefined,
  });

  // -- 3. Business type -------------------------------------------------------
  checks.push({
    label:  'businessType is valid',
    pass:   (KNOWN_BUSINESS_TYPES as readonly string[]).includes(schema.businessType),
    detail: !(KNOWN_BUSINESS_TYPES as readonly string[]).includes(schema.businessType)
      ? `"${schema.businessType}" is not a recognised business type`
      : undefined,
  });

  // -- 4. Theme ---------------------------------------------------------------
  checks.push({
    label:  'styleTemplate is a known theme',
    pass:   isValidTheme(schema.styleTemplate),
    detail: !isValidTheme(schema.styleTemplate)
      ? `"${schema.styleTemplate}" is not a registered theme`
      : undefined,
  });

  // -- 5. Business name -------------------------------------------------------
  checks.push({
    label:  'business.name is non-empty',
    pass:   typeof schema.business?.name === 'string' && schema.business.name.trim().length > 0,
    detail: !schema.business?.name ? 'business.name is missing or empty' : undefined,
  });

  // -- 6. Menu structure ------------------------------------------------------
  const cats = schema.menu?.categories;
  checks.push({
    label:  'menu.categories is an array',
    pass:   Array.isArray(cats),
    detail: !Array.isArray(cats) ? 'menu.categories must be an array' : undefined,
  });

  if (Array.isArray(cats)) {
    for (const [i, cat] of cats.entries()) {
      const catLabel = `category[${i}] "${cat.name ?? ''}":`;

      checks.push({
        label:  `${catLabel} has a name`,
        pass:   typeof cat.name === 'string' && cat.name.trim().length > 0,
        detail: !cat.name ? 'name is missing' : undefined,
      });

      checks.push({
        label:  `${catLabel} items is an array`,
        pass:   Array.isArray(cat.items),
        detail: !Array.isArray(cat.items) ? 'items must be an array' : undefined,
      });

      if (Array.isArray(cat.items)) {
        for (const [j, item] of cat.items.entries()) {
          const itemLabel = `  item[${j}] "${item.name ?? ''}":`;
          checks.push({
            label:  `${itemLabel} has id, name, and price`,
            pass:   !!item.id && !!item.name && item.price !== undefined,
            detail: !item.id    ? 'missing id'
                  : !item.name  ? 'missing name'
                  : item.price === undefined ? 'missing price'
                  : undefined,
          });
        }
      }
    }
  }

  // -- Print results ---------------------------------------------------------
  let failures = 0;
  for (const c of checks) {
    const icon = c.pass ? '\u2705' : '\u274c';
    const extra = c.detail ? ` — ${c.detail}` : '';
    console.log(`  ${icon}  ${c.label}${extra}`);
    if (!c.pass) failures++;
  }

  console.log('');
  if (failures === 0) {
    console.log(`\u2728 All ${checks.length} checks passed.`);
  } else {
    console.error(`\u274c ${failures} of ${checks.length} checks failed.`);
    process.exit(1);
  }
}

async function findProjectFile(): Promise<string> {
  const { access } = await import('node:fs/promises');
  const { join } = await import('node:path');
  const candidates = [
    join(process.cwd(), 'project.plated.json'),
    join(process.cwd(), 'plated.json'),
  ];
  for (const f of candidates) {
    try { await access(f); return f; } catch { /* try next */ }
  }
  console.error('\u274c No project file found. Specify one with --project <path>');
  process.exit(1);
}

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg.startsWith('--') || arg.startsWith('-')) {
      flags[arg] = args[i + 1] && !args[i + 1]!.startsWith('-') ? args[++i]! : '';
    }
  }
  return flags;
}
