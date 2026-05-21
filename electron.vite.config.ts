import { cpSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import type { Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendererSrc = path.resolve(__dirname, 'src/renderer/src');

// Copy main-process static assets (tray icons) into the build output. The main
// bundle is SSR-bundled, so Vite doesn't fingerprint/emit these for us.
function copyMainAssets(): Plugin {
  return {
    name: 'copy-main-assets',
    closeBundle() {
      const from = path.resolve(__dirname, 'src/main/assets');
      const to = path.resolve(__dirname, 'out/main/assets');
      mkdirSync(to, { recursive: true });
      cpSync(from, to, { recursive: true });
    },
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(), copyMainAssets()],
    resolve: {
      alias: [{ find: '@shared', replacement: path.resolve(__dirname, 'src/shared') }],
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: [{ find: '@shared', replacement: path.resolve(__dirname, 'src/shared') }],
    },
  },
  renderer: {
    root: path.resolve(__dirname, 'src/renderer'),
    plugins: [react()],
    resolve: {
      alias: [
        { find: '@app', replacement: rendererSrc },
        { find: '@features', replacement: path.resolve(rendererSrc, 'features') },
        { find: '@shared', replacement: path.resolve(rendererSrc, 'shared') },
        { find: '@icons', replacement: path.resolve(rendererSrc, 'shared/ui/icons/index.ts') },
      ],
    },
    build: {
      rollupOptions: {
        input: { index: path.resolve(__dirname, 'src/renderer/index.html') },
      },
    },
  },
});
