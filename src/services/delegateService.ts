import { DelegationVerification, DelegationType, NFTData } from '../types';
import { NFT_COLLECTIONS } from '../constants/nftCollections';

interface DelegateRegistryResponse {
  delegations: Array<{
    delegate: string;
    vault: string;
    type: number; // 0=NONE, 1=ALL, 2=CONTRACT, 3=TOKEN
    contract?: string;
    tokenId?: string;
    amount?: number;
    rights?: string;
  }>;
}

interface DelegationCacheEntry {
  data: DelegationVerification[];
  timestamp: number;
  expiresAt: number;
}

interface DelegateCheckRequest {
  delegate: string;
  vault: string;
  contract: string;
  tokenId?: string;
}

interface DelegateCheckResponse {
  valid: boolean;
  delegate: string;
  vault: string;
  contract: string;
  tokenId?: string;
  rights?: string;
}

export class DelegateService {
  private readonly baseURL = 'https://api.delegate.xyz/registry';
  private readonly cache = new Map<string, DelegationCacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly rateLimitDelay = 200; // 200ms between requests
  private lastRequestTime = 0;

  /**
   * Get all vault wallets that have delegated to the specified address
   */
  async getDelegationsForWallet(delegateAddress: string): Promise<DelegationVerification[]> {
    const cacheKey = `delegations:${delegateAddress.toLowerCase()}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }

    try {
      await this.enforceRateLimit();
      
      const response = await fetch(
        `${this.baseURL}/getDelegatesForDelegate?delegate=${delegateAddress}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Delegate.xyz API error: ${response.status} ${response.statusText}`);
      }

      const data: DelegateRegistryResponse = await response.json();
      const delegations = this.processDelegationResponse(data, delegateAddress);

      // Cache the results
      this.cache.set(cacheKey, {
        data: delegations,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION
      });

      return delegations;
      
    } catch (error: any) {
      console.warn('Failed to fetch delegations from Delegate.xyz:', error);
      
      // Return cached data if available, even if expired
      if (cached) {
        return cached.data;
      }
      
      return [];
    }
  }

  /**
   * Check if a specific ERC721 token is delegated to the delegate address
   */
  async checkERC721Delegation(
    delegateAddress: string,
    vaultAddress: string,
    contractAddress: string,
    tokenId: string
  ): Promise<boolean> {
    try {
      await this.enforceRateLimit();

      const response = await fetch(`${this.baseURL}/checkDelegateForERC721`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          delegate: delegateAddress,
          vault: vaultAddress,
          contract: contractAddress,
          tokenId: tokenId
        })
      });

      if (!response.ok) {
        throw new Error(`ERC721 delegation check failed: ${response.status}`);
      }

      const data: DelegateCheckResponse = await response.json();
      return data.valid;
      
    } catch (error) {
      console.warn(`ERC721 delegation check failed for ${contractAddress}:${tokenId}:`, error);
      return false;
    }
  }

  /**
   * Check if ERC1155 tokens are delegated to the delegate address
   */
  async checkERC1155Delegation(
    delegateAddress: string,
    vaultAddress: string,
    contractAddress: string,
    tokenId?: string
  ): Promise<boolean> {
    try {
      await this.enforceRateLimit();

      const payload: any = {
        delegate: delegateAddress,
        vault: vaultAddress,
        contract: contractAddress
      };

      if (tokenId) {
        payload.tokenId = tokenId;
      }

      const response = await fetch(`${this.baseURL}/checkDelegateForERC1155`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`ERC1155 delegation check failed: ${response.status}`);
      }

      const data: DelegateCheckResponse = await response.json();
      return data.valid;
      
    } catch (error) {
      console.warn(`ERC1155 delegation check failed for ${contractAddress}:`, error);
      return false;
    }
  }

  /**
   * Get delegated NFTs for a specific collection
   */
  async getDelegatedNFTsForCollection(
    delegateAddress: string,
    collectionKey: keyof typeof NFT_COLLECTIONS,
    vaultNFTs: NFTData[]
  ): Promise<NFTData[]> {
    const collection = NFT_COLLECTIONS[collectionKey];
    const delegatedNFTs: NFTData[] = [];

    // Get all delegations for this wallet
    const delegations = await this.getDelegationsForWallet(delegateAddress);
    
    // Filter delegations relevant to this collection
    const relevantDelegations = delegations.filter(delegation => 
      delegation.delegationType.type === 'ALL' ||
      (delegation.delegationType.type === 'CONTRACT' && 
       delegation.delegationType.contract?.toLowerCase() === collection.contract.toLowerCase())
    );

    for (const delegation of relevantDelegations) {
      // Get NFTs from this vault that match the delegation
      const matchingNFTs = vaultNFTs.filter(nft => {
        // Verify the NFT is from the correct vault
        if (nft.verificationSource !== delegation.vaultWallet) return false;
        
        // Check delegation type
        switch (delegation.delegationType.type) {
          case 'ALL':
            return true;
          
          case 'CONTRACT':
            return nft.contractAddress.toLowerCase() === collection.contract.toLowerCase();
          
          case 'TOKEN':
            return nft.contractAddress.toLowerCase() === collection.contract.toLowerCase() &&
                   nft.tokenId === delegation.delegationType.tokenId;
          
          default:
            return false;
        }
      });

      // Verify each NFT delegation individually
      for (const nft of matchingNFTs) {
        let isValidDelegation = false;

        if (collection.tokenType === 'ERC721') {
          isValidDelegation = await this.checkERC721Delegation(
            delegateAddress,
            delegation.vaultWallet,
            nft.contractAddress,
            nft.tokenId
          );
        } else if (collection.tokenType === 'ERC1155') {
          isValidDelegation = await this.checkERC1155Delegation(
            delegateAddress,
            delegation.vaultWallet,
            nft.contractAddress,
            nft.tokenId
          );
        }

        if (isValidDelegation) {
          delegatedNFTs.push({
            ...nft,
            ownershipContext: 'DELEGATED',
            delegationInfo: {
              delegateWallet: delegateAddress,
              vaultWallet: delegation.vaultWallet,
              delegationType: delegation.delegationType
            }
          });
        }
      }
    }

    return delegatedNFTs;
  }

  /**
   * Check if a wallet has any delegations
   */
  async hasDelegations(delegateAddress: string): Promise<boolean> {
    const delegations = await this.getDelegationsForWallet(delegateAddress);
    return delegations.length > 0;
  }

  /**
   * Get delegation summary for dashboard display
   */
  async getDelegationSummary(delegateAddress: string): Promise<{
    totalVaults: number;
    totalDelegations: number;
    byType: Record<string, number>;
    byCollection: Record<string, number>;
  }> {
    const delegations = await this.getDelegationsForWallet(delegateAddress);
    
    const summary = {
      totalVaults: new Set(delegations.map(d => d.vaultWallet)).size,
      totalDelegations: delegations.length,
      byType: {} as Record<string, number>,
      byCollection: {} as Record<string, number>
    };

    // Count by delegation type
    for (const delegation of delegations) {
      const type = delegation.delegationType.type;
      summary.byType[type] = (summary.byType[type] || 0) + 1;
    }

    // Count by collection (for contract delegations)
    for (const delegation of delegations) {
      if (delegation.delegationType.type === 'CONTRACT' && delegation.delegationType.contract) {
        const collection = this.getCollectionFromContract(delegation.delegationType.contract);
        if (collection) {
          summary.byCollection[collection] = (summary.byCollection[collection] || 0) + 1;
        }
      }
    }

    return summary;
  }

  /**
   * Clear delegation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Process raw delegation response from Delegate.xyz API
   */
  private processDelegationResponse(
    response: DelegateRegistryResponse,
    delegateAddress: string
  ): DelegationVerification[] {
    return response.delegations.map(delegation => {
      const delegationType: DelegationType = {
        type: this.mapDelegationType(delegation.type),
        contract: delegation.contract,
        tokenId: delegation.tokenId
      };

      return {
        vaultWallet: delegation.vault,
        delegateWallet: delegateAddress,
        delegationType,
        verified: true // Assume verified if returned by API
      };
    });
  }

  /**
   * Map Delegate.xyz delegation type numbers to our type system
   */
  private mapDelegationType(type: number): 'ALL' | 'CONTRACT' | 'TOKEN' {
    switch (type) {
      case 1: return 'ALL';
      case 2: return 'CONTRACT';
      case 3: return 'TOKEN';
      default: return 'ALL';
    }
  }

  /**
   * Get collection name from contract address
   */
  private getCollectionFromContract(contractAddress: string): string | null {
    const address = contractAddress.toLowerCase();
    
    for (const [key, collection] of Object.entries(NFT_COLLECTIONS)) {
      if (collection.contract.toLowerCase() === address) {
        return key.toLowerCase();
      }
    }
    
    return null;
  }

  /**
   * Enforce rate limiting between API calls
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }
}

// Export singleton instance
export const delegateService = new DelegateService();