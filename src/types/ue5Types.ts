/**
 * UE5 ProjectPhoenix-BEFE Compatible Types
 * 
 * These types must match the ProjectPhoenix-BEFE format exactly
 * for seamless integration with UE5 backend systems.
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface UE5AuthResponse {
  token: string;
  user?: {
    id: string;                     // Wallet address as user ID
    email: string;                  // "{wallet}@clonex.wtf" format
    walletAddress?: string;
  };
}

export interface UE5JWTPayload {
  id: string;           // Wallet address
  email: string;        // {wallet}@clonex.wtf
  iat: number;         // Issued at
  exp: number;         // Expires at
}

export interface UE5LoginRequest {
  walletAddress: string;
  signature: string;
  message: string;
  nonce: string;
}

export interface UE5AuthChallenge {
  message: string;
  nonce: string;
  timestamp: number;
}

// ============================================================================
// NFT Types
// ============================================================================

export interface UE5NFTItem {
  contractAddress: string;
  contractName: string;
  tokenId: string;
  type: "ERC721" | "ERC1155";
  balance?: string;
}

export interface UE5NFTResponse {
  characters: UE5NFTItem[];
  items: UE5NFTItem[];
}

export interface UE5NFTSyncRequest {
  walletAddress: string;
  forceRefresh?: boolean;
}

export interface UE5NFTMetadata {
  contractAddress: string;
  tokenId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

// ============================================================================
// Contract Types
// ============================================================================

export interface UE5ContractInfo {
  address: string;
  type: "ERC721" | "ERC1155";
  name: string;
  tokenIdRange?: { start: number; end: number };
}

export interface UE5ContractsResponse {
  characters: UE5ContractInfo[];
  items: UE5ContractInfo[];
}

// ============================================================================
// User Profile Types
// ============================================================================

export interface UE5UserProfile {
  id: string;                     // Wallet address
  email: string;                  // {wallet}@clonex.wtf
  walletAddress: string;
  accessLevel: UE5AccessLevel;
  collections: UE5Collection[];
  totalCharacters: number;
  totalItems: number;
  lastLogin: number;              // Unix timestamp
  joinedDate: number;             // Unix timestamp
}

export interface UE5Collection {
  contractAddress: string;
  contractName: string;
  type: "ERC721" | "ERC1155";
  totalOwned: number;
  category: "characters" | "items";
}

export type UE5AccessLevel = 
  | "NONE" 
  | "COLLECTOR" 
  | "ACTIVE_RESEARCHER" 
  | "SENIOR_RESEARCHER" 
  | "ECOSYSTEM_NATIVE";

// ============================================================================
// API Response Types
// ============================================================================

export interface UE5APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
}

export interface UE5PaginatedResponse<T = any> extends UE5APIResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// Game Integration Types
// ============================================================================

export interface UE5GameSessionRequest {
  walletAddress: string;
  gameVersion: string;
  platform: string;
  sessionId?: string;
}

export interface UE5GameSessionResponse {
  sessionToken: string;
  expiresAt: number;
  gameSettings: {
    enabledFeatures: string[];
    characterSlots: number;
    itemSlots: number;
  };
}

export interface UE5AssetLoadRequest {
  contractAddress: string;
  tokenId: string;
  assetType: "character" | "item";
  quality: "low" | "medium" | "high";
}

export interface UE5AssetLoadResponse {
  assetUrl: string;
  assetType: string;
  fileSize: number;
  checksum: string;
  expiresAt: number;
}

// ============================================================================
// Inventory Management Types
// ============================================================================

export interface UE5InventoryItem {
  contractAddress: string;
  tokenId: string;
  contractName: string;
  type: "ERC721" | "ERC1155";
  category: "characters" | "items";
  balance: string;
  metadata: {
    name: string;
    description?: string;
    imageUrl?: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  gameData?: {
    isEquipped: boolean;
    lastUsed?: number;
    durability?: number;
    level?: number;
  };
}

export interface UE5InventoryResponse {
  walletAddress: string;
  totalItems: number;
  categories: {
    characters: UE5InventoryItem[];
    items: UE5InventoryItem[];
  };
  lastUpdated: number;
}

// ============================================================================
// Error Types
// ============================================================================

export interface UE5Error {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export type UE5ErrorCode = 
  | "INVALID_WALLET"
  | "INVALID_SIGNATURE" 
  | "TOKEN_EXPIRED"
  | "INSUFFICIENT_ACCESS"
  | "NFT_NOT_FOUND"
  | "CONTRACT_NOT_SUPPORTED"
  | "NETWORK_ERROR"
  | "RATE_LIMITED"
  | "MAINTENANCE_MODE";

// ============================================================================
// Blockchain Types
// ============================================================================

export interface UE5BlockchainConfig {
  chainId: number;
  networkName: string;
  rpcUrl: string;
  explorerUrl: string;
  supportedContracts: string[];
}

export interface UE5TransactionStatus {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  blockNumber?: number;
  gasUsed?: string;
  timestamp?: number;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface UE5UserAnalytics {
  walletAddress: string;
  gameTime: number;              // Total playtime in seconds
  sessionsPlayed: number;
  lastActiveDate: number;
  favoritedCharacters: string[]; // Token IDs
  achievementsUnlocked: string[];
  preferences: {
    graphics: "low" | "medium" | "high" | "ultra";
    sound: number;               // 0-100
    notifications: boolean;
  };
}

// ============================================================================
// Cache Types
// ============================================================================

export interface UE5CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version: string;
}

export interface UE5CacheConfig {
  userProfileTTL: number;        // User profile cache TTL
  nftDataTTL: number;           // NFT data cache TTL
  contractInfoTTL: number;      // Contract info cache TTL
  assetUrlTTL: number;          // Asset URL cache TTL
}

// ============================================================================
// Type Guards
// ============================================================================

export const isUE5NFTItem = (obj: any): obj is UE5NFTItem => {
  return obj && 
    typeof obj.contractAddress === 'string' &&
    typeof obj.contractName === 'string' &&
    typeof obj.tokenId === 'string' &&
    (obj.type === 'ERC721' || obj.type === 'ERC1155');
};

export const isUE5AuthResponse = (obj: any): obj is UE5AuthResponse => {
  return obj && typeof obj.token === 'string';
};

export const isUE5APIResponse = <T>(obj: any): obj is UE5APIResponse<T> => {
  return obj && typeof obj.success === 'boolean' && typeof obj.timestamp === 'number';
};

// ============================================================================
// Default Values
// ============================================================================

export const UE5_DEFAULT_CACHE_CONFIG: UE5CacheConfig = {
  userProfileTTL: 15 * 60 * 1000,    // 15 minutes
  nftDataTTL: 30 * 60 * 1000,        // 30 minutes
  contractInfoTTL: 60 * 60 * 1000,   // 1 hour
  assetUrlTTL: 10 * 60 * 1000,       // 10 minutes
};

export const UE5_SUPPORTED_ASSET_QUALITIES = ['low', 'medium', 'high'] as const;
export const UE5_SUPPORTED_PLATFORMS = ['windows', 'mac', 'linux'] as const;
export const UE5_MAX_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Utility Types
// ============================================================================

export type UE5ContractCategory = "characters" | "items";
export type UE5TokenType = "ERC721" | "ERC1155";
export type UE5AssetQuality = "low" | "medium" | "high";
export type UE5Platform = "windows" | "mac" | "linux";