import React, { lazy, Suspense } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { ENV_CONFIG } from '../config/environment';

// Lazy load components
const StickerButton = lazy(() => 
  import('./StickerButton').then(module => ({
    default: module.StickerButton
  }))
);

const StickerCard = lazy(() => 
  import('./StickerCard').then(module => ({
    default: module.StickerCard
  }))
);

// Simple loading component
const ComponentLoading = () => (
  <div className="text-center p-4">
    <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
  </div>
);

export const WalletInterface = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const metamaskConnector = connectors.find(c => c.name === 'MetaMask');
    if (metamaskConnector) {
      connect({ connector: metamaskConnector });
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };
  
  if (!isConnected) {
    return (
      <Suspense fallback={<ComponentLoading />}>
        <StickerCard className="p-8 text-center">
          <h2 className="text-2xl font-black mb-6">CONNECT WALLET</h2>
          <p className="mb-8">Connect your wallet to verify your CloneX DNA and access the ecosystem</p>
          <StickerButton 
            variant="primary"
            size="lg"
            onClick={handleConnect}
            loading={isPending}
          >
            CONNECT
          </StickerButton>
        </StickerCard>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<ComponentLoading />}>
      <StickerCard className="p-8">
        <div className="flex flex-col items-center gap-4">
          <h2 className="text-2xl font-black">WALLET CONNECTED</h2>
          <p className="font-mono text-sm">{address}</p>
          <StickerButton 
            variant="danger" 
            size="md"
            onClick={() => disconnect()}
          >
            DISCONNECT
          </StickerButton>
        </div>
      </StickerCard>
    </Suspense>
  );
};

export default WalletInterface;