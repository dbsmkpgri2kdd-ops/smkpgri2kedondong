import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const basePath = process.env.VITE_BASE_PATH || '/';
  return {
    base: basePath,
    plugins: [
      react(),
      tailwindcss(),
      // Copies src/assets into dist/ and generates SPA route stubs + 404.html for GitHub Pages.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
          const indexHtmlPath = path.resolve(distDir, 'index.html');
          if (fs.existsSync(distDir) && fs.existsSync(indexHtmlPath)) {
            fs.writeFileSync(path.resolve(distDir, '.nojekyll'), '');
            fs.copyFileSync(indexHtmlPath, path.resolve(distDir, '404.html'));
            const spaRoutes = [
              'profil',
              'jurusan',
              'ppdb',
              'layanan',
              'literasi',
              'media',
              'kontak',
              'admin',
            ];
            for (const route of spaRoutes) {
              const routeDir = path.resolve(distDir, route);
              fs.mkdirSync(routeDir, {recursive: true});
              fs.copyFileSync(indexHtmlPath, path.resolve(routeDir, 'index.html'));
            }
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
