// Plated CLI — export command: generate a full Astro site from a project file
import { readFile, access } from 'node:fs/promises';
import { resolve, join }    from 'node:path';
import { generate }         from '@plated/generator';
import type { ProjectSchema } from '@plated/types';

export async function cmdExport(args: string[]): Promise<void> {
  const flags      = parseFlags(args);
  const projectFile = flags['--project'] ?? flags['-p'] ?? (await findProjectFile());
  const outputDir  = flags['--out'] ?? flags['-o'] ?? join(process.cwd(), 'dist');
  const dryRun     = '--dry-run' in flags;

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

  const result = await generate(schema, resolve(outputDir), { dryRun });

  if (result.errors?.length) {
    for (const e of result.errors) console.error(`❌ ${e}`);
    if (!result.success) process.exit(1);
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

async function findProjectFile(): Promise<string> {
  const candidates = [
    join(process.cwd(), 'project.plated.json'),
    join(process.cwd(), 'plated.json'),
  ];
  for (const f of candidates) {
    try {
      await access(f);
      return f;
    } catch {
      // not found — try next
    }
  }
  console.error('❌ No project file found. Run: plated init');
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
