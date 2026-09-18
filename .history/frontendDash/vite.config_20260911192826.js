import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
        // Fix: Don't let Vite's proxy intercept the WS handshake incorrectly
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Swallow harmless WS abort errors during HMR reloads
            if (['ECONNABORTED', 'ECONNRESET', 'EPIPE'].includes(err.code)) return
            console.warn('Proxy error:', err.message)
          })
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'maplibre-gl',
      '@deck.gl/mapbox',
      '@deck.gl/layers',
      '@deck.gl/core',
    ],
    esbuildOptions: { target: 'es2020' },
  },
})