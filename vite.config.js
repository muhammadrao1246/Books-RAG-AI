import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  usePolling: true,
  server: {    
    // this ensures that the browser opens upon server start
    open: true,
    // this sets a default port to 3000  
    port: 3000, 
  },
  resolve:{
    alias: {
      src: '/src',
      // pages: '/src/pages',
      // components: '/src/components',
      // helpers: '/src/helpers',
      // assets: '/src/assets',
      // services: '/src/services',
      // utils: '/src/utils'
    }
  },
  build: {
    rollupOptions:{
      external: [
        // "js/mui-player-desktop-plugin.min.js"
        // ""
      ],
    }
  }
})
