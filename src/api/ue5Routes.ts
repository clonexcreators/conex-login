/**
 * UE5 API Route Handlers for ProjectPhoenix-BEFE Integration
 * 
 * HTTP endpoint handlers that UE5 can consume directly.
 * Provides complete authentication, NFT verification, and user management API.
 */

import { ue5AuthService } from './ue5AuthService';
import { ue5NFTService } from './ue5NFTService';
import { ue5ContractService } from './ue5ContractService';
import { ue5DataFormatter } from '../services/ue5DataFormatter';
import { 
  UE5AuthResponse, 
  UE5APIResponse, 
  UE5NFTResponse, 
  UE5ContractsResponse,
  UE5UserProfile 
} from '../types/ue5Types';
import { ENV_CONFIG } from '../config/environment';

// ============================================================================
// Request/Response Types for API Endpoints
// ============================================================================

export interface UE5APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  body?: any;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export interface UE5RouteHandler {
  (request: UE5APIRequest): Promise<UE5APIResponse<any>>;
}

// ============================================================================
// UE5 API Router Class
// ============================================================================

class UE5APIRouter {
  private routes = new Map<string, UE5RouteHandler>();
  
  constructor() {
    this.initializeRoutes();
    
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🎮 UE5 API Router initialized');
      console.log('🚀 Available endpoints:', Array.from(this.routes.keys()));
    }
  }

  /**
   * Initialize all UE5 API routes
   */
  private initializeRoutes(): void {
    // ========================================================================
    // Authentication Routes
    // ========================================================================
    
    this.routes.set('POST:/api/ue5/auth/register', this.handleAuthRegister.bind(this));
    this.routes.set('POST:/api/ue5/auth/login', this.handleAuthLogin.bind(this));
    this.routes.set('POST:/api/ue5/auth/refresh', this.handleAuthRefresh.bind(this));
    this.routes.set('GET:/api/ue5/auth/status', this.handleAuthStatus.bind(this));
    
    // ========================================================================
    // User Management Routes
    // ========================================================================
    
    this.routes.set('POST:/api/ue5/auth/update-wallet', this.handleUpdateWallet.bind(this));
    this.routes.set('GET:/api/ue5/auth/wallet', this.handleGetWallet.bind(this));
    this.routes.set('GET:/api/ue5/user/profile', this.handleGetUserProfile.bind(this));
    
    // ========================================================================
    // NFT & Contract Routes
    // ========================================================================
    
    this.routes.set('GET:/api/ue5/auth/contracts', this.handleGetContracts.bind(this));
    this.routes.set('GET:/api/ue5/auth/nfts', this.handleGetNFTs.bind(this));
    this.routes.set('POST:/api/ue5/nft/verify', this.handleVerifyNFT.bind(this));
    
    // ========================================================================
    // Development & Debug Routes
    // ========================================================================
    
    if (ENV_CONFIG.showUE5Debug) {
      this.routes.set('GET:/api/ue5/debug/status', this.handleDebugStatus.bind(this));
      this.routes.set('GET:/api/ue5/debug/routes', this.handleDebugRoutes.bind(this));
    }
  }

  /**
   * Handle incoming UE5 API request
   */
  async handleRequest(request: UE5APIRequest): Promise<UE5APIResponse<any>> {
    const routeKey = `${request.method}:${request.path}`;
    
    if (ENV_CONFIG.showUE5Debug) {
      console.log(`🔍 UE5 API Request: ${routeKey}`);
    }

    const handler = this.routes.get(routeKey);
    
    if (!handler) {
      return {
        success: false,
        error: `Endpoint not found: ${routeKey}`,
        timestamp: Date.now()
      };
    }

    try {
      return await handler(request);
    } catch (error: any) {
      console.error(`UE5 API Error for ${routeKey}:`, error);
      
      return {
        success: false,
        error: `Internal server error: ${error.message}`,
        timestamp: Date.now()
      };
    }
  }

  // ============================================================================
  // Authentication Route Handlers
  // ============================================================================

  /**
   * POST /api/ue5/auth/register
   */
  private async handleAuthRegister(request: UE5APIRequest): Promise<UE5APIResponse<UE5AuthResponse>> {
    const { walletAddress, platform, gameVersion } = request.body || {};
    
    if (!walletAddress) {
      return {
        success: false,
        error: 'Missing required field: walletAddress',
        timestamp: Date.now()
      };
    }

    const authResponse = await ue5AuthService.ue5Register({
      walletAddress,
      platform: platform || 'ue5',
      gameVersion: gameVersion || ENV_CONFIG.ue5GameVersion
    });

    return {
      success: true,
      data: authResponse,
      timestamp: Date.now()
    };
  }

  /**
   * POST /api/ue5/auth/login
   */
  private async handleAuthLogin(request: UE5APIRequest): Promise<UE5APIResponse<UE5AuthResponse>> {
    const { walletAddress, signature, message, nonce } = request.body || {};
    
    if (!walletAddress || !signature || !message || !nonce) {
      return {
        success: false,
        error: 'Missing required fields: walletAddress, signature, message, nonce',
        timestamp: Date.now()
      };
    }

    const authResponse = await ue5AuthService.ue5Login({
      walletAddress,
      signature,
      message,
      nonce
    });

    return {
      success: true,
      data: authResponse,
      timestamp: Date.now()
    };
  }

  /**
   * POST /api/ue5/auth/refresh
   */
  private async handleAuthRefresh(request: UE5APIRequest): Promise<UE5APIResponse<UE5AuthResponse>> {
    const token = this.extractBearerToken(request.headers);
    
    if (!token) {
      return {
        success: false,
        error: 'Missing or invalid Authorization header',
        timestamp: Date.now()
      };
    }

    const authResponse = await ue5AuthService.ue5RefreshToken(token);

    return {
      success: true,
      data: authResponse,
      timestamp: Date.now()
    };
  }

  /**
   * GET /api/ue5/auth/status
   */
  private async handleAuthStatus(request: UE5APIRequest): Promise<UE5APIResponse<{ valid: boolean }>> {
    const token = this.extractBearerToken(request.headers);
    
    if (!token) {
      return {
        success: true,
        data: { valid: false },
        message: 'No token provided',
        timestamp: Date.now()
      };
    }

    const isValid = await ue5AuthService.ue5ValidateToken(token);

    return {
      success: true,
      data: { valid: isValid },
      timestamp: Date.now()
    };
  }

  // ============================================================================
  // User Management Route Handlers
  // ============================================================================

  /**
   * POST /api/ue5/auth/update-wallet
   */
  private async handleUpdateWallet(request: UE5APIRequest): Promise<UE5APIResponse<{ success: boolean }>> {
    const { userId, newWalletAddress, signature, message, nonce } = request.body || {};
    
    if (!userId || !newWalletAddress || !signature || !message || !nonce) {
      return {
        success: false,
        error: 'Missing required fields: userId, newWalletAddress, signature, message, nonce',
        timestamp: Date.now()
      };
    }

    await ue5AuthService.ue5UpdateWallet({
      userId,
      newWalletAddress,
      signature,
      message,
      nonce
    });

    return {
      success: true,
      data: { success: true },
      timestamp: Date.now()
    };
  }

  /**
   * GET /api/ue5/auth/wallet
   */
  private async handleGetWallet(request: UE5APIRequest): Promise<UE5APIResponse<{ walletAddress: string | null }>> {
    const userId = request.query?.userId;
    
    if (!userId) {
      return {
        success: false,
        error: 'Missing required query parameter: userId',
        timestamp: Date.now()
      };
    }

    const result = await ue5AuthService.ue5GetWallet(userId);

    return {
      success: true,
      data: result,
      timestamp: Date.now()
    };
  }

  /**
   * GET /api/ue5/user/profile
   */
  private async handleGetUserProfile(request: UE5APIRequest): Promise<UE5APIResponse<UE5UserProfile | null>> {
    const walletAddress = request.query?.walletAddress;
    
    if (!walletAddress) {
      return {
        success: false,
        error: 'Missing required query parameter: walletAddress',
        timestamp: Date.now()
      };
    }

    const profile = await ue5AuthService.getUE5UserProfile(walletAddress);

    return {
      success: true,
      data: profile,
      timestamp: Date.now()
    };
  }

  // ============================================================================
  // NFT & Contract Route Handlers
  // ============================================================================

  /**
   * GET /api/ue5/auth/contracts
   */
  private async handleGetContracts(request: UE5APIRequest): Promise<UE5APIResponse<UE5ContractsResponse>> {
    const contractsResponse = await ue5NFTService.ue5GetSupportedContracts();
    
    if (!contractsResponse.success) {
      return contractsResponse;
    }

    return {
      success: true,
      data: contractsResponse.data!,
      timestamp: Date.now()
    };
  }

  /**
   * GET /api/ue5/auth/nfts
   */
  private async handleGetNFTs(request: UE5APIRequest): Promise<UE5APIResponse<UE5NFTResponse>> {
    const walletAddress = request.query?.walletAddress;
    const forceRefresh = request.query?.forceRefresh === 'true';
    
    if (!walletAddress) {
      return {
        success: false,
        error: 'Missing required query parameter: walletAddress',
        timestamp: Date.now()
      };
    }

    const nftResponse = await ue5NFTService.ue5GetUserNFTs({
      walletAddress,
      forceRefresh
    });

    if (!nftResponse.success) {
      return nftResponse;
    }

    return {
      success: true,
      data: nftResponse.data!,
      timestamp: Date.now()
    };
  }

  /**
   * POST /api/ue5/nft/verify
   */
  private async handleVerifyNFT(request: UE5APIRequest): Promise<UE5APIResponse<{ hasAccess: boolean }>> {
    const { walletAddress, contractAddress, tokenId } = request.body || {};
    
    if (!walletAddress || !contractAddress || !tokenId) {
      return {
        success: false,
        error: 'Missing required fields: walletAddress, contractAddress, tokenId',
        timestamp: Date.now()
      };
    }

    const verificationResponse = await ue5NFTService.ue5VerifyNFTOwnership({
      walletAddress,
      contractAddress,
      tokenId
    });

    if (!verificationResponse.success) {
      return {
        success: false,
        error: verificationResponse.error,
        timestamp: Date.now()
      };
    }

    return {
      success: true,
      data: { hasAccess: verificationResponse.data || false },
      timestamp: Date.now()
    };
  }

  // ============================================================================
  // Debug Route Handlers (Development Only)
  // ============================================================================

  /**
   * GET /api/ue5/debug/status
   */
  private async handleDebugStatus(request: UE5APIRequest): Promise<UE5APIResponse<any>> {
    const debugInfo = {
      ue5Auth: ue5AuthService.getDebugInfo(),
      ue5NFT: ue5NFTService.getDebugInfo(),
      ue5Contract: ue5ContractService.getDebugInfo(),
      environment: {
        enableUE5Auth: ENV_CONFIG.enableUE5Auth,
        ue5GameVersion: ENV_CONFIG.ue5GameVersion,
        ue5ApiBaseUrl: ENV_CONFIG.ue5ApiBaseUrl,
        showUE5Debug: ENV_CONFIG.showUE5Debug
      },
      routes: {
        totalRoutes: this.routes.size,
        availableEndpoints: Array.from(this.routes.keys())
      }
    };

    return {
      success: true,
      data: debugInfo,
      timestamp: Date.now()
    };
  }

  /**
   * GET /api/ue5/debug/routes
   */
  private async handleDebugRoutes(request: UE5APIRequest): Promise<UE5APIResponse<{ routes: string[] }>> {
    return {
      success: true,
      data: { routes: Array.from(this.routes.keys()) },
      timestamp: Date.now()
    };
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  /**
   * Extract Bearer token from Authorization header
   */
  private extractBearerToken(headers?: Record<string, string>): string | null {
    if (!headers || !headers.authorization && !headers.Authorization) {
      return null;
    }

    const authHeader = headers.authorization || headers.Authorization;
    
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }

  /**
   * Get all available routes for debugging
   */
  getAvailableRoutes(): string[] {
    return Array.from(this.routes.keys());
  }

  /**
   * Check if route exists
   */
  hasRoute(method: string, path: string): boolean {
    return this.routes.has(`${method}:${path}`);
  }
}

// ============================================================================
// UE5 API Client for Frontend Usage
// ============================================================================

export class UE5APIClient {
  private router: UE5APIRouter;
  
  constructor() {
    this.router = new UE5APIRouter();
  }

  /**
   * Make API request (simulates HTTP call)
   */
  async request(method: 'GET' | 'POST' | 'PUT' | 'DELETE', path: string, options: {
    body?: any;
    headers?: Record<string, string>;
    query?: Record<string, string>;
  } = {}): Promise<UE5APIResponse<any>> {
    const request: UE5APIRequest = {
      method,
      path,
      body: options.body,
      headers: options.headers,
      query: options.query
    };

    return this.router.handleRequest(request);
  }

  /**
   * Authentication API methods
   */
  auth = {
    register: (walletAddress: string, platform?: string, gameVersion?: string) =>
      this.request('POST', '/api/ue5/auth/register', {
        body: { walletAddress, platform, gameVersion }
      }),

    login: (walletAddress: string, signature: string, message: string, nonce: string) =>
      this.request('POST', '/api/ue5/auth/login', {
        body: { walletAddress, signature, message, nonce }
      }),

    refresh: (token: string) =>
      this.request('POST', '/api/ue5/auth/refresh', {
        headers: { Authorization: `Bearer ${token}` }
      }),

    status: (token: string) =>
      this.request('GET', '/api/ue5/auth/status', {
        headers: { Authorization: `Bearer ${token}` }
      }),

    updateWallet: (userId: string, newWalletAddress: string, signature: string, message: string, nonce: string) =>
      this.request('POST', '/api/ue5/auth/update-wallet', {
        body: { userId, newWalletAddress, signature, message, nonce }
      }),

    getWallet: (userId: string) =>
      this.request('GET', '/api/ue5/auth/wallet', {
        query: { userId }
      })
  };

  /**
   * User API methods
   */
  user = {
    getProfile: (walletAddress: string) =>
      this.request('GET', '/api/ue5/user/profile', {
        query: { walletAddress }
      })
  };

  /**
   * NFT API methods
   */
  nft = {
    getContracts: () =>
      this.request('GET', '/api/ue5/auth/contracts'),

    getNFTs: (walletAddress: string, forceRefresh?: boolean) =>
      this.request('GET', '/api/ue5/auth/nfts', {
        query: { walletAddress, forceRefresh: forceRefresh ? 'true' : 'false' }
      }),

    verify: (walletAddress: string, contractAddress: string, tokenId: string) =>
      this.request('POST', '/api/ue5/nft/verify', {
        body: { walletAddress, contractAddress, tokenId }
      })
  };

  /**
   * Debug API methods (development only)
   */
  debug = {
    getStatus: () =>
      this.request('GET', '/api/ue5/debug/status'),

    getRoutes: () =>
      this.request('GET', '/api/ue5/debug/routes')
  };
}

// Export singleton instances
export const ue5APIRouter = new UE5APIRouter();
export const ue5APIClient = new UE5APIClient();