import { NFTProvider, NFTData, VerificationResult, DelegationVerification, NFTCacheEntry, AlchemyConfig, MoralisConfig, EtherscanConfig } from '../types';
import { NFT_COLLECTIONS, ACCESS_LEVELS } from '../constants/nftCollections';
import { NFT_MESSAGES } from '../constants/nftMessages';
import { delegateService } from './delegateService';

const NFT_PROVIDERS: NFTProvider[] = [
  {
    name: 'ALCHEMY',
    priority: 1,
    config: {
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY || '',
      network: 'eth-mainnet',
      baseURL: 'https://eth-mainnet.g.alchemy.com/nft/v3',
      endpoints: {
        getNFTs: '/{apiKey}/getNFTsForOwner',
        getNFTMetadata: '/{apiKey}/getNFTMetadata'
      }
    } as AlchemyConfig,
    rateLimits: {
      requestsPerSecond: 5,
      requestsPerDay: 300
    },
    capabilities: ['metadata', 'media', 'traits', 'transfers']
  },
  {
    name: 'MORALIS',
    priority: 2,
    config: {
      apiKey: import.meta.env.VITE_MORALIS_API_KEY || '',
      baseURL: 'https://deep-index.moralis.io/api/v2.2',
      endpoints: {
        getNFTs: '/{address}/nft',
        getNFTMetadata: '/nft/{address}/{tokenId}'
      }
    } as MoralisConfig,
    rateLimits: {
      requestsPerSecond: 25,
      requestsPerDay: 100000
    },
    capabilities: ['metadata', 'media', 'transfers', 'trades']
  },
  {
    name: 'ETHERSCAN',
    priority: 3,
    config: {
      apiKey: import.meta.env.VITE_ETHERSCAN_API_KEY || '',
      baseURL: 'https://api.etherscan.io/api',
      endpoints: {
        getTokenNFTInventory: '?module=account&action=tokennfttx',
        getContractABI: '?module=contract&action=getabi',
        getTransactionHistory: '?module=account&action=txlist'
      }
    } as EtherscanConfig,
    rateLimits: {
      requestsPerSecond: 5,
      requestsPerDay: 100000
    },
    capabilities: ['ownership_verification', 'transfer_history', 'contract_data']
  }
];

class EnhancedNFTCache {
  private cache = new Map<string, NFTCacheEntry>();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  getCachedNFTs(
    walletAddress: string, 
    delegations: DelegationVerification[]
  ): NFTData[] | null {
    const cacheKey = this.generateCacheKey(walletAddress, delegations);
    const entry = this.cache.get(cacheKey);
    
    if (entry && Date.now() < entry.expiresAt) {
      return entry.data;
    }
    
    return null;
  }
  
  setCachedNFTs(
    walletAddress: string,
    delegations: DelegationVerification[],
    result: VerificationResult
  ): void {
    const cacheKey = this.generateCacheKey(walletAddress, delegations);
    const entry: NFTCacheEntry = {
      data: result.nftDetails,
      timestamp: Date.now(),
      verificationSources: result.verificationSources,
      delegationContext: delegations,
      expiresAt: Date.now() + this.CACHE_DURATION
    };
    
    this.cache.set(cacheKey, entry);
  }
  
  private generateCacheKey(
    walletAddress: string, 
    delegations: DelegationVerification[]
  ): string {
    const delegationHashes = delegations
      .map(d => `${d.vaultWallet}-${d.delegationType.type}`)
      .sort()
      .join('|');
    
    return `${walletAddress}:${delegationHashes}`;
  }
}

export class MultiProviderNFTService {
  private providers: NFTProvider[] = NFT_PROVIDERS;
  private rateLimitTracker = new Map<string, number[]>();
  private cache = new EnhancedNFTCache();
  
  async verifyWalletNFTs(
    walletAddress: string, 
    delegations: DelegationVerification[] = []
  ): Promise<VerificationResult> {
    const startTime = Date.now();
    
    // Check cache first
    const cachedNFTs = this.cache.getCachedNFTs(walletAddress, delegations);
    if (cachedNFTs) {
      return this.processVerificationResults(
        cachedNFTs, 
        ['CACHE' as any], 
        startTime, 
        cachedNFTs.filter(nft => nft.blockchainVerification?.verified).length,
        {},
        delegations
      );
    }
    
    const allNFTs: NFTData[] = [];
    const usedSources: ('ALCHEMY' | 'MORALIS' | 'ETHERSCAN')[] = [];
    
    try {
      // 1. Primary verification - Direct NFTs
      console.log('🔍 Fetching directly owned NFTs...');
      const directNFTs = await this.getPrimaryNFTData(walletAddress);
      allNFTs.push(...directNFTs.map(nft => ({ 
        ...nft, 
        ownershipContext: 'DIRECT' as const 
      })));
      
      if (directNFTs.length > 0) {
        usedSources.push(directNFTs[0].verificationSource as any);
      }
      
      console.log(`📦 Found ${directNFTs.length} directly owned NFTs`);
      
      // 2. Delegation verification - Delegated NFTs
      if (delegations.length > 0) {
        console.log(`🔗 Processing ${delegations.length} delegations...`);
        
        for (const delegation of delegations) {
          try {
            console.log(`🔍 Checking delegation from vault: ${delegation.vaultWallet.slice(0, 6)}...`);
            
            // Get NFTs from vault wallet
            const vaultNFTs = await this.getPrimaryNFTData(delegation.vaultWallet);
            
            // Verify specific delegations using Delegate.xyz
            const verifiedDelegatedNFTs = await this.verifySpecificDelegations(
              walletAddress,
              delegation,
              vaultNFTs
            );
            
            console.log(`✅ Verified ${verifiedDelegatedNFTs.length} delegated NFTs from ${delegation.vaultWallet.slice(0, 6)}...`);
            
            allNFTs.push(...verifiedDelegatedNFTs);
            
          } catch (error) {
            console.warn(`❌ Failed to verify delegation from ${delegation.vaultWallet}:`, error);
          }
        }
      }
      
      // 3. Blockchain verification with Etherscan
      console.log('🔗 Performing blockchain verification...');
      const blockchainVerified = await this.verifyOwnershipOnChain(walletAddress, allNFTs);
      const etherscanData = await this.getEtherscanMetadata(walletAddress);
      
      if (!usedSources.includes('ETHERSCAN')) {
        usedSources.push('ETHERSCAN');
      }
      
      // 4. Process results with delegation context
      const result = this.processVerificationResults(
        allNFTs, 
        usedSources, 
        startTime, 
        blockchainVerified,
        etherscanData,
        delegations
      );
      
      console.log(`🎯 Final result: ${result.totalNFTs} total NFTs (${result.directNFTs.length} direct, ${result.delegatedNFTs.length} delegated)`);
      
      // Cache the results
      this.cache.setCachedNFTs(walletAddress, delegations, result);
      
      return result;
      
    } catch (error: any) {
      throw new Error(`NFT verification failed: ${error.message}`);
    }
  }
  
  /**
   * Verify specific NFT delegations using Delegate.xyz API
   */
  private async verifySpecificDelegations(
    delegateAddress: string,
    delegation: DelegationVerification,
    vaultNFTs: NFTData[]
  ): Promise<NFTData[]> {
    const verifiedNFTs: NFTData[] = [];
    
    // Filter NFTs based on delegation type
    const candidateNFTs = this.filterNFTsByDelegation(vaultNFTs, delegation);
    
    console.log(`🔍 Checking ${candidateNFTs.length} candidate NFTs for delegation verification...`);
    
    // Verify each NFT individually with Delegate.xyz
    for (const nft of candidateNFTs) {
      try {
        let isValidDelegation = false;
        
        // Get collection info to determine token type
        const collection = this.getCollectionFromContract(nft.contractAddress);
        
        if (collection) {
          const collectionInfo = NFT_COLLECTIONS[collection.toUpperCase() as keyof typeof NFT_COLLECTIONS];
          
          if (collectionInfo.tokenType === 'ERC721') {
            isValidDelegation = await delegateService.checkERC721Delegation(
              delegateAddress,
              delegation.vaultWallet,
              nft.contractAddress,
              nft.tokenId
            );
          } else if (collectionInfo.tokenType === 'ERC1155') {
            isValidDelegation = await delegateService.checkERC1155Delegation(
              delegateAddress,
              delegation.vaultWallet,
              nft.contractAddress,
              nft.tokenId
            );
          }
          
          if (isValidDelegation) {
            console.log(`✅ Verified delegation for ${collection} #${nft.tokenId}`);
            
            verifiedNFTs.push({
              ...nft,
              ownershipContext: 'DELEGATED',
              delegationInfo: {
                delegateWallet: delegateAddress,
                vaultWallet: delegation.vaultWallet,
                delegationType: delegation.delegationType
              }
            });
          } else {
            console.log(`❌ Failed to verify delegation for ${collection} #${nft.tokenId}`);
          }
        }
        
      } catch (error) {
        console.warn(`⚠️ Error verifying delegation for NFT ${nft.tokenId}:`, error);
      }
    }
    
    return verifiedNFTs;
  }
  
  private async getPrimaryNFTData(walletAddress: string): Promise<NFTData[]> {
    // Try providers in priority order with fallback
    for (const provider of this.providers.filter(p => p.name !== 'ETHERSCAN')) {
      try {
        if (this.isRateLimited(provider.name)) {
          continue;
        }
        
        const nfts = await this.fetchFromProvider(provider, walletAddress);
        this.trackRequest(provider.name);
        
        return nfts.map(nft => ({
          ...nft,
          verificationSource: provider.name
        }));
        
      } catch (error) {
        console.warn(`${provider.name} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All NFT providers failed');
  }
  
  private async verifyOwnershipOnChain(
    walletAddress: string, 
    nfts: NFTData[]
  ): Promise<number> {
    let verifiedCount = 0;
    
    try {
      const etherscanConfig = this.providers.find(p => p.name === 'ETHERSCAN')?.config as EtherscanConfig;
      
      for (const nft of nfts) {
        try {
          const url = `${etherscanConfig.baseURL}${etherscanConfig.endpoints.getTokenNFTInventory}&address=${walletAddress}&contractaddress=${nft.contractAddress}&apikey=${etherscanConfig.apiKey}`;
          
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.status === '1' && data.result) {
            const tokenExists = data.result.some((tx: any) => 
              tx.tokenID === nft.tokenId && 
              tx.to.toLowerCase() === walletAddress.toLowerCase()
            );
            
            if (tokenExists) {
              nft.blockchainVerification = {
                verified: true,
                ownershipConfirmed: true,
                lastTransferBlock: parseInt(data.result[0]?.blockNumber),
                lastTransferHash: data.result[0]?.hash
              };
              verifiedCount++;
            }
          }
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (error) {
          console.warn(`Etherscan verification failed for ${nft.tokenId}:`, error);
          nft.blockchainVerification = {
            verified: false,
            ownershipConfirmed: false
          };
        }
      }
      
    } catch (error) {
      console.warn('Etherscan verification service failed:', error);
    }
    
    return verifiedCount;
  }
  
  private async getEtherscanMetadata(walletAddress: string): Promise<any> {
    try {
      const etherscanConfig = this.providers.find(p => p.name === 'ETHERSCAN')?.config as EtherscanConfig;
      const url = `${etherscanConfig.baseURL}${etherscanConfig.endpoints.getTransactionHistory}&address=${walletAddress}&sort=desc&apikey=${etherscanConfig.apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === '1' && data.result) {
        const nftTransactions = data.result.filter((tx: any) => 
          Object.values(NFT_COLLECTIONS).some(collection => 
            collection.contract.toLowerCase() === tx.to?.toLowerCase()
          )
        );
        
        return {
          totalTransactions: data.result.length,
          firstNFTAcquisition: nftTransactions[nftTransactions.length - 1]?.timeStamp,
          recentActivity: data.result.slice(0, 10).some((tx: any) => 
            Date.now() - (parseInt(tx.timeStamp) * 1000) < 7 * 24 * 60 * 60 * 1000 // 7 days
          )
        };
      }
      
    } catch (error) {
      console.warn('Etherscan metadata fetch failed:', error);
    }
    
    return {};
  }
  
  private filterNFTsByDelegation(
    nfts: NFTData[], 
    delegation: DelegationVerification
  ): NFTData[] {
    switch (delegation.delegationType.type) {
      case 'ALL':
        // Return all supported collection NFTs
        return nfts.filter(nft => 
          Object.values(NFT_COLLECTIONS).some(collection => 
            collection.contract.toLowerCase() === nft.contractAddress.toLowerCase()
          )
        );
      
      case 'CONTRACT':
        return nfts.filter(nft => 
          nft.contractAddress.toLowerCase() === 
          delegation.delegationType.contract?.toLowerCase()
        );
      
      case 'TOKEN':
        return nfts.filter(nft => 
          nft.contractAddress.toLowerCase() === 
          delegation.delegationType.contract?.toLowerCase() &&
          nft.tokenId === delegation.delegationType.tokenId
        );
      
      default:
        return [];
    }
  }
  
  private getCollectionFromContract(contractAddress: string): string | null {
    const address = contractAddress.toLowerCase();
    
    for (const [key, collection] of Object.entries(NFT_COLLECTIONS)) {
      if (collection.contract.toLowerCase() === address) {
        return key.toLowerCase();
      }
    }
    
    return null;
  }
  
  private async fetchFromProvider(
    provider: NFTProvider, 
    walletAddress: string
  ): Promise<NFTData[]> {
    switch (provider.name) {
      case 'ALCHEMY':
        return this.fetchFromAlchemy(provider.config as AlchemyConfig, walletAddress);
      
      case 'MORALIS':
        return this.fetchFromMoralis(provider.config as MoralisConfig, walletAddress);
      
      case 'ETHERSCAN':
        return this.fetchFromEtherscan(provider.config as EtherscanConfig, walletAddress);
      
      default:
        throw new Error(`Unknown provider: ${provider.name}`);
    }
  }
  
  private async fetchFromAlchemy(
    config: AlchemyConfig, 
    walletAddress: string
  ): Promise<NFTData[]> {
    const url = `${config.baseURL}${config.endpoints.getNFTs.replace('{apiKey}', config.apiKey)}`;
    const params = new URLSearchParams({
      owner: walletAddress,
      withMetadata: 'true',
      pageSize: '100'
    });
    
    // Add all supported contract addresses
    Object.values(NFT_COLLECTIONS).forEach(collection => {
      params.append('contractAddresses[]', collection.contract);
    });
    
    const response = await fetch(`${url}?${params}`);
    if (!response.ok) throw new Error(`Alchemy API error: ${response.status}`);
    
    const data = await response.json();
    return this.normalizeAlchemyResponse(data);
  }
  
  private async fetchFromMoralis(
    config: MoralisConfig, 
    walletAddress: string
  ): Promise<NFTData[]> {
    const url = `${config.baseURL}${config.endpoints.getNFTs.replace('{address}', walletAddress)}`;
    const params = new URLSearchParams({
      chain: 'eth',
      format: 'decimal',
      media_items: 'true'
    });
    
    // Add all supported contract addresses
    Object.values(NFT_COLLECTIONS).forEach(collection => {
      params.append('token_addresses', collection.contract);
    });
    
    const response = await fetch(`${url}?${params}`, {
      headers: {
        'X-API-Key': config.apiKey
      }
    });
    
    if (!response.ok) throw new Error(`Moralis API error: ${response.status}`);
    
    const data = await response.json();
    return this.normalizeMoralisResponse(data);
  }
  
  private async fetchFromEtherscan(
    config: EtherscanConfig, 
    walletAddress: string
  ): Promise<NFTData[]> {
    const nfts: NFTData[] = [];
    
    // Check all supported contracts
    for (const [collectionKey, collection] of Object.entries(NFT_COLLECTIONS)) {
      try {
        const url = `${config.baseURL}${config.endpoints.getTokenNFTInventory}&address=${walletAddress}&contractaddress=${collection.contract}&apikey=${config.apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === '1' && data.result) {
          for (const tx of data.result) {
            if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
              nfts.push({
                tokenId: tx.tokenID,
                contractAddress: tx.contractAddress,
                tokenType: collection.tokenType as 'ERC721' | 'ERC1155',
                metadata: {
                  name: `${collection.name} #${tx.tokenID}`,
                  description: '',
                  image: '',
                  attributes: []
                },
                media: [],
                verificationSource: 'ETHERSCAN',
                ownershipContext: 'DIRECT',
                blockchainVerification: {
                  verified: true,
                  lastTransferBlock: parseInt(tx.blockNumber),
                  lastTransferHash: tx.hash,
                  ownershipConfirmed: true
                }
              });
            }
          }
        }
        
        // Rate limiting between contract checks
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.warn(`Failed to check ${collectionKey} on Etherscan:`, error);
        continue;
      }
    }
    
    return nfts;
  }
  
  private normalizeAlchemyResponse(data: any): NFTData[] {
    return data.ownedNfts?.map((nft: any) => ({
      tokenId: nft.tokenId,
      contractAddress: nft.contract.address,
      tokenType: nft.tokenType,
      tokenUri: nft.tokenUri,
      metadata: nft.metadata || {
        name: `Token #${nft.tokenId}`,
        description: '',
        image: '',
        attributes: []
      },
      media: nft.media || [],
      verificationSource: 'ALCHEMY',
      ownershipContext: 'DIRECT'
    })) || [];
  }
  
  private normalizeMoralisResponse(data: any): NFTData[] {
    return data.result?.map((nft: any) => ({
      tokenId: nft.token_id,
      contractAddress: nft.token_address,
      tokenType: nft.contract_type,
      tokenUri: nft.token_uri,
      metadata: nft.metadata ? JSON.parse(nft.metadata) : {
        name: `Token #${nft.token_id}`,
        description: '',
        image: '',
        attributes: []
      },
      media: nft.media_items || [],
      verificationSource: 'MORALIS',
      ownershipContext: 'DIRECT'
    })) || [];
  }
  
  private processVerificationResults(
    allNFTs: NFTData[], 
    usedSources: ('ALCHEMY' | 'MORALIS' | 'ETHERSCAN')[], 
    startTime: number,
    blockchainVerified: number = 0,
    etherscanData: any = {},
    delegations: DelegationVerification[] = []
  ): VerificationResult {
    // Categorize NFTs by collection
    const clonexNFTs = allNFTs.filter(nft => 
      nft.contractAddress.toLowerCase() === NFT_COLLECTIONS.CLONEX.contract.toLowerCase()
    );
    const animusNFTs = allNFTs.filter(nft => 
      nft.contractAddress.toLowerCase() === NFT_COLLECTIONS.ANIMUS.contract.toLowerCase()
    );
    const animusEggNFTs = allNFTs.filter(nft => 
      nft.contractAddress.toLowerCase() === NFT_COLLECTIONS.ANIMUS_EGGS.contract.toLowerCase()
    );
    const clonexVialNFTs = allNFTs.filter(nft => 
      nft.contractAddress.toLowerCase() === NFT_COLLECTIONS.CLONEX_VIALS.contract.toLowerCase()
    );
    
    const collections: any[] = [];
    if (clonexNFTs.length > 0) collections.push('clonex');
    if (animusNFTs.length > 0) collections.push('animus');
    if (animusEggNFTs.length > 0) collections.push('animus_eggs');
    if (clonexVialNFTs.length > 0) collections.push('clonex_vials');
    
    // Determine access level based on combined direct + delegated NFTs
    let accessLevel: any = 'NONE';
    
    const counts = {
      clonex: clonexNFTs.length,
      animus: animusNFTs.length,
      animus_eggs: animusEggNFTs.length,
      clonex_vials: clonexVialNFTs.length
    };
    
    // Check access levels in descending order
    for (const [level, requirements] of Object.entries(ACCESS_LEVELS).reverse()) {
      const req = requirements.requirements;
      if (counts.clonex >= req.clonex && 
          counts.animus >= req.animus && 
          counts.animus_eggs >= req.animus_eggs && 
          counts.clonex_vials >= req.clonex_vials) {
        accessLevel = level;
        break;
      }
    }
    
    // Create delegation summary
    const delegationSummary = delegations.length > 0 ? {
      totalVaults: new Set(delegations.map(d => d.vaultWallet)).size,
      totalDelegations: delegations.length,
      byType: delegations.reduce((acc, d) => {
        acc[d.delegationType.type] = (acc[d.delegationType.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byCollection: {},
      lastUpdated: Date.now()
    } : undefined;
    
    return {
      collections,
      accessLevel,
      totalNFTs: allNFTs.length,
      nftDetails: allNFTs,
      verificationSources: usedSources,
      blockchainVerified,
      delegatedNFTs: allNFTs.filter(nft => nft.ownershipContext === 'DELEGATED'),
      directNFTs: allNFTs.filter(nft => nft.ownershipContext === 'DIRECT'),
      verificationTime: Date.now() - startTime,
      delegationSummary,
      etherscanData
    };
  }
  
  private isRateLimited(providerName: string): boolean {
    const requests = this.rateLimitTracker.get(providerName) || [];
    const now = Date.now();
    const recentRequests = requests.filter(time => now - time < 1000);
    
    const provider = this.providers.find(p => p.name === providerName);
    return recentRequests.length >= provider!.rateLimits.requestsPerSecond;
  }
  
  private trackRequest(providerName: string): void {
    const requests = this.rateLimitTracker.get(providerName) || [];
    requests.push(Date.now());
    this.rateLimitTracker.set(providerName, requests);
  }
}

export const nftService = new MultiProviderNFTService();