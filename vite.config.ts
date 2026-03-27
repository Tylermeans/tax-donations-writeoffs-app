import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // GitHub Pages deploys to /tax-donations-writeoffs-app/ subfolder
  base: '/tax-donations-writeoffs-app/',
})
