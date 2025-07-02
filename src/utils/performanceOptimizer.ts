// Enhanced performance optimization utilities

interface BundleAnalysis {
  totalSize: number;
  chunks: Array<{
    name: string;
    size: number;
    gzipSize?: number;
    isVendor: boolean;
    isCritical: boolean;
  }>;
  recommendations: string[];
}

export const measureChunkLoadTime = (chunkName: string) => {
  const startTime = performance.now();
  
  return () => {
    const loadTime = performance.now() - startTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📦 Chunk '${chunkName}' loaded in ${loadTime.toFixed(2)}ms`);
    }
    
    // Report to analytics in production
    if (process.env.NODE_ENV === 'production' && 'gtag' in window) {
      (window as any).gtag('event', 'chunk_load_time', {
        chunk_name: chunkName,
        load_time: Math.round(loadTime),
        category: 'performance'
      });
    }
  };
};

export const preloadResource = (href: string, as: 'script' | 'style' | 'font' = 'script') => {
  if (typeof document === 'undefined') return;
  
  // Check if already preloaded
  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
};

export const observeChunkLoad = (chunkPromise: Promise<any>, chunkName: string) => {
  const endMeasurement = measureChunkLoadTime(chunkName);
  
  return chunkPromise
    .then(result => {
      endMeasurement();
      return result;
    })
    .catch(error => {
      endMeasurement();
      console.error(`Failed to load chunk '${chunkName}':`, error);
      throw error;
    });
};

// Enhanced bundle analyzer with performance recommendations
export const analyzeBundleSize = (): Promise<BundleAnalysis> => {
  if (typeof document === 'undefined') {
    return Promise.resolve({ totalSize: 0, chunks: [], recommendations: [] });
  }
  
  return new Promise((resolve) => {
    const chunks = document.querySelectorAll('script[src*="assets"]');
    const analysis: BundleAnalysis = {
      totalSize: 0,
      chunks: [],
      recommendations: []
    };
    
    const promises = Array.from(chunks).map(async (chunk) => {
      const src = (chunk as HTMLScriptElement).src;
      const chunkName = src.split('/').pop()?.replace('.js', '') || 'unknown';
      
      try {
        const response = await fetch(src, { method: 'HEAD' });
        const size = parseInt(response.headers.get('content-length') || '0');
        
        const isVendor = chunkName.includes('vendor');
        const isCritical = ['vendor-react', 'app-auth', 'app-wallet'].some(critical => 
          chunkName.includes(critical)
        );
        
        analysis.chunks.push({
          name: chunkName,
          size,
          isVendor,
          isCritical
        });
        
        analysis.totalSize += size;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`📦 ${chunkName}: ${(size / 1024).toFixed(2)}KB ${isCritical ? '(Critical)' : ''}`);
        }
      } catch (error) {
        console.warn(`❌ Could not analyze chunk: ${chunkName}`);
      }
    });
    
    Promise.all(promises).then(() => {
      // Generate recommendations
      const largeChunks = analysis.chunks.filter(chunk => chunk.size > 200 * 1024);
      const vendorSize = analysis.chunks
        .filter(chunk => chunk.isVendor)
        .reduce((sum, chunk) => sum + chunk.size, 0);
      
      if (largeChunks.length > 0) {
        analysis.recommendations.push(
          `⚠️ Large chunks detected: ${largeChunks.map(c => c.name).join(', ')}`
        );
      }
      
      if (vendorSize > 500 * 1024) {
        analysis.recommendations.push(
          `⚠️ Vendor bundle too large: ${(vendorSize / 1024).toFixed(2)}KB`
        );
      }
      
      if (analysis.totalSize > 1024 * 1024) {
        analysis.recommendations.push(
          `⚠️ Total bundle size: ${(analysis.totalSize / 1024 / 1024).toFixed(2)}MB`
        );
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.group('📊 Bundle Analysis');
        console.log(`📊 Total size: ${(analysis.totalSize / 1024).toFixed(2)}KB`);
        console.log(`📦 Vendor size: ${(vendorSize / 1024).toFixed(2)}KB`);
        console.log(`🎯 Critical chunks: ${analysis.chunks.filter(c => c.isCritical).length}`);
        
        if (analysis.recommendations.length > 0) {
          console.warn('📋 Recommendations:');
          analysis.recommendations.forEach(rec => console.warn(rec));
        }
        
        console.groupEnd();
      }
      
      resolve(analysis);
    });
  });
};

// Critical resource hints for faster loading - FIXED FONT PRELOADING
export const addCriticalResourceHints = () => {
  // Only preload fonts if we're actually using them immediately
  if (typeof document !== 'undefined') {
    // Check if Inter font is actually being used in CSS
    const hasInterFont = Array.from(document.styleSheets).some(sheet => {
      try {
        return Array.from(sheet.cssRules).some(rule => 
          rule.cssText && rule.cssText.includes('Inter')
        );
      } catch (e) {
        return false;
      }
    });

    // Only preload if we're using it
    if (hasInterFont) {
      preloadResource('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap', 'style');
    }
    
    // DNS prefetch for external resources
    const dnsPrefetch = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = href;
      document.head.appendChild(link);
    };
    
    dnsPrefetch('https://fonts.googleapis.com');
    dnsPrefetch('https://fonts.gstatic.com');
    dnsPrefetch('https://api.clonex.wtf');
    dnsPrefetch('https://eth-mainnet.g.alchemy.com');
  }
};

// Performance monitoring hook with Web Vitals
export const usePerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  // Monitor Core Web Vitals
  const reportWebVitals = () => {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      // Core Web Vitals
      getCLS((metric) => {
        console.log('📊 Cumulative Layout Shift:', metric);
        if (metric.value > 0.1) {
          console.warn('⚠️ CLS above threshold');
        }
      });
      
      getFID((metric) => {
        console.log('📊 First Input Delay:', metric);
        if (metric.value > 100) {
          console.warn('⚠️ FID above threshold');
        }
      });
      
      getFCP((metric) => {
        console.log('📊 First Contentful Paint:', metric);
        if (metric.value > 1800) {
          console.warn('⚠️ FCP slow');
        }
      });
      
      getLCP((metric) => {
        console.log('📊 Largest Contentful Paint:', metric);
        if (metric.value > 2500) {
          console.warn('⚠️ LCP slow');
        }
      });
      
      getTTFB((metric) => {
        console.log('📊 Time to First Byte:', metric);
        if (metric.value > 800) {
          console.warn('⚠️ TTFB slow');
        }
      });
    }).catch(error => {
      console.warn('Web Vitals library not available:', error);
    });
  };
  
  // Report after page load
  if (document.readyState === 'complete') {
    reportWebVitals();
  } else {
    window.addEventListener('load', reportWebVitals);
  }
};

// Smart preloading based on connection quality
export const adaptivePreloading = () => {
  if (typeof navigator === 'undefined') return { preload: false, reason: 'no-navigator' };
  
  // Check network conditions
  const connection = (navigator as any).connection;
  if (connection) {
    const { effectiveType, saveData, downlink } = connection;
    
    // Don't preload on slow connections or data saver mode
    if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
      return { preload: false, reason: 'slow-connection' };
    }
    
    // Limited preloading on 3G
    if (effectiveType === '3g' || downlink < 1.5) {
      return { preload: 'minimal', reason: '3g-connection' };
    }
  }
  
  // Check device memory (if available)
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory && deviceMemory < 4) {
    return { preload: 'minimal', reason: 'low-memory' };
  }
  
  return { preload: true, reason: 'good-conditions' };
};

// Optimize images and assets
export const optimizeAssets = () => {
  if (typeof document === 'undefined') return;
  
  // Add loading="lazy" to images not in viewport
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach((img, index) => {
    if (index > 2) { // First 3 images load immediately
      img.setAttribute('loading', 'lazy');
    }
  });
  
  // Optimize font loading - ensure fonts are actually used before preloading
  const fontFaces = document.querySelectorAll('link[rel="preload"][as="font"]');
  fontFaces.forEach(font => {
    if (!font.hasAttribute('crossorigin')) {
      font.setAttribute('crossorigin', 'anonymous');
    }
  });
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  // Defer critical resource hints to avoid unused preload warnings
  setTimeout(() => {
    addCriticalResourceHints();
  }, 100);
  
  // Defer non-critical optimizations
  setTimeout(() => {
    optimizeAssets();
    
    if (process.env.NODE_ENV === 'development') {
      analyzeBundleSize();
    }
  }, 1000);
  
  // Monitor performance
  usePerformanceMonitoring();
};