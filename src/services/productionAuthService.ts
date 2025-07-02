/**
 * Production Authentication Service for CloneX Universal Login
 * Interfaces with VPS backend at api.clonex.wtf
 */

import { ENV_CONFIG, API_HEADERS } from '../config/environment';
import { AccessLevel, calculateAccessLevel } from '../constants/accessLevels';
import { cookieService } from './cookieService';
import { handleAPIError } from '../utils/errorHandler';

export interface ProductionNonceResponse {
  success: boolean;
  nonce: string;
  message: string;
  timestamp: number;
  expiresAt: number;
}

export interface ProductionAuthResponse {
  success: boolean;
  token: string;
  user: {
    walletAddress: string;
    accessLevel: AccessLevel;
    collections: {
      clonex: number;
      animus: number;
      animus_eggs: number;
      clonex_vials: number;
    };
    subdomainAccess: string[];
    nfts: Array<{
      contract: string;
      tokenId: string;
      metadata: {
        name: string;
        image: string;
        attributes: Array<{
          trait_type: string;
          value: string;
        }>;
      };
    }>;
    lastVerified: string;
    verificationMethod: 'alchemy' | 'moralis' | 'etherscan';
    cached: boolean;
  };
  expiresAt: number;
}

export interface ProductionNFTResponse {
  success: boolean;
  walletAddress: string;
  accessLevel: AccessLevel;
  collections: {
    clonex: number;
    animus: number;
    animus_eggs: number;
    clonex_vials: number;
  };
  nfts: Array<{
    contract: string;
    tokenId: string;
    metadata: {
      name: string;
      image: string;
      attributes: Array<{
        trait_type: string;
        value: string;
      }>;
    };
  }>;
  lastVerified: string;
  verificationMethod: 'alchemy' | 'moralis' | 'etherscan';
  cached: boolean;
  verificationTime: number;
}

export interface ProductionSessionResponse {
  valid: boolean;
  user?: {
    walletAddress: string;
    accessLevel: AccessLevel;
    collections: {
      clonex: number;
      animus: number;
      animus_eggs: number;
      clonex_vials: number;
    };
    subdomainAccess: string[];
  };
  expiresAt?: number;
}

class ProductionAuthService {
  private readonly baseURL = ENV_CONFIG.apiBaseUrl;
  private readonly timeout = ENV_CONFIG.apiTimeout;
  private retryCount = 0;
  private readonly maxRetries = ENV_CONFIG.maxRetries;

  /**
   * Generate authentication nonce from VPS backend
   */
  async generateNonce(walletAddress: string): Promise<{
    message: string;
    nonce: string;
    timestamp: number;
  }> {
    try {
      const response = await this.makeRequest<ProductionNonceResponse>('/api/auth/wallet/nonce', {
        method: 'POST',
        body: JSON.stringify({ 
          walletAddress,
          subdomain: ENV_CONFIG.currentSubdomain,
          domain: ENV_CONFIG.cloneXDomain
        })
      });

      if (!response.success) {
        throw new Error('Failed to generate nonce');
      }

      return {
        message: response.message,
        nonce: response.nonce,
        timestamp: response.timestamp
      };

    } catch (error: any) {
      console.error('❌ Nonce generation failed:', error);
      throw handleAPIError(error);
    }
  }

  /**
   * Verify wallet signature with VPS backend
   */
  async verifySignature(
    walletAddress: string,
    signature: string,
    message: string,
    nonce: string
  ): Promise<ProductionAuthResponse> {
    try {
      const response = await this.makeRequest<ProductionAuthResponse>('/api/auth/wallet/verify', {
        method: 'POST',
        body: JSON.stringify({
          walletAddress,
          signature,
          message,
          nonce,
          subdomain: ENV_CONFIG.currentSubdomain,
          domain: ENV_CONFIG.cloneXDomain
        })
      });

      if (!response.success) {
        throw new Error('Signature verification failed');
      }

      // Store token in localStorage and cross-domain cookies
      localStorage.setItem('clonex_auth_token', response.token);
      
      if (ENV_CONFIG.isCloneXDomain) {
        cookieService.setAuthSession(response.token, response.expiresAt);
      }

      return response;

    } catch (error: any) {
      console.error('❌ Signature verification failed:', error);
      throw handleAPIError(error);
    }
  }

  /**
   * Verify NFTs with VPS backend
   */
  async verifyNFTs(walletAddress: string): Promise<ProductionNFTResponse> {
    try {
      const token = this.getToken();
      
      const response = await this.makeRequest<ProductionNFTResponse>(`/api/nft/verify/${walletAddress}`, {
        method: 'GET',
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.success) {
        throw new Error('NFT verification failed');
      }

      return response;

    } catch (error: any) {
      console.error('❌ NFT verification failed:', error);
      throw handleAPIError(error);
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ProductionAuthResponse> {
    try {
      const currentToken = this.getToken();
      
      if (!currentToken) {
        throw new Error('No token to refresh');
      }

      const response = await this.makeRequest<ProductionAuthResponse>('/api/auth/refresh', {
        method: 'POST',
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          subdomain: ENV_CONFIG.currentSubdomain,
          domain: ENV_CONFIG.cloneXDomain
        })
      });

      if (!response.success) {
        throw new Error('Token refresh failed');
      }

      // Update stored token
      localStorage.setItem('clonex_auth_token', response.token);
      
      if (ENV_CONFIG.isCloneXDomain) {
        cookieService.setAuthSession(response.token, response.expiresAt);
      }

      return response;

    } catch (error: any) {
      console.error('❌ Token refresh failed:', error);
      throw handleAPIError(error);
    }
  }

  /**
   * Validate current session with VPS backend
   */
  async validateSession(): Promise<ProductionSessionResponse> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return { valid: false };
      }

      const response = await this.makeRequest<ProductionSessionResponse>('/api/auth/session/validate', {
        method: 'POST',
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subdomain: ENV_CONFIG.currentSubdomain,
          domain: ENV_CONFIG.cloneXDomain
        })
      });

      return response;

    } catch (error: any) {
      console.warn('❌ Session validation failed:', error);
      return { valid: false };
    }
  }

  /**
   * Validate subdomain access
   */
  async validateSubdomainAccess(targetSubdomain: string): Promise<{
    allowed: boolean;
    accessLevel: AccessLevel;
    requiredLevel?: AccessLevel;
    upgradeOptions?: any;
  }> {
    try {
      const token = this.getToken();
      
      if (!token) {
        return { 
          allowed: false, 
          accessLevel: 'LOST_CODE',
          requiredLevel: 'LOST_CODE'
        };
      }

      const response = await this.makeRequest<{
        allowed: boolean;
        accessLevel: AccessLevel;
        requiredLevel?: AccessLevel;
        upgradeOptions?: any;
      }>('/api/auth/subdomain/validate', {
        method: 'POST',
        headers: {
          ...API_HEADERS,
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetSubdomain,
          currentSubdomain: ENV_CONFIG.currentSubdomain,
          domain: ENV_CONFIG.cloneXDomain
        })
      });

      return response;

    } catch (error: any) {
      console.warn('❌ Subdomain validation failed:', error);
      return { 
        allowed: false, 
        accessLevel: 'LOST_CODE',
        requiredLevel: 'LOST_CODE'
      };
    }
  }

  /**
   * Logout and clear all sessions
   */
  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      
      if (token) {
        // Inform backend about logout
        await this.makeRequest('/api/auth/logout', {
          method: 'POST',
          headers: {
            ...API_HEADERS,
            'Authorization': `Bearer ${token}`
          }
        }).catch(() => {
          // Silent fail for logout cleanup
        });
      }

    } finally {
      // Clear local storage and cookies
      localStorage.removeItem('clonex_auth_token');
      
      if (ENV_CONFIG.isCloneXDomain) {
        cookieService.clearAuthSession();
      }
    }
  }

  /**
   * Check if token is expired (client-side check)
   */
  isTokenExpired(token?: string): boolean {
    try {
      const authToken = token || this.getToken();
      if (!authToken) return true;

      const payload = JSON.parse(atob(authToken.split('.')[1]));
      return Date.now() / 1000 > payload.exp;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem('clonex_auth_token');
  }

  /**
   * Decode JWT token payload
   */
  decodeToken(token?: string): any {
    try {
      const authToken = token || this.getToken();
      if (!authToken) return null;

      return JSON.parse(atob(authToken.split('.')[1]));
    } catch (error) {
      return null;
    }
  }

  /**
   * Generic request wrapper with retry logic and error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        credentials: 'include',
        headers: {
          ...API_HEADERS,
          'Origin': window.location.origin,
          ...options.headers
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'API_ERROR',
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status
        }));

        const error = new Error(errorData.message || 'Request failed');
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      return await response.json();

    } catch (error: any) {
      clearTimeout(timeoutId);

      // Retry logic for network errors
      if (error.name === 'AbortError' || error.message?.includes('fetch')) {
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          await new Promise(resolve => setTimeout(resolve, ENV_CONFIG.retryDelay * this.retryCount));
          return this.makeRequest<T>(endpoint, options);
        }
      }

      this.retryCount = 0; // Reset retry count
      throw error;
    }
  }
}

// Export singleton instance
export const productionAuthService = new ProductionAuthService();