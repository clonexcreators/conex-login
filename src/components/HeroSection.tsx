import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { useNFTVerification } from '../hooks/useNFTVerification';
import { Shield, Zap, Users, Activity, Database, Cpu } from 'lucide-react';
import { StickerCard } from './StickerCard';
import { StatusBadge } from './StatusBadge';
import { AuthChallenge } from './AuthChallenge';
import { AuthStatus } from './AuthStatus';
import { VerificationSummary } from './VerificationSummary';
import { EnhancedNFTCard } from './EnhancedNFTCard';
import { AssetLoadingState } from './AssetLoadingState';
import { NFT_COLLECTIONS } from '../constants/nftCollections';
import { PUNK_MESSAGES } from '../constants/punkMessages';
import { ASSET_MESSAGES } from '../constants/groAssets';

export const HeroSection: React.FC = () => {
  const { 
    isAuthenticated, 
    user, 
    isLoading,
    challenge,
    isConnected
  } = useAuthStore();
  
  const { signChallenge } = useWalletConnection();
  const { result: verificationResult, enhancedNFTs, isLoading: isVerifyingNFTs } = useNFTVerification();

  // Loading state - Research Lab Loading
  if (isLoading || isVerifyingNFTs) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="research-panel text-center max-w-md">
          <div className="w-16 h-16 bg-[#00C2FF] border-2 border-[#1C1C1C] rounded-[12px] mx-auto mb-6 flex items-center justify-center">
            <Activity className="w-8 h-8 text-black animate-pulse" strokeWidth={2.5} />
          </div>
          <StatusBadge 
            status="processing" 
            text={isVerifyingNFTs ? "SCANNING NFT DATABASE..." : "INITIALIZING LAB SYSTEMS..."} 
            size="md"
            pulse={true}
          />
          {isVerifyingNFTs && (
            <div className="mt-4 lab-text-sm text-center">
              CHECKING ALCHEMY → MORALIS → ETHERSCAN<br />
              LOADING 3D MOLECULAR STRUCTURES...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authenticated state - Research Dashboard
  if (isAuthenticated && user) {
    return (
      <div className="py-20 space-y-12">
        <div className="text-center">
          <h2 className="lab-heading-xl mb-6">
            RESEARCH DASHBOARD
          </h2>
          
          <div className="mb-8">
            <AuthStatus />
          </div>
        </div>
        
        {/* Verification Summary - Lab Report Style */}
        {verificationResult && (
          <div className="max-w-4xl mx-auto">
            <VerificationSummary 
              result={verificationResult} 
              isLoading={isVerifyingNFTs} 
            />
          </div>
        )}
        
        {/* Enhanced NFT Collections - Research Specimens */}
        {enhancedNFTs.length > 0 && (
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Direct NFTs */}
            {enhancedNFTs.filter(nft => nft.ownershipContext === 'DIRECT').length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="lab-heading-md">PRIMARY SPECIMENS</h3>
                  <div className="flex items-center gap-3">
                    <StatusBadge 
                      status="verified" 
                      text={`${enhancedNFTs.filter(nft => nft.ownershipContext === 'DIRECT').length} AUTHENTICATED`} 
                      size="md" 
                    />
                    {enhancedNFTs.some(nft => nft.groAssets.length > 0) && (
                      <StatusBadge 
                        status="active" 
                        text="3D MOLECULAR DATA AVAILABLE" 
                        size="md" 
                      />
                    )}
                  </div>
                </div>
                
                <div className="data-grid">
                  {enhancedNFTs
                    .filter(nft => nft.ownershipContext === 'DIRECT')
                    .map((nft, index) => {
                      const isCloneX = nft.contractAddress.toLowerCase().includes('49cf6f5d44e70224e2e23fdcdd2c053f30ada28b');
                      const collection = isCloneX ? 'CLONEX' : 'ANIMUS';
                      
                      return (
                        <EnhancedNFTCard
                          key={`${nft.contractAddress}-${nft.tokenId}-${index}`}
                          nft={nft}
                          collection={collection}
                          showAssetToggle={true}
                        />
                      );
                    })}
                </div>
              </div>
            )}
            
            {/* Delegated NFTs */}
            {enhancedNFTs.filter(nft => nft.ownershipContext === 'DELEGATED').length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="lab-heading-md">DELEGATED ACCESS</h3>
                  <StatusBadge 
                    status="active" 
                    text={`${enhancedNFTs.filter(nft => nft.ownershipContext === 'DELEGATED').length} SPECIMENS AVAILABLE`} 
                    size="md" 
                  />
                </div>
                
                <div className="data-grid">
                  {enhancedNFTs
                    .filter(nft => nft.ownershipContext === 'DELEGATED')
                    .map((nft, index) => {
                      const isCloneX = nft.contractAddress.toLowerCase().includes('49cf6f5d44e70224e2e23fdcdd2c053f30ada28b');
                      const collection = isCloneX ? 'CLONEX' : 'ANIMUS';
                      
                      return (
                        <EnhancedNFTCard
                          key={`${nft.contractAddress}-${nft.tokenId}-delegated-${index}`}
                          nft={nft}
                          collection={collection}
                          showAssetToggle={true}
                        />
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* No specimens found */}
        {enhancedNFTs.length === 0 && user.verificationResult && (
          <div className="text-center">
            <StickerCard variant="research-panel" className="max-w-2xl mx-auto text-center">
              <div className="w-16 h-16 bg-[#F5F5F5] border-2 border-[#1C1C1C] rounded-[12px] mx-auto mb-6 flex items-center justify-center">
                <Database className="w-8 h-8 text-[#4A4A4A]" strokeWidth={2.5} />
              </div>
              <h3 className="lab-heading-md mb-4">
                NO SPECIMENS DETECTED
              </h3>
              <p className="lab-text mb-6">
                Acquire CloneX or Animus NFTs to access the research facility database
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://opensea.io/collection/clonex"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lab-button-primary px-6 py-3 no-underline hover:scale-105 transition-transform duration-150"
                >
                  ACQUIRE CLONEX
                </a>
                <a
                  href="https://opensea.io/collection/animus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lab-button-secondary px-6 py-3 no-underline hover:scale-105 transition-transform duration-150"
                >
                  ACQUIRE ANIMUS
                </a>
              </div>
            </StickerCard>
          </div>
        )}
        
        {/* Legacy fallback stats */}
        {!user.verificationResult && (
          <div className="data-grid max-w-4xl mx-auto">
            <StickerCard variant="research-panel" className="text-center">
              <div className="bg-[#FF5AF7] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
                <Shield className="w-8 h-8 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="lab-heading-md mb-4">CLONEX SPECIMENS</h3>
              <p className="text-4xl font-black text-[#FF5AF7] mb-2">{user.cloneXTokens.length}</p>
              <StatusBadge status="verified" text="AUTHENTICATED" />
            </StickerCard>
            
            <StickerCard variant="research-panel" className="text-center">
              <div className="bg-[#00C2FF] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-4 inline-block">
                <Users className="w-8 h-8 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="lab-heading-md mb-4">ANIMUS SPECIMENS</h3>
              <p className="text-4xl font-black text-[#00C2FF] mb-2">{user.animusTokens.length}</p>
              <StatusBadge status="active" text="CATALOGUED" />
            </StickerCard>
          </div>
        )}
      </div>
    );
  }

  // Connected but needs authentication - DNA Scan Required
  if (isConnected && challenge) {
    return (
      <div className="py-20">
        <AuthChallenge onSignChallenge={signChallenge} />
      </div>
    );
  }

  // Connected but no challenge yet
  if (isConnected) {
    return (
      <div className="text-center py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="lab-heading-xl mb-8">
            DNA SCANNER ONLINE
          </h2>
          
          <AuthStatus />
          
          <StickerCard variant="research-panel" className="max-w-2xl mx-auto mt-12">
            <p className="lab-heading-md leading-relaxed">
              LABORATORY SYSTEMS READY.<br />
              INITIATE DNA SEQUENCE SCAN TO<br />
              COMPLETE AUTHENTICATION.
            </p>
          </StickerCard>
        </div>
      </div>
    );
  }

  // Default landing state - Research Facility Interface
  return (
    <div className="text-center py-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="lab-heading-xl mb-6 leading-none">
            CLONEX
          </h2>
          <div className="research-panel inline-block max-w-3xl transform rotate-1">
            <span className="lab-heading-lg text-[#FF5AF7]">
              RESEARCH FACILITY
            </span>
          </div>
        </div>
        
        <StickerCard variant="research-panel" className="max-w-3xl mx-auto mb-16">
          <p className="lab-heading-md leading-relaxed">
            SECURE ACCESS TO THE CLONEX RESEARCH DATABASE.<br />
            CONNECT YOUR DNA SCANNER TO ACCESS<br />
            MOLECULAR STRUCTURES AND MANAGE<br />
            YOUR SPECIMEN COLLECTION WITH<br />
            <span className="text-[#FF5AF7]">3D VISUALIZATION SUPPORT</span>.
          </p>
        </StickerCard>
        
        <div className="data-grid mt-20">
          <StickerCard variant="research-panel" className="text-center bg-[#6EFFC7]">
            <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-6 inline-block">
              <Shield className="w-12 h-12 text-[#6EFFC7]" strokeWidth={2.5} />
            </div>
            <h3 className="lab-heading-md mb-4">SECURE ACCESS</h3>
            <p className="lab-text text-black font-bold">
              CRYPTOGRAPHIC AUTHENTICATION KEEPS YOUR RESEARCH DATA AND SPECIMENS SECURE.
            </p>
          </StickerCard>
          
          <StickerCard variant="research-panel" className="text-center bg-[#FF5AF7]">
            <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-6 inline-block">
              <Cpu className="w-12 h-12 text-[#00C2FF]" strokeWidth={2.5} />
            </div>
            <h3 className="lab-heading-md mb-4 text-black">3D MOLECULAR DATA</h3>
            <p className="lab-text text-black font-bold">
              VIEW 3D CHARACTER MODELS, 2D ILLUSTRATIONS, AND ANIMATIONS WITH SMART FALLBACKS.
            </p>
          </StickerCard>
          
          <StickerCard variant="research-panel" className="text-center bg-[#00C2FF]">
            <div className="bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] p-4 mb-6 inline-block">
              <Database className="w-12 h-12 text-[#1C1C1C]" strokeWidth={2.5} />
            </div>
            <h3 className="lab-heading-md mb-4 text-black">SPECIMEN DATABASE</h3>
            <p className="lab-text text-black font-bold">
              CATALOG AND ANALYZE YOUR CLONEX AND ANIMUS SPECIMENS WITH BLOCKCHAIN VERIFICATION.
            </p>
          </StickerCard>
        </div>
      </div>
    </div>
  );
};