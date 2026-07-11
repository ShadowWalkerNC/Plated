/**
 * @plated/generator — orchestrates full Astro project generation.
 *
 * Pipeline:
 *   1. loadManifests()        — registers all 8 template manifests
 *   2. buildAstroProject()    — produces AstroFile[] (manifest-driven)
 *   3. write to outputDir     — clears old output, writes new files
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join }        from 'node:path';
import { buildAstroProject }    from '@plated/astro-output';
import type { ProjectSchema }   from '@plated/types';
import { loadManifests }        from './manifestLoader.js';

export interface GenerateOptions {
  /** Skip disk writes; useful for testing / preview. */
  dryRun?: boolean;
  /** Log generated file paths to stdout. */
  verbose?: boolean;
}

export interface GenerateResult {
  success:      boolean;
  outputDir:    string;
  filesWritten: number;
  errors:       string[];
  warnings:     string[];
}

/**
 * generate — builds a complete Astro project from a ProjectSchema
 * and writes it to outputDir.
 *
 * @param schema     The validated ProjectSchema from the wizard / editor.
 * @param outputDir  Absolute path to the target directory.
 * @param options    Optional flags.
 */
export async function generate(
  schema:    ProjectSchema,
  outputDir: string,
  options:   GenerateOptions = {},
): Promise<GenerateResult> {
  const errors:   string[] = [];
  const warnings: string[] = [];

  try {
    // Step 1 — register manifests (idempotent, first call wins)
    loadManifests();

    // Step 2 — generate the full file list
    const files = buildAstroProject(schema);

    if (options.verbose) {
      for (const f of files) process.stdout.write(`[plated] ${f.path}\n`);
    }

    if (options.dryRun) {
      return { success: true, outputDir, filesWritten: files.length, errors, warnings };
    }

    // Step 3 — write to disk
    await rm(outputDir, { recursive: true, force: true });
    await mkdir(outputDir, { recursive: true });

    for (const file of files) {
      const abs = join(outputDir, file.path);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, file.content, 'utf-8');
    }

    return { success: true, outputDir, filesWritten: files.length, errors, warnings };
  } catch (err) {
    errors.push(err instanceof Error ? err.message : String(err));
    return { success: false, outputDir, filesWritten: 0, errors, warnings };
  }
}

export * from './themeRegistry.js';
