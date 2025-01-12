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
    outDir: 'dist',
    assetsDir: 'assets',
   rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || '';
          if (/\.glb$/.test(name)) {
            return 'assets/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
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