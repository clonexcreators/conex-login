import React from 'react';
import { useConfig, useSwitchChain } from 'wagmi';
import { StickerCard } from './StickerCard';
import { StickerButton } from './StickerButton';
import { StatusBadge } from './StatusBadge';

export const NetworkSelector: React.FC = () => {
  const config = useConfig();
  const { chains } = config;
  const { switchChain, isPending, switchingToChainId } = useSwitchChain();

  return (
    <StickerCard>
      <h3 className="font-black uppercase text-lg mb-6 text-center">
        BLOCKCHAIN NETWORKS
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {chains.map((chain) => (
          <div 
            key={chain.id}
            className="border-2 border-gray-200 rounded-xl p-3 hover:border-pink-400 transition-colors"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-sm uppercase">{chain.name}</div>
              {chain.iconUrl && (
                <img 
                  src={chain.iconUrl} 
                  alt={chain.name} 
                  className="w-6 h-6"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
            </div>
            
            <div className="mb-3">
              <div className="text-xs text-gray-600">
                ID: {chain.id}
              </div>
              <div className="text-xs text-gray-600 truncate">
                RPC: {typeof chain.rpcUrls.default.http[0] === 'string' ? chain.rpcUrls.default.http[0].substring(0, 25) + '...' : 'Custom'}
              </div>
            </div>
            
            <StickerButton
              variant="ghost"
              size="sm"
              onClick={() => switchChain({ chainId: chain.id })}
              loading={isPending && switchingToChainId === chain.id}
              className="w-full"
            >
              {isPending && switchingToChainId === chain.id ? 'SWITCHING...' : 'SELECT'}
            </StickerButton>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center">
        <StatusBadge status="active" text="Supported Networks" size="sm" />
      </div>
    </StickerCard>
  );
};