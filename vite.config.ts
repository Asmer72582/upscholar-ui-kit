import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy API requests to api.upscholar.in (all server connections)
    proxy: {
      '/api': {
        target: 'https://api.upscholar.in',
        changeOrigin: true,
        secure: true,
        ws: true,
      },
      '/socket.io': {
        target: 'https://api.upscholar.in',
        changeOrigin: true,
        secure: true,
        ws: true,
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'global': 'globalThis',
  },
}));