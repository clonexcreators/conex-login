export interface User {
  address: string;
  ensName?: string;
  cloneXTokens: NFTToken[];
  animusTokens: NFTToken[];
  animusEggTokens: NFTToken[];
  cloneXVialTokens: NFTToken[];
  isConnected: boolean;
  verificationResult?: VerificationResult;
  delegationSummary?: DelegationSummary;
}

export interface NFTToken {
  tokenId: string;
  image: string;
  name: string;
  attributes: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface WalletConnectionState {
  isConnecting: boolean;
  isConnected: boolean;
  address?: string;
  error?: string;
}

export interface AuthChallenge {
  message: string;
  nonce: string;
  timestamp: number;
}

export interface AuthState {
  user: User | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  walletAddress: string | null;
  authToken: string | null;
  challenge: AuthChallenge | null;
  isLoading: boolean;
  isSigningChallenge: boolean;
  error: string | null;
  lastAuthTime: number | null;
}

export interface AuthError {
  type: 'WALLET_REJECTED' | 'NETWORK_ERROR' | 'SESSION_EXPIRED' | 'SIGNATURE_FAILED' | 'UNKNOWN';
  message: string;
}

// Enhanced NFT Types for Multi-Provider System
export interface NFTData {
  tokenId: string;
  contractAddress: string;
  tokenType: 'ERC721' | 'ERC1155';
  tokenUri?: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  media: Array<{
    gateway: string;
    thumbnail: string;
    raw: string;
    format: string;
  }>;
  verificationSource: 'ALCHEMY' | 'MORALIS' | 'ETHERSCAN' | 'CACHE';
  ownershipContext: 'DIRECT' | 'DELEGATED';
  blockchainVerification?: {
    verified: boolean;
    lastTransferBlock?: number;
    lastTransferHash?: string;
    ownershipConfirmed: boolean;
  };
  delegationInfo?: {
    delegateWallet: string;
    vaultWallet: string;
    delegationType: DelegationType;
  };
  groAssets?: AssetVariant[];
  currentAssetType?: string;
  fallbackAsset?: string;
  hasAnimation?: boolean;
}

export interface VerificationResult {
  collections: CollectionType[];
  accessLevel: AccessLevel;
  totalNFTs: number;
  nftDetails: NFTData[];
  verificationSources: ('ALCHEMY' | 'MORALIS' | 'ETHERSCAN')[];
  blockchainVerified: number;
  delegatedNFTs: NFTData[];
  directNFTs: NFTData[];
  verificationTime: number;
  delegationSummary?: DelegationSummary;
  etherscanData?: {
    totalTransactions: number;
    firstNFTAcquisition?: string;
    recentActivity: boolean;
  };
}

export interface NFTProvider {
  name: 'ALCHEMY' | 'MORALIS' | 'ETHERSCAN';
  priority: number;
  config: AlchemyConfig | MoralisConfig | EtherscanConfig;
  rateLimits: {
    requestsPerSecond: number;
    requestsPerDay: number;
  };
  capabilities: string[];
}

export interface AlchemyConfig {
  apiKey: string;
  network: 'eth-mainnet';
  baseURL: string;
  endpoints: {
    getNFTs: string;
    getNFTMetadata: string;
  };
}

export interface MoralisConfig {
  apiKey: string;
  baseURL: 'https://deep-index.moralis.io/api/v2.2';
  endpoints: {
    getNFTs: string;
    getNFTMetadata: string;
  };
}

export interface EtherscanConfig {
  apiKey: string;
  baseURL: 'https://api.etherscan.io/api';
  endpoints: {
    getTokenNFTInventory: string;
    getContractABI: string;
    getTransactionHistory: string;
  };
}

// Enhanced Delegation Types for Delegate.xyz v2 Integration
export interface DelegationType {
  type: 'ALL' | 'CONTRACT' | 'TOKEN';
  contract?: string;
  tokenId?: string;
  rights?: string; // For delegate.xyz v2 rights system
}

export interface DelegationVerification {
  vaultWallet: string;
  delegateWallet: string;
  delegationType: DelegationType;
  verified: boolean;
  expirationTimestamp?: number; // For time-bound delegations
  rights?: string; // Specific rights granted
}

export interface DelegationSummary {
  totalVaults: number;
  totalDelegations: number;
  byType: Record<string, number>;
  byCollection: Record<string, number>;
  lastUpdated: number;
}

export type CollectionType = 'clonex' | 'animus' | 'animus_eggs' | 'clonex_vials';
export type AccessLevel = 'NONE' | 'COLLECTOR' | 'ACTIVE_RESEARCHER' | 'SENIOR_RESEARCHER' | 'ECOSYSTEM_NATIVE';

export interface NFTCacheEntry {
  data: NFTData[];
  timestamp: number;
  verificationSources: ('ALCHEMY' | 'MORALIS' | 'ETHERSCAN')[];
  delegationContext: DelegationVerification[];
  expiresAt: number;
}

// GRO Asset System Types
export interface GROAssetConfig {
  baseURL: string;
  collections: {
    clonex: {
      '3d_character': string;
      '2d_illustration'?: string;
    };
    animus: {
      '3d_character': string;
      '2d_illustration': string;
    };
    animus_egg: {
      '3d_image': string;
      'animation': string;
    };
    clonex_vials: {
      '3d_image': string;
      'animation': string;
    };
  };
}

export interface AssetVariant {
  type: '3d_character' | '2d_illustration' | '3d_image' | 'animation';
  url: string;
  available: boolean;
  comingSoon?: boolean;
  preloaded?: boolean;
}

export interface MultiAssetNFT extends NFTData {
  groAssets: AssetVariant[];
  currentAssetType: string;
  fallbackAsset: string;
  hasAnimation?: boolean;
}

export interface AssetCache {
  preloadQueue: string[];
  loadedAssets: Map<string, string>;
  failedAssets: Set<string>;
  cacheExpiry: number;
}

export interface AssetLoadingState {
  isLoading: boolean;
  currentAsset: string | null;
  preloadingAssets: string[];
  failedAssets: string[];
  cacheStatus: 'empty' | 'partial' | 'complete';
}