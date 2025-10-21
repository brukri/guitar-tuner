import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If deploying to GitHub Pages under a repository subpath, set base to '/<repo>/'
// We read from process.env.GHP_BASE if provided by an action, otherwise default to '/'
const base = process.env.GHP_BASE ?? '/'

export default defineConfig({
  plugins: [react()],
  base,
})
