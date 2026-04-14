import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: true,
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks for heavy dependencies
          if (id.includes('node_modules/three')) {
            return 'three-vendor';
          }
          if (id.includes('node_modules/react-globe')) {
            return 'globe-chunk';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion-chunk';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase-chunk';
          }
          if (id.includes('node_modules/react')) {
            return 'react-vendor';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    reportCompressedSize: true,
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false,
  },
  optimize: {
    esbuildOptions: {
      // Drop console logs
      pure: ['console.log', 'console.info'],
    },
  },
})