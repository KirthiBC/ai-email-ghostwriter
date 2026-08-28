import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login1':'http://localhost:5000',
      '/signup1':'http://localhost:5000',
      '/history':'http://localhost:5000',
      '/generate-email': 'http://localhost:5000',
    }
  }
})
