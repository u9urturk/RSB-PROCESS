import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import pkg from './package.json' assert { type: 'json' };
import { execSync } from 'child_process';

// NOTE: This JS config mirrors vite.config.ts so that if Vite loads this file
// (due to tooling precedence) we still have path aliases & env defines.
// Prefer keeping only one config (remove this file) to avoid divergence.

const gitSha = (() => {
  try { return execSync('git rev-parse --short HEAD').toString().trim(); } catch { return 'dev'; }
})();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: { host: '0.0.0.0' },
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(pkg.version),
    'import.meta.env.GIT_SHA': JSON.stringify(gitSha)
  }
});