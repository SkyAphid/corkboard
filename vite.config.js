import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],

  server: {
    port: 3000
  },

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url))
    }
  },

  build: {
    chunkSizeWarningLimit: 1024, // Set to a higher value (e.g., 1000 kB)
  },

})
