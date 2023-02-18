import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
      },
    },
  },
});
