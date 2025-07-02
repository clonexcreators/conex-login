import { lazy } from 'react';
import React from 'react';
import ComponentFallback from '../components/ComponentFallback';

// === SAFE LAZY LOADING WRAPPER ===

/**
 * Creates a safe lazy wrapper that handles import failures gracefully
 */
const createSafeLazy = (importFn: () => Promise<any>, componentName: string) => {
  return lazy(async () => {
    try {
      const module = await importFn();
      
      // Verify the component exists
      if (!module.default && !module[componentName]) {
        console.warn(`Component ${componentName} not found in module, using fallback`);
        return { 
          default: () => React.createElement(ComponentFallback, { 
            componentName,
            message: "Component export not found in module" 
          })
        };
      }
      
      return module;
    } catch (error) {
      console.warn(`Failed to load component ${componentName}:`, error);
      return { 
        default: () => React.createElement(ComponentFallback, { 
          componentName,
          message: "Failed to load component from server" 
        })
      };
    }
  });
};

// === SAFE LAZY LOADED COMPONENTS ===

// Authentication Components (loaded when auth is needed)
export const LazyAuthChallenge = createSafeLazy(
  () => import('../components/AuthChallenge').then(module => ({ default: module.AuthChallenge })),
  'AuthChallenge'
);

export const LazyAuthStatus = createSafeLazy(
  () => import('../components/AuthStatus').then(module => ({ default: module.AuthStatus })),
  'AuthStatus'
);

export const LazyWalletButton = createSafeLazy(
  () => import('../components/WalletButton').then(module => ({ default: module.WalletButton })),
  'WalletButton'
);

// NFT Components (loaded when NFT features are accessed)
export const LazyNFTCard = createSafeLazy(
  () => import('../components/NFTCard').then(module => ({ default: module.NFTCard })),
  'NFTCard'
);

export const LazyNFTGrid = createSafeLazy(
  () => import('../components/NFTGrid').then(module => ({ default: module.NFTGrid })),
  'NFTGrid'
);

export const LazyEnhancedNFTCard = createSafeLazy(
  () => import('../components/EnhancedNFTCard').then(module => ({ default: module.EnhancedNFTCard })),
  'EnhancedNFTCard'
);

// Enhanced Features (loaded when advanced features are needed)
export const LazyVerificationSummary = createSafeLazy(
  () => import('../components/VerificationSummary').then(module => ({ default: module.VerificationSummary })),
  'VerificationSummary'
);

export const LazyAssetTypeToggle = createSafeLazy(
  () => import('../components/AssetTypeToggle').then(module => ({ default: module.AssetTypeToggle })),
  'AssetTypeToggle'
);

export const LazyAssetLoadingState = createSafeLazy(
  () => import('../components/AssetLoadingState').then(module => ({ default: module.AssetLoadingState })),
  'AssetLoadingState'
);

export const LazyCollectionBadge = createSafeLazy(
  () => import('../components/CollectionBadge').then(module => ({ default: module.CollectionBadge })),
  'CollectionBadge'
);

// UE5 Components (loaded only when UE5 features are accessed)
export const LazyUE5Status = createSafeLazy(
  () => import('../components/UE5Status').then(module => ({ default: module.UE5Status })),
  'UE5Status'
);

// Admin/Advanced Components (loaded only for high-tier users)
export const LazyAdminPanel = createSafeLazy(
  () => import('../components/AdminPanel').then(module => ({ default: module.AdminPanel })),
  'AdminPanel'
);

// === PRELOADING STRATEGIES ===

// Preload critical user flow components
export const preloadAuthFlow = async () => {
  try {
    console.log('🔄 Preloading authentication flow...');
    const components = await Promise.all([
      import('../components/AuthChallenge'),
      import('../components/AuthStatus'),
      import('../components/WalletButton')
    ]);
    console.log('✅ Auth flow preloaded');
    return components;
  } catch (error) {
    console.warn('⚠️ Auth flow preload failed:', error);
    return [];
  }
};

// Preload NFT components after successful authentication
export const preloadNFTComponents = async () => {
  try {
    console.log('🔄 Preloading NFT components...');
    const components = await Promise.all([
      import('../components/NFTCard'),
      import('../components/NFTGrid'),
      import('../components/EnhancedNFTCard'),
      import('../components/VerificationSummary')
    ]);
    console.log('✅ NFT components preloaded');
    return components;
  } catch (error) {
    console.warn('⚠️ NFT components preload failed:', error);
    return [];
  }
};

// Preload UI components for immediate interaction
export const preloadUIComponents = async () => {
  try {
    console.log('🔄 Preloading UI components...');
    const components = await Promise.all([
      import('../components/StatusBadge'),
      import('../components/StickerButton'),
      import('../components/StickerCard')
    ]);
    console.log('✅ UI components preloaded');
    return components;
  } catch (error) {
    console.warn('⚠️ UI components preload failed:', error);
    return [];
  }
};

// Preload advanced features for power users
export const preloadAdvancedFeatures = async () => {
  try {
    console.log('🔄 Preloading advanced features...');
    const components = await Promise.all([
      import('../components/AssetTypeToggle'),
      import('../components/AssetLoadingState'),
      import('../components/CollectionBadge')
    ]);
    console.log('✅ Advanced features preloaded');
    return components;
  } catch (error) {
    console.warn('⚠️ Advanced features preload failed:', error);
    return [];
  }
};

// UE5 integration preload (only if enabled)
export const preloadUE5Integration = async () => {
  try {
    console.log('🔄 Preloading UE5 integration...');
    const components = await Promise.all([
      import('../components/UE5Status'),
      import('../api/ue5AuthService'),
      import('../utils/ue5JWT')
    ]);
    console.log('✅ UE5 integration preloaded');
    return components;
  } catch (error) {
    console.warn('⚠️ UE5 integration preload failed:', error);
    return [];
  }
};

// Admin panel preload (only for COSMIC_CHAMPION level)
export const preloadAdminFeatures = async () => {
  try {
    console.log('🔄 Preloading admin features...');
    const components = await Promise.all([
      import('../components/AdminPanel')
    ]);
    console.log('✅ Admin features preloaded');
    return components;
  } catch (error) {
    console.warn('⚠️ Admin features preload failed:', error);
    return [];
  }
};

// === INTELLIGENT PRELOADING ===

// Preload based on user interaction patterns
export const intelligentPreload = (userState: {
  isConnected: boolean;
  isAuthenticated: boolean;
  hasNFTs: boolean;
  accessLevel?: string;
}) => {
  // If user is connected but not authenticated, preload auth flow
  if (userState.isConnected && !userState.isAuthenticated) {
    setTimeout(() => preloadAuthFlow(), 1000);
  }
  
  // If user is authenticated, preload NFT components
  if (userState.isAuthenticated) {
    setTimeout(() => preloadNFTComponents(), 500);
    
    // If user has NFTs, preload advanced features
    if (userState.hasNFTs) {
      setTimeout(() => preloadAdvancedFeatures(), 2000);
    }
    
    // For high-tier users, preload UE5 features
    if (userState.accessLevel && ['COSMIC_CHAMPION', 'CLONE_VANGUARD'].includes(userState.accessLevel)) {
      setTimeout(() => preloadUE5Integration(), 3000);
    }
    
    // For COSMIC_CHAMPION, preload admin features
    if (userState.accessLevel === 'COSMIC_CHAMPION') {
      setTimeout(() => preloadAdminFeatures(), 4000);
    }
  }
};

// === PERFORMANCE MONITORING ===

export const measureComponentLoadTime = (componentName: string) => {
  const startTime = performance.now();
  
  return () => {
    const loadTime = performance.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Component '${componentName}' loaded in ${loadTime.toFixed(2)}ms`);
    }
    
    // Report to analytics in production
    if (process.env.NODE_ENV === 'production' && 'gtag' in window) {
      (window as any).gtag('event', 'component_load_time', {
        component_name: componentName,
        load_time: Math.round(loadTime),
        category: 'performance'
      });
    }
  };
};

// Enhanced lazy loading with performance monitoring
export const createMonitoredLazyComponent = (
  importFn: () => Promise<any>,
  componentName: string
) => {
  const endMeasurement = measureComponentLoadTime(componentName);
  
  return createSafeLazy(async () => {
    try {
      const module = await importFn();
      endMeasurement();
      return module;
    } catch (error) {
      endMeasurement();
      console.error(`Failed to load component '${componentName}':`, error);
      throw error;
    }
  }, componentName);
};