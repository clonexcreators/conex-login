import React from 'react';
import { StatusBadge } from './StatusBadge';
import { StickerCard } from './StickerCard';
import { Shield, Users } from 'lucide-react';

interface CollectionBadgeProps {
  collection: 'clonex' | 'animus';
  count: number;
  verified: boolean;
}

export const CollectionBadge: React.FC<CollectionBadgeProps> = ({ 
  collection, 
  count, 
  verified 
}) => {
  const isCloneX = collection === 'clonex';
  
  return (
    <StickerCard 
      variant="default" 
      className={`inline-block ${isCloneX ? 'bg-[#FF5AF7]' : 'bg-[#00C2FF]'} hover:scale-105 transition-transform duration-150`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-[12px] border-2 border-[#1C1C1C] ${isCloneX ? 'bg-[#6EFFC7]' : 'bg-[#FF5AF7]'}`}>
          {isCloneX ? (
            <Shield className="w-5 h-5 text-black" strokeWidth={2.5} />
          ) : (
            <Users className="w-5 h-5 text-black" strokeWidth={2.5} />
          )}
        </div>
        
        <div>
          <h3 className={`text-lg font-black ${isCloneX ? 'text-black' : 'text-black'}`}>
            {collection.toUpperCase()}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-xl font-black ${isCloneX ? 'text-black' : 'text-black'}`}>
              {count}
            </span>
            {verified && (
              <StatusBadge 
                status="success" 
                text="VERIFIED" 
                size="sm" 
              />
            )}
          </div>
        </div>
      </div>
    </StickerCard>
  );
};