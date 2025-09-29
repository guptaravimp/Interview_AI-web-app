import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external connections
    cors: true, // Enable CORS
    hmr: {
      overlay: true // Show error overlay
    }
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    minify: 'esbuild'
  },
  base: '/',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  }
})
