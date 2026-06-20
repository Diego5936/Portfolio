import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

const devApiProxy = process.env.VITE_DEV_API_PROXY ?? "http://localhost:3001";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: true,
    watch: {
      // Docker bind mounts on Windows/OneDrive often miss native file events.
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      "/api": devApiProxy,
      "/generated": devApiProxy,
    },
  },
})
