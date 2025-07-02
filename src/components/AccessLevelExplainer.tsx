import React, { useState } from 'react';
import { AccessLevel, ACCESS_LEVEL_CONFIG } from '../config/api';
import { AccessLevelBadge } from './AccessLevelBadge';
import { StickerButton } from './StickerButton';
import { StickerCard } from './StickerCard';

interface AccessLevelExplainerProps {
  currentAccessLevel?: AccessLevel;
  className?: string;
}

export const AccessLevelExplainer: React.FC<AccessLevelExplainerProps> = ({
  currentAccessLevel,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const accessLevels: AccessLevel[] = [
    'COSMIC_CHAMPION',
    'CLONE_VANGUARD', 
    'DNA_DISCIPLE',
    'ANIMUS_PRIME',
    'ANIMUS_HATCHLING',
    'LOST_CODE'
  ];

  return (
    <StickerCard variant="research-panel" className={className}>
      <div className="text-center mb-4">
        <h3 className="font-black uppercase text-lg mb-2">ACCESS LEVELS</h3>
        <p className="text-gray-600 text-sm">
          Your NFT holdings determine your ecosystem access level
        </p>
      </div>

      <div className="text-center mb-4">
        <StickerButton
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'HIDE DETAILS' : 'SHOW ALL LEVELS'}
        </StickerButton>
      </div>

      {isExpanded ? (
        <div className="space-y-4">
          {accessLevels.map((level) => {
            const config = ACCESS_LEVEL_CONFIG[level];
            const isCurrent = currentAccessLevel === level;
            
            return (
              <div 
                key={level} 
                className={`border-2 rounded-xl p-3 ${
                  isCurrent 
                    ? 'border-pink-500 bg-pink-50' 
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <AccessLevelBadge accessLevel={level} />
                  {isCurrent && (
                    <span className="bg-pink-500 text-white px-2 py-1 rounded-lg font-bold text-xs">
                      YOUR LEVEL
                    </span>
                  )}
                </div>
                
                <div className="text-left">
                  <p className="text-sm text-gray-700 mb-1">{config.description}</p>
                  <p className="text-xs text-gray-600">Requirements: {config.requirements}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Access: {config.subdomains.includes('*') ? 'All features' : `${config.subdomains.length} subdomain(s)`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        currentAccessLevel && (
          <div className="text-center">
            <AccessLevelBadge 
              accessLevel={currentAccessLevel}
              showDescription 
              showRequirements
            />
          </div>
        )
      )}
    </StickerCard>
  );
};