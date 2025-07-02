/**
 * UE5 Data Formatter Service
 * 
 * Converts CloneX Universal Login data to UE5 ProjectPhoenix-BEFE format.
 * Strips unnecessary data and provides clean, game-ready structures.
 */

import { 
  UE5AuthResponse, 
  UE5JWTPayload, 
  UE5NFTItem, 
  UE5NFTResponse, 
  UE5UserProfile, 
  UE5Collection, 
  UE5InventoryItem, 
  UE5InventoryResponse,
  UE5AccessLevel,
  UE5ContractCategory,
  UE5TokenType
} from '../types/ue5Types';

import { 
  getContractCategory, 
  getContractName, 
  getContractType, 
  isSupportedContract,
  UE5_CONTRACT_PRIORITIES 
} from '../constants/ue5Contracts';

import { User, MultiAssetNFT, NFTData, VerificationResult } from '../types';
import { ENV_CONFIG } from '../config/environment';

class UE5DataFormatter {
  
  // ============================================================================
  // Authentication Data Formatting
  // ============================================================================

  /**
   * Format CloneX user data to UE5 auth response
   */
  formatAuthResponse(token: string, user: User): UE5AuthResponse {
    return {
      token,
      user: {
        id: user.address,
        email: this.generateGameEmail(user.address),
        walletAddress: user.address
      }
    };
  }

  /**
   * Format CloneX JWT to UE5 JWT payload
   */
  formatJWTPayload(walletAddress: string, originalToken: string): UE5JWTPayload {
    try {
      // Decode original token to get expiry info
      const originalPayload = JSON.parse(atob(originalToken));
      
      return {
        id: walletAddress,
        email: this.generateGameEmail(walletAddress),
        iat: Math.floor(Date.now() / 1000),
        exp: originalPayload.exp || Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h default
      };
    } catch (error) {
      console.warn('Failed to decode original token:', error);
      
      return {
        id: walletAddress,
        email: this.generateGameEmail(walletAddress),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      };
    }
  }

  /**
   * Generate game-compatible email from wallet address
   */
  private generateGameEmail(walletAddress: string): string {
    return `${walletAddress.toLowerCase()}@clonex.wtf`;
  }

  // ============================================================================
  // NFT Data Formatting (UNIFIED APPROACH)
  // ============================================================================

  /**
   * Convert CloneX MultiAssetNFT to simple UE5NFTItem (strips GRO data)
   */
  formatNFTItem(nft: MultiAssetNFT | NFTData): UE5NFTItem | null {
    // Only include supported contracts
    if (!isSupportedContract(nft.contractAddress)) {
      return null;
    }

    const contractName = getContractName(nft.contractAddress);
    const contractType = getContractType(nft.contractAddress);

    if (!contractName || !contractType) {
      console.warn(`Contract not found in UE5 mapping: ${nft.contractAddress}`);
      return null;
    }

    return {
      contractAddress: nft.contractAddress.toLowerCase(),
      contractName,
      tokenId: nft.tokenId,
      type: contractType,
      // ERC1155 balance (ERC721 is always "1")
      balance: contractType === 'ERC1155' ? '1' : undefined
    };
  }

  /**
   * Convert CloneX NFT collection to UE5 response format (UNIFIED)
   * CRITICAL: Combines direct + delegated NFTs into unified arrays
   */
  formatNFTResponse(nfts: (MultiAssetNFT | NFTData)[]): UE5NFTResponse {
    const formattedNFTs = nfts
      .map(nft => this.formatNFTItem(nft))
      .filter((item): item is UE5NFTItem => item !== null);

    // Separate into characters and items
    const characters: UE5NFTItem[] = [];
    const items: UE5NFTItem[] = [];

    formattedNFTs.forEach(nft => {
      const category = getContractCategory(nft.contractAddress);
      if (category === 'characters') {
        characters.push(nft);
      } else if (category === 'items') {
        items.push(nft);
      }
    });

    // Sort by contract priority (CloneX first, etc.)
    const sortByPriority = (a: UE5NFTItem, b: UE5NFTItem) => {
      const priorityA = UE5_CONTRACT_PRIORITIES[a.contractAddress] || 999;
      const priorityB = UE5_CONTRACT_PRIORITIES[b.contractAddress] || 999;
      return priorityA - priorityB;
    };

    return {
      characters: characters.sort(sortByPriority),
      items: items.sort(sortByPriority)
    };
  }

  /**
   * Convert VerificationResult to unified UE5 NFT response
   * CRITICAL: Flattens direct + delegated NFTs into single response
   */
  formatVerificationResultToUE5(verificationResult: VerificationResult): UE5NFTResponse {
    // Combine ALL accessible NFTs (direct + delegated)
    const allAccessibleNFTs: NFTData[] = [
      ...verificationResult.directNFTs,     // Direct ownership
      ...verificationResult.delegatedNFTs   // Delegated access
    ];

    if (ENV_CONFIG.showUE5Debug) {
      console.log(`🔄 UE5 Formatter: Converting ${allAccessibleNFTs.length} total accessible NFTs`);
      console.log(`📦 Breakdown: ${verificationResult.directNFTs.length} direct, ${verificationResult.delegatedNFTs.length} delegated`);
    }

    // Use existing formatNFTResponse method (strips ownership context)
    const ue5Response = this.formatNFTResponse(allAccessibleNFTs);

    if (ENV_CONFIG.showUE5Debug) {
      console.log(`✅ UE5 Format: ${ue5Response.characters.length} characters, ${ue5Response.items.length} items`);
    }

    return ue5Response;
  }

  // ============================================================================
  // User Profile Formatting
  // ============================================================================

  /**
   * Format CloneX user to UE5 user profile
   */
  formatUserProfile(user: User, verificationResult?: VerificationResult): UE5UserProfile {
    const collections = this.formatUserCollections(user, verificationResult);
    
    const totalCharacters = collections
      .filter(c => c.category === 'characters')
      .reduce((sum, c) => sum + c.totalOwned, 0);
      
    const totalItems = collections
      .filter(c => c.category === 'items')
      .reduce((sum, c) => sum + c.totalOwned, 0);

    return {
      id: user.address,
      email: this.generateGameEmail(user.address),
      walletAddress: user.address,
      accessLevel: this.mapAccessLevel(user, verificationResult),
      collections,
      totalCharacters,
      totalItems,
      lastLogin: Date.now(),
      joinedDate: Date.now() // TODO: Track actual join date
    };
  }

  /**
   * Format user's NFT collections for UE5 (includes delegated counts)
   */
  private formatUserCollections(user: User, verificationResult?: VerificationResult): UE5Collection[] {
    const collections: UE5Collection[] = [];
    
    // If we have verification result, use unified counts (direct + delegated)
    if (verificationResult) {
      const allNFTs = [...verificationResult.directNFTs, ...verificationResult.delegatedNFTs];
      
      // Count by contract address
      const contractCounts: Record<string, number> = {};
      allNFTs.forEach(nft => {
        const address = nft.contractAddress.toLowerCase();
        contractCounts[address] = (contractCounts[address] || 0) + 1;
      });
      
      // Convert to UE5 collection format
      Object.entries(contractCounts).forEach(([address, count]) => {
        const contractName = getContractName(address);
        const contractType = getContractType(address);
        const category = getContractCategory(address);
        
        if (contractName && contractType && category) {
          collections.push({
            contractAddress: address,
            contractName,
            type: contractType,
            totalOwned: count,
            category
          });
        }
      });
    } else {
      // Fallback to legacy user data structure
      if (user.cloneXTokens.length > 0) {
        const cloneXContract = '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b';
        collections.push({
          contractAddress: cloneXContract,
          contractName: 'CloneX',
          type: 'ERC721',
          totalOwned: user.cloneXTokens.length,
          category: 'characters'
        });
      }

      if (user.animusTokens.length > 0) {
        const animusContract = '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f';
        collections.push({
          contractAddress: animusContract,
          contractName: 'Animus',
          type: 'ERC721',
          totalOwned: user.animusTokens.length,
          category: 'characters'
        });
      }

      if (user.animusEggTokens.length > 0) {
        const animusEggContract = '0x6c410cf0b8c113dc6a7641b431390b11d5515082';
        collections.push({
          contractAddress: animusEggContract,
          contractName: 'Animus Eggs',
          type: 'ERC721',
          totalOwned: user.animusEggTokens.length,
          category: 'items'
        });
      }

      if (user.cloneXVialTokens.length > 0) {
        const cloneXVialContract = '0x348fc118bcc65a92dc033a951af153d14d945312';
        collections.push({
          contractAddress: cloneXVialContract,
          contractName: 'CloneX Vials',
          type: 'ERC1155',
          totalOwned: user.cloneXVialTokens.length,
          category: 'items'
        });
      }
    }

    return collections;
  }

  /**
   * Map CloneX access level to UE5 access level (includes delegated assets)
   */
  private mapAccessLevel(user: User, verificationResult?: VerificationResult): UE5AccessLevel {
    // Use verification result access level if available
    if (verificationResult?.accessLevel) {
      return verificationResult.accessLevel as UE5AccessLevel;
    }

    // Fallback to calculating based on owned NFTs
    const cloneXCount = user.cloneXTokens.length;
    const animusCount = user.animusTokens.length;
    const animusEggCount = user.animusEggTokens.length;
    const cloneXVialCount = user.cloneXVialTokens.length;

    if (cloneXCount >= 10 && animusCount >= 5 && animusEggCount >= 5 && cloneXVialCount >= 25) {
      return 'ECOSYSTEM_NATIVE';
    } else if (cloneXCount >= 5 && animusCount >= 2 && animusEggCount >= 3 && cloneXVialCount >= 10) {
      return 'SENIOR_RESEARCHER';
    } else if (cloneXCount >= 2 && animusCount >= 1 && animusEggCount >= 1 && cloneXVialCount >= 5) {
      return 'ACTIVE_RESEARCHER';
    } else if (cloneXCount >= 1) {
      return 'COLLECTOR';
    } else {
      return 'NONE';
    }
  }

  // ============================================================================
  // Inventory Formatting
  // ============================================================================

  /**
   * Format CloneX NFTs to UE5 inventory response (unified)
   */
  formatInventoryResponse(
    walletAddress: string, 
    nfts: (MultiAssetNFT | NFTData)[]
  ): UE5InventoryResponse {
    const inventoryItems = nfts
      .map(nft => this.formatInventoryItem(nft))
      .filter((item): item is UE5InventoryItem => item !== null);

    // Separate into categories
    const characters = inventoryItems.filter(item => item.category === 'characters');
    const items = inventoryItems.filter(item => item.category === 'items');

    return {
      walletAddress: walletAddress.toLowerCase(),
      totalItems: inventoryItems.length,
      categories: {
        characters,
        items
      },
      lastUpdated: Date.now()
    };
  }

  /**
   * Format single NFT to UE5 inventory item
   */
  private formatInventoryItem(nft: MultiAssetNFT | NFTData): UE5InventoryItem | null {
    if (!isSupportedContract(nft.contractAddress)) {
      return null;
    }

    const contractName = getContractName(nft.contractAddress);
    const contractType = getContractType(nft.contractAddress);
    const category = getContractCategory(nft.contractAddress);

    if (!contractName || !contractType || !category) {
      return null;
    }

    return {
      contractAddress: nft.contractAddress.toLowerCase(),
      tokenId: nft.tokenId,
      contractName,
      type: contractType,
      category,
      balance: contractType === 'ERC1155' ? '1' : '1',
      metadata: {
        name: nft.metadata.name || `${contractName} #${nft.tokenId}`,
        description: nft.metadata.description || '',
        imageUrl: this.getCleanImageUrl(nft),
        attributes: nft.metadata.attributes || []
      },
      gameData: {
        isEquipped: false,
        lastUsed: undefined,
        durability: undefined,
        level: undefined
      }
    };
  }

  /**
   * Get clean image URL (strips GRO data, uses original metadata image)
   */
  private getCleanImageUrl(nft: MultiAssetNFT | NFTData): string {
    // Always use original metadata image for UE5 (no GRO assets)
    return nft.metadata.image || '';
  }

  // ============================================================================
  // Data Validation
  // ============================================================================

  /**
   * Validate UE5 NFT item structure
   */
  validateNFTItem(item: UE5NFTItem): boolean {
    return !!(
      item.contractAddress &&
      item.contractName &&
      item.tokenId &&
      (item.type === 'ERC721' || item.type === 'ERC1155') &&
      isSupportedContract(item.contractAddress)
    );
  }

  /**
   * Validate UE5 user profile structure
   */
  validateUserProfile(profile: UE5UserProfile): boolean {
    return !!(
      profile.id &&
      profile.email &&
      profile.walletAddress &&
      profile.accessLevel &&
      Array.isArray(profile.collections) &&
      typeof profile.totalCharacters === 'number' &&
      typeof profile.totalItems === 'number'
    );
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Get clean contract statistics for UE5 (unified counts)
   */
  getContractStats(nfts: (MultiAssetNFT | NFTData)[]): {
    totalSupported: number;
    byCategory: Record<UE5ContractCategory, number>;
    byContract: Record<string, number>;
  } {
    const supportedNFTs = nfts.filter(nft => isSupportedContract(nft.contractAddress));
    
    const stats = {
      totalSupported: supportedNFTs.length,
      byCategory: { characters: 0, items: 0 } as Record<UE5ContractCategory, number>,
      byContract: {} as Record<string, number>
    };

    supportedNFTs.forEach(nft => {
      const category = getContractCategory(nft.contractAddress);
      const contractName = getContractName(nft.contractAddress);
      
      if (category) {
        stats.byCategory[category]++;
      }
      
      if (contractName) {
        stats.byContract[contractName] = (stats.byContract[contractName] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Strip CloneX-specific data for UE5 compatibility
   */
  stripCloneXSpecificData<T extends Record<string, any>>(data: T): Partial<T> {
    const stripped = { ...data };
    
    // Remove GRO-specific fields
    delete stripped.groAssets;
    delete stripped.currentAssetType;
    delete stripped.fallbackAsset;
    delete stripped.hasAnimation;
    
    // Remove CloneX-specific verification data
    delete stripped.verificationSource;
    delete stripped.delegationInfo;
    delete stripped.delegationSummary;
    delete stripped.ownershipContext; // CRITICAL: Strip ownership context for unified response
    
    // Remove media arrays (UE5 uses simple image URLs)
    delete stripped.media;
    
    return stripped;
  }

  /**
   * Get debug info for UE5 integration
   */
  getDebugInfo(nfts: (MultiAssetNFT | NFTData)[]): {
    originalCount: number;
    supportedCount: number;
    unsupportedContracts: string[];
    ue5Response: UE5NFTResponse;
    stats: ReturnType<typeof this.getContractStats>;
  } {
    const supportedNFTs = nfts.filter(nft => isSupportedContract(nft.contractAddress));
    const unsupportedContracts = Array.from(
      new Set(
        nfts
          .filter(nft => !isSupportedContract(nft.contractAddress))
          .map(nft => nft.contractAddress)
      )
    );

    return {
      originalCount: nfts.length,
      supportedCount: supportedNFTs.length,
      unsupportedContracts,
      ue5Response: this.formatNFTResponse(nfts),
      stats: this.getContractStats(nfts)
    };
  }
}

// Export singleton instance
export const ue5DataFormatter = new UE5DataFormatter();