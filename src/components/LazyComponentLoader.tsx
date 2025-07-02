import React, { Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyComponentLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
}

export const LazyComponentLoader: React.FC<LazyComponentLoaderProps> = ({ 
  children, 
  fallback,
  minHeight = '200px'
}) => {
  const defaultFallback = (
    <div 
      className="flex items-center justify-center w-full bg-[#F9F9F9] border-4 border-black rounded-[20px] sticker-shadow"
      style={{ minHeight }}
    >
      <LoadingSpinner />
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// High-order component for lazy loading with error boundary
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));
  
  return React.forwardRef<any, P>((props, ref) => (
    <LazyComponentLoader fallback={fallback}>
      <LazyComponent {...props} ref={ref} />
    </LazyComponentLoader>
  ));
};