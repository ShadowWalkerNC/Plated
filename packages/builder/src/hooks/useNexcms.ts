// Typed wrapper around window.nexcms IPC calls
// Keeps all IPC surface in one place; components never touch window directly.
import type { ProjectSchema } from '@nexcms/types';

declare global {
  interface Window {
    nexcms: NexcmsApi;
  }
}

export interface NexcmsApi {
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

export function useNexcms(): NexcmsApi {
  if (typeof window === 'undefined' || !window.nexcms) {
    throw new Error('[useNexcms] window.nexcms is not available. Are you running inside Electron?');
  }
  return window.nexcms;
}
