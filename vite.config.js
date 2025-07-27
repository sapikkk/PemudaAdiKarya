import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  base: '/', // Pastikan ini sesuai dengan deployment
  server: {
    host: true, // Penting untuk akses mobile
    port: 3000
  }
})
