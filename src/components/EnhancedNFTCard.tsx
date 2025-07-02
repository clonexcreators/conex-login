import React, { useState, useEffect } from 'react';
import { MultiAssetNFT } from '../types';
import { StickerCard } from './StickerCard';
import { StatusBadge } from './StatusBadge';
import { AssetTypeToggle } from './AssetTypeToggle';
import { NFT_COLLECTIONS } from '../constants/nftCollections';
import { ASSET_MESSAGES } from '../constants/groAssets';
import { groAssetService } from '../services/groAssetService';
import { ENV_CONFIG } from '../config/environment';
import { Zap, Image, Play, Shield, Users, Link, ExternalLink, Database } from 'lucide-react';

interface EnhancedNFTCardProps {
  nft: MultiAssetNFT;
  collection: keyof typeof NFT_COLLECTIONS;
  showAssetToggle?: boolean;
  className?: string;
}

export const EnhancedNFTCard: React.FC<EnhancedNFTCardProps> = ({ 
  nft, 
  collection,
  showAssetToggle = true,
  className = ''
}) => {
  const [currentAssetType, setCurrentAssetType] = useState(nft.currentAssetType);
  const [currentImageUrl, setCurrentImageUrl] = useState(nft.fallbackAsset || nft.metadata.image);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const collectionInfo = NFT_COLLECTIONS[collection.toUpperCase() as keyof typeof NFT_COLLECTIONS];
  const isDelegated = nft.ownershipContext === 'DELEGATED';
  const isBlockchainVerified = nft.blockchainVerification?.verified;
  const hasAvailableAssets = nft.groAssets.filter(a => a.available).length > 0;
  const hasMultipleAssets = hasAvailableAssets && nft.groAssets.filter(a => a.available).length > 1;
  
  const getCollectionIcon = () => {
    const collectionName = collection.toLowerCase();
    if (collectionName.includes('clonex')) return Shield;
    if (collectionName.includes('animus')) return Users;
    return Database;
  };
  
  const getCollectionColor = () => {
    const collectionName = collection.toLowerCase();
    if (collectionName.includes('clonex')) return 'bg-[#FF5AF7]';
    if (collectionName.includes('animus')) return 'bg-[#00C2FF]';
    return 'bg-[#6EFFC7]';
  };
  
  useEffect(() => {
    // Always ensure we have a valid image URL
    if (!currentImageUrl) {
      setCurrentImageUrl(nft.fallbackAsset || nft.metadata.image);
      return;
    }

    // Update image when asset type changes (only if GRO is enabled and assets are available)
    if (ENV_CONFIG.groEnabled && hasAvailableAssets) {
      const newImageUrl = groAssetService.getAssetWithFallback(nft, currentAssetType);
      if (newImageUrl !== currentImageUrl) {
        setImageLoading(true);
        setImageError(false);
        setCurrentImageUrl(newImageUrl);
      }
    }
  }, [currentAssetType, nft, currentImageUrl, hasAvailableAssets]);

  const handleAssetTypeChange = (newType: string) => {
    // Only allow asset type changes if GRO is enabled and assets are available
    if (ENV_CONFIG.groEnabled && hasAvailableAssets) {
      setCurrentAssetType(newType);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    // Always fallback to original metadata image on error
    setCurrentImageUrl(nft.metadata.image);
  };

  const getAssetTypeIcon = () => {
    if (currentAssetType.includes('3d')) {
      return <Zap className="w-3 h-3" strokeWidth={2.5} />;
    } else if (currentAssetType.includes('animation')) {
      return <Play className="w-3 h-3" strokeWidth={2.5} />;
    }
    return <Image className="w-3 h-3" strokeWidth={2.5} />;
  };

  const getAssetTypeLabel = () => {
    if (!ENV_CONFIG.groEnabled) return 'ALCHEMY/MORALIS';
    if (currentAssetType === 'original') return 'BACKUP IMAGE';
    return currentAssetType.replace('_', ' ').toUpperCase();
  };

  const Icon = getCollectionIcon();

  return (
    <div className={`relative ${className}`}>
      <StickerCard variant="research-panel" className="overflow-hidden hover:scale-[1.02] transition-transform duration-200">
        {/* NFT Image with Research Lab styling */}
        <div className="relative aspect-square bg-[#F5F5F5] border-2 border-[#1C1C1C] rounded-[12px] mb-4 overflow-hidden">
          {imageLoading && (
            <div className="absolute inset-0 bg-[#00C2FF] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={nft.metadata.name}
              className="w-full h-full object-cover transition-opacity duration-300"
              style={{ 
                opacity: imageLoading ? 0 : 1,
                imageRendering: 'crisp-edges'
              }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div className={`w-full h-full ${getCollectionColor()} flex items-center justify-center`}>
              <Icon className="w-16 h-16 text-black" strokeWidth={2.5} />
            </div>
          )}
          
          {/* Asset type indicator - only show if assets available or original */}
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center gap-1 lab-surface px-2 py-1">
              {getAssetTypeIcon()}
              <span className="text-xs font-bold text-black">
                {getAssetTypeLabel()}
              </span>
            </div>
          </div>
          
          {/* GRO optimization badge - only show for GRO assets */}
          {ENV_CONFIG.groEnabled && currentImageUrl.includes('gro.clonex.wtf') && (
            <div className="absolute top-2 right-2 z-10">
              <StatusBadge 
                status="verified" 
                text="GRO OPTIMIZED" 
                size="sm" 
              />
            </div>
          )}
          
          {/* GRO disabled indicator - show in dev mode */}
          {ENV_CONFIG.showGroStatus && !ENV_CONFIG.groEnabled && (
            <div className="absolute top-2 right-2 z-10">
              <StatusBadge 
                status="error" 
                text="GRO DISABLED" 
                size="sm" 
              />
            </div>
          )}
          
          {/* Ownership Context Indicator */}
          <div className="absolute bottom-2 left-2 z-10">
            {isDelegated ? (
              <StatusBadge status="active" text="DELEGATED" size="sm" />
            ) : (
              <StatusBadge status="verified" text="OWNED" size="sm" />
            )}
          </div>
          
          {/* Animation indicator - only if assets available */}
          {nft.hasAnimation && hasAvailableAssets && (
            <div className="absolute bottom-2 right-2 z-10">
              <StatusBadge 
                status="active" 
                text="ANIMATED" 
                size="sm" 
              />
            </div>
          )}
        </div>
        
        {/* Asset Type Toggle - only show if GRO enabled and multiple assets available */}
        {showAssetToggle && ENV_CONFIG.groEnabled && hasMultipleAssets && (
          <div className="mb-4">
            <AssetTypeToggle
              availableTypes={nft.groAssets}
              currentType={currentAssetType}
              onTypeChange={handleAssetTypeChange}
            />
          </div>
        )}
        
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
          
          {/* Multiple Assets Badge - only if assets available */}
          {ENV_CONFIG.groEnabled && hasMultipleAssets && (
            <StatusBadge 
              status="active" 
              text={ASSET_MESSAGES.multipleAssets} 
              size="sm" 
            />
          )}
          
          {/* No GRO Assets Available Badge */}
          {ENV_CONFIG.groEnabled && !hasAvailableAssets && (
            <StatusBadge 
              status="error" 
              text="NO 3D ASSETS AVAILABLE" 
              size="sm" 
            />
          )}
          
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
          
          {/* Molecular Traits */}
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
      
      {/* Blockchain Verification Badge */}
      <div className="absolute top-2 right-2 z-20">
        <StatusBadge 
          status={isBlockchainVerified ? "verified" : "error"} 
          text={isBlockchainVerified ? "VERIFIED" : "UNVERIFIED"} 
          size="sm" 
        />
      </div>
      
      {/* Provider Source Indicator */}
      <div className="absolute bottom-2 left-2 z-20">
        <StatusBadge 
          status="active" 
          text={nft.verificationSource} 
          size="sm" 
        />
      </div>
      
      {/* External Link */}
      <div className="absolute bottom-2 right-2 z-20">
        <a
          href={`${collectionInfo.opensea}/${nft.tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="lab-surface p-2 hover:scale-110 transition-transform duration-150"
        >
          <ExternalLink className="w-3 h-3 text-[#4A4A4A]" strokeWidth={2.5} />
        </a>
      </div>
      
      {/* Error state indicator */}
      {imageError && (
        <div className="absolute bottom-8 right-2 z-20">
          <StatusBadge 
            status="error" 
            text="BACKUP IMAGE" 
            size="sm" 
          />
        </div>
      )}
    </div>
  );
};