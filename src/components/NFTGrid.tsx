import React from 'react';
import { NFTData } from '../types';
import { NFTCard } from './NFTCard';
import { StickerCard } from './StickerCard';
import { StatusBadge } from './StatusBadge';
import { NFT_COLLECTIONS } from '../constants/nftCollections';

interface NFTGridProps {
  nfts: NFTData[];
  title: string;
  emptyMessage?: string;
}

export const NFTGrid: React.FC<NFTGridProps> = ({ 
  nfts, 
  title, 
  emptyMessage = "NO NFTS FOUND" 
}) => {
  if (nfts.length === 0) {
    return (
      <StickerCard variant="default" className="p-8 text-center bg-[#F9F9F9]">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gray-300 border-4 border-black rounded-[20px] mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">😔</span>
          </div>
          <StatusBadge status="error" text={emptyMessage} size="md" />
        </div>
      </StickerCard>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black text-black uppercase">{title}</h3>
        <StatusBadge 
          status="success" 
          text={`${nfts.length} FOUND`} 
          size="md" 
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nfts.map((nft, index) => {
          // Determine collection based on contract address
          const isCloneX = nft.contractAddress.toLowerCase() === NFT_COLLECTIONS.CLONEX.contract.toLowerCase();
          const collection = isCloneX ? 'CLONEX' : 'ANIMUS';
          
          return (
            <NFTCard
              key={`${nft.contractAddress}-${nft.tokenId}-${index}`}
              nft={nft}
              collection={collection}
            />
          );
        })}
      </div>
    </div>
  );
};