/**
 * preview.ts — IPC handlers for the Electron desktop preview window.
 *
 * Flow:
 *   1. Renderer calls preview:open with the current ProjectSchema.
 *   2. Main generates the site into a temp directory (OS tmpdir).
 *   3. Main starts a minimal http.createServer() serving the temp dir.
 *   4. Main opens a child BrowserWindow pointed at localhost:<port>.
 *   5. preview:reload regenerates + reloads the window contents.
 *   6. preview:close shuts down the server and closes the window.
 *
 * Why a local server instead of loadFile()?
 *   Astro sites that use <script type="module"> and dynamic imports need
 *   an http:// origin; file:// breaks module resolution in Chromium.
 */
import {
  BrowserWindow, ipcMain, nativeTheme,
} from 'electron';
import type { IpcMain } from 'electron';
import * as http    from 'node:http';
import * as fs      from 'node:fs';
import * as path    from 'node:path';
import * as os      from 'node:os';
import * as url     from 'node:url';
import { generate } from '@plated/generator';
import type { ProjectSchema } from '@plated/types';

// ── Module-level singletons ────────────────────────────────────────────────

let previewWindow: BrowserWindow | null = null;
let previewServer: http.Server   | null = null;
let previewDir:    string        | null = null;
let previewPort:   number        | null = null;

// ── Helpers ───────────────────────────────────────────────────────────────

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

function serveDir(rootDir: string): http.RequestListener {
  return (req, res) => {
    const parsedUrl  = url.parse(req.url ?? '/');
    let   pathname   = decodeURIComponent(parsedUrl.pathname ?? '/');

    // Map / → /index.html
    if (pathname.endsWith('/')) pathname += 'index.html';

    let filePath = path.join(rootDir, pathname);

    // SPA fallback: if exact file not found, try /index.html
    if (!fs.existsSync(filePath)) {
      filePath = path.join(rootDir, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }

    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
  };
}

function startServer(rootDir: string): Promise<{ server: http.Server; port: number }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer(serveDir(rootDir));
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      if (!addr || typeof addr === 'string') {
        reject(new Error('preview server address unavailable'));
        return;
      }
      resolve({ server, port: addr.port });
    });
    server.on('error', reject);
  });
}

function stopServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!previewServer) { resolve(); return; }
    previewServer.close(() => {
      previewServer = null;
      previewPort   = null;
      resolve();
    });
  });
}

function openPreviewWindow(port: number): BrowserWindow {
  const win = new BrowserWindow({
    width:  1440,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    title: 'Plated — Preview',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#18140f' : '#fcf8f3',
    webPreferences: {
      // The preview window renders a plain static site — no preload needed.
      nodeIntegration:  false,
      contextIsolation: true,
      sandbox: true,
      // Allow the local http://127.0.0.1 origin
      allowRunningInsecureContent: false,
    },
  });

  win.loadURL(`http://127.0.0.1:${port}/`);

  win.on('closed', () => {
    previewWindow = null;
    void stopServer();
  });

  return win;
}

async function doGenerate(schema: ProjectSchema): Promise<string> {
  if (!previewDir) {
    previewDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plated-preview-'));
  }

  // Generate static files into previewDir
  const result = await generate(schema, path.join(previewDir, 'dist'));
  if (!result.success) {
    throw new Error(`Generation failed: ${result.errors.join('; ')}`);
  }

  return path.join(previewDir, 'dist');
}

// ── IPC handler registration ──────────────────────────────────────────────────

export function registerPreviewHandlers(_ipcMain: IpcMain): void {

  // preview:open — generate + serve + open window
  ipcMain.handle('preview:open', async (_event, schema: ProjectSchema) => {
    try {
      // If a preview window is already open, just reload it
      if (previewWindow && !previewWindow.isDestroyed()) {
        const distDir = await doGenerate(schema);
        void distDir; // server already running; just reload
        previewWindow.webContents.reloadIgnoringCache();
        previewWindow.focus();
        return { ok: true, port: previewPort };
      }

      const distDir              = await doGenerate(schema);
      const { server, port }     = await startServer(distDir);
      previewServer = server;
      previewPort   = port;
      previewWindow = openPreviewWindow(port);

      return { ok: true, port };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    }
  });

  // preview:reload — regen + reload existing window
  ipcMain.handle('preview:reload', async (_event, schema: ProjectSchema) => {
    try {
      if (!previewWindow || previewWindow.isDestroyed()) {
        return { ok: false, error: 'No preview window open' };
      }

      await doGenerate(schema);
      previewWindow.webContents.reloadIgnoringCache();
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    }
  });

  // preview:close — close window + stop server
  ipcMain.handle('preview:close', async () => {
    try {
      if (previewWindow && !previewWindow.isDestroyed()) {
        previewWindow.close();
      }
      await stopServer();
      previewDir = null;
      return { ok: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: message };
    }
  });

  // preview:isOpen — renderer can poll whether a window is visible
  ipcMain.handle('preview:isOpen', () => {
    return !!previewWindow && !previewWindow.isDestroyed();
  });
}
