import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const vendorChunks: Record<string, string[]> = {
  markdown: ['react-markdown', 'remark-', 'rehype-', 'micromark', 'mdast-', 'hast-', 'unified', 'highlight.js', 'lowlight', 'unist-', 'vfile'],
  supabase: ['@supabase'],
  motion: ['framer-motion', 'motion-dom', 'motion-utils'],
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          for (const [chunk, needles] of Object.entries(vendorChunks)) {
            if (needles.some((needle) => id.includes(`node_modules/${needle}`))) return chunk
          }
          return undefined
        },
      },
    },
  },
})
