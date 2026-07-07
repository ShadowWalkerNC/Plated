import { defineConfig } from 'vitest/config';

/**
 * Separate vitest config for the Electron main-process handlers.
 *
 * Why separate from src/vitest.config.ts?
 *  - Electron IPC code runs in Node.js, not a browser — environment must be
 *    'node', not 'jsdom'.
 *  - The handlers import Node built-ins (fs/promises, os, path) and
 *    workspace packages directly; no DOM setup file needed.
 *
 * background.ts is intentionally excluded:
 *  - It spawns a real BrowserWindow, which requires a running Electron
 *    runtime and cannot be unit-tested in vitest.
 */
export default defineConfig({
  test: {
    globals:     true,
    environment: 'node',
    include:     ['electron/**/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include:  ['electron/**/*.ts'],
      exclude:  ['electron/**/__tests__/**', 'electron/bg-worker.html'],
    },
  },
});
