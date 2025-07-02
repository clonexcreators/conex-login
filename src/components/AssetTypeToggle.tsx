import React from 'react';
import { AssetVariant } from '../types';
import { StickerButton } from './StickerButton';
import { StatusBadge } from './StatusBadge';
import { ASSET_MESSAGES } from '../constants/groAssets';

interface AssetTypeToggleProps {
  availableTypes: AssetVariant[];
  currentType: string;
  onTypeChange: (type: string) => void;
  className?: string;
}

export const AssetTypeToggle: React.FC<AssetTypeToggleProps> = ({
  availableTypes,
  currentType,
  onTypeChange,
  className = ''
}) => {
  const formatAssetType = (type: string) => {
    switch (type) {
      case '3d_character':
        return '3D CHARACTER';
      case '2d_illustration':
        return '2D ILLUSTRATION';
      case '3d_image':
        return '3D IMAGE';
      case 'animation':
        return 'ANIMATION';
      default:
        return type.toUpperCase();
    }
  };

  const getButtonVariant = (assetType: string) => {
    if (assetType === currentType) return 'primary';
    return 'secondary';
  };

  // Filter to only show available or coming soon assets
  const displayableAssets = availableTypes.filter(asset => 
    asset.available || asset.comingSoon
  );

  if (displayableAssets.length <= 1) {
    return null; // Don't show toggle if only one asset type
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayableAssets.map((asset) => (
        <div key={asset.type} className="relative">
          <StickerButton
            variant={getButtonVariant(asset.type)}
            size="sm"
            onClick={() => asset.available && onTypeChange(asset.type)}
            disabled={!asset.available}
            className="min-w-[120px]"
          >
            {formatAssetType(asset.type)}
          </StickerButton>
          
          {/* Asset status indicators */}
          <div className="absolute -top-2 -right-2 flex flex-col gap-1">
            {asset.comingSoon && (
              <StatusBadge 
                status="loading" 
                text="SOON" 
                size="sm" 
              />
            )}
            {asset.preloaded && asset.available && (
              <StatusBadge 
                status="success" 
                text="CACHED" 
                size="sm" 
              />
            )}
          </div>
        </div>
      ))}
      
      {/* Multiple assets indicator */}
      {displayableAssets.length > 1 && (
        <div className="flex items-center ml-4">
          <StatusBadge 
            status="active" 
            text={ASSET_MESSAGES.multipleAssets} 
            size="sm" 
          />
        </div>
      )}
    </div>
  );
};