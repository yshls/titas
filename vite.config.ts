import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'fs';

export default defineConfig({
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: true,
    https: (() => {
      const keyPath = './.certs/localhost-key.pem';
      const certPath = './.certs/localhost.pem';

      if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        console.log('⚠️  SSL certificates not found, using HTTP for local dev');
        return undefined;
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
    // 소스맵에는 원본 코드 전문이 담겨 배포 시 전체 소스가 공개된다.
    // 로컬 디버깅이 필요하면 일시적으로 true로 두고 빌드할 것.
    sourcemap: false,
    rollupOptions: {
      external: ['sharp', 'onnxruntime-node'],
      output: {
        // 배포마다 바뀌는 앱 코드와, 거의 바뀌지 않는 라이브러리를 분리해
        // 재방문 시 라이브러리 청크가 캐시에서 재사용되도록 한다.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-motion': ['framer-motion'],
          'vendor-i18n': [
            'i18next',
            'react-i18next',
            'i18next-browser-languagedetector',
          ],
        },
      },
    },
  },
  worker: {
    format: 'es',
  },
});
