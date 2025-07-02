import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { authService } from '../services/authService';
import { AuthUser, AccessLevel, NFTVerificationResponse } from '../config/api';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  nftData: NFTVerificationResponse | null;
}

interface AuthActions {
  login: () => Promise<void>;
  logout: () => void;
  refreshNFTs: () => Promise<void>;
  clearError: () => void;
  checkSessionStatus: () => Promise<boolean>;
}

export const useCloneXAuth = (): AuthState & AuthActions => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    nftData: null
  });

  const { address, isConnected, isConnecting } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Helper to update state
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error helper
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Check if user is authenticated
  const checkSessionStatus = useCallback(async (): Promise<boolean> => {
    const token = authService.getToken();
    
    if (!token || authService.isTokenExpired(token)) {
      updateState({ 
        user: null, 
        isAuthenticated: false,
        nftData: null 
      });
      return false;
    }

    try {
      const sessionResponse = await authService.validateSession();
      
      if (sessionResponse.success && sessionResponse.sessionValid) {
        updateState({ 
          user: sessionResponse.user, 
          isAuthenticated: true 
        });
        return true;
      } else {
        authService.clearToken();
        updateState({ 
          user: null, 
          isAuthenticated: false,
          nftData: null 
        });
        return false;
      }
    } catch (error) {
      console.warn('Session validation failed:', error);
      authService.clearToken();
      updateState({ 
        user: null, 
        isAuthenticated: false,
        error: 'Session validation failed',
        nftData: null 
      });
      return false;
    }
  }, [updateState]);

  // Refresh NFT data
  const refreshNFTs = useCallback(async () => {
    if (!address || !state.isAuthenticated) {
      console.warn('Cannot refresh NFTs: no address or not authenticated');
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      const nftResponse = await authService.verifyNFTs(address);
      
      if (nftResponse.success) {
        updateState({ 
          nftData: nftResponse,
          user: state.user ? { 
            ...state.user, 
            accessLevel: nftResponse.accessLevel 
          } : null,
          isLoading: false 
        });
        
        console.log('✅ NFT verification completed:', {
          accessLevel: nftResponse.accessLevel,
          collections: nftResponse.nftCollections,
          delegated: nftResponse.delegatedAccess.enabled
        });
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('❌ NFT verification failed:', errorMessage);
      updateState({ 
        error: `NFT verification failed: ${errorMessage}`,
        isLoading: false 
      });
    }
  }, [address, state.isAuthenticated, state.user, updateState]);

  // Main login function
  const login = useCallback(async () => {
    if (!address || !isConnected) {
      updateState({ error: 'Wallet not connected' });
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      console.log('🔐 Starting authentication for:', address);

      // Step 1: Generate nonce
      updateState({ isLoading: true, error: null });
      const nonceResponse = await authService.generateNonce(address);
      console.log('📝 Nonce generated:', nonceResponse.nonce);

      // Step 2: Sign challenge message
      console.log('✍️ Requesting signature for message:', nonceResponse.message);
      const signature = await signMessageAsync({ 
        message: nonceResponse.message 
      });
      console.log('✅ Message signed successfully');

      // Step 3: Verify signature and get JWT
      const authResponse = await authService.verifySignature(
        address,
        signature,
        nonceResponse.nonce
      );

      if (authResponse.success) {
        console.log('🎉 Authentication successful!');
        
        // Store token and update state
        authService.setToken(authResponse.token);
        updateState({ 
          user: authResponse.user,
          isAuthenticated: true,
          isLoading: false 
        });

        // Step 4: Verify NFTs for access level
        try {
          const nftResponse = await authService.verifyNFTs(address);
          
          if (nftResponse.success) {
            updateState({ 
              nftData: nftResponse,
              user: { 
                ...authResponse.user, 
                accessLevel: nftResponse.accessLevel 
              }
            });
            
            console.log('🔬 NFT verification completed:', {
              accessLevel: nftResponse.accessLevel,
              totalCollections: Object.keys(nftResponse.nftCollections).length,
              delegated: nftResponse.delegatedAccess.enabled
            });
          }
        } catch (nftError) {
          console.warn('⚠️ NFT verification failed (using basic access):', nftError);
          // Continue with basic authentication even if NFT verification fails
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error('❌ Authentication failed:', errorMessage);
      
      // Handle user rejection gracefully
      if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
        updateState({ 
          error: 'Signature rejected - authentication cancelled',
          isLoading: false 
        });
      } else {
        updateState({ 
          error: `Authentication failed: ${errorMessage}`,
          isLoading: false 
        });
      }
    }
  }, [address, isConnected, signMessageAsync, updateState]);

  // Logout function
  const logout = useCallback(() => {
    console.log('🚪 Logging out...');
    
    authService.clearToken();
    updateState({ 
      user: null, 
      isAuthenticated: false, 
      error: null,
      nftData: null 
    });
    
    // Optionally disconnect wallet
    disconnect();
    
    console.log('✅ Logout complete');
  }, [disconnect, updateState]);

  // Auto-validate session on app load and address change
  useEffect(() => {
    if (address && isConnected && !isConnecting) {
      console.log('🔍 Checking existing session for:', address);
      checkSessionStatus();
    } else if (!isConnected) {
      // Clear state when wallet disconnected
      updateState({ 
        user: null, 
        isAuthenticated: false,
        nftData: null 
      });
    }
  }, [address, isConnected, isConnecting, checkSessionStatus, updateState]);

  // Auto-clear errors after 10 seconds
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        clearError();
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, [state.error, clearError]);

  return {
    // State
    user: state.user,
    isLoading: state.isLoading || isConnecting,
    error: state.error,
    isAuthenticated: state.isAuthenticated && !!state.user,
    nftData: state.nftData,
    
    // Actions
    login,
    logout,
    refreshNFTs,
    clearError,
    checkSessionStatus
  };
};

// Export types for external use
export type { AuthState, AuthActions };