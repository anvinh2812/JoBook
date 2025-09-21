import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isProd = process.env.NODE_ENV === 'production'

// Nếu production thì gọi thẳng API domain
const backendTarget = isProd
  ? 'https://api.jobook.io.vn'
  : 'http://localhost:5001'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: backendTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    __API_BASE_URL__: JSON.stringify(
      isProd ? 'https://api.jobook.io.vn/api' : '/api'
    )
  }
})
