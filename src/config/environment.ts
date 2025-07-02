export const isWebContainer = typeof window !== 'undefined' && 
  window.location.hostname.includes('webcontainer-api.io');

export const isDev = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD || !isWebContainer;

// Domain detection for cross-domain session management
export const getCloneXDomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Check if we're on a clonex.wtf subdomain
  if (hostname.endsWith('.clonex.wtf')) {
    return '.clonex.wtf'; // Root domain for cookies
  }
  
  // Check if we're on the main domain
  if (hostname === 'clonex.wtf') {
    return '.clonex.wtf';
  }
  
  // Development/localhost - use current domain
  if (hostname === 'localhost' || hostname.includes('webcontainer-api.io')) {
    return hostname;
  }
  
  return null;
};

export const isCloneXDomain = (): boolean => {
  return getCloneXDomain() !== null;
};

export const getCurrentSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  if (hostname.endsWith('.clonex.wtf')) {
    const subdomain = hostname.replace('.clonex.wtf', '');
    return subdomain || 'www';
  }
  
  if (hostname === 'clonex.wtf') {
    return 'www';
  }
  
  return hostname; // For development
};

// Environment configuration
export const ENV_CONFIG = {
  // API Configuration
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.clonex.wtf',
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '15000'),
  
  // Web3 Configuration
  disableWeb3: false, // Never disable in production
  walletConnectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  enableCoinbaseWallet: import.meta.env.VITE_ENABLE_COINBASE === 'true',
  walletDebug: false, // Disable debug in production
  
  // NFT Provider Configuration
  alchemyApiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
  moralisApiKey: import.meta.env.VITE_MORALIS_API_KEY,
  etherscanApiKey: import.meta.env.VITE_ETHERSCAN_API_KEY,
  
  // GRO Asset Service Configuration
  groEnabled: import.meta.env.VITE_GRO_ENABLED === 'true',
  groTimeout: parseInt(import.meta.env.VITE_GRO_TIMEOUT || '3000'),
  groBaseUrl: import.meta.env.VITE_GRO_BASE_URL || 'https://gro.clonex.wtf',
  
  // Cross-Domain Configuration
  cloneXDomain: getCloneXDomain(),
  currentSubdomain: getCurrentSubdomain(),
  isCloneXDomain: isCloneXDomain(),
  
  // Session Configuration
  sessionCookieName: 'clonex_session',
  accessTokenCookieName: 'clonex_access_token',
  cookieSecure: true, // Always secure in production
  cookieSameSite: 'Lax' as const,
  
  // Development Flags - All disabled for production
  showDevBanner: false,
  enableMockAuth: false,
  
  // Performance Configuration
  enablePreloading: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  
  // Error Handling
  enableErrorReporting: true,
  maxRetries: 3,
  retryDelay: 1000,
  
  // UE5 Configuration
  ue5JwtSecret: import.meta.env.VITE_UE5_JWT_SECRET || 'production_secret',
  ue5TokenExpiry: parseInt(import.meta.env.VITE_UE5_TOKEN_EXPIRY || '86400'),
  ue5GameVersion: import.meta.env.VITE_UE5_GAME_VERSION || '1.0.0',
  ue5ApiBaseUrl: import.meta.env.VITE_UE5_API_BASE_URL || 'https://ue5-api.clonex.wtf',
  enableUE5Auth: import.meta.env.VITE_ENABLE_UE5_AUTH === 'true',
  showUE5Debug: false, // Disable debug in production
  
  // Debug options - All disabled for production
  showApiDebug: false,
  showGroStatus: false,
  showCrossDomainDebug: false,
  forceGroFallback: false
};

// API Headers
export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Client-Version': '2.0.0',
  'X-Client-Platform': 'web'
};