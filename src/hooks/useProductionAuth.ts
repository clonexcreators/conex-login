/**
 * Production Authentication Hook for CloneX Universal Login
 */

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage, useConnect, useDisconnect } from 'wagmi';
import { productionAuthService } from '../services/productionAuthService';
import { cookieService } from '../services/cookieService';
import { ENV_CONFIG } from '../config/environment';
import { AccessLevel, calculateAccessLevel, hasSubdomainAccess } from '../constants/accessLevels';
import { handleAPIError, logError, withRetry } from '../utils/errorHandler';

export interface ProductionAuthUser {
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
}

export interface ProductionAuthState {
  user: ProductionAuthUser | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSigningChallenge: boolean;
  error: string | null;
  challenge: {
    message: string;
    nonce: string;
    timestamp: number;
  } | null;
}

export const useProductionAuth = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const [authState, setAuthState] = useState<ProductionAuthState>({
    user: null,
    isConnected: false,
    isAuthenticated: false,
    isLoading: false,
    isSigningChallenge: false,
    error: null,
    challenge: null
  });

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      if (isConnected && address) {
        setAuthState(prev => ({ ...prev, isConnected: true, isLoading: true }));

        try {
          // Check for existing valid session
          const sessionResult = await productionAuthService.validateSession();
          
          if (sessionResult.valid && sessionResult.user) {
            // Valid session found - restore user state
            setAuthState(prev => ({
              ...prev,
              isAuthenticated: true,
              user: {
                walletAddress: sessionResult.user!.walletAddress,
                accessLevel: sessionResult.user!.accessLevel,
                collections: sessionResult.user!.collections,
                subdomainAccess: sessionResult.user!.subdomainAccess,
                nfts: [],
                lastVerified: new Date().toISOString(),
                verificationMethod: 'alchemy',
                cached: true
              },
              isLoading: false
            }));

            // Load full NFT data in background
            loadNFTData(address);
            
          } else {
            // No valid session - need to authenticate
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
          
        } catch (error: any) {
          console.warn('Session initialization failed:', error);
          setAuthState(prev => ({ 
            ...prev, 
            isLoading: false,
            error: 'Session initialization failed'
          }));
        }
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          isConnected: false,
          isAuthenticated: false,
          user: null
        }));
      }
    };

    initializeAuth();
  }, [isConnected, address]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      const metamaskConnector = connectors.find(c => c.name === 'MetaMask');
      const connector = metamaskConnector || connectors[0];
      
      if (connector) {
        connect({ connector });
      }
    } catch (error: any) {
      const apiError = handleAPIError(error);
      setAuthState(prev => ({ ...prev, error: apiError.message }));
      logError(apiError, 'wallet_connection');
    }
  }, [connect, connectors]);

  // Generate authentication challenge
  const generateChallenge = useCallback(async () => {
    if (!address) return;

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const challenge = await withRetry(() => 
        productionAuthService.generateNonce(address)
      );

      setAuthState(prev => ({
        ...prev,
        challenge,
        isLoading: false
      }));

    } catch (error: any) {
      const apiError = handleAPIError(error);
      setAuthState(prev => ({ 
        ...prev, 
        error: apiError.message,
        isLoading: false
      }));
      logError(apiError, 'challenge_generation');
    }
  }, [address]);

  // Sign challenge and authenticate
  const signChallenge = useCallback(async () => {
    if (!authState.challenge || !address) return;

    setAuthState(prev => ({ ...prev, isSigningChallenge: true, error: null }));

    try {
      // Sign the challenge message
      const signature = await signMessageAsync({
        message: authState.challenge.message
      });

      // Verify signature with backend
      const authResult = await withRetry(() =>
        productionAuthService.verifySignature(
          address,
          signature,
          authState.challenge!.message,
          authState.challenge!.nonce
        )
      );

      if (authResult.success) {
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: {
            walletAddress: authResult.user.walletAddress,
            accessLevel: authResult.user.accessLevel,
            collections: authResult.user.collections,
            subdomainAccess: authResult.user.subdomainAccess,
            nfts: authResult.user.nfts,
            lastVerified: authResult.user.lastVerified,
            verificationMethod: authResult.user.verificationMethod,
            cached: authResult.user.cached
          },
          isSigningChallenge: false,
          challenge: null
        }));
      } else {
        throw new Error('Authentication failed');
      }

    } catch (error: any) {
      const apiError = handleAPIError(error);
      setAuthState(prev => ({
        ...prev,
        error: apiError.message,
        isSigningChallenge: false
      }));
      logError(apiError, 'authentication');
    }
  }, [authState.challenge, address, signMessageAsync]);

  // Load NFT data
  const loadNFTData = useCallback(async (walletAddress: string) => {
    try {
      const nftResult = await withRetry(() =>
        productionAuthService.verifyNFTs(walletAddress)
      );

      if (nftResult.success) {
        setAuthState(prev => ({
          ...prev,
          user: prev.user ? {
            ...prev.user,
            collections: nftResult.collections,
            nfts: nftResult.nfts,
            lastVerified: nftResult.lastVerified,
            verificationMethod: nftResult.verificationMethod,
            cached: nftResult.cached,
            accessLevel: calculateAccessLevel(nftResult.collections)
          } : null
        }));
      }

    } catch (error: any) {
      console.warn('NFT verification failed:', error);
      // Don't set error state for NFT loading failures
    }
  }, []);

  // Refresh NFT data
  const refreshNFTData = useCallback(async () => {
    if (!authState.user?.walletAddress) return;

    setAuthState(prev => ({ ...prev, isLoading: true }));
    await loadNFTData(authState.user.walletAddress);
    setAuthState(prev => ({ ...prev, isLoading: false }));
  }, [authState.user?.walletAddress, loadNFTData]);

  // Check subdomain access
  const checkSubdomainAccess = useCallback((subdomain: string): boolean => {
    if (!authState.user?.accessLevel) return false;
    return hasSubdomainAccess(authState.user.accessLevel, subdomain);
  }, [authState.user?.accessLevel]);

  // Handle cross-domain navigation
  const navigateToSubdomain = useCallback(async (targetSubdomain: string) => {
    if (!authState.user) {
      return {
        allowed: false,
        reason: 'Not authenticated'
      };
    }

    try {
      const accessResult = await productionAuthService.validateSubdomainAccess(targetSubdomain);
      
      if (accessResult.allowed) {
        // Redirect with session token
        const token = productionAuthService.getToken();
        window.location.href = `https://${targetSubdomain}.clonex.wtf?token=${encodeURIComponent(token || '')}`;
        return { allowed: true };
      } else {
        return {
          allowed: false,
          reason: 'Insufficient access level',
          currentLevel: accessResult.accessLevel,
          requiredLevel: accessResult.requiredLevel,
          upgradeOptions: accessResult.upgradeOptions
        };
      }

    } catch (error: any) {
      const apiError = handleAPIError(error);
      logError(apiError, 'subdomain_navigation');
      return {
        allowed: false,
        reason: apiError.message
      };
    }
  }, [authState.user]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await productionAuthService.logout();
      disconnect();
      
      setAuthState({
        user: null,
        isConnected: false,
        isAuthenticated: false,
        isLoading: false,
        isSigningChallenge: false,
        error: null,
        challenge: null
      });

    } catch (error: any) {
      console.warn('Logout error:', error);
      // Force logout on error
      disconnect();
      setAuthState({
        user: null,
        isConnected: false,
        isAuthenticated: false,
        isLoading: false,
        isSigningChallenge: false,
        error: null,
        challenge: null
      });
    }
  }, [disconnect]);

  // Clear error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // State
    user: authState.user,
    isConnected: authState.isConnected,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    isConnecting,
    isSigningChallenge: authState.isSigningChallenge,
    error: authState.error,
    challenge: authState.challenge,

    // Actions
    connectWallet,
    generateChallenge,
    signChallenge,
    refreshNFTData,
    checkSubdomainAccess,
    navigateToSubdomain,
    logout,
    clearError,

    // Utilities
    hasAccess: (subdomain: string) => checkSubdomainAccess(subdomain)
  };
};