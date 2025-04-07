import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // 청크 경고 크기 조정 (필요에 따라 값 조절)
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // 큰 라이브러리 수동 분할
        manualChunks(id) {
          // node_modules의 큰 라이브러리 분리
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
