import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proxy API calls to the processor backend — no backend changes needed.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // 127.0.0.1 rather than localhost: localhost can resolve to ::1 and hit
      // whatever else is bound to port 3000 on IPv6.
      '/resarch': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
    },
  },
})
