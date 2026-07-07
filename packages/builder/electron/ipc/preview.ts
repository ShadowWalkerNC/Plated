/**
 * preview.ts — IPC handlers for the in-app site preview window.
 *
 * Channels:
 *   preview:open   → generate site to temp dir, start Astro/sirv server,
 *                    open the URL in a child BrowserWindow.
 *   preview:reload → re-generate and reload the preview window.
 *   preview:close  → destroy the preview window + kill the server.
 *   preview:isOpen → returns { open: boolean }.
 *
 * The preview uses a standalone BrowserWindow (not BrowserView) so it can
 * float alongside the builder. The child window does NOT have node integration.
 */
import type { IpcMain }   from 'electron';
import { BrowserWindow }  from 'electron';
import { generate }       from '@plated/generator';
import { spawn }          from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { rm }             from 'node:fs/promises';
import { tmpdir }         from 'node:os';
import { join }           from 'node:path';
import { randomUUID }     from 'node:crypto';
import type { ProjectSchema } from '@plated/types';

let previewWindow: BrowserWindow | null = null;
let previewServer: ChildProcess | null  = null;
let previewTmpDir: string | null        = null;
let previewUrl:    string | null        = null;

async function startPreview(schema: ProjectSchema): Promise<string> {
  // Tear down any previous preview
  await stopPreview();

  const tmpOut = join(tmpdir(), `plated-preview-${randomUUID()}`);
  previewTmpDir = tmpOut;

  await generate(schema, tmpOut);

  // Pick a random available port
  const port = await getFreePort();

  // Try to serve via npx serve (static), falling back to sirv or http-server
  previewServer = spawn('npx', ['--yes', 'serve', '-l', String(port), tmpOut], {
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });

  // Wait for the server to be ready (poll for up to 10 s)
  const url = `http://127.0.0.1:${port}`;
  await waitForPort(url, 10_000);
  previewUrl = url;
  return url;
}

async function stopPreview(): Promise<void> {
  previewServer?.kill();
  previewServer = null;
  previewUrl = null;
  if (previewTmpDir) {
    await rm(previewTmpDir, { recursive: true, force: true });
    previewTmpDir = null;
  }
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const net    = require('node:net') as typeof import('node:net');
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('Could not determine free port'));
      });
    });
  });
}

function waitForPort(url: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const http = require('node:http') as typeof import('node:http');
    function attempt() {
      http.get(url, (res) => {
        res.destroy();
        resolve();
      }).on('error', () => {
        if (Date.now() > deadline) { reject(new Error(`Preview server at ${url} never started`)); return; }
        setTimeout(attempt, 200);
      });
    }
    attempt();
  });
}

export function registerPreviewHandlers(ipcMain: IpcMain): void {
  // ── preview:open ──────────────────────────────────────────────────────────────
  ipcMain.handle('preview:open', async (_event, schema: ProjectSchema) => {
    const url = await startPreview(schema);

    if (!previewWindow || previewWindow.isDestroyed()) {
      previewWindow = new BrowserWindow({
        width:  1200,
        height: 860,
        title:  'Plated Preview',
        webPreferences: {
          nodeIntegration:  false,
          contextIsolation: true,
          sandbox:          true,
        },
      });
      previewWindow.on('closed', () => {
        previewWindow = null;
        stopPreview().catch(() => { /* silent */ });
      });
    }

    previewWindow.loadURL(url);
    previewWindow.show();
    return { ok: true, url };
  });

  // ── preview:reload ─────────────────────────────────────────────────────────────
  ipcMain.handle('preview:reload', async (_event, schema: ProjectSchema) => {
    if (!previewWindow || previewWindow.isDestroyed()) {
      return { ok: false, reason: 'no preview window open' };
    }
    const url = await startPreview(schema);
    previewWindow.loadURL(url);
    return { ok: true, url };
  });

  // ── preview:close ─────────────────────────────────────────────────────────────
  ipcMain.handle('preview:close', async () => {
    previewWindow?.close();
    previewWindow = null;
    await stopPreview();
    return { ok: true };
  });

  // ── preview:isOpen ────────────────────────────────────────────────────────────
  ipcMain.handle('preview:isOpen', () => {
    return { ok: true, open: !!previewWindow && !previewWindow.isDestroyed() };
  });
}
