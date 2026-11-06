import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  worker: { format: 'es' },
  test: { environment: 'node', exclude: ['**/node_modules/**', '.claude/**', 'dist/**'] },
} as any)
