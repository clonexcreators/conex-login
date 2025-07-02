/**
 * UE5 NFT Verification Service for ProjectPhoenix-BEFE Integration
 * 
 * Provides UE5-compatible NFT endpoints using unified direct + delegated NFT data
 * from CloneX Universal Login multi-provider verification system.
 */

import { 
  UE5NFTResponse, 
  UE5NFTItem, 
  UE5APIResponse,
  UE5ContractsResponse 
} from '../types/ue5Types';

import { VerificationResult, MultiAssetNFT, NFTData } from '../types';
import { ue5DataFormatter } from '../services/ue5DataFormatter';
import { nftService } from '../services/multiProviderNFT';
import { delegateService } from '../services/delegateService';
import { ue5ContractService } from './ue5ContractService';
import { ENV_CONFIG } from '../config/environment';

export interface UE5NFTVerificationRequest {
  walletAddress: string;
  forceRefresh?: boolean;
  includeDelegated?: boolean;
}

export interface UE5NFTOwnershipRequest {
  walletAddress: string;
  contractAddress: string;
  tokenId: string;
}

export interface UE5NFTSyncRequest {
  walletAddress: string;
  lastSyncTimestamp?: number;
}

class UE5NFTService {
  private nftCache = new Map<string, { data: UE5NFTResponse; timestamp: number; expires: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🎮 UE5 NFT Service initialized');
    }
  }

  // ============================================================================
  // Core NFT Verification Methods
  // ============================================================================

  /**
   * Get all accessible NFTs for UE5 (UNIFIED: Direct + Delegated)
   */
  async ue5GetUserNFTs(request: UE5NFTVerificationRequest): Promise<UE5APIResponse<UE5NFTResponse>> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🔍 UE5 NFT verification for:', request.walletAddress);
      }

      // Check cache first (unless force refresh)
      if (!request.forceRefresh) {
        const cached = this.getCachedNFTs(request.walletAddress);
        if (cached) {
          if (ENV_CONFIG.showUE5Debug) {
            console.log('💾 Returning cached UE5 NFT data');
          }
          return {
            success: true,
            data: cached,
            timestamp: Date.now()
          };
        }
      }

      // Use existing CloneX multi-provider verification (includes delegation)
      const verificationResult = await this.getUnifiedNFTVerification(request.walletAddress);
      
      if (!verificationResult) {
        return {
          success: true,
          data: { characters: [], items: [] },
          message: 'No NFTs found for wallet',
          timestamp: Date.now()
        };
      }

      // Convert to unified UE5 format (strips ownership context)
      const ue5Response = this.convertToUnifiedUE5Format(verificationResult);
      
      // Cache the result
      this.setCachedNFTs(request.walletAddress, ue5Response);

      if (ENV_CONFIG.showUE5Debug) {
        console.log(`✅ UE5 NFT verification complete: ${ue5Response.characters.length} characters, ${ue5Response.items.length} items`);
      }

      return {
        success: true,
        data: ue5Response,
        timestamp: Date.now()
      };

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 NFT verification failed:', error);
      }

      return {
        success: false,
        error: `NFT verification failed: ${error.message}`,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Verify specific NFT ownership/access (Direct OR Delegated)
   */
  async ue5VerifyNFTOwnership(request: UE5NFTOwnershipRequest): Promise<UE5APIResponse<boolean>> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log(`🔍 UE5 NFT ownership check: ${request.contractAddress}:${request.tokenId} for ${request.walletAddress}`);
      }

      // Get unified NFT list for user
      const nftResponse = await this.ue5GetUserNFTs({ 
        walletAddress: request.walletAddress 
      });

      if (!nftResponse.success || !nftResponse.data) {
        return {
          success: true,
          data: false,
          message: 'No NFTs accessible',
          timestamp: Date.now()
        };
      }

      // Check if NFT exists in unified list (direct or delegated doesn't matter)
      const allNFTs = [...nftResponse.data.characters, ...nftResponse.data.items];
      const hasAccess = allNFTs.some(nft => 
        nft.contractAddress.toLowerCase() === request.contractAddress.toLowerCase() &&
        nft.tokenId === request.tokenId
      );

      if (ENV_CONFIG.showUE5Debug) {
        console.log(`${hasAccess ? '✅' : '❌'} UE5 NFT access result: ${hasAccess}`);
      }

      return {
        success: true,
        data: hasAccess,
        timestamp: Date.now()
      };

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 NFT ownership check failed:', error);
      }

      return {
        success: false,
        error: `Ownership verification failed: ${error.message}`,
        data: false,
        timestamp: Date.now()
      };
    }
  }

  /**
   * Sync NFT data with game state
   */
  async ue5SyncUserNFTs(request: UE5NFTSyncRequest): Promise<UE5APIResponse<UE5NFTResponse>> {
    // Force refresh if last sync is old or not provided
    const forceRefresh = !request.lastSyncTimestamp || 
      (Date.now() - request.lastSyncTimestamp) > (10 * 60 * 1000); // 10 minutes

    return this.ue5GetUserNFTs({
      walletAddress: request.walletAddress,
      forceRefresh
    });
  }

  /**
   * Get supported contracts for UE5
   */
  async ue5GetSupportedContracts(): Promise<UE5APIResponse<UE5ContractsResponse>> {
    try {
      const contracts = await ue5ContractService.getSupportedContracts();
      
      return {
        success: true,
        data: contracts,
        timestamp: Date.now()
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Failed to get contracts: ${error.message}`,
        timestamp: Date.now()
      };
    }
  }

  // ============================================================================
  // Private Helper Methods - UNIFIED NFT PROCESSING
  // ============================================================================

  /**
   * Get unified NFT verification using existing CloneX system
   */
  private async getUnifiedNFTVerification(walletAddress: string): Promise<VerificationResult | null> {
    try {
      // Check for delegations first
      const delegations = await delegateService.getDelegationsForWallet(walletAddress);
      
      if (ENV_CONFIG.showUE5Debug) {
        console.log(`🔗 Found ${delegations.length} delegations for ${walletAddress}`);
      }

      // Use existing multi-provider verification (includes delegation checking)
      const verificationResult = await nftService.verifyWalletNFTs(walletAddress, delegations);
      
      if (ENV_CONFIG.showUE5Debug) {
        console.log(`📦 Verification result: ${verificationResult.directNFTs.length} direct, ${verificationResult.delegatedNFTs.length} delegated`);
      }

      return verificationResult;

    } catch (error) {
      console.warn('Failed to get unified NFT verification:', error);
      return null;
    }
  }

  /**
   * Convert CloneX verification result to unified UE5 format
   * CRITICAL: Combines direct + delegated into single arrays
   */
  private convertToUnifiedUE5Format(verificationResult: VerificationResult): UE5NFTResponse {
    // Step 1: Combine ALL accessible NFTs (direct + delegated)
    const allAccessibleNFTs: NFTData[] = [
      ...verificationResult.directNFTs,     // Directly owned
      ...verificationResult.delegatedNFTs   // Accessible via delegation
    ];

    if (ENV_CONFIG.showUE5Debug) {
      console.log(`🔄 Converting ${allAccessibleNFTs.length} total accessible NFTs to UE5 format`);
    }

    // Step 2: Categorize by contract type and convert
    const characters: UE5NFTItem[] = [];
    const items: UE5NFTItem[] = [];

    allAccessibleNFTs.forEach(nft => {
      try {
        // Convert NFT to UE5 format (strips ownership context)
        const ue5Item = ue5DataFormatter.formatNFTItem(nft);
        
        if (ue5Item) {
          // Categorize by contract address
          if (this.isCharacterContract(nft.contractAddress)) {
            characters.push(ue5Item);
          } else if (this.isItemContract(nft.contractAddress)) {
            items.push(ue5Item);
          }
        }
      } catch (error) {
        console.warn(`Failed to convert NFT ${nft.contractAddress}:${nft.tokenId}:`, error);
      }
    });

    // Step 3: Sort by contract priority (CloneX first, etc.)
    characters.sort(this.sortByContractPriority);
    items.sort(this.sortByContractPriority);

    const result: UE5NFTResponse = { characters, items };

    if (ENV_CONFIG.showUE5Debug) {
      console.log(`✅ UE5 format conversion complete: ${characters.length} characters, ${items.length} items`);
    }

    return result;
  }

  /**
   * Check if contract address is a character contract
   */
  private isCharacterContract(contractAddress: string): boolean {
    const characterContracts = [
      '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b', // CloneX
      '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f'  // Animus
    ];
    
    return characterContracts.some(addr => 
      addr.toLowerCase() === contractAddress.toLowerCase()
    );
  }

  /**
   * Check if contract address is an item contract
   */
  private isItemContract(contractAddress: string): boolean {
    const itemContracts = [
      '0x348fc118bcc65a92dc033a951af153d14d945312', // CloneX Vials
      '0x6c410cf0b8c113dc6a7641b431390b11d5515082'  // Animus Eggs
    ];
    
    return itemContracts.some(addr => 
      addr.toLowerCase() === contractAddress.toLowerCase()
    );
  }

  /**
   * Sort NFTs by contract priority (CloneX first, etc.)
   */
  private sortByContractPriority(a: UE5NFTItem, b: UE5NFTItem): number {
    const priorities: Record<string, number> = {
      '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b': 1, // CloneX
      '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f': 2, // Animus
      '0x6c410cf0b8c113dc6a7641b431390b11d5515082': 3, // Animus Eggs
      '0x348fc118bcc65a92dc033a951af153d14d945312': 4  // CloneX Vials
    };

    const priorityA = priorities[a.contractAddress.toLowerCase()] || 999;
    const priorityB = priorities[b.contractAddress.toLowerCase()] || 999;
    
    return priorityA - priorityB;
  }

  // ============================================================================
  // Cache Management
  // ============================================================================

  /**
   * Get cached NFT data
   */
  private getCachedNFTs(walletAddress: string): UE5NFTResponse | null {
    const cacheKey = walletAddress.toLowerCase();
    const cached = this.nftCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    
    // Clean up expired cache
    if (cached) {
      this.nftCache.delete(cacheKey);
    }
    
    return null;
  }

  /**
   * Set cached NFT data
   */
  private setCachedNFTs(walletAddress: string, data: UE5NFTResponse): void {
    const cacheKey = walletAddress.toLowerCase();
    
    this.nftCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + this.CACHE_DURATION
    });
  }

  /**
   * Clear NFT cache
   */
  clearCache(walletAddress?: string): void {
    if (walletAddress) {
      this.nftCache.delete(walletAddress.toLowerCase());
    } else {
      this.nftCache.clear();
    }
    
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🧹 UE5 NFT cache cleared');
    }
  }

  // ============================================================================
  // Debug and Utilities
  // ============================================================================

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): {
    totalCached: number;
    cacheHitRate: number;
    oldestEntry: number | null;
  } {
    const now = Date.now();
    const validEntries = Array.from(this.nftCache.values()).filter(entry => now < entry.expires);
    
    return {
      totalCached: validEntries.length,
      cacheHitRate: 0, // TODO: Track hit rate
      oldestEntry: validEntries.length > 0 
        ? Math.min(...validEntries.map(entry => entry.timestamp))
        : null
    };
  }

  /**
   * Get debug information
   */
  getDebugInfo(): {
    serviceName: string;
    cacheStats: any;
    supportedContracts: {
      characters: number;
      items: number;
    };
  } {
    return {
      serviceName: 'UE5NFTService',
      cacheStats: this.getCacheStats(),
      supportedContracts: {
        characters: 2, // CloneX, Animus
        items: 2       // CloneX Vials, Animus Eggs
      }
    };
  }
}

// Export singleton instance
export const ue5NFTService = new UE5NFTService();