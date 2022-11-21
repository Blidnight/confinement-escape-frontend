import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'bootstrap' : path.resolve(__dirname, 'node_modules/bootstrap'),
      'buffer': path.resolve(__dirname, 'node_modules/buffer/'),
      'stream': path.resolve(__dirname, 'node_modules/stream-browserify/'),
      'assert': path.resolve(__dirname, 'node_modules/assert/') // don't forget  to install assert (npm i --save-dev assert)
    }
  },
  plugins: [react()],
  server: {
    port: 8080
  }
})
