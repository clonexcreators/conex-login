import { useState, useCallback } from 'react';
import { VerificationResult, DelegationVerification, MultiAssetNFT, DelegationSummary } from '../types';
import { nftService } from '../services/multiProviderNFT';
import { delegateService } from '../services/delegateService';
import { groAssetService } from '../services/groAssetService';
import { NFT_MESSAGES } from '../constants/nftMessages';
import { ENV_CONFIG } from '../config/environment';
import { useAuthStore } from '../stores/authStore';

interface NFTVerificationState {
  isLoading: boolean;
  result: VerificationResult | null;
  enhancedNFTs: MultiAssetNFT[];
  delegationSummary: DelegationSummary | null;
  error: string | null;
  currentProvider: string | null;
}

export const useNFTVerification = () => {
  const [verificationState, setVerificationState] = useState<NFTVerificationState>({
    isLoading: false,
    result: null,
    enhancedNFTs: [],
    delegationSummary: null,
    error: null,
    currentProvider: null
  });
  
  const { setUser, walletAddress } = useAuthStore();
  
  const verifyWithFallback = useCallback(async (
    address?: string,
    explicitDelegations: DelegationVerification[] = []
  ) => {
    const targetAddress = address || walletAddress;
    if (!targetAddress) {
      setVerificationState(prev => ({
        ...prev,
        error: "No wallet address provided"
      }));
      return;
    }
    
    setVerificationState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      result: null,
      enhancedNFTs: [],
      delegationSummary: null
    }));
    
    try {
      // Phase 1: Check for delegations first
      setVerificationState(prev => ({ 
        ...prev, 
        currentProvider: 'DELEGATE.XYZ' 
      }));
      
      console.log('🔍 Checking delegations for wallet:', targetAddress);
      
      // Get all delegations for this wallet
      const allDelegations = await delegateService.getDelegationsForWallet(targetAddress);
      const activeDelegations = [...explicitDelegations, ...allDelegations];
      
      console.log(`📋 Found ${activeDelegations.length} total delegations`);
      
      // Get delegation summary for UI
      const delegationSummary = activeDelegations.length > 0 
        ? await delegateService.getDelegationSummary(targetAddress)
        : null;
      
      // Phase 2: Multi-provider NFT verification with delegations
      setVerificationState(prev => ({ 
        ...prev, 
        currentProvider: 'MULTI-PROVIDER',
        delegationSummary 
      }));
      
      const result = await nftService.verifyWalletNFTs(targetAddress, activeDelegations);
      
      console.log(`🎯 Verification complete: ${result.totalNFTs} total NFTs found`);
      console.log(`📦 Direct: ${result.directNFTs.length}, Delegated: ${result.delegatedNFTs.length}`);
      
      // Phase 3: Enhance NFTs with GRO assets (if enabled)
      const enhancedNFTs: MultiAssetNFT[] = [];
      
      if (ENV_CONFIG.groEnabled && !ENV_CONFIG.forceGroFallback) {
        setVerificationState(prev => ({ 
          ...prev, 
          currentProvider: 'GRO ASSETS' 
        }));
        
        for (const nft of result.nftDetails) {
          try {
            const enhancedNFT = await groAssetService.enhanceNFTWithAssets(nft);
            enhancedNFTs.push(enhancedNFT);
          } catch (error) {
            console.warn(`Failed to enhance NFT ${nft.tokenId} with GRO assets:`, error);
            // Fallback to basic enhancement with original image
            enhancedNFTs.push({
              ...nft,
              groAssets: [],
              currentAssetType: 'original',
              fallbackAsset: nft.metadata.image
            });
          }
        }
        
        // Phase 4: Preload assets for enhanced NFTs (background process)
        if (enhancedNFTs.length > 0) {
          Promise.all(
            enhancedNFTs.map(nft => 
              nft.groAssets.length > 0 ? groAssetService.preloadAssets(nft.groAssets) : Promise.resolve()
            )
          ).catch(error => {
            console.warn('Asset preloading failed:', error);
          });
        }
      } else {
        // GRO disabled - create enhanced NFTs with original images only
        console.log('🚫 GRO disabled - using original images only');
        
        for (const nft of result.nftDetails) {
          enhancedNFTs.push({
            ...nft,
            groAssets: [],
            currentAssetType: 'original',
            fallbackAsset: nft.metadata.image,
            hasAnimation: false
          });
        }
      }
      
      // Update final state
      setVerificationState({
        result: {
          ...result,
          delegationSummary
        },
        enhancedNFTs,
        delegationSummary,
        isLoading: false,
        error: null,
        currentProvider: null
      });
      
      // Update user in auth store with enhanced NFT data
      if (result) {
        const cloneXTokens = enhancedNFTs
          .filter(nft => nft.contractAddress.toLowerCase().includes('49cf6f5d44e70224e2e23fdcdd2c053f30ada28b'))
          .map(nft => ({
            tokenId: nft.tokenId,
            image: nft.fallbackAsset || nft.metadata.image,
            name: nft.metadata.name || `CloneX #${nft.tokenId}`,
            attributes: nft.metadata.attributes || []
          }));
          
        const animusTokens = enhancedNFTs
          .filter(nft => nft.contractAddress.toLowerCase().includes('ec99492dd9ef8ca48f691acd67d2c96a0a43935f'))
          .map(nft => ({
            tokenId: nft.tokenId,
            image: nft.fallbackAsset || nft.metadata.image,
            name: nft.metadata.name || `Animus #${nft.tokenId}`,
            attributes: nft.metadata.attributes || []
          }));

        const animusEggTokens = enhancedNFTs
          .filter(nft => nft.contractAddress.toLowerCase().includes('6c410cf0b8c113dc6a7641b431390b11d5515082'))
          .map(nft => ({
            tokenId: nft.tokenId,
            image: nft.fallbackAsset || nft.metadata.image,
            name: nft.metadata.name || `Animus Egg #${nft.tokenId}`,
            attributes: nft.metadata.attributes || []
          }));

        const cloneXVialTokens = enhancedNFTs
          .filter(nft => nft.contractAddress.toLowerCase().includes('348fc118bcc65a92dc033a951af153d14d945312'))
          .map(nft => ({
            tokenId: nft.tokenId,
            image: nft.fallbackAsset || nft.metadata.image,
            name: nft.metadata.name || `CloneX Vial #${nft.tokenId}`,
            attributes: nft.metadata.attributes || []
          }));
        
        setUser({
          address: targetAddress,
          cloneXTokens,
          animusTokens,
          animusEggTokens,
          cloneXVialTokens,
          isConnected: true,
          verificationResult: result,
          delegationSummary
        });
      }
      
    } catch (error: any) {
      console.error('NFT verification failed:', error);
      setVerificationState({
        error: error.message || NFT_MESSAGES.allProvidersFailed,
        isLoading: false,
        result: null,
        enhancedNFTs: [],
        delegationSummary: null,
        currentProvider: null
      });
    }
  }, [walletAddress, setUser]);
  
  const clearVerification = useCallback(() => {
    setVerificationState({
      isLoading: false,
      result: null,
      enhancedNFTs: [],
      delegationSummary: null,
      error: null,
      currentProvider: null
    });
  }, []);
  
  return { 
    verifyWithFallback, 
    clearVerification,
    ...verificationState 
  };
};