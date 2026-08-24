import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import basicSsl from '@vitejs/plugin-basic-ssl';
import fs from 'fs';

export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    host: true,
    // Supabase OAuth의 Redirect URLs 허용목록은 origin이 정확히 일치해야 한다.
    // 포트가 밀리면(5173→5174→…) redirectTo가 목록에 없는 값이 되고,
    // Supabase는 에러 대신 조용히 Site URL(배포 주소)로 폴백해버린다.
    // 포트를 못 잡으면 다른 포트로 뜨지 말고 실패하게 둔다.
    port: 5173,
    strictPort: true,
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
  test: {
    // tests/·e2e/의 Playwright 스펙까지 Vitest가 실행하지 않도록 src 안으로 제한한다.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    environment: 'node',
    // supabaseClient는 키가 없으면 모듈을 읽는 순간 예외를 던진다.
    // 실제 통신은 하지 않으므로 테스트에서만 형식이 맞는 더미 값을 넣어준다.
    env: {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    },
  },
});
