import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// New portfolio app lives at the repo root. The old site (my-portfolio) and the
// design handoff bundle (ayush-portfolio-handoff) stay nested as references and
// are excluded from this app's build.
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5191,
    strictPort: false,
    fs: { strict: true },
  },
})
