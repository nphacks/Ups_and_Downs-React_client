import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  optimizeDeps: {
    exclude: ['three-stdlib']
  },
  assetsInclude: ['**/*.glb'],
  build: {
    sourcemap: true, // Add this for debugging
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
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
  }
})