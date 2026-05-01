import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
/*
export default defineConfig({
  plugins: [react()],
})*/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://26.227.33.49:9000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
