import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        // Required for the Help Center WebSocket chat (/api/help/ws) to work through the
        // Vite dev proxy — without it, upgrade requests aren't forwarded to the backend.
        ws: true,
      },
    },
  },
  build: {
  chunkSizeWarningLimit: 1600,
  },
})
