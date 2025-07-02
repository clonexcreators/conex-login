import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { NFTVerificationResponse, NFTToken } from '../config/api';
import { AccessLevelBadge } from './AccessLevelBadge';
import { StickerButton } from './StickerButton';
import { StickerCard } from './StickerCard';
import { LoadingSpinner } from './LoadingSpinner';

interface NFTVerificationProps {
  walletAddress: string;
  onVerificationComplete?: (data: NFTVerificationResponse) => void;
}

export const NFTVerification: React.FC<NFTVerificationProps> = ({ 
  walletAddress, 
  onVerificationComplete 
}) => {
  const [nftData, setNftData] = useState<NFTVerificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadNFTData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔬 Starting NFT verification for:', walletAddress);
      const response = await authService.verifyNFTs(walletAddress);
      
      if (response.success) {
        setNftData(response);
        setLastRefresh(new Date());
        onVerificationComplete?.(response);
        
        console.log('✅ NFT verification completed:', {
          accessLevel: response.accessLevel,
          totalCollections: Object.keys(response.nftCollections).length,
          delegated: response.delegatedAccess.enabled
        });
      } else {
        throw new Error('NFT verification failed');
      }
    } catch (err) {
      const errorMessage = (err as Error).message;
      console.error('❌ NFT verification failed:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      loadNFTData();
    }
  }, [walletAddress]);

  if (isLoading) {
    return (
      <StickerCard>
        <div className="text-center py-8">
          <LoadingSpinner size="xl" message="SCANNING BLOCKCHAIN..." variant="primary" />
          <p className="text-gray-600 text-sm mt-4">
            Verifying NFT ownership and calculating access level...
          </p>
        </div>
      </StickerCard>
    );
  }

  if (error) {
    return (
      <StickerCard variant="error-card">
        <div className="text-center py-6">
          <h3 className="font-black uppercase text-lg text-red-700 mb-4">
            VERIFICATION FAILED
          </h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          
          {/* Helpful error guidance */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-600 text-xs">
              💡 This might be due to API rate limits or network issues. 
              The development environment may have limited API access.
            </p>
          </div>
          
          <StickerButton onClick={loadNFTData} variant="danger" size="md">
            RETRY SCAN
          </StickerButton>
        </div>
      </StickerCard>
    );
  }

  if (!nftData) {
    return (
      <StickerCard>
        <div className="text-center py-6">
          <p className="text-gray-600">No NFT data available</p>
        </div>
      </StickerCard>
    );
  }

  const { nftCollections, accessLevel, delegatedAccess, verificationMethod, lastUpdated } = nftData;
  
  // Calculate totals
  const totalNFTs = Object.values(nftCollections).reduce((sum, collection) => sum + collection.count, 0);
  const hasAnyNFTs = totalNFTs > 0;

  return (
    <div className="space-y-6">
      {/* Access Level Display */}
      <StickerCard variant={hasAnyNFTs ? 'success-card' : 'default'}>
        <div className="text-center">
          <h2 className="text-2xl font-black uppercase mb-4">
            {hasAnyNFTs ? 'ACCESS VERIFIED' : 'NO NFTS DETECTED'}
          </h2>
          
          <AccessLevelBadge 
            accessLevel={accessLevel} 
            showDescription 
            showRequirements
          />
          
          {delegatedAccess.enabled && (
            <div className="mt-4 bg-purple-100 border-2 border-purple-500 rounded-xl p-3">
              <h4 className="font-bold text-purple-700 text-sm mb-1">
                🔗 DELEGATION ACTIVE
              </h4>
              <p className="text-purple-600 text-xs">
                {delegatedAccess.vaultWallets.length} vault wallet(s) providing additional access
              </p>
            </div>
          )}
        </div>
      </StickerCard>

      {/* NFT Collections Grid */}
      <StickerCard>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black uppercase">DNA COLLECTION</h3>
          <div className="flex items-center space-x-3">
            <div className="bg-teal-500 text-white px-3 py-1 rounded-xl font-bold text-sm">
              {totalNFTs} TOTAL
            </div>
            <StickerButton onClick={loadNFTData} variant="secondary" size="sm">
              REFRESH
            </StickerButton>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* CloneX */}
          <StickerCard variant={nftCollections.clonex.count > 0 ? 'verification-card' : 'default'}>
            <div className="text-center">
              <h4 className="font-black uppercase text-lg text-pink-700 mb-2">CLONEX</h4>
              <div className="text-3xl font-black text-pink-600 mb-2">
                {nftCollections.clonex.count}
              </div>
              <p className="text-pink-600 text-sm uppercase font-bold">
                {nftCollections.clonex.count === 1 ? 'CLONE' : 'CLONES'} OWNED
              </p>
            </div>
          </StickerCard>

          {/* Animus */}
          <StickerCard variant={nftCollections.animus.count > 0 ? 'verification-card' : 'default'}>
            <div className="text-center">
              <h4 className="font-black uppercase text-lg text-purple-700 mb-2">ANIMUS</h4>
              <div className="text-3xl font-black text-purple-600 mb-2">
                {nftCollections.animus.count}
              </div>
              <p className="text-purple-600 text-sm uppercase font-bold">
                ANIMUS OWNED
              </p>
            </div>
          </StickerCard>

          {/* Animus Eggs */}
          <StickerCard variant={nftCollections.animus_eggs.count > 0 ? 'verification-card' : 'default'}>
            <div className="text-center">
              <h4 className="font-black uppercase text-sm text-orange-700 mb-2">ANIMUS EGGS</h4>
              <div className="text-2xl font-black text-orange-600 mb-2">
                {nftCollections.animus_eggs.count}
              </div>
              <p className="text-orange-600 text-xs uppercase font-bold">EGGS OWNED</p>
            </div>
          </StickerCard>

          {/* CloneX Vials */}
          <StickerCard variant={nftCollections.clonex_vials.count > 0 ? 'verification-card' : 'default'}>
            <div className="text-center">
              <h4 className="font-black uppercase text-sm text-cyan-700 mb-2">VIALS</h4>
              <div className="text-2xl font-black text-cyan-600 mb-2">
                {nftCollections.clonex_vials.count}
              </div>
              <p className="text-cyan-600 text-xs uppercase font-bold">VIALS OWNED</p>
            </div>
          </StickerCard>
        </div>

        {/* Verification Details */}
        <div className="bg-gray-100 border-2 border-gray-300 rounded-xl p-3">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-bold text-gray-700">Verification Method:</span>
              <p className="text-gray-600 font-mono">{verificationMethod}</p>
            </div>
            <div>
              <span className="font-bold text-gray-700">Last Updated:</span>
              <p className="text-gray-600">
                {lastRefresh ? lastRefresh.toLocaleTimeString() : new Date(lastUpdated).toLocaleString()}
              </p>
            </div>
          </div>
          
          {delegatedAccess.enabled && delegatedAccess.delegatedNFTs.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-300">
              <span className="font-bold text-gray-700 text-xs">Delegated NFTs:</span>
              <p className="text-gray-600 text-xs">
                {delegatedAccess.delegatedNFTs.length} NFT(s) from vault wallets included in access calculation
              </p>
            </div>
          )}
        </div>
      </StickerCard>

      {/* Access Breakdown */}
      {hasAnyNFTs && (
        <StickerCard variant="research-panel">
          <h3 className="font-black uppercase text-lg mb-4">ACCESS BREAKDOWN</h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span>Base Access:</span>
              <span className="font-bold">
                {nftCollections.clonex.count > 0 || nftCollections.animus.count > 0 ? 'VERIFIED' : 'LIMITED'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>CloneX Features:</span>
              <span className={`font-bold ${nftCollections.clonex.count > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {nftCollections.clonex.count > 0 ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Animus Features:</span>
              <span className={`font-bold ${nftCollections.animus.count > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {nftCollections.animus.count > 0 ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Ecosystem Status:</span>
              <span className="font-bold text-purple-600">{accessLevel.replace('_', ' ')}</span>
            </div>
          </div>
        </StickerCard>
      )}

      {/* No NFTs Guidance */}
      {!hasAnyNFTs && (
        <StickerCard>
          <div className="text-center py-6">
            <h3 className="font-black uppercase text-lg mb-4 text-gray-700">
              GET STARTED WITH CLONEX
            </h3>
            
            <p className="text-gray-600 text-sm mb-4">
              To access CloneX ecosystem features, you'll need to own qualifying NFTs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <a 
                href="https://opensea.io/collection/clonex"
                target="_blank"
                rel="noopener noreferrer" 
                className="text-center"
              >
                <StickerButton variant="primary" size="md" className="w-full">
                  VIEW CLONEX COLLECTION
                </StickerButton>
              </a>
              
              <a 
                href="https://opensea.io/collection/animus"
                target="_blank"
                rel="noopener noreferrer" 
                className="text-center"
              >
                <StickerButton variant="secondary" size="md" className="w-full">
                  VIEW ANIMUS COLLECTION
                </StickerButton>
              </a>
            </div>
          </div>
        </StickerCard>
      )}
    </div>
  );
};