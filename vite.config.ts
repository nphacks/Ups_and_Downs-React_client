import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  optimizeDeps: {
    exclude: ['three-stdlib']
  },
  assetsInclude: ['**/*.glb'],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]'
      }
    }
  },
  server: {
    fs: {
      strict: false,
      allow: ['..']
    },
    middlewareMode: false,
    watch: {
      usePolling: true
    }
  },
  resolve: {
    assetsInclude: ['**/*.glb']
  }
})