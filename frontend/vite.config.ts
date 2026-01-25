import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/', // <--- CAMBIO CRÍTICO: Debe ser la raíz para Vercel
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})