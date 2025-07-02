import React, { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ENV_CONFIG } from '../config/environment';

// Lazy load web3 components to reduce initial bundle size
const Web3Provider = lazy(() => import('./Web3Provider').then(module => ({ 
  default: module.default || module.Web3Provider 
})));

// Fallback loading component
const LoadingIndicator = () => (
  <div className="w-full h-full flex items-center justify-center p-6">
    <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Base content without web3 dependencies
const BaseAppContent = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
            CLONEX DNA
          </h1>
          <h2 className="text-xl font-black uppercase text-gray-700 mb-2">
            SEQUENCER v2.0
          </h2>
          <p className="text-gray-600 font-bold text-sm uppercase">
            Universal Login & Verification System
          </p>
        </div>
        
        {/* Web3 integration wrapped in Suspense */}
        <Suspense fallback={<LoadingIndicator />}>
          <Web3Provider />
        </Suspense>
      </div>
    </div>
  );
};

// Create a QueryClient for TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ENV_CONFIG.cacheTimeout,
      refetchOnWindowFocus: false,
    },
  },
});

export const ProductionApp: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BaseAppContent />
    </QueryClientProvider>
  );
};

export default ProductionApp;