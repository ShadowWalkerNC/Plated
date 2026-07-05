// nexcms export — generate a full Astro site from a project file
import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { generate } from '@nexcms/generator';
import type { ProjectSchema } from '@nexcms/types';

export async function cmdExport(args: string[]): Promise<void> {
  const flags = parseFlags(args);
  const projectFile = flags['--project'] ?? flags['-p'] ?? findProjectFile();
  const outputDir = flags['--out'] ?? flags['-o'] ?? join(process.cwd(), 'dist');
  const includeSource = '--source' in flags;
  const dryRun = '--dry-run' in flags;

  console.log(`📦 Loading project: ${projectFile}`);

  let schema: ProjectSchema;
  try {
    const raw = await readFile(resolve(projectFile), 'utf-8');
    schema = JSON.parse(raw) as ProjectSchema;
  } catch (err) {
    console.error(`❌ Could not read project file: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  console.log(`⚙️  Generating site${dryRun ? ' (dry run)' : ''}...`);

  const result = await generate(schema, {
    outputDir: resolve(outputDir),
    includeSource,
    dryRun,
  });

  if (result.warnings.length) {
    for (const w of result.warnings) console.warn(`⚠️  ${w}`);
  }

  if (!result.success) {
    for (const e of result.errors) console.error(`❌ ${e}`);
    process.exit(1);
  }

  if (dryRun) {
    console.log(`✅ Dry run complete — ${result.filesWritten} files would be written.`);
  } else {
    console.log(`✅ Site generated — ${result.filesWritten} files written to: ${result.outputDir}`);
    console.log(`\n🚀 To preview your site:`);
    console.log(`   cd ${result.outputDir} && npm install && npm run preview`);
    console.log(`\n📦 To deploy:`);
    console.log(`   Push the ${result.outputDir} folder to Netlify, Vercel, or Cloudflare Pages.`);
  }
}

function findProjectFile(): string {
  const candidates = [
    join(process.cwd(), 'project.nexcms.json'),
    join(process.cwd(), 'nexcms.json'),
  ];
  for (const f of candidates) {
    try {
      require('node:fs').accessSync(f);
      return f;
    } catch {
      // continue
    }
  }
  console.error('❌ No project file found. Run: nexcms new');
  process.exit(1);
}

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--') || arg.startsWith('-')) {
      flags[arg] = args[i + 1] && !args[i + 1].startsWith('-') ? args[++i] : '';
    }
  }
  return flags;
}
