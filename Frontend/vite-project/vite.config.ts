import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy API calls to the processor backend — no backend changes needed.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/resarch': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
