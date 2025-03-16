import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@rainbow-me/rainbowkit',
      '@rainbow-me/rainbowkit/styles.css',
      'wagmi',
      '@tanstack/react-query'
    ],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  resolve: {
    dedupe: [
      '@rainbow-me/rainbowkit',
      'wagmi',
      'react',
      'react-dom'
    ]
  },
  build: {
    target: 'es2020',
  }
})
