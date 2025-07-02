import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Your existing shims
      'use-sync-external-store/with-selector': path.resolve(__dirname, 'src/shims/use-sync-external-store-with-selector.js'),
      'eventemitter3': path.resolve(__dirname, 'src/shims/eventemitter3.js'),
      'react-use/lib/useLocalStorage': path.resolve(__dirname, 'src/shims/useLocalStorage.js'),
      'events': path.resolve(__dirname, 'src/shims/events.js'),
      'mitt': path.resolve(__dirname, 'src/shims/mitt.js'),
      'pino/browser': path.resolve(__dirname, 'src/shims/pino-browser.js'),
      
      // Updated WalletConnect logger shim with .mjs extension
      '@walletconnect/logger': path.resolve(__dirname, 'src/shims/walletconnect-logger.mjs'),
      
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
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-wagmi': ['wagmi', 'viem', '@rainbow-me/rainbowkit'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': ['lucide-react', 'clsx', 'zustand'],
          'app-production-auth': [
            './src/hooks/useProductionAuth.ts',
            './src/services/productionAuthService.ts',
            './src/constants/accessLevels.ts'
          ],
          'app-layout': [
            './src/components/Header.tsx',
            './src/components/Footer.tsx',
            './src/components/LoadingSpinner.tsx'
          ],
          'app-production': [
            './src/components/ProductionWalletButton.tsx',
            './src/components/ProductionAuthChallenge.tsx',
            './src/components/ProductionNFTDashboard.tsx'
          ],
          'app-ui': [
            './src/components/StickerButton.tsx',
            './src/components/StickerCard.tsx',
            './src/components/StatusBadge.tsx'
          ],
          'app-utils': [
            './src/utils/errorHandler.ts',
            './src/utils/crossDomainUtils.ts',
            './src/utils/performanceOptimizer.ts'
          ],
          'app-services': [
            './src/services/cookieService.ts'
          ]
        },
        chunkFileNames: (chunkInfo) => {
          if (chunkInfo.name.startsWith('vendor-')) {
            return 'assets/vendor/[name]-[hash].js';
          }
          if (chunkInfo.name.startsWith('app-')) {
            return 'assets/app/[name]-[hash].js';
          }
          return 'assets/chunks/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash].css';
          }
          if (assetInfo.name?.match(/\.(png|jpe?g|svg|gif|webp)$/)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          if (assetInfo.name?.match(/\.(woff2?|eot|ttf|otf)$/)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    cssCodeSplit: true,
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
  
  // Updated dependency optimization to work with shims
  optimizeDeps: {
    include: [
      '@walletconnect/logger', // Add to ensure ESBuild pre-bundles it
      'react',
      'react-dom',
      '@rainbow-me/rainbowkit',
      'wagmi',
      'viem'
    ],
    exclude: [
      'lucide-react',
      'use-sync-external-store',
      'zustand'
    ]
  }
});