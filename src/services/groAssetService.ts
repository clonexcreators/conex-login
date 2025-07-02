import { AssetVariant, AssetCache, MultiAssetNFT, NFTData } from '../types';
import { GRO_CONFIG, ASSET_FALLBACK_ORDER, ASSET_ERRORS } from '../constants/groAssets';
import { ENV_CONFIG } from '../config/environment';

class GROAssetService {
  private cache: AssetCache = {
    preloadQueue: [],
    loadedAssets: new Map(),
    failedAssets: new Set(),
    cacheExpiry: Date.now() + (30 * 60 * 1000) // 30 minutes
  };

  private preloadPromises = new Map<string, Promise<boolean>>();
  private groAvailable: boolean | null = null; // Cache GRO server status

  async getAvailableAssets(collection: string, tokenId: string): Promise<AssetVariant[]> {
    // If GRO is disabled, return empty array immediately
    if (!ENV_CONFIG.groEnabled || ENV_CONFIG.forceGroFallback) {
      if (ENV_CONFIG.showGroStatus) {
        console.log('🚫 GRO disabled via configuration');
      }
      return [];
    }

    const normalizedCollection = this.normalizeCollectionName(collection);
    const collectionConfig = GRO_CONFIG.collections[normalizedCollection as keyof typeof GRO_CONFIG.collections];
    const assets: AssetVariant[] = [];
    
    if (collectionConfig) {
      // Check if GRO server is available (cached check)
      if (this.groAvailable === false) {
        if (ENV_CONFIG.showGroStatus) {
          console.log('🚫 GRO server unavailable (cached)');
        }
        return [];
      }

      for (const [assetType, path] of Object.entries(collectionConfig)) {
        try {
          const url = this.generateAssetURL(normalizedCollection, assetType, tokenId);
          
          // Special handling for CloneX 2D (coming soon)
          if (normalizedCollection === 'clonex' && assetType === '2d_illustration') {
            assets.push({
              type: assetType as any,
              url,
              available: false,
              comingSoon: true
            });
          } else {
            const available = await this.checkAssetAvailability(url);
            const preloaded = this.cache.loadedAssets.has(url);
            
            assets.push({
              type: assetType as any,
              url,
              available,
              preloaded
            });
          }
        } catch (error) {
          console.warn(`Failed to process asset ${assetType} for ${collection} #${tokenId}:`, error);
        }
      }
    }
    
    return assets;
  }

  async enhanceNFTWithAssets(nft: NFTData): Promise<MultiAssetNFT> {
    // Always set fallbackAsset to the original Alchemy/Moralis image first
    const fallbackAsset = nft.metadata.image;
    
    // If GRO is disabled, return immediately with original image
    if (!ENV_CONFIG.groEnabled || ENV_CONFIG.forceGroFallback) {
      return {
        ...nft,
        groAssets: [],
        currentAssetType: 'original',
        fallbackAsset,
        hasAnimation: false
      };
    }

    try {
      const collection = this.getCollectionFromContract(nft.contractAddress);
      const groAssets = await this.getAvailableAssets(collection, nft.tokenId);
      
      // Determine current asset type based on availability
      const fallbackOrder = ASSET_FALLBACK_ORDER[collection as keyof typeof ASSET_FALLBACK_ORDER] || [];
      let currentAssetType = 'original';
      let enhancedFallbackAsset = fallbackAsset;
      
      // Only try GRO assets if they're available
      if (groAssets.length > 0) {
        for (const assetType of fallbackOrder) {
          if (assetType === 'alchemy_backup') {
            break; // Use original fallback
          }
          
          const asset = groAssets.find(a => a.type === assetType && a.available);
          if (asset) {
            currentAssetType = assetType;
            enhancedFallbackAsset = asset.url;
            break;
          }
        }
      }
      
      return {
        ...nft,
        groAssets,
        currentAssetType,
        fallbackAsset: enhancedFallbackAsset,
        hasAnimation: groAssets.some(a => a.type === 'animation' && a.available)
      };
      
    } catch (error) {
      console.warn(`GRO enhancement failed for NFT ${nft.tokenId}, using fallback:`, error);
      
      // Always return a valid MultiAssetNFT with original image on error
      return {
        ...nft,
        groAssets: [],
        currentAssetType: 'original',
        fallbackAsset,
        hasAnimation: false
      };
    }
  }

  async preloadAssets(assets: AssetVariant[]): Promise<void> {
    // Skip preloading if GRO is disabled
    if (!ENV_CONFIG.groEnabled) {
      return;
    }

    // Only preload available assets that aren't already cached
    const assetsToPreload = assets.filter(asset => 
      asset.available && 
      !this.cache.loadedAssets.has(asset.url) &&
      !this.cache.failedAssets.has(asset.url)
    );
    
    const preloadPromises = assetsToPreload.map(asset => 
      this.preloadSingleAsset(asset.url)
    );
    
    await Promise.allSettled(preloadPromises);
  }

  async preloadSingleAsset(url: string): Promise<boolean> {
    // Check if we already have a preload promise for this URL
    if (this.preloadPromises.has(url)) {
      return this.preloadPromises.get(url)!;
    }

    const preloadPromise = this.performPreload(url);
    this.preloadPromises.set(url, preloadPromise);
    
    try {
      const success = await preloadPromise;
      if (success) {
        this.cache.loadedAssets.set(url, url);
      } else {
        this.cache.failedAssets.add(url);
      }
      return success;
    } finally {
      this.preloadPromises.delete(url);
    }
  }

  private async performPreload(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        resolve(false);
      }, ENV_CONFIG.groTimeout); // Use configurable timeout
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      
      img.src = url;
    });
  }

  generateAssetURL(collection: string, assetType: string, tokenId: string): string {
    const collectionConfig = GRO_CONFIG.collections[collection as keyof typeof GRO_CONFIG.collections];
    const path = collectionConfig?.[assetType as keyof typeof collectionConfig];
    
    if (path) {
      return `${ENV_CONFIG.groBaseUrl}${path}/${tokenId}.webp`;
    }
    
    throw new Error(`Asset type ${assetType} not found for collection ${collection}`);
  }

  async checkAssetAvailability(url: string): Promise<boolean> {
    // Check cache first
    if (this.cache.loadedAssets.has(url)) return true;
    if (this.cache.failedAssets.has(url)) return false;
    
    // If GRO server is known to be unavailable, return false immediately
    if (this.groAvailable === false) return false;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), ENV_CONFIG.groTimeout);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        // Mark GRO as available on first success
        if (this.groAvailable === null) {
          this.groAvailable = true;
          if (ENV_CONFIG.showGroStatus) {
            console.log('✅ GRO server is available');
          }
        }
        return true;
      } else {
        this.cache.failedAssets.add(url);
        return false;
      }
    } catch (error) {
      // Mark GRO as unavailable on network errors
      if (this.groAvailable === null) {
        this.groAvailable = false;
        if (ENV_CONFIG.showGroStatus) {
          console.warn('❌ GRO server unavailable:', error);
        }
      }
      
      this.cache.failedAssets.add(url);
      return false;
    }
  }

  private normalizeCollectionName(collection: string): string {
    const contractToCollection: Record<string, string> = {
      '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b': 'clonex',
      '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f': 'animus',
      '0x6c410cf0b8c113dc6a7641b431390b11d5515082': 'animus_egg',
      '0x348fc118bcc65a92dc033a951af153d14d945312': 'clonex_vials'
    };
    
    // If it's a contract address, convert it
    if (collection.startsWith('0x')) {
      return contractToCollection[collection.toLowerCase()] || 'clonex';
    }
    
    return collection.toLowerCase();
  }

  private getCollectionFromContract(contractAddress: string): string {
    const address = contractAddress.toLowerCase();
    
    if (address.includes('49cf6f5d44e70224e2e23fdcdd2c053f30ada28b')) {
      return 'clonex';
    } else if (address.includes('ec99492dd9ef8ca48f691acd67d2c96a0a43935f')) {
      return 'animus';
    } else if (address.includes('6c410cf0b8c113dc6a7641b431390b11d5515082')) {
      return 'animus_egg';
    } else if (address.includes('348fc118bcc65a92dc033a951af153d14d945312')) {
      return 'clonex_vials';
    }
    
    return 'clonex';
  }

  getCacheStatus(): 'empty' | 'partial' | 'complete' {
    if (!ENV_CONFIG.groEnabled) {
      return 'empty'; // No caching when GRO disabled
    }
    
    const totalAssets = this.cache.preloadQueue.length;
    const loadedAssets = this.cache.loadedAssets.size;
    
    if (loadedAssets === 0) return 'empty';
    if (loadedAssets < totalAssets) return 'partial';
    return 'complete';
  }

  clearCache(): void {
    this.cache.loadedAssets.clear();
    this.cache.failedAssets.clear();
    this.cache.preloadQueue = [];
    this.preloadPromises.clear();
    this.groAvailable = null; // Reset GRO availability check
  }

  getAssetWithFallback(nft: MultiAssetNFT, preferredType?: string): string {
    // Always prioritize the original fallback asset when GRO is disabled
    if (!ENV_CONFIG.groEnabled || nft.groAssets.length === 0) {
      return nft.fallbackAsset || nft.metadata.image;
    }

    const targetType = preferredType || nft.currentAssetType;
    
    // Try to get the preferred asset type
    const preferredAsset = nft.groAssets.find(a => a.type === targetType && a.available);
    if (preferredAsset && this.cache.loadedAssets.has(preferredAsset.url)) {
      return preferredAsset.url;
    }
    
    // Try fallback order
    const collection = this.getCollectionFromContract(nft.contractAddress);
    const fallbackOrder = ASSET_FALLBACK_ORDER[collection as keyof typeof ASSET_FALLBACK_ORDER] || [];
    
    for (const assetType of fallbackOrder) {
      if (assetType === 'alchemy_backup') {
        return nft.metadata.image;
      }
      
      const asset = nft.groAssets.find(a => a.type === assetType && a.available);
      if (asset) {
        return asset.url;
      }
    }
    
    // Final fallback to original metadata image
    return nft.fallbackAsset || nft.metadata.image;
  }

  // Get GRO server status for debugging
  getGroStatus(): { enabled: boolean; available: boolean | null; timeout: number } {
    return {
      enabled: ENV_CONFIG.groEnabled,
      available: this.groAvailable,
      timeout: ENV_CONFIG.groTimeout
    };
  }
}

export const groAssetService = new GROAssetService();