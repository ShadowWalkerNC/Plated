// Plated CLI -- export command: generate a full Astro site from a project file
import { readFile, access, cp } from 'node:fs/promises';
import { resolve, join }        from 'node:path';
import { mkdtemp, rm }          from 'node:fs/promises';
import { tmpdir }               from 'node:os';
import { generate }             from '@plated/generator';
import type { ProjectSchema }   from '@plated/types';

export async function cmdExport(args: string[]): Promise<void> {
  const flags       = parseFlags(args);
  const projectFile = flags['--project'] ?? flags['-p'] ?? (await findProjectFile());
  const dryRun      = '--dry-run' in flags;
  const sourceMode  = '--source' in flags;
  const outputDir   = flags['--out'] ?? flags['-o'] ??
                      join(process.cwd(), sourceMode ? 'dist-source' : 'dist');

  console.log(`\uD83D\uDCE6 Loading project: ${projectFile}`);

  let schema: ProjectSchema;
  try {
    const raw = await readFile(resolve(projectFile), 'utf-8');
    schema = JSON.parse(raw) as ProjectSchema;
  } catch (err) {
    console.error(`\u274c Could not read project file: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  // -- Source mode: write the Astro source tree for manual customisation ------
  if (sourceMode && !dryRun) {
    console.log(`\u2699\uFE0F  Generating Astro source tree...`);
    const absOut = resolve(outputDir);

    // Generate into a temp dir first, then move into place so we never leave
    // a half-written output directory on failure.
    let tmp: string | null = null;
    try {
      tmp = await mkdtemp(join(tmpdir(), 'plated-export-src-'));
      const result = await generate(schema, tmp);
      if (!result.success || result.errors?.length) {
        for (const e of result.errors ?? []) console.error(`\u274c ${e}`);
        process.exit(1);
      }
      // Remove stale output dir if it exists, then copy the generated source
      await rm(absOut, { recursive: true, force: true });
      await cp(tmp, absOut, { recursive: true });
    } finally {
      if (tmp) await rm(tmp, { recursive: true, force: true }).catch(() => {});
    }

    console.log(`\u2705 Source tree written to: ${absOut}`);
    console.log(`\n\uD83D\uDCA1 To start the dev server:`);
    console.log(`   cd ${absOut}`);
    console.log(`   pnpm install`);
    console.log(`   pnpm dev`);
    console.log(`\n\uD83D\uDCE6 To build for production:`);
    console.log(`   pnpm build`);
    return;
  }

  // -- Normal mode: generate directly into outputDir -------------------------
  console.log(`\u2699\uFE0F  Generating site${dryRun ? ' (dry run)' : ''}...`);

  const result = await generate(schema, resolve(outputDir), { dryRun });

  if (result.errors?.length) {
    for (const e of result.errors) console.error(`\u274c ${e}`);
    if (!result.success) process.exit(1);
  }

  if (dryRun) {
    console.log(`\u2705 Dry run complete \u2014 ${result.filesWritten} files would be written.`);
  } else {
    console.log(`\u2705 Site generated \u2014 ${result.filesWritten} files written to: ${result.outputDir}`);
    console.log(`\n\uD83D\uDE80 To preview your site:`);
    console.log(`   cd ${result.outputDir} && npm install && npm run preview`);
    console.log(`\n\uD83D\uDCE6 To deploy:`);
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
    } catch { /* not found -- try next */ }
  }
  console.error('\u274c No project file found. Run: plated init');
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
