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
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // Suppress noisy WS abort errors during dev reloads
            if (err.code === 'ECONNABORTED' || err.code === 'ECONNRESET' || err.code === 'EPIPE') {
              return
            }
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