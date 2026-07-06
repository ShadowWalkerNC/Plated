// Typed wrapper around window.plated IPC calls
// Keeps all IPC surface in one place; components never touch window directly.
import type { ProjectSchema } from '@plated/types';

declare global {
  interface Window {
    plated: PlatedApi;
  }
}

export interface PlatedApi {
  generate(schema: ProjectSchema, outputDir: string, includeSource?: boolean): Promise<GenerateResult>;
  generateDryRun(schema: ProjectSchema): Promise<GenerateResult>;
  pickOutputDir(): Promise<string | null>;
  pickFile(options?: { filters?: Array<{ name: string; extensions: string[] }> }): Promise<string | null>;
  saveFile(options?: { defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }): Promise<string | null>;
  openExternal(url: string): Promise<void>;
  revealInFinder(filePath: string): Promise<void>;
  saveProject(schema: ProjectSchema, filePath: string): Promise<void>;
  loadProject(filePath: string): Promise<ProjectSchema>;
  getRecentProjects(): Promise<string[]>;
}

export interface GenerateResult {
  success: boolean;
  outputDir: string;
  filesWritten: number;
  errors: string[];
  warnings: string[];
  templateUsed: string;
}

export function usePlated(): PlatedApi {
  if (typeof window === 'undefined' || !window.plated) {
    throw new Error('[usePlated] window.plated is not available. Are you running inside Electron?');
  }
  return window.plated;
}
