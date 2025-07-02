import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { addCriticalResourceHints, usePerformanceMonitoring } from './utils/performanceOptimizer';

// Initialize performance optimizations
addCriticalResourceHints();

// Lazy load the app to reduce initial bundle size
const ProductionApp = lazy(() => import('./components/ProductionApp').then(module => ({
  default: module.ProductionApp
})));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="font-black text-lg">LOADING CLONEX...</p>
    </div>
  </div>
);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <ProductionApp />
    </Suspense>
  </StrictMode>
);

// Initialize performance monitoring
usePerformanceMonitoring();