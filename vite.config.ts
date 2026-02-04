import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, './.certs/localhost-key.pem'),
      ),
      cert: fs.readFileSync(path.resolve(__dirname, './.certs/localhost.pem')),
    },
    headers: {
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Cross-Origin-Opener-Policy': 'same-origin',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['@xenova/transformers', 'sharp', 'onnxruntime-node'],
    include: ['onnxruntime-web'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['sharp', 'onnxruntime-node'],
    },
  },
  worker: {
    format: 'es',
  },
});
