// @nexcms/builder — Electron preload
// Exposes a typed, sandboxed `window.nexcms` API to the renderer.
// Every channel must be explicitly listed here — no open proxies.

import { contextBridge, ipcRenderer } from 'electron';
import type { ProjectSchema } from '@nexcms/types';

// ---- Channel constants (single source of truth) ----------------------------
export const IPC = {
  // Generator
  GENERATE: 'nexcms:generate',
  GENERATE_DRY_RUN: 'nexcms:generate:dryRun',
  // Dialog
  PICK_OUTPUT_DIR: 'nexcms:dialog:pickOutputDir',
  PICK_FILE: 'nexcms:dialog:pickFile',
  SAVE_FILE: 'nexcms:dialog:saveFile',
  // Shell
  OPEN_EXTERNAL: 'nexcms:shell:openExternal',
  REVEAL_IN_FINDER: 'nexcms:shell:revealInFinder',
  // Project
  PROJECT_SAVE: 'nexcms:project:save',
  PROJECT_LOAD: 'nexcms:project:load',
  PROJECT_RECENT: 'nexcms:project:recent',
} as const;

export type IpcChannels = (typeof IPC)[keyof typeof IPC];

// ---- Typed API exposed to renderer ------------------------------------------

contextBridge.exposeInMainWorld('nexcms', {
  /**
   * Run the full generator and write output to disk.
   * Returns GenerateResult.
   */
  generate(
    schema: ProjectSchema,
    outputDir: string,
    includeSource = true,
  ) {
    return ipcRenderer.invoke(IPC.GENERATE, { schema, outputDir, includeSource });
  },

  /**
   * Dry-run: resolve the template and return file count + warnings
   * without writing anything to disk. Used by the wizard preview.
   */
  generateDryRun(schema: ProjectSchema) {
    return ipcRenderer.invoke(IPC.GENERATE_DRY_RUN, { schema });
  },

  /**
   * Open a native folder picker. Returns the selected path or null.
   */
  pickOutputDir(): Promise<string | null> {
    return ipcRenderer.invoke(IPC.PICK_OUTPUT_DIR);
  },

  /**
   * Open a native file picker. Returns the selected file path or null.
   */
  pickFile(options?: { filters?: Electron.FileFilter[] }): Promise<string | null> {
    return ipcRenderer.invoke(IPC.PICK_FILE, options);
  },

  /**
   * Save a file via native save dialog. Returns the chosen path or null.
   */
  saveFile(options?: { defaultPath?: string; filters?: Electron.FileFilter[] }): Promise<string | null> {
    return ipcRenderer.invoke(IPC.SAVE_FILE, options);
  },

  /**
   * Open a URL in the system browser.
   */
  openExternal(url: string): Promise<void> {
    return ipcRenderer.invoke(IPC.OPEN_EXTERNAL, url);
  },

  /**
   * Reveal a path in Finder / Explorer.
   */
  revealInFinder(filePath: string): Promise<void> {
    return ipcRenderer.invoke(IPC.REVEAL_IN_FINDER, filePath);
  },

  /**
   * Persist a ProjectSchema to the most recently opened project file.
   */
  saveProject(schema: ProjectSchema, filePath: string): Promise<void> {
    return ipcRenderer.invoke(IPC.PROJECT_SAVE, { schema, filePath });
  },

  /**
   * Load a ProjectSchema from disk by file path.
   */
  loadProject(filePath: string): Promise<ProjectSchema> {
    return ipcRenderer.invoke(IPC.PROJECT_LOAD, { filePath });
  },

  /**
   * Return the list of recently opened project file paths.
   */
  getRecentProjects(): Promise<string[]> {
    return ipcRenderer.invoke(IPC.PROJECT_RECENT);
  },
});
