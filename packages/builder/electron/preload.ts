import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('plated', {
  // ─ Generator
  generate:            (schema: unknown, outputDir: string, includeSource?: boolean) =>
    ipcRenderer.invoke('generate', { schema, outputDir, includeSource }),
  generateDryRun:      (schema: unknown) =>
    ipcRenderer.invoke('generate:dryRun', { schema }),

  // ─ Dialog
  pickOutputDir:       () =>
    ipcRenderer.invoke('dialog:pickOutputDir'),
  pickFile:            (options?: unknown) =>
    ipcRenderer.invoke('dialog:pickFile', options),
  saveFile:            (options?: unknown) =>
    ipcRenderer.invoke('dialog:saveFile', options),

  // ─ Shell
  openExternal:        (url: string) =>
    ipcRenderer.invoke('shell:openExternal', url),
  revealInFinder:      (filePath: string) =>
    ipcRenderer.invoke('shell:revealInFinder', filePath),

  // ─ Project
  saveProject:         (schema: unknown, filePath: string) =>
    ipcRenderer.invoke('project:save', { schema, filePath }),
  loadProject:         (filePath: string) =>
    ipcRenderer.invoke('project:load', { filePath }),
  getRecentProjects:   () =>
    ipcRenderer.invoke('project:recent'),

  // ─ Export
  exportZip:           (schema: unknown) =>
    ipcRenderer.invoke('export:zip',     schema),
  exportFolder:        (schema: unknown) =>
    ipcRenderer.invoke('export:folder',  schema),
  exportPreview:       (schema: unknown) =>
    ipcRenderer.invoke('export:preview', schema),

  // ─ Updater
  updaterCheck:        () => ipcRenderer.invoke('updater:check'),
  updaterInstall:      () => ipcRenderer.invoke('updater:install'),
  updaterVersion:      () => ipcRenderer.invoke('updater:version'),
  onUpdaterEvent: (cb: (e: unknown) => void) => {
    const handler = (_: Electron.IpcRendererEvent, e: unknown) => cb(e);
    ipcRenderer.on('updater:event', handler);
    return () => ipcRenderer.off('updater:event', handler);
  },

  // ─ Network
  networkIsOnline:     () => ipcRenderer.invoke('network:isOnline'),
  networkProbe:        (url: string) => ipcRenderer.invoke('network:probe', url),
  onNetworkChange: (cb: (e: unknown) => void) => {
    const handler = (_: Electron.IpcRendererEvent, e: unknown) => cb(e);
    ipcRenderer.on('network:change', handler);
    return () => ipcRenderer.off('network:change', handler);
  },
});
