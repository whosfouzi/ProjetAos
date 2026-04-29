import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 80,
    strictPort: true,
    allowedHosts: true,
    hmr: {
      clientPort: 3000
    },

    proxy: {
      '/api/auth': {
        target: 'http://auth-service:8001',
        changeOrigin: true,
        xfwd: true,
      },
      '/api/courses': {
        target: 'http://course-service:8002',
        changeOrigin: true,
        xfwd: true,
      },
      '/api/enroll': {
        target: 'http://enrollment-service:8003',
        changeOrigin: true,
        xfwd: true,
      },
      '/api/quizzes': {
        target: 'http://quiz-service:8004',
        changeOrigin: true,
        xfwd: true,
      },
      '/media': {
        target: 'http://auth-service:8001',
        changeOrigin: true,
        xfwd: true,
      }
    }
  }
})
