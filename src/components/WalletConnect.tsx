import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useCloneXAuth } from '../hooks/useCloneXAuth';
import { StickerButton } from './StickerButton';
import { StickerCard } from './StickerCard';
import { LoadingSpinner } from './LoadingSpinner';
import { AccessLevelBadge } from './AccessLevelBadge';

export const WalletConnect: React.FC = () => {
  const { address, isConnected, chain } = useAccount();
  const { 
    user, 
    isLoading, 
    error, 
    isAuthenticated, 
    login, 
    logout, 
    clearError 
  } = useCloneXAuth();

  // Custom connect button with punk styling
  const CustomConnectButton = () => (
    <ConnectButton.Custom>
      {({ account, chain, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div className="w-full">
            {(() => {
              if (!ready) {
                return (
                  <StickerButton disabled size="lg" className="w-full">
                    <LoadingSpinner size="sm" message="" variant="white" />
                    INITIALIZING...
                  </StickerButton>
                );
              }

              if (!connected) {
                return (
                  <StickerButton 
                    onClick={openConnectModal} 
                    variant="primary" 
                    size="xl"
                    className="w-full"
                  >
                    CONNECT WALLET
                  </StickerButton>
                );
              }

              if (chain.unsupported) {
                return (
                  <StickerButton 
                    onClick={openChainModal} 
                    variant="danger"
                    size="lg"
                    className="w-full"
                  >
                    WRONG NETWORK
                  </StickerButton>
                );
              }

              return (
                <StickerCard variant="verification-card">
                  <div className="text-center space-y-4">
                    <h3 className="font-black uppercase text-lg text-teal-700">
                      WALLET LINKED
                    </h3>
                    
                    <div className="bg-white border-2 border-teal-500 rounded-xl p-3">
                      <p className="font-mono text-xs break-all text-gray-800">
                        {account.address}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {chain.name} Network
                      </p>
                    </div>

                    {!isAuthenticated ? (
                      <StickerButton
                        onClick={login}
                        loading={isLoading}
                        variant="secondary"
                        size="lg"
                        className="w-full"
                      >
                        {isLoading ? 'DNA SEQUENCING...' : 'AUTHENTICATE'}
                      </StickerButton>
                    ) : (
                      <div className="space-y-3">
                        {user && (
                          <AccessLevelBadge 
                            accessLevel={user.accessLevel} 
                            size="md" 
                            showDescription
                          />
                        )}
                        <div className="flex gap-2">
                          <StickerButton
                            onClick={() => openChainModal()}
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                          >
                            NETWORK
                          </StickerButton>
                          <StickerButton
                            onClick={logout}
                            variant="danger"
                            size="sm"
                            className="flex-1"
                          >
                            DISCONNECT
                          </StickerButton>
                        </div>
                      </div>
                    )}
                  </div>
                </StickerCard>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <StickerCard variant="error-card">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-black uppercase text-red-700 mb-2">
                CONNECTION FAILED
              </h3>
              <p className="text-red-600 text-sm mb-3">{error}</p>
              
              {/* Helpful error messages */}
              {error.includes('rejected') && (
                <p className="text-red-500 text-xs">
                  💡 You cancelled the signature. Try again when ready.
                </p>
              )}
              {error.includes('Allowlist') && (
                <p className="text-red-500 text-xs">
                  💡 WalletConnect domain issue - this is expected in development.
                </p>
              )}
            </div>
            <StickerButton variant="danger" size="sm" onClick={clearError}>
              CLEAR
            </StickerButton>
          </div>
        </StickerCard>
      )}

      {/* Loading State */}
      {isLoading && (
        <StickerCard>
          <div className="text-center py-8">
            <LoadingSpinner 
              size="xl" 
              message="PROCESSING AUTHENTICATION..." 
              variant="primary" 
            />
            <p className="text-gray-600 text-sm mt-4">
              {!isConnected 
                ? 'Connecting to wallet...' 
                : 'Verifying signature and checking NFTs...'
              }
            </p>
          </div>
        </StickerCard>
      )}

      {/* Main Connection Interface */}
      <CustomConnectButton />

      {/* Success State */}
      {isAuthenticated && user && (
        <StickerCard variant="success-card">
          <div className="text-center">
            <h2 className="text-2xl font-black uppercase text-green-700 mb-4">
              DNA VERIFICATION COMPLETE
            </h2>
            
            <div className="bg-white border-2 border-green-500 rounded-xl p-4 mb-4">
              <p className="font-black uppercase text-sm text-green-700 mb-2">
                ACCESS GRANTED
              </p>
              <AccessLevelBadge 
                accessLevel={user.accessLevel} 
                size="lg" 
                showDescription 
                showRequirements
              />
            </div>
            
            <p className="text-green-600 text-sm">
              Welcome to the CloneX ecosystem! Your access level has been verified.
            </p>
          </div>
        </StickerCard>
      )}

      {/* Development Info */}
      {import.meta.env.MODE === 'development' && (
        <StickerCard>
          <h3 className="font-black uppercase text-sm mb-3">Dev Info</h3>
          <div className="text-xs font-mono space-y-1">
            <p>Connected: {isConnected ? '✅' : '❌'}</p>
            <p>Authenticated: {isAuthenticated ? '✅' : '❌'}</p>
            <p>Loading: {isLoading ? '🔄' : '✅'}</p>
            <p>Address: {address || 'None'}</p>
            <p>Chain: {chain?.name || 'None'}</p>
            {error && <p className="text-red-600">Error: {error}</p>}
          </div>
        </StickerCard>
      )}
    </div>
  );
};