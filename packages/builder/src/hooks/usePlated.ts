// Typed wrapper around window.plated IPC calls
// Keeps all IPC surface in one place; components never touch window directly.
import type { ProjectSchema } from '@plated/types';
import type { QrOptions }     from '@plated/pdf-tools';

declare global {
  interface Window {
    plated: PlatedApi;
  }
}

export interface GenerateResult {
  success: boolean;
  outputDir: string;
  filesWritten: number;
  errors: string[];
  warnings: string[];
  templateUsed: string;
}

export interface ExportPdfResult {
  ok: boolean;
  filePath?: string;
  reason?: string;
}

export interface QrResult {
  ok: boolean;
  dataUrl?: string;
  filePath?: string;
  reason?: string;
}

export interface BgRemovalResult {
  ok: boolean;
  resultUrl?: string;
  reason?: string;
}

export interface PlatedApi {
  // ─ Generator
  generate(schema: ProjectSchema, outputDir: string, includeSource?: boolean): Promise<GenerateResult>;
  generateDryRun(schema: ProjectSchema): Promise<GenerateResult>;

  // ─ Dialog
  pickOutputDir(): Promise<string | null>;
  pickFile(options?: { filters?: Array<{ name: string; extensions: string[] }> }): Promise<string | null>;
  saveFile(options?: { defaultPath?: string; filters?: Array<{ name: string; extensions: string[] }> }): Promise<string | null>;

  // ─ Shell
  openExternal(url: string): Promise<void>;
  revealInFinder(filePath: string): Promise<void>;

  // ─ Project
  saveProject(schema: ProjectSchema, filePath: string): Promise<void>;
  loadProject(filePath: string): Promise<ProjectSchema>;
  getRecentProjects(): Promise<string[]>;

  // ─ Export
  exportZip(schema: ProjectSchema): Promise<{ ok: boolean; filePath?: string }>;
  exportFolder(schema: ProjectSchema): Promise<{ ok: boolean; outputDir?: string }>;
  exportPreview(schema: ProjectSchema): Promise<{ ok: boolean; url?: string }>;

  // ─ PDF
  exportMenuPdf(schema: ProjectSchema): Promise<ExportPdfResult>;

  // ─ QR
  generateQr(url: string, opts?: QrOptions): Promise<QrResult>;
  saveQr(url: string, opts?: QrOptions): Promise<QrResult>;

  // ─ Background removal
  removeBackground(imagePath: string): Promise<BgRemovalResult>;

  // ─ Updater
  updaterCheck(): Promise<void>;
  updaterInstall(): Promise<void>;
  updaterVersion(): Promise<string>;
  onUpdaterEvent(cb: (e: unknown) => void): () => void;

  // ─ Network
  networkIsOnline(): Promise<boolean>;
  networkProbe(url: string): Promise<boolean>;
  onNetworkChange(cb: (e: unknown) => void): () => void;
}

export function usePlated(): PlatedApi {
  if (typeof window === 'undefined' || !window.plated) {
    throw new Error('[usePlated] window.plated is not available. Are you running inside Electron?');
  }
  return window.plated;
}
