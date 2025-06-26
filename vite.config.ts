import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(({ mode }: { mode: string }) => ({
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === 'analyze'
      ? [
          visualizer({
            filename: 'dist/stats.html',
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],

  resolve: {
    alias: [
      { find: '@', replacement: '/src' },
      { find: '@/components', replacement: '/src/components' },
      { find: '@/assets', replacement: '/src/assets' },
      { find: '@config', replacement: '/src/config' },
      { find: '@hooks', replacement: '/src/hooks' },
      { find: '@utils', replacement: '/src/utils' },
      { find: '@types', replacement: '/src/types' },
      { find: '@workers', replacement: '/src/workers' },
    ],
  },
}));
