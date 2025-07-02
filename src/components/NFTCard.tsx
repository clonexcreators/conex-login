import React from 'react';
import { NFTData } from '../types';
import { StickerCard } from './StickerCard';
import { StatusBadge } from './StatusBadge';
import { NFT_COLLECTIONS } from '../constants/nftCollections';
import { Shield, Users, Link, ExternalLink } from 'lucide-react';

interface NFTCardProps {
  nft: NFTData;
  collection: keyof typeof NFT_COLLECTIONS;
}

export const NFTCard: React.FC<NFTCardProps> = ({ nft, collection }) => {
  const collectionInfo = NFT_COLLECTIONS[collection.toUpperCase() as keyof typeof NFT_COLLECTIONS];
  const isDelegated = nft.ownershipContext === 'DELEGATED';
  const isBlockchainVerified = nft.blockchainVerification?.verified;
  
  const getCollectionIcon = () => {
    const isCloneX = collection.toLowerCase().includes('clonex');
    return isCloneX ? Shield : Users;
  };
  
  const getCollectionColor = () => {
    const collectionName = collection.toLowerCase();
    if (collectionName.includes('clonex')) return 'bg-[#FF5AF7]';
    if (collectionName.includes('animus')) return 'bg-[#00C2FF]';
    return 'bg-[#6EFFC7]';
  };
  
  const Icon = getCollectionIcon();
  
  return (
    <div className="relative">
      <StickerCard variant="research-panel" className="overflow-hidden hover:scale-[1.02] transition-transform duration-200">
        {/* NFT Image */}
        <div className="aspect-square bg-[#F5F5F5] border-2 border-[#1C1C1C] rounded-[12px] mb-4 overflow-hidden relative">
          {nft.metadata.image ? (
            <img
              src={nft.metadata.image}
              alt={nft.metadata.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/400x400/FF5AF7/FFFFFF?text=${collection.toUpperCase()}%20%23${nft.tokenId}`;
              }}
            />
          ) : (
            <div className={`w-full h-full ${getCollectionColor()} flex items-center justify-center`}>
              <Icon className="w-16 h-16 text-black" strokeWidth={2.5} />
            </div>
          )}
          
          {/* Ownership Context Indicator */}
          <div className="absolute top-2 left-2">
            {isDelegated ? (
              <StatusBadge status="active" text="DELEGATED" size="sm" />
            ) : (
              <StatusBadge status="verified" text="OWNED" size="sm" />
            )}
          </div>
        </div>
        
        {/* NFT Info */}
        <div className="space-y-3">
          <div>
            <h3 className="lab-heading-md">
              {nft.metadata.name || `${collectionInfo.name} #${nft.tokenId}`}
            </h3>
            <p className="lab-text-sm">
              SPECIMEN #{nft.tokenId}
            </p>
          </div>
          
          {/* Delegation Info */}
          {isDelegated && nft.delegationInfo && (
            <div className="lab-surface p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-[#00C2FF]" strokeWidth={2.5} />
                <span className="lab-text-sm font-bold">DELEGATED ACCESS</span>
              </div>
              <div className="lab-text-sm">
                FROM: <span className="font-bold text-[#FF5AF7]">
                  {nft.delegationInfo.vaultWallet.slice(0, 6)}...{nft.delegationInfo.vaultWallet.slice(-4)}
                </span>
              </div>
              <StatusBadge 
                status="active" 
                text={`${nft.delegationInfo.delegationType.type} DELEGATION`} 
                size="sm" 
              />
            </div>
          )}
          
          {/* Traits */}
          {nft.metadata.attributes && nft.metadata.attributes.length > 0 && (
            <div className="space-y-2">
              <div className="lab-text-sm font-bold">MOLECULAR TRAITS</div>
              <div className="flex flex-wrap gap-1">
                {nft.metadata.attributes.slice(0, 3).map((attr, index) => (
                  <StatusBadge
                    key={index}
                    status="active"
                    text={`${attr.trait_type}: ${attr.value}`}
                    size="sm"
                  />
                ))}
                {nft.metadata.attributes.length > 3 && (
                  <StatusBadge
                    status="active"
                    text={`+${nft.metadata.attributes.length - 3} MORE`}
                    size="sm"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </StickerCard>
      
      {/* Blockchain Verification Status */}
      <div className="absolute top-2 right-2 z-10">
        <StatusBadge 
          status={isBlockchainVerified ? "verified" : "error"} 
          text={isBlockchainVerified ? "VERIFIED" : "UNVERIFIED"} 
          size="sm" 
        />
      </div>
      
      {/* Data Source Indicator */}
      <div className="absolute bottom-2 left-2 z-10">
        <StatusBadge 
          status="active" 
          text={nft.verificationSource} 
          size="sm" 
        />
      </div>
      
      {/* External Link for OpenSea */}
      <div className="absolute bottom-2 right-2 z-10">
        <a
          href={`${collectionInfo.opensea}/${nft.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="lab-surface p-2 hover:scale-110 transition-transform duration-150"
        >
          <ExternalLink className="w-3 h-3 text-[#4A4A4A]" strokeWidth={2.5} />
        </a>
      </div>
    </div>
  );
};