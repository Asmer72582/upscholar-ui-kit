import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { UserConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    server: {
      host: "::",
      port: 8080,
      // Enable HTTPS for development testing
      https: env.VITE_ENABLE_HTTPS === 'true' ? {
        key: './localhost-key.pem',
        cert: './localhost-cert.pem'
      } : undefined
    },
    plugins: [
      react(),
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      // Fix for simple-peer and other Node.js polyfills
      dedupe: ['react', 'react-dom'],
    },
    define: {
      'global': 'globalThis',
      // Define production environment
      'process.env.NODE_ENV': JSON.stringify(mode),
      // WebRTC support detection
      'process.env.VITE_WEBRTC_SUPPORTED': true,
    },
    optimizeDeps: {
      include: [
        'vite-compatible-simple-peer',
        'socket.io-client',
      ],
      exclude: [
        // Exclude Node.js-specific modules
        'simple-peer',
        'wrtc',
      ]
    },
    build: {
      target: 'es2020',
      minify: 'terser',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: {
            'webrtc': ['vite-compatible-simple-peer'],
            'socketio': ['socket.io-client'],
            'ui': ['lucide-react', '@radix-ui/react-toast'],
          }
        },
        // Externalize Node.js modules in production
        external: [
          'fs',
          'path',
          'crypto',
          'stream',
          'events',
          'buffer',
          'util',
          'os',
          'url',
          'querystring',
          'http',
          'https',
          'net',
          'tls',
          'zlib',
          'child_process',
          'cluster',
          'dns',
          'readline',
          'vm',
          'module',
          'console',
          'timers',
          'process'
        ]
      },
      // Ensure compatibility with older browsers while maintaining WebRTC support
    },
    // Environment variables
    envPrefix: ['VITE_', 'REACT_APP_'],
    // Ensure proper handling of WebRTC in production
    esbuild: {
      target: 'es2020',
      supported: {
        'top-level-await': true,
        'dynamic-import': true,
      }
    }
  };
});