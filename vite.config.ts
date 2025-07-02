import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Your existing shims
      'use-sync-external-store/with-selector': path.resolve(__dirname, 'src/shims/use-sync-external-store-with-selector.js'),
      'react-use/lib/useLocalStorage': path.resolve(__dirname, 'src/shims/useLocalStorage.js'),
      'events': path.resolve(__dirname, 'src/shims/events.js'),
      'mitt': path.resolve(__dirname, 'src/shims/mitt.js'),
      'pino/browser': path.resolve(__dirname, 'src/shims/pino-browser.js'),
      
      // Add direct shim resolution for the missing specifiers
      'use-sync-external-store/shim/with-selector.js': path.resolve(__dirname, 'src/shims/use-sync-external-store-with-selector.js'),
      'use-sync-external-store/shim': path.resolve(__dirname, 'src/shims/use-sync-external-store-with-selector.js'),
    }
  },
  server: {
    host: true,
    port: 3000,
    cors: true,
    headers: {
      // Allow cross-origin communication for wallet SDKs
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'unsafe-none'
    },
    proxy: {
      '/api': {
        target: 'https://api.clonex.wtf',
        changeOrigin: true,
        secure: true
      }
    }
  },
  preview: {
    host: true,
    port: 3000
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    cssMinify: true,
    // Ensure CSS is included in the build
    cssCodeSplit: false, // Change to false to have a single CSS file
    rollupOptions: {
      output: {
        // Ensure CSS is treated properly
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/style-[hash].css';
          }
          if (assetInfo.name?.match(/\.(png|jpe?g|svg|gif|webp)$/)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(woff2?|eot|ttf|otf)$/)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks: {
          // React core packages
          'vendor-react': ['react', 'react-dom'],
          
          // TanStack Query
          'vendor-query': ['@tanstack/react-query'],
          
          // Web3 libraries - keep them together to avoid circular dependencies
          'vendor-web3': ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
          
          // UI libraries
          'vendor-ui': ['clsx', 'zustand', 'lucide-react'],
          
          // App chunks
          'app-auth': [
            './src/hooks/useCloneXAuth.ts',
            './src/hooks/useWalletConnection.ts',
            './src/services/authService.ts',
            './src/stores/authStore.ts'
          ]
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name?.startsWith('vendor-')) {
            return 'assets/vendor/[name]-[hash].js';
          }
          if (chunkInfo.name?.startsWith('app-')) {
            return 'assets/app/[name]-[hash].js';
          }
          return 'assets/chunks/[name]-[hash].js';
        },
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2
      },
      mangle: {
        safari10: true
      },
      format: {
        comments: false
      }
    }
  },
  
  define: {
    global: 'globalThis'
  },
  
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@rainbow-me/rainbowkit',
      'wagmi',
      'viem',
      'eventemitter3'
    ],
    exclude: [
      'lucide-react',
      'use-sync-external-store',
      'zustand',
      '@walletconnect/logger'
    ],
    esbuildOptions: {
      target: 'es2020',
      supported: {
        'top-level-await': true
      }
    }
  }
});