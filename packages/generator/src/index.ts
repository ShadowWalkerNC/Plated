// @plated/generator — delegates file generation to @plated/astro-output
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join }        from 'node:path';
import { buildAstroProject }    from '@plated/astro-output';
import type { ProjectSchema }   from '@plated/types';

export interface GenerateOptions {
  dryRun?: boolean;
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
 * and writes it to outputDir. Pass dryRun:true to skip disk writes.
 */
export async function generate(
  schema:    ProjectSchema,
  outputDir: string,
  options:   GenerateOptions = {},
): Promise<GenerateResult> {
  const errors:   string[] = [];
  const warnings: string[] = [];

  try {
    const files = buildAstroProject(schema);

    if (options.dryRun) {
      return { success: true, outputDir, filesWritten: files.length, errors, warnings };
    }

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
