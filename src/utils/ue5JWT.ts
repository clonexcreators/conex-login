/**
 * UE5 JWT Utilities for ProjectPhoenix-BEFE Integration
 * 
 * Handles JWT generation, validation, and management specifically
 * for UE5 game authentication with CloneX Universal Login.
 */

import { ENV_CONFIG } from '../config/environment';
import { UE5JWTPayload, UE5AuthResponse, UE5AccessLevel } from '../types/ue5Types';
import { User } from '../types';

export interface UE5TokenClaims extends UE5JWTPayload {
  // Extended claims for UE5 game integration
  accessLevel: UE5AccessLevel;
  collections: string[];
  gamePermissions: string[];
  sessionType: 'game' | 'web' | 'api';
  platform?: string;
  gameVersion?: string;
}

export interface UE5TokenValidationResult {
  valid: boolean;
  claims?: UE5TokenClaims;
  error?: string;
  expired?: boolean;
}

class UE5JWTService {
  private readonly secret: string;
  private readonly defaultExpiry: number;
  
  constructor() {
    this.secret = ENV_CONFIG.ue5JwtSecret;
    this.defaultExpiry = ENV_CONFIG.ue5TokenExpiry;
    
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🎮 UE5 JWT Service initialized');
      console.log('⏰ Default token expiry:', this.defaultExpiry, 'seconds');
    }
  }

  /**
   * Generate UE5-compatible JWT token from CloneX user data
   */
  generateToken(
    user: User, 
    options: {
      sessionType?: 'game' | 'web' | 'api';
      platform?: string;
      gameVersion?: string;
      customExpiry?: number;
    } = {}
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const expiry = options.customExpiry || this.defaultExpiry;
    
    const claims: UE5TokenClaims = {
      // Standard UE5 JWT claims
      id: user.address,
      email: this.generateGameEmail(user.address),
      iat: now,
      exp: now + expiry,
      
      // Extended UE5 claims
      accessLevel: this.mapToUE5AccessLevel(user),
      collections: this.mapUserCollections(user),
      gamePermissions: this.generateGamePermissions(user),
      sessionType: options.sessionType || 'web',
      platform: options.platform || 'web',
      gameVersion: options.gameVersion || ENV_CONFIG.ue5GameVersion
    };

    // In production, use proper JWT library with HMAC signing
    // For now, using base64 encoding for development
    const token = this.encodeToken(claims);
    
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🎫 Generated UE5 token for:', user.address);
      console.log('🎯 Access level:', claims.accessLevel);
      console.log('📦 Collections:', claims.collections);
      console.log('⏰ Expires at:', new Date(claims.exp * 1000).toLocaleString());
    }
    
    return token;
  }

  /**
   * Validate UE5 JWT token
   */
  validateToken(token: string): UE5TokenValidationResult {
    try {
      const claims = this.decodeToken(token);
      
      if (!claims) {
        return {
          valid: false,
          error: 'Invalid token format'
        };
      }

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      if (claims.exp <= now) {
        return {
          valid: false,
          expired: true,
          error: 'Token expired'
        };
      }

      // Validate required claims
      if (!claims.id || !claims.email) {
        return {
          valid: false,
          error: 'Missing required claims'
        };
      }

      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ UE5 token validated for:', claims.id);
      }

      return {
        valid: true,
        claims
      };

    } catch (error) {
      return {
        valid: false,
        error: `Token validation failed: ${error}`
      };
    }
  }

  /**
   * Refresh UE5 JWT token
   */
  refreshToken(currentToken: string): string | null {
    const validation = this.validateToken(currentToken);
    
    if (!validation.valid || !validation.claims) {
      if (ENV_CONFIG.showUE5Debug) {
        console.warn('❌ Cannot refresh invalid token');
      }
      return null;
    }

    // Generate new token with same claims but updated timestamps
    const newClaims: UE5TokenClaims = {
      ...validation.claims,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.defaultExpiry
    };

    const newToken = this.encodeToken(newClaims);
    
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🔄 UE5 token refreshed for:', newClaims.id);
    }
    
    return newToken;
  }

  /**
   * Get token expiry time in milliseconds
   */
  getTokenExpiry(token: string): number | null {
    const claims = this.decodeToken(token);
    return claims ? claims.exp * 1000 : null;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    const claims = this.decodeToken(token);
    if (!claims) return true;
    
    return Math.floor(Date.now() / 1000) >= claims.exp;
  }

  /**
   * Extract user ID from token
   */
  getUserIdFromToken(token: string): string | null {
    const claims = this.decodeToken(token);
    return claims?.id || null;
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry(token: string): number {
    const claims = this.decodeToken(token);
    if (!claims) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, claims.exp - now);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Encode token claims (in production, use proper JWT library)
   */
  private encodeToken(claims: UE5TokenClaims): string {
    // TODO: In production, use proper JWT signing with HMAC/RSA
    // For development, using base64 with signature simulation
    const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
    const payload = btoa(JSON.stringify(claims));
    const signature = btoa(this.generateSignature(header + '.' + payload));
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Decode token claims (in production, verify signature)
   */
  private decodeToken(token: string): UE5TokenClaims | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      const [header, payload, signature] = parts;
      
      // TODO: In production, verify signature properly
      if (ENV_CONFIG.showUE5Debug) {
        const expectedSignature = btoa(this.generateSignature(header + '.' + payload));
        if (signature !== expectedSignature) {
          console.warn('⚠️ UE5 Token signature mismatch (development mode)');
        }
      }

      return JSON.parse(atob(payload));

    } catch (error) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ Failed to decode UE5 token:', error);
      }
      return null;
    }
  }

  /**
   * Generate simple signature (development only)
   */
  private generateSignature(data: string): string {
    // Simple hash for development - use proper HMAC in production
    let hash = 0;
    const secret = this.secret + data;
    
    for (let i = 0; i < secret.length; i++) {
      const char = secret.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate game email from wallet address
   */
  private generateGameEmail(walletAddress: string): string {
    return `${walletAddress.toLowerCase()}@clonex.wtf`;
  }

  /**
   * Map CloneX user to UE5 access level
   */
  private mapToUE5AccessLevel(user: User): UE5AccessLevel {
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

  /**
   * Map user's NFT collections to simple array
   */
  private mapUserCollections(user: User): string[] {
    const collections: string[] = [];
    
    if (user.cloneXTokens.length > 0) collections.push('clonex');
    if (user.animusTokens.length > 0) collections.push('animus');
    if (user.animusEggTokens.length > 0) collections.push('animus_eggs');
    if (user.cloneXVialTokens.length > 0) collections.push('clonex_vials');
    
    return collections;
  }

  /**
   * Generate game permissions based on user's NFT holdings
   */
  private generateGamePermissions(user: User): string[] {
    const permissions: string[] = ['basic_access'];
    
    if (user.cloneXTokens.length > 0) {
      permissions.push('character_clonex', 'premium_features');
    }
    
    if (user.animusTokens.length > 0) {
      permissions.push('character_animus', 'companion_features');
    }
    
    if (user.animusEggTokens.length > 0) {
      permissions.push('breeding_system', 'item_animus_eggs');
    }
    
    if (user.cloneXVialTokens.length > 0) {
      permissions.push('enhancement_system', 'item_clonex_vials');
    }
    
    // Special permissions for high-tier users
    const accessLevel = this.mapToUE5AccessLevel(user);
    if (accessLevel === 'ECOSYSTEM_NATIVE') {
      permissions.push('admin_features', 'beta_access', 'exclusive_content');
    } else if (accessLevel === 'SENIOR_RESEARCHER') {
      permissions.push('advanced_features', 'beta_access');
    }
    
    return permissions;
  }
}

// Export singleton instance
export const ue5JWT = new UE5JWTService();