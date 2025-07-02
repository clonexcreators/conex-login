/**
 * UE5 Authentication Hook
 * 
 * React hook for managing UE5 authentication state and integration
 * with CloneX Universal Login system.
 */

import { useState, useEffect, useCallback } from 'react';
import { ue5AuthService } from '../api/ue5AuthService';
import { ue5JWT } from '../utils/ue5JWT';
import { ue5DataFormatter } from '../services/ue5DataFormatter';
import { useAuthStore } from '../stores/authStore';
import { useWalletConnection } from './useWalletConnection';
import { 
  UE5AuthResponse, 
  UE5UserProfile, 
  UE5NFTResponse,
  UE5AccessLevel 
} from '../types/ue5Types';
import { ENV_CONFIG } from '../config/environment';

export interface UE5AuthState {
  // Authentication State
  isUE5Authenticated: boolean;
  ue5Token: string | null;
  ue5User: UE5UserProfile | null;
  ue5AccessLevel: UE5AccessLevel;
  
  // Loading States
  isUE5Loading: boolean;
  isUE5Connecting: boolean;
  isUE5TokenRefreshing: boolean;
  
  // Error Handling
  ue5Error: string | null;
  
  // Game Integration
  gamePermissions: string[];
  gameSessionActive: boolean;
  
  // NFT Data in UE5 Format
  ue5NFTs: UE5NFTResponse | null;
}

export interface UE5AuthActions {
  // Authentication Actions
  connectToUE5: () => Promise<UE5AuthResponse | null>;
  disconnectFromUE5: () => void;
  refreshUE5Token: () => Promise<boolean>;
  validateUE5Session: () => Promise<boolean>;
  
  // Game Session Management
  startGameSession: (platform?: string) => Promise<boolean>;
  endGameSession: () => void;
  
  // Data Sync
  syncNFTsWithUE5: () => Promise<UE5NFTResponse | null>;
  
  // Utilities
  clearUE5Error: () => void;
  getUE5Debug: () => any;
}

export const useUE5Auth = (): UE5AuthState & UE5AuthActions => {
  // ============================================================================
  // State Management
  // ============================================================================
  
  const [ue5State, setUE5State] = useState<UE5AuthState>({
    isUE5Authenticated: false,
    ue5Token: null,
    ue5User: null,
    ue5AccessLevel: 'NONE',
    isUE5Loading: false,
    isUE5Connecting: false,
    isUE5TokenRefreshing: false,
    ue5Error: null,
    gamePermissions: [],
    gameSessionActive: false,
    ue5NFTs: null
  });

  // ============================================================================
  // Dependencies
  // ============================================================================
  
  const { 
    isAuthenticated, 
    user, 
    walletAddress,
    authToken 
  } = useAuthStore();
  
  const { 
    isConnected,
    challenge 
  } = useWalletConnection();

  // ============================================================================
  // Core Authentication Actions
  // ============================================================================

  const connectToUE5 = useCallback(async (): Promise<UE5AuthResponse | null> => {
    if (!isConnected || !walletAddress) {
      setUE5State(prev => ({
        ...prev,
        ue5Error: 'Wallet not connected. Please connect your wallet first.'
      }));
      return null;
    }

    if (!isAuthenticated || !authToken) {
      setUE5State(prev => ({
        ...prev,
        ue5Error: 'CloneX authentication required. Please complete wallet authentication first.'
      }));
      return null;
    }

    setUE5State(prev => ({
      ...prev,
      isUE5Connecting: true,
      ue5Error: null
    }));

    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🎮 Connecting to UE5 authentication...');
      }

      // Use existing CloneX authentication to get UE5 token
      if (!challenge) {
        throw new Error('No authentication challenge available');
      }

      // Since we're already authenticated with CloneX, we can register/login directly
      const ue5Response = await ue5AuthService.ue5Register({
        walletAddress,
        platform: 'ue5',
        gameVersion: ENV_CONFIG.ue5GameVersion
      });

      // Validate the UE5 token
      const tokenValid = await ue5AuthService.ue5ValidateToken(ue5Response.token);
      if (!tokenValid) {
        throw new Error('Generated UE5 token is invalid');
      }

      // Get UE5 user profile
      const ue5UserProfile = await ue5AuthService.getUE5UserProfile(walletAddress);
      
      // Get token claims for additional data
      const tokenClaims = ue5JWT.validateToken(ue5Response.token).claims;

      // Sync NFTs to UE5 format
      const ue5NFTs = user ? ue5DataFormatter.formatNFTResponse([
        ...user.cloneXTokens.map(token => ({
          tokenId: token.tokenId,
          contractAddress: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b',
          tokenType: 'ERC721' as const,
          metadata: {
            name: token.name,
            description: '',
            image: token.image,
            attributes: token.attributes
          },
          media: [],
          verificationSource: 'CLONEX' as const,
          ownershipContext: 'DIRECT' as const
        })),
        ...user.animusTokens.map(token => ({
          tokenId: token.tokenId,
          contractAddress: '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f',
          tokenType: 'ERC721' as const,
          metadata: {
            name: token.name,
            description: '',
            image: token.image,
            attributes: token.attributes
          },
          media: [],
          verificationSource: 'CLONEX' as const,
          ownershipContext: 'DIRECT' as const
        }))
      ]) : null;

      setUE5State(prev => ({
        ...prev,
        isUE5Authenticated: true,
        ue5Token: ue5Response.token,
        ue5User: ue5UserProfile,
        ue5AccessLevel: tokenClaims?.accessLevel || 'NONE',
        gamePermissions: tokenClaims?.gamePermissions || [],
        ue5NFTs,
        isUE5Connecting: false,
        ue5Error: null
      }));

      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ UE5 authentication successful');
        console.log('🎯 Access level:', tokenClaims?.accessLevel);
        console.log('🎮 Game permissions:', tokenClaims?.gamePermissions);
      }

      return ue5Response;

    } catch (error: any) {
      const errorMessage = error.message || 'UE5 authentication failed';
      
      setUE5State(prev => ({
        ...prev,
        isUE5Connecting: false,
        ue5Error: errorMessage
      }));

      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 authentication failed:', error);
      }

      return null;
    }
  }, [isConnected, isAuthenticated, walletAddress, authToken, challenge, user]);

  const disconnectFromUE5 = useCallback(() => {
    if (ENV_CONFIG.showUE5Debug) {
      console.log('👋 Disconnecting from UE5...');
    }

    setUE5State({
      isUE5Authenticated: false,
      ue5Token: null,
      ue5User: null,
      ue5AccessLevel: 'NONE',
      isUE5Loading: false,
      isUE5Connecting: false,
      isUE5TokenRefreshing: false,
      ue5Error: null,
      gamePermissions: [],
      gameSessionActive: false,
      ue5NFTs: null
    });
  }, []);

  const refreshUE5Token = useCallback(async (): Promise<boolean> => {
    if (!ue5State.ue5Token) {
      return false;
    }

    setUE5State(prev => ({
      ...prev,
      isUE5TokenRefreshing: true,
      ue5Error: null
    }));

    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🔄 Refreshing UE5 token...');
      }

      const refreshResponse = await ue5AuthService.ue5RefreshToken(ue5State.ue5Token);
      const tokenClaims = ue5JWT.validateToken(refreshResponse.token).claims;

      setUE5State(prev => ({
        ...prev,
        ue5Token: refreshResponse.token,
        ue5AccessLevel: tokenClaims?.accessLevel || prev.ue5AccessLevel,
        gamePermissions: tokenClaims?.gamePermissions || prev.gamePermissions,
        isUE5TokenRefreshing: false
      }));

      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ UE5 token refreshed successfully');
      }

      return true;

    } catch (error: any) {
      setUE5State(prev => ({
        ...prev,
        isUE5TokenRefreshing: false,
        ue5Error: `Token refresh failed: ${error.message}`
      }));

      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 token refresh failed:', error);
      }

      return false;
    }
  }, [ue5State.ue5Token]);

  const validateUE5Session = useCallback(async (): Promise<boolean> => {
    if (!ue5State.ue5Token) {
      return false;
    }

    try {
      const isValid = await ue5AuthService.ue5ValidateToken(ue5State.ue5Token);
      
      if (!isValid) {
        setUE5State(prev => ({
          ...prev,
          ue5Error: 'UE5 session expired',
          isUE5Authenticated: false
        }));
      }

      return isValid;

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 session validation failed:', error);
      }
      return false;
    }
  }, [ue5State.ue5Token]);

  // ============================================================================
  // Game Session Management
  // ============================================================================

  const startGameSession = useCallback(async (platform: string = 'ue5'): Promise<boolean> => {
    if (!ue5State.isUE5Authenticated || !ue5State.ue5Token) {
      setUE5State(prev => ({
        ...prev,
        ue5Error: 'UE5 authentication required to start game session'
      }));
      return false;
    }

    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🎮 Starting UE5 game session...');
      }

      // Validate token before starting session
      const tokenValid = await validateUE5Session();
      if (!tokenValid) {
        throw new Error('Invalid UE5 token');
      }

      setUE5State(prev => ({
        ...prev,
        gameSessionActive: true,
        ue5Error: null
      }));

      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ UE5 game session started');
      }

      return true;

    } catch (error: any) {
      setUE5State(prev => ({
        ...prev,
        ue5Error: `Failed to start game session: ${error.message}`
      }));

      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ UE5 game session start failed:', error);
      }

      return false;
    }
  }, [ue5State.isUE5Authenticated, ue5State.ue5Token, validateUE5Session]);

  const endGameSession = useCallback(() => {
    if (ENV_CONFIG.showUE5Debug) {
      console.log('🛑 Ending UE5 game session...');
    }

    setUE5State(prev => ({
      ...prev,
      gameSessionActive: false
    }));
  }, []);

  // ============================================================================
  // Data Synchronization
  // ============================================================================

  const syncNFTsWithUE5 = useCallback(async (): Promise<UE5NFTResponse | null> => {
    if (!user) {
      return null;
    }

    try {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('🔄 Syncing NFTs with UE5 format...');
      }

      // Convert user's NFTs to UE5 format
      const allNFTs = [
        ...user.cloneXTokens.map(token => ({
          tokenId: token.tokenId,
          contractAddress: '0x49cf6f5d44e70224e2e23fdcdd2c053f30ada28b',
          tokenType: 'ERC721' as const,
          metadata: {
            name: token.name,
            description: '',
            image: token.image,
            attributes: token.attributes
          },
          media: [],
          verificationSource: 'CLONEX' as const,
          ownershipContext: 'DIRECT' as const
        })),
        ...user.animusTokens.map(token => ({
          tokenId: token.tokenId,
          contractAddress: '0xec99492dd9ef8ca48f691acd67d2c96a0a43935f',
          tokenType: 'ERC721' as const,
          metadata: {
            name: token.name,
            description: '',
            image: token.image,
            attributes: token.attributes
          },
          media: [],
          verificationSource: 'CLONEX' as const,
          ownershipContext: 'DIRECT' as const
        })),
        ...user.animusEggTokens.map(token => ({
          tokenId: token.tokenId,
          contractAddress: '0x6c410cf0b8c113dc6a7641b431390b11d5515082',
          tokenType: 'ERC721' as const,
          metadata: {
            name: token.name,
            description: '',
            image: token.image,
            attributes: token.attributes
          },
          media: [],
          verificationSource: 'CLONEX' as const,
          ownershipContext: 'DIRECT' as const
        })),
        ...user.cloneXVialTokens.map(token => ({
          tokenId: token.tokenId,
          contractAddress: '0x348fc118bcc65a92dc033a951af153d14d945312',
          tokenType: 'ERC1155' as const,
          metadata: {
            name: token.name,
            description: '',
            image: token.image,
            attributes: token.attributes
          },
          media: [],
          verificationSource: 'CLONEX' as const,
          ownershipContext: 'DIRECT' as const
        }))
      ];

      const ue5NFTs = ue5DataFormatter.formatNFTResponse(allNFTs);

      setUE5State(prev => ({
        ...prev,
        ue5NFTs
      }));

      if (ENV_CONFIG.showUE5Debug) {
        console.log('✅ NFTs synced with UE5 format');
        console.log(`📦 Characters: ${ue5NFTs.characters.length}, Items: ${ue5NFTs.items.length}`);
      }

      return ue5NFTs;

    } catch (error: any) {
      if (ENV_CONFIG.showUE5Debug) {
        console.error('❌ NFT sync failed:', error);
      }
      return null;
    }
  }, [user]);

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const clearUE5Error = useCallback(() => {
    setUE5State(prev => ({
      ...prev,
      ue5Error: null
    }));
  }, []);

  const getUE5Debug = useCallback(() => {
    return {
      state: ue5State,
      authServiceDebug: ue5AuthService.getDebugInfo(),
      envConfig: {
        enableUE5Auth: ENV_CONFIG.enableUE5Auth,
        ue5ApiBaseUrl: ENV_CONFIG.ue5ApiBaseUrl,
        ue5GameVersion: ENV_CONFIG.ue5GameVersion,
        showUE5Debug: ENV_CONFIG.showUE5Debug
      },
      cloneXAuth: {
        isConnected,
        isAuthenticated,
        walletAddress,
        hasAuthToken: !!authToken
      }
    };
  }, [ue5State, isConnected, isAuthenticated, walletAddress, authToken]);

  // ============================================================================
  // Effects
  // ============================================================================

  // Auto-sync NFTs when user data changes
  useEffect(() => {
    if (ue5State.isUE5Authenticated && user) {
      syncNFTsWithUE5();
    }
  }, [user, ue5State.isUE5Authenticated, syncNFTsWithUE5]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!ue5State.ue5Token || !ue5State.isUE5Authenticated) {
      return;
    }

    const tokenExpiry = ue5JWT.getTokenExpiry(ue5State.ue5Token);
    if (!tokenExpiry) return;

    const refreshBuffer = 5 * 60 * 1000; // 5 minutes before expiry
    const timeUntilRefresh = tokenExpiry - Date.now() - refreshBuffer;

    if (timeUntilRefresh > 0) {
      const refreshTimeout = setTimeout(() => {
        if (ENV_CONFIG.showUE5Debug) {
          console.log('⏰ Auto-refreshing UE5 token before expiry...');
        }
        refreshUE5Token();
      }, timeUntilRefresh);

      return () => clearTimeout(refreshTimeout);
    }
  }, [ue5State.ue5Token, ue5State.isUE5Authenticated, refreshUE5Token]);

  // Disconnect UE5 when CloneX auth is lost
  useEffect(() => {
    if (!isAuthenticated && ue5State.isUE5Authenticated) {
      if (ENV_CONFIG.showUE5Debug) {
        console.log('👋 CloneX auth lost, disconnecting UE5...');
      }
      disconnectFromUE5();
    }
  }, [isAuthenticated, ue5State.isUE5Authenticated, disconnectFromUE5]);

  // ============================================================================
  // Return Hook Interface
  // ============================================================================

  return {
    ...ue5State,
    connectToUE5,
    disconnectFromUE5,
    refreshUE5Token,
    validateUE5Session,
    startGameSession,
    endGameSession,
    syncNFTsWithUE5,
    clearUE5Error,
    getUE5Debug
  };
};