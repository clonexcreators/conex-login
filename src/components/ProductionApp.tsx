import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { mainnet, polygon, arbitrum } from 'wagmi/chains';
import { RainbowKitProvider, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, walletConnectWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { useAccount } from 'wagmi';
import { WalletConnect } from './WalletConnect';
import { ConnectionStatus } from './ConnectionStatus';
import { NetworkSelector } from './NetworkSelector';
import { NFTVerification } from './NFTVerification';
import { NFTCollectionSummary } from './NFTCollectionSummary';
import { AccessLevelExplainer } from './AccessLevelExplainer';
import { StickerButton } from './StickerButton';
import { StickerCard } from './StickerCard';
import { useCloneXAuth } from '../hooks/useCloneXAuth';
import { NFTVerificationResponse } from '../config/api';
import { ENV_CONFIG } from '../config/environment';

import '@rainbow-me/rainbowkit/styles.css';

// Web3 Configuration for Production
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [metaMaskWallet, walletConnectWallet, coinbaseWallet],
    },
  ],
  {
    appName: 'CloneX Universal Login',
    projectId: ENV_CONFIG.walletConnectId || '743b5c9a705ea2255557991fb96d9c7e',
  }
);

const wagmiConfig = createConfig({
  chains: [mainnet, polygon, arbitrum],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: ENV_CONFIG.cacheTimeout,
      refetchOnWindowFocus: false,
    },
  },
});

const ProductionAppContent: React.FC = () => {
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);
  const [showAccessExplainer, setShowAccessExplainer] = useState(false);
  const [nftVerificationData, setNftVerificationData] = useState<NFTVerificationResponse | null>(null);
  
  const { address, isConnected } = useAccount();
  const { user, isAuthenticated } = useCloneXAuth();

  const handleNFTVerificationComplete = (data: NFTVerificationResponse) => {
    setNftVerificationData(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <StickerCard variant="research-panel">
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
        </StickerCard>

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ConnectionStatus />
          <StickerCard>
            <h3 className="font-black uppercase text-sm mb-3">System Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>API:</span>
                <span className="font-bold text-green-600">ONLINE</span>
              </div>
              <div className="flex justify-between">
                <span>NFT Verification:</span>
                <span className="font-bold text-green-600">READY</span>
              </div>
              <div className="flex justify-between">
                <span>Mode:</span>
                <span className="font-bold text-blue-600">PRODUCTION</span>
              </div>
            </div>
          </StickerCard>
        </div>

        {/* Main Wallet Connection */}
        <StickerCard>
          <div className="text-center mb-6">
            <h3 className="text-2xl font-black uppercase text-gray-800 mb-2">
              WALLET CONNECTION
            </h3>
            <p className="text-gray-600 text-sm">
              Connect your wallet to verify your CloneX DNA and access the ecosystem
            </p>
          </div>
          
          <WalletConnect />
        </StickerCard>

        {/* NFT Collection Summary */}
        {nftVerificationData && (
          <NFTCollectionSummary nftData={nftVerificationData} />
        )}

        {/* NFT Verification Section */}
        {isConnected && isAuthenticated && address && (
          <div className="space-y-6">
            <StickerCard>
              <h3 className="text-2xl font-black uppercase text-center mb-6">
                NFT VERIFICATION
              </h3>
              <NFTVerification 
                walletAddress={address} 
                onVerificationComplete={handleNFTVerificationComplete}
              />
            </StickerCard>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center">
          <StickerButton
            variant="ghost"
            size="sm"
            onClick={() => setShowNetworkSelector(!showNetworkSelector)}
          >
            {showNetworkSelector ? 'HIDE' : 'SHOW'} NETWORK SELECTOR
          </StickerButton>
          
          <StickerButton
            variant="ghost"
            size="sm"
            onClick={() => setShowAccessExplainer(!showAccessExplainer)}
          >
            {showAccessExplainer ? 'HIDE' : 'SHOW'} ACCESS LEVELS
          </StickerButton>
        </div>

        {/* Optional Components */}
        {showNetworkSelector && <NetworkSelector />}
        
        {showAccessExplainer && (
          <AccessLevelExplainer currentAccessLevel={user?.accessLevel} />
        )}

        {/* Footer */}
        <StickerCard>
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p className="font-bold uppercase">Powered by Blockchain Verification</p>
            <p>Multi-Provider NFT Verification: Alchemy + Moralis + Etherscan</p>
            <p>Delegation Support: Delegate.xyz v2 Integration</p>
            <p className="font-mono">v2.0.0 • CloneX Authentication System</p>
          </div>
        </StickerCard>

      </div>
    </div>
  );
};

export const ProductionApp: React.FC = () => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ProductionAppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};