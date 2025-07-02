/**
 * UE5 Authentication Service for ProjectPhoenix-BEFE Integration
 * 
 * Provides UE5-compatible authentication endpoints using CloneX wallet
 * signature authentication with ProjectPhoenix-BEFE response format.
 */

import { ENV_CONFIG } from '../config/environment';
import { authService } from '../services/authService';
import { ue5JWT } from '../utils/ue5JWT';
import { ue5DataFormatter } from '../services/ue5DataFormatter';
import { 
  UE5AuthResponse, 
  UE5LoginRequest, 
  UE5AuthChallenge,
  UE5UserProfile,
  UE5APIResponse 
} from '../types/ue5Types';
import { User, AuthChallenge } from '../types';

export interface SignatureData {
  walletAddress: string;
  signature: string;
  message: string;
  nonce: string;
}

export interface UE5WalletResponse {
  walletAddress: string | null;
}

export interface UE5RegisterRequest {
  walletAddress: string;
  platform?: string;
  gameVersion?: string;
}

export interface UE5UpdateWalletRequest {
  userId: string;
  newWalletAddress: string;
  signature: string;
  message: string;
  nonce: string;
}

class UE5AuthenticationService {
  private readonly mockUsers = new Map<string, User>();
  private readonly mockNonces = new Map<string, UE5AuthChallenge>();

  constructor() {
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🎮 UE5 Authentication Service initialized');
      console.log('🔧 Mock mode:', ENV_CONFIG.enableMockAuth);
    }
  }

  // ============================================================================
  // Core Authentication Methods
  // ============================================================================

  /**
   * UE5 Login - Authenticate with wallet signature
   */
  async ue5Login(signatureData: SignatureData): Promise<UE5AuthResponse> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🔑 UE5 Login attempt for:', signatureData.walletAddress);
      }

      // Use existing CloneX authentication logic
      const cloneXAuthResult = await authService.verifySignature(
        signatureData.walletAddress,
        signatureData.signature,
        signatureData.message,
        signatureData.nonce
      );

      if (!cloneXAuthResult.success) {
        throw new Error('CloneX authentication failed');
      }

      // Create user object from CloneX auth result
      const user = this.createUserFromCloneXAuth(cloneXAuthResult);
      
      // Generate UE5-compatible JWT
      const ue5Token = ue5JWT.generateToken(user, {
        sessionType: 'game',
        platform: 'ue5',
        gameVersion: ENV_CONFIG.ue5GameVersion
      });

      // Format response for UE5
      const ue5Response = ue5DataFormatter.formatAuthResponse(ue5Token, user);

      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ UE5 Login successful for:', user.address);
        console.log('🎯 Access level:', ue5JWT.validateToken(ue5Token).claims?.accessLevel);
      }

      return ue5Response;

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 Login failed:', error.message);
      }
      throw new Error(`UE5 authentication failed: ${error.message}`);
    }
  }

  /**
   * UE5 Register - Register new wallet for game access
   */
  async ue5Register(request: UE5RegisterRequest): Promise<UE5AuthResponse> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('📝 UE5 Register attempt for:', request.walletAddress);
      }

      // Generate authentication challenge for registration
      const challenge = await this.generateUE5Challenge(request.walletAddress);
      
      // For mock mode, auto-complete registration
      if (ENV_CONFIG.enableMockAuth) {
        const mockUser = this.createMockUser(request.walletAddress);
        this.mockUsers.set(request.walletAddress.toLowerCase(), mockUser);
        
        const ue5Token = ue5JWT.generateToken(mockUser, {
          sessionType: 'game',
          platform: request.platform || 'ue5',
          gameVersion: request.gameVersion || ENV_CONFIG.ue5GameVersion
        });

        const ue5Response = ue5DataFormatter.formatAuthResponse(ue5Token, mockUser);

        if (ENV_CONFIG.showUE5Debug) {
          console.log('✅ UE5 Mock registration successful for:', mockUser.address);
        }

        return ue5Response;
      }

      // In production mode, return challenge for signature
      throw new Error('Registration requires signature verification. Please use ue5Login with signed challenge.');

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 Register failed:', error.message);
      }
      throw new Error(`UE5 registration failed: ${error.message}`);
    }
  }

  /**
   * UE5 Update Wallet - Update user's wallet address
   */
  async ue5UpdateWallet(request: UE5UpdateWalletRequest): Promise<void> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🔄 UE5 Update wallet for user:', request.userId);
        console.log('🔄 New wallet:', request.newWalletAddress);
      }

      // Verify signature for wallet update
      const verification = await authService.verifySignature(
        request.newWalletAddress,
        request.signature,
        request.message,
        request.nonce
      );

      if (!verification.success) {
        throw new Error('Wallet signature verification failed');
      }

      // In mock mode, update mock user
      if (ENV_CONFIG.enableMockAuth) {
        const oldUser = this.mockUsers.get(request.userId.toLowerCase());
        if (oldUser) {
          const updatedUser = { ...oldUser, address: request.newWalletAddress };
          this.mockUsers.delete(request.userId.toLowerCase());
          this.mockUsers.set(request.newWalletAddress.toLowerCase(), updatedUser);
        }
      }

      // TODO: In production, update user's wallet in database

      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ UE5 Wallet updated successfully');
      }

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 Update wallet failed:', error.message);
      }
      throw new Error(`Wallet update failed: ${error.message}`);
    }
  }

  /**
   * UE5 Get Wallet - Get user's current wallet address
   */
  async ue5GetWallet(userId: string): Promise<UE5WalletResponse> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🔍 UE5 Get wallet for user:', userId);
      }

      // In mock mode, return mock user wallet
      if (ENV_CONFIG.enableMockAuth) {
        const mockUser = this.mockUsers.get(userId.toLowerCase());
        return {
          walletAddress: mockUser?.address || null
        };
      }

      // TODO: In production, get user's wallet from database
      return {
        walletAddress: userId // Assuming userId is wallet address for now
      };

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 Get wallet failed:', error.message);
      }
      return {
        walletAddress: null
      };
    }
  }

  /**
   * UE5 Validate Token - Validate current UE5 JWT token
   */
  async ue5ValidateToken(token: string): Promise<boolean> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🔍 UE5 Validate token');
      }

      const validation = ue5JWT.validateToken(token);
      
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🎫 Token validation result:', validation.valid);
        if (validation.error) {
          console.log('❌ Validation error:', validation.error);
        }
      }

      return validation.valid;

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 Token validation failed:', error.message);
      }
      return false;
    }
  }

  /**
   * UE5 Refresh Token - Refresh expired UE5 JWT token
   */
  async ue5RefreshToken(token: string): Promise<UE5AuthResponse> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🔄 UE5 Refresh token');
      }

      const newToken = ue5JWT.refreshToken(token);
      
      if (!newToken) {
        throw new Error('Token refresh failed - invalid or expired token');
      }

      // Get user data from refreshed token
      const claims = ue5JWT.validateToken(newToken).claims;
      if (!claims) {
        throw new Error('Failed to validate refreshed token');
      }

      const ue5Response: UE5AuthResponse = {
        token: newToken,
        user: {
          id: claims.id,
          email: claims.email,
          walletAddress: claims.id
        }
      };

      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ UE5 Token refreshed for:', claims.id);
      }

      return ue5Response;

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 Token refresh failed:', error.message);
      }
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // ============================================================================
  // Challenge Generation
  // ============================================================================

  /**
   * Generate UE5 authentication challenge
   */
  async generateUE5Challenge(walletAddress: string): Promise<UE5AuthChallenge> {
    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🎯 Generating UE5 challenge for:', walletAddress);
      }

      // Use existing CloneX challenge generation
      const cloneXChallenge = await authService.generateNonce(walletAddress);
      
      // Convert to UE5 format
      const ue5Challenge: UE5AuthChallenge = {
        message: this.formatUE5ChallengeMessage(cloneXChallenge.message, walletAddress),
        nonce: cloneXChallenge.nonce,
        timestamp: cloneXChallenge.timestamp
      };

      // Store challenge for validation
      this.mockNonces.set(walletAddress.toLowerCase(), ue5Challenge);

      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ UE5 Challenge generated');
      }

      return ue5Challenge;

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 Challenge generation failed:', error.message);
      }
      throw new Error(`Challenge generation failed: ${error.message}`);
    }
  }

  /**
   * Get stored challenge for wallet
   */
  getStoredChallenge(walletAddress: string): UE5AuthChallenge | null {
    return this.mockNonces.get(walletAddress.toLowerCase()) || null;
  }

  // ============================================================================
  // User Management Utilities
  // ============================================================================

  /**
   * Get UE5 user profile
   */
  async getUE5UserProfile(walletAddress: string): Promise<UE5UserProfile | null> {
    try {
      if (ENV_CONFIG.enableMockAuth) {
        const mockUser = this.mockUsers.get(walletAddress.toLowerCase());
        if (mockUser) {
          return ue5DataFormatter.formatUserProfile(mockUser);
        }
      }

      // TODO: In production, get user from database and format
      return null;

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ Failed to get UE5 user profile:', error.message);
      }
      return null;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Create User object from CloneX auth result
   */
  private createUserFromCloneXAuth(authResult: any): User {
    return {
      address: authResult.user.walletAddress,
      cloneXTokens: [],  // Will be populated by NFT verification
      animusTokens: [],
      animusEggTokens: [],
      cloneXVialTokens: [],
      isConnected: true
    };
  }

  /**
   * Create mock user for development
   */
  private createMockUser(walletAddress: string): User {
    return {
      address: walletAddress,
      cloneXTokens: [
        { tokenId: '1234', image: '', name: 'CloneX #1234', attributes: [] },
        { tokenId: '5678', image: '', name: 'CloneX #5678', attributes: [] }
      ],
      animusTokens: [
        { tokenId: '9999', image: '', name: 'Animus #9999', attributes: [] }
      ],
      animusEggTokens: [
        { tokenId: '777', image: '', name: 'Animus Egg #777', attributes: [] }
      ],
      cloneXVialTokens: [
        { tokenId: '111', image: '', name: 'CloneX Vial #111', attributes: [] }
      ],
      isConnected: true
    };
  }

  /**
   * Format challenge message for UE5
   */
  private formatUE5ChallengeMessage(originalMessage: string, walletAddress: string): string {
    return `UE5 ProjectPhoenix Game Authentication\n\nWallet: ${walletAddress}\nGame Version: ${ENV_CONFIG.ue5GameVersion}\nPlatform: UE5\n\n${originalMessage}\n\nBy signing this message, you authorize access to the ProjectPhoenix game with your CloneX Universal Login credentials.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  // ============================================================================
  // Debug and Testing Utilities
  // ============================================================================

  /**
   * Get debug information
   */
  getDebugInfo(): {
    enableUE5Auth: boolean;
    mockUsersCount: number;
    storedNoncesCount: number;
    jwtConfig: any;
  } {
    return {
      enableUE5Auth: ENV_CONFIG.enableUE5Auth,
      mockUsersCount: this.mockUsers.size,
      storedNoncesCount: this.mockNonces.size,
      jwtConfig: {
        tokenExpiry: ENV_CONFIG.ue5TokenExpiry,
        gameVersion: ENV_CONFIG.ue5GameVersion,
        showDebug: ENV_CONFIG.showUE5Debug
      }
    };
  }

  /**
   * Clear stored data (for testing)
   */
  clearStoredData(): void {
    this.mockUsers.clear();
    this.mockNonces.clear();
    
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🧹 UE5 Auth service data cleared');
    }
  }
}

// Export singleton instance
export const ue5AuthService = new UE5AuthenticationService();