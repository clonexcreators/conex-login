import React from 'react';
import { NFTVerificationResponse } from '../config/api';
import { AccessLevelBadge } from './AccessLevelBadge';
import { StickerCard } from './StickerCard';

interface NFTCollectionSummaryProps {
  nftData: NFTVerificationResponse;
  compact?: boolean;
  className?: string;
}

export const NFTCollectionSummary: React.FC<NFTCollectionSummaryProps> = ({
  nftData,
  compact = false,
  className = ''
}) => {
  const { nftCollections, accessLevel, delegatedAccess } = nftData;
  
  const totalNFTs = Object.values(nftCollections).reduce((sum, collection) => sum + collection.count, 0);
  const hasAnyNFTs = totalNFTs > 0;

  if (compact) {
    return (
      <div className={`flex items-center space-x-4 ${className}`}>
        <AccessLevelBadge accessLevel={accessLevel} />
        
        <div className="flex space-x-2 text-sm">
          {nftCollections.clonex.count > 0 && (
            <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-lg font-bold">
              {nftCollections.clonex.count} CloneX
            </span>
          )}
          {nftCollections.animus.count > 0 && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-bold">
              {nftCollections.animus.count} Animus
            </span>
          )}
          {totalNFTs === 0 && (
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-lg font-bold">
              No NFTs
            </span>
          )}
        </div>
        
        {delegatedAccess.enabled && (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-bold text-xs">
            🔗 DELEGATED
          </span>
        )}
      </div>
    );
  }

  return (
    <StickerCard variant={hasAnyNFTs ? 'verification-card' : 'default'} className={className}>
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-black uppercase text-lg mb-3">
            COLLECTION SUMMARY
          </h3>
          <AccessLevelBadge accessLevel={accessLevel} showDescription />
        </div>

        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-2xl font-black text-pink-600">{nftCollections.clonex.count}</div>
            <div className="text-xs font-bold text-pink-700">CLONEX</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-purple-600">{nftCollections.animus.count}</div>
            <div className="text-xs font-bold text-purple-700">ANIMUS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-orange-600">{nftCollections.animus_eggs.count}</div>
            <div className="text-xs font-bold text-orange-700">EGGS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-cyan-600">{nftCollections.clonex_vials.count}</div>
            <div className="text-xs font-bold text-cyan-700">VIALS</div>
          </div>
        </div>

        {delegatedAccess.enabled && (
          <div className="bg-purple-100 border-2 border-purple-500 rounded-xl p-3 text-center">
            <p className="font-bold text-purple-700 text-sm">
              🔗 Delegation Active: {delegatedAccess.vaultWallets.length} vault wallet(s)
            </p>
          </div>
        )}
      </div>
    </StickerCard>
  );
};