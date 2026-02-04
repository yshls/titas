import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: true,
    https: (() => {
      const keyPath = './.certs/localhost-key.pem';
      const certPath = './.certs/localhost.pem';
      if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        throw new Error(
          'SSL certificate files not found in ./.certs/. Please generate them for local development. See project documentation for details.',
        );
      }
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    })(),

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
