import { fileURLToPath } from 'node:url';
import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rendererSrc = path.resolve(__dirname, 'src/renderer/src');

// Tests target the renderer (React) + pure shared/main logic. The same aliases
// the renderer build uses, so test imports resolve identically.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@app', replacement: rendererSrc },
      { find: '@features', replacement: path.resolve(rendererSrc, 'features') },
      { find: '@shared', replacement: path.resolve(rendererSrc, 'shared') },
      { find: '@icons', replacement: path.resolve(rendererSrc, 'shared/ui/icons/index.ts') },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
