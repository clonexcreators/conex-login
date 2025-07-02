import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProductionApp } from './components/ProductionApp';
import './index.css';
import { addCriticalResourceHints, usePerformanceMonitoring } from './utils/performanceOptimizer';

// Initialize performance optimizations
addCriticalResourceHints();

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ProductionApp />
  </StrictMode>
);

// Initialize performance monitoring
usePerformanceMonitoring();