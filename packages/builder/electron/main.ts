// @nexcms/builder — Electron main process
// Boots the BrowserWindow, loads Vite dev server (dev) or built dist (prod),
// and registers all IPC handlers.

import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import { join } from 'node:path';
import { registerGeneratorHandlers } from './ipc/generator';
import { registerDialogHandlers } from './ipc/dialog';
import { registerShellHandlers } from './ipc/shell';

const isDev = !app.isPackaged;
const VITE_DEV_URL = 'http://localhost:5173';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'NexCMS Builder',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#fcf8f3',
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

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Register all IPC channels before the window is ready
function registerIpc(): void {
  registerGeneratorHandlers(ipcMain);
  registerDialogHandlers(ipcMain, dialog);
  registerShellHandlers(ipcMain, shell);
}

// App lifecycle
app.whenReady().then(() => {
  registerIpc();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Prevent navigation away from the app
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    if (isDev && url.startsWith(VITE_DEV_URL)) return;
    event.preventDefault();
  });
});
