import React from 'react';
import { AccessLevel, ACCESS_LEVEL_CONFIG } from '../config/api';

interface AccessLevelBadgeProps {
  accessLevel: AccessLevel;
  showDescription?: boolean;
  showRequirements?: boolean;
  className?: string;
}

export const AccessLevelBadge: React.FC<AccessLevelBadgeProps> = ({
  accessLevel,
  showDescription = false,
  showRequirements = false,
  className = ''
}) => {
  const config = ACCESS_LEVEL_CONFIG[accessLevel];
  
  const getBadgeClasses = () => {
    const baseClasses = "inline-flex items-center justify-center font-black uppercase tracking-wider rounded-2xl border-4 text-center";
    
    // Consistent sizing for all badges - matches current Cosmic Champion
    const sizeClasses = "px-4 py-2 text-sm min-w-[120px]";

    const colorClasses = {
      'COSMIC_CHAMPION': 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white border-white animate-pulse shadow-lg shadow-purple-500/50',
      'CLONE_VANGUARD': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-orange-700 shadow-lg shadow-yellow-500/50',
      'DNA_DISCIPLE': 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-cyan-700 shadow-lg shadow-blue-500/50',
      'ANIMUS_PRIME': 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-pink-700 shadow-lg shadow-purple-500/50',
      'ANIMUS_HATCHLING': 'bg-gradient-to-r from-teal-400 to-green-500 text-black border-green-700 shadow-lg shadow-teal-500/50',
      'LOST_CODE': 'bg-gray-200 text-gray-700 border-gray-500 shadow-lg shadow-gray-500/25'
    };

    return `${baseClasses} ${sizeClasses} ${colorClasses[accessLevel]}`;
  };

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      <div className={getBadgeClasses()}>
        {config.title}
      </div>
      
      {showDescription && (
        <p className="text-sm text-gray-600 text-center font-semibold">
          {config.description}
        </p>
      )}
      
      {showRequirements && (
        <p className="text-xs text-gray-500 text-center font-medium">
          {config.requirements}
        </p>
      )}
    </div>
  );
};