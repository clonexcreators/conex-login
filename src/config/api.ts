// Production API configuration for CloneX Universal Login
// Backend: https://api.clonex.wtf

// ============================================================================
// API Configuration
// ============================================================================

export const API_CONFIG = {
  baseURL: 'https://api.clonex.wtf',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Environment-aware API URL
export const getApiUrl = () => {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:3000';  // Local development
  }
  return 'https://api.clonex.wtf';  // Production
};

export const API_URL = getApiUrl();

// ============================================================================
// Access Level Types (Production-aligned with backend)
// ============================================================================

export type AccessLevel = 
  | 'COSMIC_CHAMPION'    // 25+ CloneX, 10+ Animus
  | 'CLONE_VANGUARD'     // 15+ CloneX, 5+ Animus  
  | 'DNA_DISCIPLE'       // 5+ CloneX, 1+ Animus
  | 'ANIMUS_PRIME'       // 5+ Animus
  | 'ANIMUS_HATCHLING'   // 1+ CloneX OR 1+ Animus
  | 'LOST_CODE';         // No qualifying NFTs

export const ACCESS_LEVEL_CONFIG = {
  'COSMIC_CHAMPION': {
    title: 'Cosmic Champion',
    description: 'Ultimate ecosystem status',
    requirements: '25+ CloneX, 10+ Animus',
    color: '#FF2D75', // Hot pink
    subdomains: ['*'] // All subdomains
  },
  'CLONE_VANGUARD': {
    title: 'Clone Vanguard', 
    description: 'High-ranking CloneX holder',
    requirements: '15+ CloneX, 5+ Animus',
    color: '#34EEDC', // Mint teal
    subdomains: ['gm', 'gro', 'profile', 'lore', 'lab']
  },
  'DNA_DISCIPLE': {
    title: 'DNA Disciple',
    description: 'CloneX collector',
    requirements: '5+ CloneX, 1+ Animus',
    color: '#87CEFA', // Sky blue
    subdomains: ['gm', 'gro', 'profile', 'lore']
  },
  'ANIMUS_PRIME': {
    title: 'Animus Prime',
    description: 'Animus specialist',
    requirements: '5+ Animus',
    color: '#FF85B3', // Bubblegum pink
    subdomains: ['gm', 'gro', 'profile', 'lore']
  },
  'ANIMUS_HATCHLING': {
    title: 'Animus Hatchling',
    description: 'Entry level',
    requirements: '1+ CloneX OR 1+ Animus',
    color: '#27C3B6', // Cool teal
    subdomains: ['gm', 'gro', 'profile']
  },
  'LOST_CODE': {
    title: 'Lost Code',
    description: 'No NFTs detected',
    requirements: 'No qualifying NFTs',
    color: '#F9F9F9', // Neutral white
    subdomains: ['gm']
  }
} as const;

// ============================================================================
// Core Interfaces
// ============================================================================

// Core user interface
export interface AuthUser {
  walletAddress: string;
  accessLevel: AccessLevel;
  isAuthenticated: boolean;
}

// Authentication responses
export interface NonceResponse {
  success: boolean;
  nonce: string;
  message: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  expiresIn: string;
}

export interface SessionStatusResponse {
  success: boolean;
  user: AuthUser;
  sessionValid: boolean;
}

// ============================================================================
// NFT Verification Types
// ============================================================================

export interface NFTToken {
  contractAddress: string;
  tokenId: string;
  metadata?: object;
  imageUrl?: string;
  isDelegated?: boolean;
  vaultWallet?: string;
}

export interface NFTCollection {
  count: number;
  tokens: NFTToken[];
}

export interface NFTVerificationResponse {
  success: boolean;
  walletAddress: string;
  accessLevel: AccessLevel;
  nftCollections: {
    clonex: NFTCollection;
    animus: NFTCollection;
    animus_eggs: NFTCollection;
    clonex_vials: NFTCollection;
  };
  delegatedAccess: {
    enabled: boolean;
    vaultWallets: string[];
    delegatedNFTs: NFTToken[];
  };
  verificationMethod: 'ALCHEMY' | 'MORALIS' | 'ETHERSCAN';
  lastUpdated: string;
}

// ============================================================================
// Error Handling
// ============================================================================

export interface APIError {
  success: false;
  error: string;
  message: string;
  code?: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type APIResponse<T> = T | APIError;

// Request options for API calls
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

// Authentication state
export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// ============================================================================
// Constants
// ============================================================================

export const CONTRACT_ADDRESSES = {
  CLONEX: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b',
  ANIMUS: '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f',
  ANIMUS_EGGS: '0x6c410cf0b8c113dc6a7641b431390b11d5515082',
  CLONEX_VIALS: '0x348fc118bcc65a92dc033a951af153d14d945312'
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    NONCE: '/api/auth/nonce',
    VERIFY: '/api/auth/verify',
    REFRESH: '/api/auth/refresh',
    STATUS: '/api/auth/status',
    LOGOUT: '/api/auth/logout'
  },
  NFT: {
    VERIFY: '/api/nft/verify',
    COLLECTIONS: '/api/nft/collections',
    DELEGATED: '/api/nft/delegated'
  },
  USER: {
    PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings'
  }
} as const;

// ============================================================================
// Type Guards
// ============================================================================

export const isAPIError = (response: any): response is APIError => {
  return response && response.success === false && typeof response.error === 'string';
};

export const isValidAccessLevel = (level: string): level is AccessLevel => {
  return Object.keys(ACCESS_LEVEL_CONFIG).includes(level);
};

// ============================================================================
// Helper Functions
// ============================================================================

export const getAccessLevelConfig = (level: AccessLevel) => {
  return ACCESS_LEVEL_CONFIG[level];
};

export const hasSubdomainAccess = (level: AccessLevel, subdomain: string): boolean => {
  const config = ACCESS_LEVEL_CONFIG[level];
  return config.subdomains.includes('*') || config.subdomains.includes(subdomain);
};

export const calculateTotalNFTs = (collections: NFTVerificationResponse['nftCollections']): number => {
  return collections.clonex.count + 
         collections.animus.count + 
         collections.animus_eggs.count + 
         collections.clonex_vials.count;
};