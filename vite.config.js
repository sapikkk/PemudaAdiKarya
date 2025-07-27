import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  // Konfigurasi khusus untuk deployment
  build: {
    // Target modern browsers for better performance
    target: 'esnext',
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ui: ['primevue']
        }
      }
    },
    
    // Ensure all assets have proper paths
    assetsDir: 'assets',
    
    // Generate source maps for debugging
    sourcemap: false,
    
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // Server configuration for development
  server: {
    port: 3000,
    host: true, // Allow external connections
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Preview configuration
  preview: {
    port: 3000,
    host: true
  },

  // Base URL configuration - important for Vercel
  base: '/',

  // Define environment variables
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})
