import { useEffect, useCallback } from 'react';

interface PreloadOptions {
  delay?: number;
  priority?: 'high' | 'low';
  condition?: () => boolean;
}

export const useChunkPreloader = () => {
  const preloadChunk = useCallback(async (
    importFn: () => Promise<any>,
    options: PreloadOptions = {}
  ) => {
    const { delay = 0, priority = 'low', condition = () => true } = options;
    
    // Check condition before preloading
    if (!condition()) return;
    
    // Use requestIdleCallback for low priority preloading
    const executePreload = () => {
      setTimeout(async () => {
        try {
          await importFn();
        } catch (error) {
          console.warn('Chunk preload failed:', error);
        }
      }, delay);
    };
    
    if (priority === 'low' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(executePreload);
    } else {
      executePreload();
    }
  }, []);

  const preloadOnHover = useCallback((
    element: HTMLElement | null,
    importFn: () => Promise<any>
  ) => {
    if (!element) return;
    
    let preloaded = false;
    
    const handleMouseEnter = () => {
      if (!preloaded) {
        preloaded = true;
        preloadChunk(importFn, { priority: 'high' });
      }
    };
    
    element.addEventListener('mouseenter', handleMouseEnter, { once: true });
    
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [preloadChunk]);

  const preloadOnIntersection = useCallback((
    targetSelector: string,
    importFn: () => Promise<any>,
    options: IntersectionObserverInit = { threshold: 0.1 }
  ) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          preloadChunk(importFn, { priority: 'high' });
          observer.disconnect();
        }
      });
    }, options);
    
    const elements = document.querySelectorAll(targetSelector);
    elements.forEach(element => observer.observe(element));
    
    return () => observer.disconnect();
  }, [preloadChunk]);

  return {
    preloadChunk,
    preloadOnHover,
    preloadOnIntersection
  };
};

// Specific preloading hooks for different app sections
export const useNFTPreloader = () => {
  const { preloadChunk, preloadOnHover } = useChunkPreloader();
  
  useEffect(() => {
    // Preload NFT components when app loads
    preloadChunk(
      () => import('../utils/lazyImports').then(m => m.preloadNFTComponents()),
      { delay: 2000, priority: 'low' }
    );
  }, [preloadChunk]);
  
  const preloadOnNFTHover = useCallback((element: HTMLElement | null) => {
    return preloadOnHover(element, () => import('../components/EnhancedNFTCard'));
  }, [preloadOnHover]);
  
  return { preloadOnNFTHover };
};

export const useAuthPreloader = () => {
  const { preloadChunk, preloadOnHover } = useChunkPreloader();
  
  const preloadOnConnectHover = useCallback((element: HTMLElement | null) => {
    return preloadOnHover(element, () => import('../components/AuthChallenge'));
  }, [preloadOnHover]);
  
  return { preloadOnConnectHover };
};