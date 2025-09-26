import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBasePath = '/driveroptimaization/';

export default defineConfig(({ command }) => ({
  base: command === 'serve' ? '/' : repoBasePath,
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
}));
