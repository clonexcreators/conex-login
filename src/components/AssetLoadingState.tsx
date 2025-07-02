import React from 'react';
import { AssetLoadingState as AssetLoadingStateType } from '../types';
import { StatusBadge } from './StatusBadge';
import { StickerCard } from './StickerCard';
import { ASSET_MESSAGES } from '../constants/groAssets';
import { Loader, Image, Zap } from 'lucide-react';

interface AssetLoadingStateProps {
  loadingState: AssetLoadingStateType;
  className?: string;
}

export const AssetLoadingState: React.FC<AssetLoadingStateProps> = ({
  loadingState,
  className = ''
}) => {
  if (!loadingState.isLoading && loadingState.preloadingAssets.length === 0) {
    return null;
  }

  return (
    <StickerCard variant="bordered" className={`p-4 bg-[#F9F9F9] ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#87CEFA] border-2 border-black rounded-[12px] flex items-center justify-center">
            <Loader className="w-4 h-4 text-black animate-spin" strokeWidth={3} />
          </div>
          <div>
            <h4 className="text-sm font-black text-black uppercase">
              {loadingState.isLoading ? ASSET_MESSAGES.loading3D : ASSET_MESSAGES.preloading2D}
            </h4>
            <p className="text-xs font-bold text-black opacity-75">
              {loadingState.currentAsset ? `Loading ${loadingState.currentAsset}` : 'Processing assets...'}
            </p>
          </div>
        </div>
        
        <StatusBadge 
          status="loading" 
          text={`${loadingState.preloadingAssets.length} ASSETS`} 
          size="sm" 
        />
      </div>
      
      {/* Preloading queue */}
      {loadingState.preloadingAssets.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-bold text-black opacity-75 uppercase">
            PRELOAD QUEUE
          </div>
          <div className="flex flex-wrap gap-1">
            {loadingState.preloadingAssets.slice(0, 3).map((asset, index) => (
              <StatusBadge
                key={index}
                status="loading"
                text={asset.toUpperCase()}
                size="sm"
              />
            ))}
            {loadingState.preloadingAssets.length > 3 && (
              <StatusBadge
                status="loading"
                text={`+${loadingState.preloadingAssets.length - 3} MORE`}
                size="sm"
              />
            )}
          </div>
        </div>
      )}
      
      {/* Cache status */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t-2 border-black">
        <div className="flex items-center gap-2">
          <Image className="w-4 h-4 text-black" strokeWidth={3} />
          <span className="text-xs font-bold text-black uppercase">
            CACHE STATUS: {loadingState.cacheStatus.toUpperCase()}
          </span>
        </div>
        
        {loadingState.failedAssets.length > 0 && (
          <StatusBadge
            status="error"
            text={`${loadingState.failedAssets.length} FAILED`}
            size="sm"
          />
        )}
      </div>
      
      {/* Success state */}
      {loadingState.cacheStatus === 'complete' && !loadingState.isLoading && (
        <div className="mt-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#34EEDC]" strokeWidth={3} />
          <StatusBadge 
            status="success" 
            text={ASSET_MESSAGES.assetCacheReady} 
            size="sm" 
          />
        </div>
      )}
    </StickerCard>
  );
};