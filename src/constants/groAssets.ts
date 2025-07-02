import { GROAssetConfig } from '../types';

export const GRO_CONFIG: GROAssetConfig = {
  baseURL: import.meta.env.VITE_GRO_BASE_URL || 'https://gro.clonex.wtf',
  collections: {
    clonex: {
      '3d_character': '/assets/clonex/3d_character/thumbnails',
      // '2d_illustration': '/assets/clonex/2d_illustration/thumbnails' // Coming soon
    },
    animus: {
      '3d_character': '/assets/animus/3d_character/thumbnails',
      '2d_illustration': '/assets/animus/2d_illustration/thumbnails'
    },
    animus_egg: {
      '3d_image': '/assets/animus_egg/3d_image/thumbnails',
      'animation': '/assets/animus_egg/animation/thumbnails'
    },
    clonex_vials: {
      '3d_image': '/assets/clonex_vials/3d_image/thumbnails',
      'animation': '/assets/clonex_vials/animation/thumbnails'
    }
  }
};

export const ASSET_FALLBACK_ORDER = {
  clonex: ['3d_character', '2d_illustration', 'alchemy_backup'],
  animus: ['3d_character', '2d_illustration', 'alchemy_backup'],
  animus_egg: ['3d_image', 'animation', 'alchemy_backup'],
  clonex_vials: ['3d_image', 'animation', 'alchemy_backup']
};

export const ASSET_ERRORS = {
  groOffline: "GRO OFFLINE - USING BACKUP",
  assetNotFound: "3D ASSET NOT FOUND - TRYING 2D",
  allAssetsFailed: "NO ASSETS FOUND - PLACEHOLDER MODE",
  loadingTimeout: "LOADING FAILED - RETRY?",
  preloadFailed: "PRELOAD FAILED - LOADING ON DEMAND"
};

export const ASSET_MESSAGES = {
  loading3D: "LOADING 3D MOLECULAR STRUCTURES...",
  preloading2D: "PRELOADING 2D SCHEMATICS...",
  assetReady: "MOLECULAR DATA READY",
  cached: "CACHED",
  multipleAssets: "MULTIPLE MOLECULAR FORMATS AVAILABLE",
  backupImage: "BACKUP MOLECULAR STRUCTURE",
  optimizedByGro: "OPTIMIZED BY GRO RESEARCH LAB",
  comingSoon: "RESEARCH IN PROGRESS",
  assetCacheReady: "MOLECULAR CACHE READY"
};