import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://walke954.github.io/wedding/ on GitHub Pages.
  base: '/wedding/',
  plugins: [react()],
})
