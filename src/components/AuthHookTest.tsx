import React from 'react';
import { useAccount } from 'wagmi';
import { useCloneXAuth } from '../hooks/useCloneXAuth';
import { authService } from '../services/authService';
import { StickerButton } from './StickerButton';
import { StickerCard } from './StickerCard';
import { AccessLevelBadge } from './AccessLevelBadge';
import { LoadingSpinner } from './LoadingSpinner';

export const AuthHookTest: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { 
    user, 
    isLoading, 
    error, 
    isAuthenticated, 
    nftData,
    login, 
    logout, 
    refreshNFTs, 
    clearError 
  } = useCloneXAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-cyan-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <StickerCard variant="research-panel">
          <h1 className="text-4xl font-black uppercase text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
            Auth Hook Testing
          </h1>
          <p className="text-center text-gray-600 font-bold">
            Testing useCloneXAuth hook functionality
          </p>
        </StickerCard>

        {/* Connection Status */}
        <StickerCard>
          <h2 className="text-2xl font-black uppercase mb-4">Wallet Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-bold">Connected: <span className={isConnected ? 'text-green-600' : 'text-red-600'}>{isConnected ? 'YES' : 'NO'}</span></p>
              <p className="font-bold">Address: <span className="font-mono text-xs">{address || 'None'}</span></p>
            </div>
            <div>
              <p className="font-bold">Authenticated: <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>{isAuthenticated ? 'YES' : 'NO'}</span></p>
              <p className="font-bold">Loading: <span className={isLoading ? 'text-yellow-600' : 'text-gray-600'}>{isLoading ? 'YES' : 'NO'}</span></p>
            </div>
          </div>
        </StickerCard>

        {/* Error Display */}
        {error && (
          <StickerCard variant="error-card">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black uppercase text-red-700 mb-2">Authentication Error</h3>
                <p className="text-red-600 text-sm">{error}</p>
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
            <div className="text-center">
              <LoadingSpinner size="lg" message="PROCESSING AUTHENTICATION..." variant="primary" />
            </div>
          </StickerCard>
        )}

        {/* Authentication Controls */}
        <StickerCard>
          <h2 className="text-2xl font-black uppercase mb-4">Authentication Controls</h2>
          <div className="flex flex-wrap gap-4">
            {!isAuthenticated ? (
              <StickerButton 
                variant="primary" 
                size="lg" 
                onClick={login}
                disabled={!isConnected || isLoading}
              >
                {isLoading ? 'AUTHENTICATING...' : 'LOGIN'}
              </StickerButton>
            ) : (
              <>
                <StickerButton variant="danger" onClick={logout}>
                  LOGOUT
                </StickerButton>
                <StickerButton variant="secondary" onClick={refreshNFTs} disabled={isLoading}>
                  REFRESH NFTS
                </StickerButton>
              </>
            )}
          </div>
        </StickerCard>

        {/* User Information */}
        {user && (
          <StickerCard variant="success-card">
            <h2 className="text-2xl font-black uppercase mb-4">User Information</h2>
            <div className="space-y-4">
              <div>
                <p className="font-bold">Wallet Address:</p>
                <p className="font-mono text-sm break-all">{user.walletAddress}</p>
              </div>
              <div>
                <p className="font-bold mb-2">Access Level:</p>
                <AccessLevelBadge 
                  accessLevel={user.accessLevel} 
                  showDescription 
                  showRequirements 
                />
              </div>
            </div>
          </StickerCard>
        )}

        {/* NFT Data */}
        {nftData && (
          <StickerCard variant="verification-card">
            <h2 className="text-2xl font-black uppercase mb-4">NFT Collections</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <h3 className="font-bold uppercase text-pink-600">CloneX</h3>
                <p className="text-2xl font-black">{nftData.nftCollections.clonex.count}</p>
              </div>
              <div className="text-center">
                <h3 className="font-bold uppercase text-purple-600">Animus</h3>
                <p className="text-2xl font-black">{nftData.nftCollections.animus.count}</p>
              </div>
              <div className="text-center">
                <h3 className="font-bold uppercase text-orange-600">Eggs</h3>
                <p className="text-2xl font-black">{nftData.nftCollections.animus_eggs.count}</p>
              </div>
              <div className="text-center">
                <h3 className="font-bold uppercase text-cyan-600">Vials</h3>
                <p className="text-2xl font-black">{nftData.nftCollections.clonex_vials.count}</p>
              </div>
            </div>
            
            {nftData.delegatedAccess.enabled && (
              <div className="mt-4 bg-purple-100 border-2 border-purple-500 rounded-xl p-3">
                <p className="font-bold text-purple-700 text-center">
                  🔗 DELEGATION ACTIVE: {nftData.delegatedAccess.vaultWallets.length} vault wallet(s)
                </p>
              </div>
            )}
            
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>Verified via: {nftData.verificationMethod}</p>
              <p>Last updated: {new Date(nftData.lastUpdated).toLocaleString()}</p>
            </div>
          </StickerCard>
        )}

        {/* Debug Information */}
        <StickerCard>
          <h2 className="text-2xl font-black uppercase mb-4">Debug Info</h2>
          <div className="bg-gray-100 rounded-xl p-4 font-mono text-xs">
            <p><strong>Token:</strong> {authService.getToken() ? 'Present' : 'None'}</p>
            <p><strong>Token Expired:</strong> {authService.isTokenExpired() ? 'Yes' : 'No'}</p>
            <p><strong>Hook State:</strong></p>
            <pre className="mt-2 text-xs">
              {JSON.stringify({
                isAuthenticated,
                hasUser: !!user,
                hasNftData: !!nftData,
                isLoading,
                hasError: !!error
              }, null, 2)}
            </pre>
          </div>
        </StickerCard>

        {/* Console Testing Instructions */}
        <StickerCard variant="research-panel">
          <h2 className="text-2xl font-black uppercase mb-4">Console Testing Available</h2>
          <div className="space-y-3">
            <div className="bg-black text-green-400 p-3 rounded-xl font-mono text-sm">
              <p>🧪 Open browser console and try:</p>
              <p className="mt-2">• <span className="text-cyan-400">cloneXTest.apiConnection()</span> - Test API connection</p>
              <p>• <span className="text-cyan-400">cloneXTest.tokenManagement()</span> - Test token functions</p>
              <p>• <span className="text-cyan-400">cloneXTest.authService</span> - Access auth service directly</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 font-bold">
                📝 Expected: API calls will fail until backend is connected, but token management should work
              </p>
            </div>
          </div>
        </StickerCard>

        {/* Task Status */}
        <StickerCard>
          <h2 className="text-2xl font-black uppercase mb-6 text-center">Task 4 Hook Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-100 border-2 border-green-500 rounded-xl">
              <div className="font-black text-green-700">✅ HOOK CREATED</div>
              <div className="text-xs text-green-600">useCloneXAuth with state management</div>
            </div>
            <div className="text-center p-4 bg-green-100 border-2 border-green-500 rounded-xl">
              <div className="font-black text-green-700">✅ WAGMI INTEGRATION</div>
              <div className="text-xs text-green-600">Wallet connection & signing</div>
            </div>
            <div className="text-center p-4 bg-green-100 border-2 border-green-500 rounded-xl">
              <div className="font-black text-green-700">✅ ERROR HANDLING</div>
              <div className="text-xs text-green-600">User-friendly error messages</div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <div className="inline-block p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl border-4 border-white font-black uppercase shadow-lg">
              🎉 Authentication Hook Ready for Task 5! 🎉
            </div>
            <p className="text-sm text-gray-600 mt-2 font-semibold">
              ✨ Hook provides: state management, session validation, NFT verification, error handling
            </p>
          </div>
        </StickerCard>

      </div>
    </div>
  );
};