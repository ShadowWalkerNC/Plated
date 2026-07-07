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
    ipcRenderer.invoke('export:zip',    schema),
  exportFolder:        (schema: unknown) =>
    ipcRenderer.invoke('export:folder', schema),
  // exportPreview is superseded by preview:open below but kept for
  // backwards compat with any SaaS renderer that calls it.
  exportPreview:       (schema: unknown) =>
    ipcRenderer.invoke('preview:open',  schema),

  // ─ Preview window
  previewOpen:         (schema: unknown) =>
    ipcRenderer.invoke('preview:open',   schema),
  previewReload:       (schema: unknown) =>
    ipcRenderer.invoke('preview:reload', schema),
  previewClose:        () =>
    ipcRenderer.invoke('preview:close'),
  previewIsOpen:       () =>
    ipcRenderer.invoke('preview:isOpen'),

  // ─ PDF
  exportMenuPdf:       (schema: unknown) =>
    ipcRenderer.invoke('pdf:exportMenu', schema),

  // ─ QR
  generateQr:          (url: string, opts?: unknown) =>
    ipcRenderer.invoke('qr:generate', { url, opts }),
  saveQr:              (url: string, opts?: unknown) =>
    ipcRenderer.invoke('qr:save',     { url, opts }),

  // ─ Background removal
  removeBackground:    (imagePath: string) =>
    ipcRenderer.invoke('bg:remove', imagePath),

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
