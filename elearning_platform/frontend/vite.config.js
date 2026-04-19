import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api/auth': {
        target: 'http://auth-service:8001',
        changeOrigin: true,
      },
      '/api/courses': {
        target: 'http://course-service:8002',
        changeOrigin: true,
      },
      '/api/enroll': {
        target: 'http://enrollment-service:8003',
        changeOrigin: true,
      },
      '/api/quizzes': {
        target: 'http://quiz-service:8004',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://auth-service:8001',
        changeOrigin: true,
      }
    }
  }
})
