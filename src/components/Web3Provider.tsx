import React, { lazy, Suspense } from 'react';
import { createConfig, WagmiProvider } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { http } from 'viem';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ENV_CONFIG } from '../config/environment';

// Lazy load RainbowKit components
const RainbowKitProvider = lazy(() => 
  import('@rainbow-me/rainbowkit').then(module => ({ 
    default: module.RainbowKitProvider 
  }))
);

// Lazy load actual app content
const WalletInterface = lazy(() => 
  import('./WalletInterface').then(module => ({ 
    default: module.WalletInterface || module.default 
  }))
);

// Simple loading component
const WalletLoading = () => (
  <div className="text-center p-6">
    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
    <p className="font-bold">Loading Web3 Components...</p>
  </div>
);

// Create a new QueryClient instance
const queryClient = new QueryClient();

// Create wagmi config with simple setup
const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(),
  },
});

export const Web3Provider = () => {
  return (
    <Suspense fallback={<WalletLoading />}>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<WalletLoading />}>
            <RainbowKitProvider>
              <WalletInterface />
            </RainbowKitProvider>
          </Suspense>
        </QueryClientProvider>
      </WagmiProvider>
    </Suspense>
  );
};

export default Web3Provider;