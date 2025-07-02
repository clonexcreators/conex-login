import { useState, useEffect, useCallback } from 'react';
import { MultiAssetNFT, AssetLoadingState, NFTData } from '../types';
import { groAssetService } from '../services/groAssetService';
import { ASSET_MESSAGES } from '../constants/groAssets';

interface AssetManagerState {
  enhancedNFTs: MultiAssetNFT[];
  loadingState: AssetLoadingState;
  error: string | null;
}

export const useAssetManager = () => {
  const [assetState, setAssetState] = useState<AssetManagerState>({
    enhancedNFTs: [],
    loadingState: {
      isLoading: false,
      currentAsset: null,
      preloadingAssets: [],
      failedAssets: [],
      cacheStatus: 'empty'
    },
    error: null
  });

  const enhanceNFTsWithAssets = useCallback(async (nfts: NFTData[]) => {
    if (nfts.length === 0) return;

    setAssetState(prev => ({
      ...prev,
      loadingState: {
        ...prev.loadingState,
        isLoading: true,
        currentAsset: ASSET_MESSAGES.loading3D
      }
    }));

    try {
      const enhancedNFTs: MultiAssetNFT[] = [];
      const preloadQueue: string[] = [];

      // Process each NFT
      for (const nft of nfts) {
        try {
          const enhancedNFT = await groAssetService.enhanceNFTWithAssets(nft);
          enhancedNFTs.push(enhancedNFT);
          
          // Add available assets to preload queue
          enhancedNFT.groAssets
            .filter(asset => asset.available)
            .forEach(asset => preloadQueue.push(asset.type));
          
        } catch (error) {
          console.warn(`Failed to enhance NFT ${nft.tokenId}:`, error);
          // Add as regular NFT with empty asset array
          enhancedNFTs.push({
            ...nft,
            groAssets: [],
            currentAssetType: 'original',
            fallbackAsset: nft.metadata.image
          });
        }
      }

      setAssetState(prev => ({
        ...prev,
        enhancedNFTs,
        loadingState: {
          ...prev.loadingState,
          isLoading: false,
          preloadingAssets: preloadQueue,
          currentAsset: null
        }
      }));

      // Start preloading assets in background
      if (enhancedNFTs.length > 0) {
        preloadAssetsInBackground(enhancedNFTs);
      }

    } catch (error: any) {
      setAssetState(prev => ({
        ...prev,
        error: error.message || 'Failed to enhance NFTs with assets',
        loadingState: {
          ...prev.loadingState,
          isLoading: false,
          currentAsset: null
        }
      }));
    }
  }, []);

  const preloadAssetsInBackground = useCallback(async (enhancedNFTs: MultiAssetNFT[]) => {
    setAssetState(prev => ({
      ...prev,
      loadingState: {
        ...prev.loadingState,
        currentAsset: ASSET_MESSAGES.preloading2D
      }
    }));

    try {
      for (const nft of enhancedNFTs) {
        if (nft.groAssets.length > 0) {
          await groAssetService.preloadAssets(nft.groAssets);
          
          // Update preloading progress
          setAssetState(prev => ({
            ...prev,
            loadingState: {
              ...prev.loadingState,
              preloadingAssets: prev.loadingState.preloadingAssets.filter(
                asset => !nft.groAssets.some(a => a.type === asset)
              )
            }
          }));
        }
      }

      // Update cache status
      const cacheStatus = groAssetService.getCacheStatus();
      setAssetState(prev => ({
        ...prev,
        loadingState: {
          ...prev.loadingState,
          currentAsset: null,
          preloadingAssets: [],
          cacheStatus
        }
      }));

    } catch (error) {
      console.warn('Background asset preloading failed:', error);
      setAssetState(prev => ({
        ...prev,
        loadingState: {
          ...prev.loadingState,
          currentAsset: null,
          preloadingAssets: []
        }
      }));
    }
  }, []);

  const clearAssetCache = useCallback(() => {
    groAssetService.clearCache();
    setAssetState(prev => ({
      ...prev,
      loadingState: {
        ...prev.loadingState,
        cacheStatus: 'empty',
        preloadingAssets: [],
        failedAssets: []
      }
    }));
  }, []);

  const retryFailedAssets = useCallback(async () => {
    const { enhancedNFTs } = assetState;
    if (enhancedNFTs.length > 0) {
      await preloadAssetsInBackground(enhancedNFTs);
    }
  }, [assetState.enhancedNFTs, preloadAssetsInBackground]);

  return {
    enhancedNFTs: assetState.enhancedNFTs,
    loadingState: assetState.loadingState,
    error: assetState.error,
    enhanceNFTsWithAssets,
    clearAssetCache,
    retryFailedAssets
  };
};