// @nexcms/generator — Phase 1 stub
// This package is scaffolded. Implementation begins in Phase 1.
//
// Responsibility: reads a validated ProjectSchema and produces
// a complete Astro site output directory.
//
// Entry point: generate(schema, options) → GenerateResult

import type { ProjectSchema } from '@nexcms/types';

export interface GenerateOptions {
  /** Absolute path to write output files */
  outputDir: string;
  /** Include full Astro source (true) or pre-built static only (false) */
  includeSource: boolean;
}

export interface GenerateResult {
  success: boolean;
  outputDir: string;
  filesWritten: number;
  errors: string[];
}

/**
 * generate — core entry point.
 * Reads a ProjectSchema, resolves the template manifest,
 * maps content slots, processes assets, generates SEO,
 * and writes an Astro project to outputDir.
 *
 * @param schema - Validated ProjectSchema
 * @param options - GenerateOptions
 * @returns GenerateResult
 */
export async function generate(
  _schema: ProjectSchema,
  _options: GenerateOptions,
): Promise<GenerateResult> {
  // Phase 1 implementation — stub only
  throw new Error(
    'generator.generate() is not yet implemented. ' +
    'Implementation begins in Phase 1 (Jul–Sep 2026).'
  );
}
