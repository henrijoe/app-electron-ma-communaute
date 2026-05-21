import path from 'path';
import { readFileSync } from 'fs';
import checker from 'vite-plugin-checker';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

const PORT = 3039;
const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));
const appBuildDate = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
}).format(new Date());

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
        dev: { logLevel: ['error'] },
      },
      overlay: {
        position: 'tl',
        initialIsOpen: false,
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: { port: PORT, host: true },
  preview: { port: PORT, host: true },
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version || '1.0.0'),
    __APP_BUILD_DATE__: JSON.stringify(appBuildDate),
  },
  esbuild: mode === 'production' ? { drop: ['console', 'debugger'] } : {},
   // Configuration importante pour Vercel
  build: {
    outDir: 'dist',
    sourcemap: false, // Désactivez les sourcemaps pour une build plus rapide
  },
}));
