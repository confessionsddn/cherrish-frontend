import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: './index.html'
      }
    },
    // Don't hash OneSignal worker files
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1000
  }
})
