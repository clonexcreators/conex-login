import React from 'react';
import { StickerCard } from './StickerCard';
import { StatusBadge } from './StatusBadge';
import { AlertTriangle } from 'lucide-react';

interface ComponentFallbackProps {
  componentName: string;
  message?: string;
}

export const ComponentFallback: React.FC<ComponentFallbackProps> = ({
  componentName,
  message
}) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <StickerCard variant="research-panel" className="bg-[#FF2D75] text-white text-center">
        <div className="w-16 h-16 bg-white border-4 border-black rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-[#FF2D75]" strokeWidth={3} />
        </div>
        
        <h2 className="text-2xl font-black uppercase tracking-wide mb-4">
          COMPONENT NOT FOUND
        </h2>
        
        <StatusBadge 
          status="error" 
          text={`${componentName.toUpperCase()} MISSING`} 
          size="md" 
        />
        
        <p className="text-lg font-bold mt-6 opacity-90">
          {message || "The requested component is under construction or missing from the system."}
        </p>
        
        <div className="bg-black border-4 border-white rounded-2xl p-4 mt-6">
          <p className="text-sm font-bold text-[#34EEDC] uppercase tracking-wide">
            COMPONENT: {componentName}
          </p>
          <p className="text-xs text-white mt-2">
            This fallback ensures the app keeps running even when components are missing.
          </p>
        </div>
        
        {/* Decorative Pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <div className="w-full h-full bg-white transform rotate-45 translate-x-16 -translate-y-16"></div>
        </div>
      </StickerCard>
    </div>
  );
};

export default ComponentFallback;