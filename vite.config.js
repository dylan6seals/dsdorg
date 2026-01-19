import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 3000
    // Note: API routes won't work in pure Vite dev mode
    // Use 'vercel dev' instead to test API endpoints locally
  }
});
