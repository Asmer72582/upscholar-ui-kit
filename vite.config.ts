import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // EMERGENCY WORKAROUND: Proxy API requests to avoid mixed content
    proxy: {
      '/api': {
        target: 'http://13.60.254.183:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // For WebSocket support
      },
      '/socket.io': {
        target: 'http://13.60.254.183:3000',
        changeOrigin: true,
        secure: false,
        ws: true, // For WebSocket support
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    'global': 'globalThis',
  },
}));