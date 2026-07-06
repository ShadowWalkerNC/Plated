// @nexcms/builder — Electron main process (v2)
import {
  app, BrowserWindow, ipcMain, dialog, shell, nativeTheme, powerMonitor,
} from 'electron';
import { join }            from 'node:path';
import { autoUpdater }     from 'electron-updater';
import { registerGeneratorHandlers } from './ipc/generator';
import { registerDialogHandlers }    from './ipc/dialog';
import { registerShellHandlers }     from './ipc/shell';
import { registerExportHandlers }    from './ipc/export';
import { registerUpdateHandlers }    from './ipc/updater';
import { registerNetworkHandlers }   from './ipc/network';

const isDev = !app.isPackaged;
const VITE_DEV_URL = 'http://localhost:5173';

let mainWindow:   BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

// ── Splash ─────────────────────────────────────────────────────────────
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

// ── Main window ───────────────────────────────────────────────────────
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1320, height: 860,
    minWidth: 1024, minHeight: 700,
    title: 'NexCMS Builder',
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
    if (!isDev) {
      // Slight delay so the window paint is visible before update check
      setTimeout(() => autoUpdater.checkForUpdatesAndNotify(), 3000);
    }
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Forward online/offline events to renderer
  powerMonitor.on('on-ac',  () => mainWindow?.webContents.send('network:change', { online: true  }));
  powerMonitor.on('on-battery', () => mainWindow?.webContents.send('network:change', { online: true }));
}

// ── IPC ─────────────────────────────────────────────────────────────────
function registerIpc(): void {
  registerGeneratorHandlers(ipcMain);
  registerDialogHandlers(ipcMain, dialog);
  registerShellHandlers(ipcMain, shell);
  registerExportHandlers(ipcMain, dialog);
  registerUpdateHandlers(ipcMain, autoUpdater, mainWindow);
  registerNetworkHandlers(ipcMain);
}

// ── Auto-updater config ─────────────────────────────────────────────────
function configureAutoUpdater(): void {
  autoUpdater.autoDownload    = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on('checking-for-update',     () => sendUpdaterEvent('checking'));
  autoUpdater.on('update-available',   (info) => sendUpdaterEvent('available',    info));
  autoUpdater.on('update-not-available',(info) => sendUpdaterEvent('not-available', info));
  autoUpdater.on('download-progress',   (p)   => sendUpdaterEvent('progress',    p));
  autoUpdater.on('update-downloaded',   (info) => sendUpdaterEvent('downloaded',  info));
  autoUpdater.on('error',               (err) => sendUpdaterEvent('error',       { message: err.message }));
}

function sendUpdaterEvent(type: string, payload?: unknown): void {
  mainWindow?.webContents.send('updater:event', { type, payload });
}

// ── App lifecycle ─────────────────────────────────────────────────────────
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
    event.preventDefault();
  });
});
