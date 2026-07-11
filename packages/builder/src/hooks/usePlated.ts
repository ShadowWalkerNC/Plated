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

const mockPlatedApi: PlatedApi = {
  generate: async (schema, outputDir) => {
    console.log('Mock generate called', schema, outputDir);
    return { success: true, outputDir, filesWritten: 35, errors: [], warnings: [], templateUsed: 'hearth' };
  },
  generateDryRun: async (schema) => {
    console.log('Mock generateDryRun called', schema);
    return { success: true, outputDir: '/mock/out', filesWritten: 35, errors: [], warnings: [], templateUsed: 'hearth' };
  },
  pickOutputDir: async () => {
    console.log('Mock pickOutputDir called');
    return '/mock/output-dir';
  },
  pickFile: async () => {
    console.log('Mock pickFile called');
    return '/mock/project.json';
  },
  saveFile: async () => {
    console.log('Mock saveFile called');
    return '/mock/saved-project.json';
  },
  openExternal: async (url) => {
    console.log('Mock openExternal called', url);
  },
  revealInFinder: async (filePath) => {
    console.log('Mock revealInFinder called', filePath);
  },
  saveProject: async (schema, filePath) => {
    console.log('Mock saveProject called', schema, filePath);
  },
  loadProject: async (filePath) => {
    console.log('Mock loadProject called', filePath);
    throw new Error('Not implemented in mock browser mode');
  },
  getRecentProjects: async () => {
    console.log('Mock getRecentProjects called');
    return [];
  },
  exportZip: async (schema) => {
    console.log('Mock exportZip called', schema);
    return { ok: true, filePath: '/mock/export.zip' };
  },
  exportFolder: async (schema) => {
    console.log('Mock exportFolder called', schema);
    return { ok: true, outputDir: '/mock/export-folder' };
  },
  exportPreview: async (schema) => {
    console.log('Mock exportPreview called', schema);
    return { ok: true, url: 'http://localhost:5180' };
  },
  exportMenuPdf: async (schema) => {
    console.log('Mock exportMenuPdf called', schema);
    return { ok: true, filePath: '/mock/menu.pdf' };
  },
  generateQr: async (url, opts) => {
    console.log('Mock generateQr called', url, opts);
    return { ok: true, dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' };
  },
  saveQr: async (url, opts) => {
    console.log('Mock saveQr called', url, opts);
    return { ok: true, filePath: '/mock/qr.png' };
  },
  removeBackground: async (imagePath) => {
    console.log('Mock removeBackground called', imagePath);
    return { ok: true, resultUrl: imagePath };
  },
  updaterCheck: async () => {},
  updaterInstall: async () => {},
  updaterVersion: async () => '0.2.0-mock',
  onUpdaterEvent: () => () => {},
  networkIsOnline: async () => true,
  networkProbe: async () => true,
  onNetworkChange: () => () => {},
};

export function usePlated(): PlatedApi {
  if (typeof window === 'undefined' || !window.plated) {
    console.warn('[usePlated] window.plated is not available. Falling back to browser mock API.');
    return mockPlatedApi;
  }
  return window.plated;
}
