/**
 * Production NFT Dashboard Component
 */

import React, { useState } from 'react';
import { useProductionAuth } from '../hooks/useProductionAuth';
import { ACCESS_LEVEL_CONFIG } from '../constants/accessLevels';
import { StickerCard } from './StickerCard';
import { StickerButton } from './StickerButton';
import { StatusBadge } from './StatusBadge';
import { 
  Shield, Users, Crown, Star, Zap, ExternalLink, 
  RefreshCw, Activity, Database, Link2, Eye
} from 'lucide-react';

export const ProductionNFTDashboard: React.FC = () => {
  const { 
    user, 
    refreshNFTData, 
    isLoading, 
    navigateToSubdomain,
    checkSubdomainAccess 
  } = useProductionAuth();
  
  const [expandedNFT, setExpandedNFT] = useState<string | null>(null);

  if (!user) return null;

  const accessConfig = ACCESS_LEVEL_CONFIG[user.accessLevel];
  const totalNFTs = user.collections.clonex + user.collections.animus + 
                   user.collections.animus_eggs + user.collections.clonex_vials;

  const handleSubdomainNavigation = async (subdomain: string) => {
    const result = await navigateToSubdomain(subdomain);
    if (!result.allowed) {
      // Could show upgrade modal here
      console.log('Access denied:', result);
    }
  };

  return (
    <div className="py-20 space-y-12">
      {/* Access Level Header */}
      <div className="text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className={`w-24 h-24 ${accessConfig.color} border-2 border-[#1C1C1C] rounded-[12px] mx-auto mb-6 flex items-center justify-center`}>
              {user.accessLevel === 'COSMIC_CHAMPION' && <Crown className="w-12 h-12 text-white" strokeWidth={2.5} />}
              {user.accessLevel === 'CLONE_VANGUARD' && <Star className="w-12 h-12 text-white" strokeWidth={2.5} />}
              {user.accessLevel.includes('ANIMUS') && <Users className="w-12 h-12 text-white" strokeWidth={2.5} />}
              {user.accessLevel === 'DNA_DISCIPLE' && <Shield className="w-12 h-12 text-white" strokeWidth={2.5} />}
              {user.accessLevel === 'LOST_CODE' && <Database className="w-12 h-12 text-white" strokeWidth={2.5} />}
            </div>
            
            <h2 className="lab-heading-xl mb-4">
              {accessConfig.title}
            </h2>
            
            <div className="lab-surface inline-block px-6 py-3 mb-6">
              <p className="lab-heading-md text-[#FF5AF7]">
                {accessConfig.description.toUpperCase()}
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 mb-6">
              <StatusBadge 
                status="verified" 
                text={`${totalNFTs} NFTs Verified`} 
                size="md" 
              />
              <StatusBadge 
                status={user.cached ? "active" : "verified"} 
                text={user.cached ? "Cached Data" : "Live Data"} 
                size="md" 
              />
              <StatusBadge 
                status="active" 
                text={user.verificationMethod.toUpperCase()} 
                size="md" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Collection Stats */}
      <div className="max-w-6xl mx-auto">
        <div className="data-grid">
          {/* CloneX Collection */}
          <StickerCard variant="research-panel" className="text-center bg-[#FF5AF7]">
            <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
              <Shield className="w-8 h-8 text-[#6EFFC7]" strokeWidth={2.5} />
            </div>
            <h3 className="lab-heading-md mb-4 text-black">CLONEX</h3>
            <p className="text-4xl font-black text-black mb-2">{user.collections.clonex}</p>
            <StatusBadge status="verified" text="AUTHENTICATED" />
          </StickerCard>

          {/* Animus Collection */}
          <StickerCard variant="research-panel" className="text-center bg-[#00C2FF]">
            <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
              <Users className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
            <h3 className="lab-heading-md mb-4 text-black">ANIMUS</h3>
            <p className="text-4xl font-black text-black mb-2">{user.collections.animus}</p>
            <StatusBadge status="active" text="CATALOGUED" />
          </StickerCard>

          {/* Animus Eggs */}
          <StickerCard variant="research-panel" className="text-center bg-[#6EFFC7]">
            <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
              <Zap className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
            <h3 className="lab-heading-md mb-4 text-black">ANIMUS EGGS</h3>
            <p className="text-4xl font-black text-black mb-2">{user.collections.animus_eggs}</p>
            <StatusBadge status="active" text="BREEDING" />
          </StickerCard>

          {/* CloneX Vials */}
          <StickerCard variant="research-panel" className="text-center bg-[#FFB800]">
            <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
              <Database className="w-8 h-8 text-black" strokeWidth={2.5} />
            </div>
            <h3 className="lab-heading-md mb-4 text-black">CLONEX VIALS</h3>
            <p className="text-4xl font-black text-black mb-2">{user.collections.clonex_vials}</p>
            <StatusBadge status="active" text="ENHANCEMENT" />
          </StickerCard>
        </div>
      </div>

      {/* Available Subdomains */}
      <div className="max-w-4xl mx-auto">
        <StickerCard variant="research-panel" className="bg-[#F5F5F5]">
          <h3 className="lab-heading-md mb-6">AVAILABLE RESEARCH AREAS</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {accessConfig.subdomains.map(subdomain => {
              const hasAccess = checkSubdomainAccess(subdomain);
              
              return (
                <button
                  key={subdomain}
                  onClick={() => hasAccess && handleSubdomainNavigation(subdomain)}
                  disabled={!hasAccess}
                  className={`p-4 border-2 border-[#1C1C1C] rounded-[12px] transition-all duration-150 ${
                    hasAccess 
                      ? 'bg-[#6EFFC7] hover:scale-105 cursor-pointer' 
                      : 'bg-gray-200 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="text-sm font-bold text-black uppercase">
                    {subdomain}.clonex.wtf
                  </div>
                  {hasAccess ? (
                    <div className="flex items-center justify-center mt-2">
                      <ExternalLink className="w-4 h-4 text-black" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600 mt-2">
                      Upgrade Required
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </StickerCard>
      </div>

      {/* NFT Gallery */}
      {user.nfts.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="lab-heading-md">NFT COLLECTION</h3>
            <StickerButton
              variant="secondary"
              size="md"
              onClick={refreshNFTData}
              disabled={isLoading}
            >
              {isLoading ? (
                <Activity className="w-4 h-4 animate-spin" strokeWidth={2.5} />
              ) : (
                <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
              )}
              Refresh
            </StickerButton>
          </div>

          <div className="data-grid">
            {user.nfts.slice(0, 12).map((nft, index) => (
              <StickerCard 
                key={`${nft.contract}-${nft.tokenId}`}
                variant="research-panel" 
                className="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                onClick={() => setExpandedNFT(expandedNFT === nft.tokenId ? null : nft.tokenId)}
              >
                <div className="aspect-square bg-[#F5F5F5] border-2 border-[#1C1C1C] rounded-[12px] mb-4 overflow-hidden">
                  {nft.metadata.image ? (
                    <img
                      src={nft.metadata.image}
                      alt={nft.metadata.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://via.placeholder.com/400x400/FF5AF7/FFFFFF?text=NFT%20%23${nft.tokenId}`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FF5AF7] flex items-center justify-center">
                      <Shield className="w-16 h-16 text-black" strokeWidth={2.5} />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-black truncate">
                    {nft.metadata.name || `Token #${nft.tokenId}`}
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#4A4A4A]">#{nft.tokenId}</span>
                    <button className="p-1 hover:scale-110 transition-transform">
                      <Eye className="w-4 h-4 text-[#4A4A4A]" strokeWidth={2.5} />
                    </button>
                  </div>

                  {expandedNFT === nft.tokenId && nft.metadata.attributes.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {nft.metadata.attributes.slice(0, 3).map((attr, i) => (
                        <div key={i} className="text-xs text-[#4A4A4A]">
                          <span className="font-bold">{attr.trait_type}:</span> {attr.value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </StickerCard>
            ))}
          </div>

          {user.nfts.length > 12 && (
            <div className="text-center mt-8">
              <StatusBadge 
                status="active" 
                text={`${user.nfts.length - 12} MORE NFTS AVAILABLE`} 
                size="md" 
              />
            </div>
          )}
        </div>
      )}

      {/* Account Info */}
      <div className="max-w-4xl mx-auto">
        <StickerCard variant="research-panel" className="bg-[#1C1C1C] text-[#6EFFC7]">
          <h3 className="lab-heading-md mb-4 text-[#6EFFC7]">ACCOUNT INFORMATION</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm opacity-75 mb-1">WALLET ADDRESS</div>
              <div className="font-mono text-sm break-all">{user.walletAddress}</div>
            </div>
            
            <div>
              <div className="text-sm opacity-75 mb-1">LAST VERIFIED</div>
              <div className="text-sm">{new Date(user.lastVerified).toLocaleString()}</div>
            </div>
            
            <div>
              <div className="text-sm opacity-75 mb-1">VERIFICATION METHOD</div>
              <div className="text-sm uppercase">{user.verificationMethod}</div>
            </div>
            
            <div>
              <div className="text-sm opacity-75 mb-1">SESSION STATUS</div>
              <div className="text-sm">AUTHENTICATED • SECURE</div>
            </div>
          </div>
        </StickerCard>
      </div>
    </div>
  );
};