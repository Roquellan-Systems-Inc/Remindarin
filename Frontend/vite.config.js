import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',

  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
  },

  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true,
      },
    },
  },

  esbuild: {
    target: 'esnext',
    legalComments: 'none',
    treeShaking: true,
  },
})