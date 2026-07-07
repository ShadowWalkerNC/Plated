// Plated Builder — Electron main process
import {
  app, BrowserWindow, ipcMain, dialog, shell, nativeTheme, powerMonitor,
} from 'electron';
import { join }            from 'node:path';
import { autoUpdater }     from 'electron-updater';
import { registerGeneratorHandlers }    from './ipc/generator.js';
import { registerDialogHandlers }       from './ipc/dialog.js';
import { registerShellHandlers }        from './ipc/shell.js';
import { registerExportHandlers }       from './ipc/export.js';
import { registerUpdateHandlers }       from './ipc/updater.js';
import { registerNetworkHandlers }      from './ipc/network.js';
import { registerProjectHandlers }      from './ipc/project.js';
import { registerPdfHandlers }          from './ipc/pdf.js';
import { registerQrHandlers }           from './ipc/qr.js';
import { registerBackgroundHandlers }   from './ipc/background.js';
import { registerPreviewHandlers }      from './ipc/preview.js';

const isDev = !app.isPackaged;
const VITE_DEV_URL = 'http://localhost:5173';

let mainWindow:   BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

function createSplash(): void {
  splashWindow = new BrowserWindow({
    width: 480, height: 300,
    frame: false, transparent: true,
    alwaysOnTop: true, resizable: false,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
  });
  splashWindow.loadFile(join(__dirname, '..', 'splash.html'));
}

function closeSplash(): void {
  if (splashWindow) { splashWindow.close(); splashWindow = null; }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1320, height: 860,
    minWidth: 1024, minHeight: 700,
    title: 'Plated Builder',
    show: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#18140f' : '#fcf8f3',
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL(VITE_DEV_URL);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(join(__dirname, '..', 'renderer', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    closeSplash();
    mainWindow?.show();
    if (!isDev) setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 3000);
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  powerMonitor.on('on-ac',      () => mainWindow?.webContents.send('network:change', { online: true }));
  powerMonitor.on('on-battery', () => mainWindow?.webContents.send('network:change', { online: true }));
}

function registerIpc(): void {
  registerGeneratorHandlers(ipcMain);
  registerDialogHandlers(ipcMain, dialog);
  registerShellHandlers(ipcMain, shell);
  registerExportHandlers(ipcMain, dialog);
  registerUpdateHandlers(ipcMain, autoUpdater, mainWindow);
  registerNetworkHandlers(ipcMain);
  registerProjectHandlers(ipcMain);
  registerPdfHandlers(ipcMain, dialog);
  registerQrHandlers(ipcMain, dialog);
  registerBackgroundHandlers(ipcMain);
  registerPreviewHandlers(ipcMain);
}

function configureAutoUpdater(): void {
  autoUpdater.autoDownload         = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update',       () => send('checking'));
  autoUpdater.on('update-available',    (i)  => send('available',     i));
  autoUpdater.on('update-not-available', (i)  => send('not-available', i));
  autoUpdater.on('download-progress',    (p)  => send('progress',      p));
  autoUpdater.on('update-downloaded',    (i)  => send('downloaded',    i));
  autoUpdater.on('error',                (e)  => send('error', { message: e.message }));
}

function send(type: string, payload?: unknown): void {
  mainWindow?.webContents.send('updater:event', { type, payload });
}

app.whenReady().then(() => {
  if (!isDev) createSplash();
  configureAutoUpdater();
  registerIpc();
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('web-contents-created', (_e, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (isDev && url.startsWith(VITE_DEV_URL)) return;
    // Allow the preview server origin through
    if (url.startsWith('http://127.0.0.1:')) return;
    event.preventDefault();
  });
});
