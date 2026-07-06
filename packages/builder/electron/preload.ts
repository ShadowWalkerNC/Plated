import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('nexcms', {
  // ─ Generator
  generate:           (schema: unknown)  => ipcRenderer.invoke('generate', schema),

  // ─ Dialog
  openFile:           ()                 => ipcRenderer.invoke('dialog:openFile'),
  saveFile:           (data: unknown)    => ipcRenderer.invoke('dialog:saveFile', data),

  // ─ Shell
  openExternal:       (url: string)      => ipcRenderer.invoke('shell:openExternal', url),

  // ─ Export
  exportZip:          (schema: unknown)  => ipcRenderer.invoke('export:zip',     schema),
  exportFolder:       (schema: unknown)  => ipcRenderer.invoke('export:folder',  schema),
  exportPreview:      (schema: unknown)  => ipcRenderer.invoke('export:preview', schema),

  // ─ Updater
  updaterCheck:       ()                 => ipcRenderer.invoke('updater:check'),
  updaterInstall:     ()                 => ipcRenderer.invoke('updater:install'),
  updaterVersion:     ()                 => ipcRenderer.invoke('updater:version'),
  onUpdaterEvent: (cb: (e: unknown) => void) => {
    const handler = (_: Electron.IpcRendererEvent, e: unknown) => cb(e);
    ipcRenderer.on('updater:event', handler);
    return () => ipcRenderer.off('updater:event', handler);
  },

  // ─ Network
  networkIsOnline:    ()                 => ipcRenderer.invoke('network:isOnline'),
  networkProbe:       (url: string)      => ipcRenderer.invoke('network:probe', url),
  onNetworkChange: (cb: (e: unknown) => void) => {
    const handler = (_: Electron.IpcRendererEvent, e: unknown) => cb(e);
    ipcRenderer.on('network:change', handler);
    return () => ipcRenderer.off('network:change', handler);
  },
});
