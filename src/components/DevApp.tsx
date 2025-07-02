import React, { useState } from 'react';
import { StickerButton } from './StickerButton';
import { StickerCard } from './StickerCard';
import { AccessLevelBadge } from './AccessLevelBadge';
import { NFTVerification } from './NFTVerification';
import { NFTCollectionSummary } from './NFTCollectionSummary';
import { AccessLevelExplainer } from './AccessLevelExplainer';
import { LoadingSpinner } from './LoadingSpinner';
import { ConnectionStatus } from './ConnectionStatus';
import { AccessLevel } from '../config/api';

// Mock data for development testing
const MOCK_WALLET_ADDRESS = '0x742d35Cc6597C2F33f39E88eE1234567890abcde';

const MOCK_NFT_DATA = {
  success: true,
  walletAddress: MOCK_WALLET_ADDRESS,
  accessLevel: 'CLONE_VANGUARD' as AccessLevel,
  nftCollections: {
    clonex: { count: 3, tokens: [] },
    animus: { count: 1, tokens: [] },
    animus_eggs: { count: 0, tokens: [] },
    clonex_vials: { count: 2, tokens: [] }
  },
  delegatedAccess: {
    enabled: true,
    vaultWallets: ['0x123...abc'],
    delegatedNFTs: []
  },
  verificationMethod: 'DEVELOPMENT_MOCK' as const,
  lastUpdated: new Date().toISOString()
};

export const DevApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'connection' | 'verification' | 'components'>('connection');
  const [mockWalletConnected, setMockWalletConnected] = useState(false);
  const [mockAuthenticated, setMockAuthenticated] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const handleMockConnection = () => {
    setShowLoading(true);
    setTimeout(() => {
      setMockWalletConnected(true);
      setShowLoading(false);
    }, 1500);
  };

  const handleMockAuthentication = () => {
    setShowLoading(true);
    setTimeout(() => {
      setMockAuthenticated(true);
      setShowLoading(false);
      setCurrentView('verification');
    }, 2000);
  };

  const handleDisconnect = () => {
    setMockWalletConnected(false);
    setMockAuthenticated(false);
    setCurrentView('connection');
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
              Development Preview Mode
            </p>
            
            <div className="mt-4 bg-yellow-100 border-2 border-yellow-500 rounded-xl p-3">
              <p className="text-yellow-700 text-xs font-bold">
                🔧 DEV MODE: WalletConnect disabled for development testing
              </p>
            </div>
          </div>
        </StickerCard>

        {/* Navigation */}
        <StickerCard>
          <div className="flex flex-wrap gap-2 justify-center">
            <StickerButton
              variant={currentView === 'connection' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('connection')}
            >
              CONNECTION
            </StickerButton>
            <StickerButton
              variant={currentView === 'verification' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('verification')}
            >
              VERIFICATION
            </StickerButton>
            <StickerButton
              variant={currentView === 'components' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('components')}
            >
              COMPONENTS
            </StickerButton>
          </div>
        </StickerCard>

        {/* Connection Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StickerCard>
            <h3 className="font-black uppercase text-sm mb-3">Mock Wallet Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Connected:</span>
                <span className={`font-bold ${mockWalletConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {mockWalletConnected ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={`font-bold ${mockAuthenticated ? 'text-green-600' : 'text-yellow-600'}`}>
                  {mockAuthenticated ? 'YES' : 'PENDING'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="font-bold text-blue-600">ETHEREUM</span>
              </div>
              {mockWalletConnected && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-xs text-gray-600">Address:</span>
                  <p className="font-mono text-xs break-all">{MOCK_WALLET_ADDRESS}</p>
                </div>
              )}
            </div>
          </StickerCard>

          <StickerCard>
            <h3 className="font-black uppercase text-sm mb-3">System Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>API:</span>
                <span className="font-bold text-green-600">READY</span>
              </div>
              <div className="flex justify-between">
                <span>NFT Verification:</span>
                <span className="font-bold text-green-600">MOCK MODE</span>
              </div>
              <div className="flex justify-between">
                <span>WalletConnect:</span>
                <span className="font-bold text-red-600">DISABLED</span>
              </div>
            </div>
          </StickerCard>
        </div>

        {/* Loading State */}
        {showLoading && (
          <StickerCard>
            <div className="text-center py-8">
              <LoadingSpinner size="xl" message="PROCESSING..." variant="primary" />
            </div>
          </StickerCard>
        )}

        {/* Connection View */}
        {currentView === 'connection' && (
          <StickerCard>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black uppercase text-gray-800 mb-2">
                MOCK WALLET CONNECTION
              </h3>
              <p className="text-gray-600 text-sm">
                Simulate wallet connection and authentication flow
              </p>
            </div>

            <div className="space-y-4">
              {!mockWalletConnected ? (
                <StickerButton
                  onClick={handleMockConnection}
                  loading={showLoading}
                  variant="primary"
                  size="xl"
                  className="w-full"
                >
                  CONNECT MOCK WALLET
                </StickerButton>
              ) : !mockAuthenticated ? (
                <div className="space-y-4">
                  <StickerCard variant="verification-card">
                    <div className="text-center">
                      <h3 className="font-black uppercase text-lg text-teal-700 mb-2">
                        WALLET LINKED
                      </h3>
                      <p className="font-mono text-xs break-all text-gray-800 mb-3">
                        {MOCK_WALLET_ADDRESS}
                      </p>
                    </div>
                  </StickerCard>
                  
                  <StickerButton
                    onClick={handleMockAuthentication}
                    loading={showLoading}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                  >
                    AUTHENTICATE
                  </StickerButton>
                </div>
              ) : (
                <StickerCard variant="success-card">
                  <div className="text-center">
                    <h2 className="text-2xl font-black uppercase text-green-700 mb-4">
                      AUTHENTICATION COMPLETE
                    </h2>
                    <AccessLevelBadge 
                      accessLevel={MOCK_NFT_DATA.accessLevel} 
                      size="lg" 
                      showDescription 
                    />
                    <div className="mt-4">
                      <StickerButton onClick={handleDisconnect} variant="danger" size="sm">
                        DISCONNECT
                      </StickerButton>
                    </div>
                  </div>
                </StickerCard>
              )}
            </div>
          </StickerCard>
        )}

        {/* Verification View */}
        {currentView === 'verification' && (
          <div className="space-y-6">
            <NFTCollectionSummary nftData={MOCK_NFT_DATA} />
            
            <StickerCard>
              <h3 className="text-2xl font-black uppercase text-center mb-6">
                NFT VERIFICATION (MOCK DATA)
              </h3>
              <div className="space-y-6">
                {/* Access Level Display */}
                <StickerCard variant="success-card">
                  <div className="text-center">
                    <h2 className="text-2xl font-black uppercase mb-4">ACCESS VERIFIED</h2>
                    <AccessLevelBadge 
                      accessLevel={MOCK_NFT_DATA.accessLevel} 
                      size="lg" 
                      showDescription 
                      showRequirements
                    />
                    <div className="mt-4 bg-purple-100 border-2 border-purple-500 rounded-xl p-3">
                      <h4 className="font-bold text-purple-700 text-sm mb-1">
                        🔗 DELEGATION ACTIVE
                      </h4>
                      <p className="text-purple-600 text-xs">
                        1 vault wallet providing additional access
                      </p>
                    </div>
                  </div>
                </StickerCard>

                {/* Collections Grid */}
                <StickerCard>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black uppercase">DNA COLLECTION</h3>
                    <div className="bg-teal-500 text-white px-3 py-1 rounded-xl font-bold text-sm">
                      6 TOTAL
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <StickerCard variant="verification-card">
                      <div className="text-center">
                        <h4 className="font-black uppercase text-lg text-pink-700 mb-2">CLONEX</h4>
                        <div className="text-3xl font-black text-pink-600 mb-2">3</div>
                        <p className="text-pink-600 text-sm uppercase font-bold">CLONES OWNED</p>
                      </div>
                    </StickerCard>

                    <StickerCard variant="verification-card">
                      <div className="text-center">
                        <h4 className="font-black uppercase text-lg text-purple-700 mb-2">ANIMUS</h4>
                        <div className="text-3xl font-black text-purple-600 mb-2">1</div>
                        <p className="text-purple-600 text-sm uppercase font-bold">ANIMUS OWNED</p>
                      </div>
                    </StickerCard>

                    <StickerCard>
                      <div className="text-center">
                        <h4 className="font-black uppercase text-sm text-orange-700 mb-2">EGGS</h4>
                        <div className="text-2xl font-black text-orange-600 mb-2">0</div>
                        <p className="text-orange-600 text-xs uppercase font-bold">EGGS OWNED</p>
                      </div>
                    </StickerCard>

                    <StickerCard variant="verification-card">
                      <div className="text-center">
                        <h4 className="font-black uppercase text-sm text-cyan-700 mb-2">VIALS</h4>
                        <div className="text-2xl font-black text-cyan-600 mb-2">2</div>
                        <p className="text-cyan-600 text-xs uppercase font-bold">VIALS OWNED</p>
                      </div>
                    </StickerCard>
                  </div>
                </StickerCard>
              </div>
            </StickerCard>
          </div>
        )}

        {/* Components View */}
        {currentView === 'components' && (
          <div className="space-y-6">
            <AccessLevelExplainer currentAccessLevel={MOCK_NFT_DATA.accessLevel} />
            
            <StickerCard>
              <h3 className="font-black uppercase text-lg mb-4">All Access Level Badges</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {(['COSMIC_CHAMPION', 'CLONE_VANGUARD', 'DNA_DISCIPLE', 'ANIMUS_PRIME', 'ANIMUS_HATCHLING', 'LOST_CODE'] as AccessLevel[]).map((level) => (
                  <AccessLevelBadge 
                    key={level}
                    accessLevel={level}
                    showDescription
                  />
                ))}
              </div>
            </StickerCard>
          </div>
        )}

        {/* Footer */}
        <StickerCard>
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p className="font-bold uppercase">Development Preview Mode</p>
            <p>All wallet functionality mocked for UI testing</p>
            <p>WalletConnect integration disabled to prevent connection issues</p>
            <p className="font-mono">v2.0.0-dev-mock</p>
          </div>
        </StickerCard>

      </div>
    </div>
  );
};