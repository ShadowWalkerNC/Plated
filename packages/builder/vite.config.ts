import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: resolve(__dirname),
  base: './',
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true,
  },
  server: {
    port: 5180,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
