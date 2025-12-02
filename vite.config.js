
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/React-project/',   // IMPORTANT: use your actual GitHub repo name here
})
