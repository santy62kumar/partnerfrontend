import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import tailwindcss from "@tailwindcss/vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
      '@components': path.resolve(rootDir, './src/components'),
      '@pages': path.resolve(rootDir, './src/pages'),
      '@store': path.resolve(rootDir, './src/store'),
      '@api': path.resolve(rootDir, './src/api'),
      '@utils': path.resolve(rootDir, './src/utils'),
      '@hooks': path.resolve(rootDir, './src/hooks'),
      '@assets': path.resolve(rootDir, './src/assets'),
    },
  },
  build: {
    sourcemap: false, // Don't expose source maps in production
  },
  server: {
    port: 3000,
    open: true,
    headers: {
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "frame-ancestors 'none'",
    },
  },
});
