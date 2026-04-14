import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/sgs-raga-sagra/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'globe': ['react-globe.gl', 'three'],
          'vendor': ['react', 'react-dom', 'framer-motion'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  server: {
    middlewareMode: false,
  },
})