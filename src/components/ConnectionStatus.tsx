import React from 'react';
import { useAccount } from 'wagmi';
import { useCloneXAuth } from '../hooks/useCloneXAuth';
import { StickerCard } from './StickerCard';
import { AccessLevelBadge } from './AccessLevelBadge';

interface ConnectionStatusProps {
  minimal?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  minimal = false, 
  className = '' 
}) => {
  const { address, isConnected, chain } = useAccount();
  const { user, isAuthenticated, isLoading } = useCloneXAuth();

  if (minimal) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`w-3 h-3 rounded-full ${
          isConnected && isAuthenticated ? 'bg-green-500' : 
          isConnected ? 'bg-yellow-500' : 'bg-red-500'
        }`} />
        <span className="text-sm font-bold">
          {isConnected && isAuthenticated ? 'AUTHENTICATED' :
           isConnected ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>
    );
  }

  return (
    <StickerCard className={className}>
      <h3 className="font-black uppercase text-sm mb-3">Connection Status</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Wallet:</span>
          <span className={`font-bold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? 'LINKED' : 'DISCONNECTED'}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Auth:</span>
          <span className={`font-bold ${isAuthenticated ? 'text-green-600' : 'text-yellow-600'}`}>
            {isAuthenticated ? 'VERIFIED' : 'PENDING'}
          </span>
        </div>
        
        {isConnected && (
          <div className="flex justify-between">
            <span>Network:</span>
            <span className="font-bold">{chain?.name || 'Unknown'}</span>
          </div>
        )}
        
        {address && (
          <div>
            <span className="block text-xs text-gray-600 mb-1">Address:</span>
            <span className="font-mono text-xs break-all">{address}</span>
          </div>
        )}
        
        {user && (
          <div className="pt-2 border-t border-gray-200">
            <AccessLevelBadge accessLevel={user.accessLevel} size="sm" />
          </div>
        )}
      </div>
    </StickerCard>
  );
};