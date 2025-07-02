import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { useAuthStore, isSessionValid } from '../stores/authStore';
import { useEffect } from 'react';
import { PUNK_MESSAGES } from '../constants/punkMessages';
import { AuthError } from '../types';
import { useNFTVerification } from './useNFTVerification';
import { authService } from '../services/authService';
import { ENV_CONFIG } from '../config/environment';

export const useWalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  
  const { 
    setConnected, 
    setLoading, 
    setChallenge,
    setSigningChallenge,
    setAuthenticated,
    setAuthError,
    logout,
    challenge,
    isAuthenticated,
    authToken
  } = useAuthStore();
  
  const { verifyWithFallback } = useNFTVerification();

  // Connect wallet
  const connectWallet = async () => {
    try {
      const metamaskConnector = connectors.find(
        (connector) => connector.name === 'MetaMask'
      );
      
      if (metamaskConnector) {
        connect({ connector: metamaskConnector });
      } else {
        connect({ connector: connectors[0] });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setAuthError({
        type: 'NETWORK_ERROR',
        message: PUNK_MESSAGES.networkError
      });
    }
  };

  // Disconnect wallet and clear auth
  const disconnectWallet = () => {
    disconnect();
    logout();
  };

  // Generate authentication challenge from backend
  const initiateAuthentication = async () => {
    if (!isConnected || !address) return;
    
    setLoading(true);
    setAuthError(null);

    try {
      if (ENV_CONFIG.showApiDebug) {
        console.log('🔑 Requesting authentication challenge for:', address);
      }

      const authChallenge = await authService.generateNonce(address);
      setChallenge(authChallenge);

      if (ENV_CONFIG.showApiDebug) {
        console.log('✅ Challenge generated successfully');
      }

    } catch (error: any) {
      console.error('Failed to generate challenge:', error);
      setAuthError({
        type: 'NETWORK_ERROR',
        message: 'Failed to generate authentication challenge'
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign authentication challenge and verify with backend
  const signChallenge = async () => {
    if (!challenge || !address) return;

    setSigningChallenge(true);
    setAuthError(null);

    try {
      if (ENV_CONFIG.showApiDebug) {
        console.log('🖊️ Signing challenge message...');
      }

      // Sign the challenge message
      const signature = await signMessageAsync({
        message: challenge.message,
      });

      if (ENV_CONFIG.showApiDebug) {
        console.log('✅ Message signed, verifying with backend...');
      }

      // Verify signature with backend
      const verificationResult = await authService.verifySignature(
        address,
        signature,
        challenge.message,
        challenge.nonce
      );

      if (verificationResult.success) {
        // Set authenticated state with backend JWT
        setAuthenticated(true, verificationResult.token);
        
        // Store user data from JWT claims
        const tokenPayload = authService.decodeToken(verificationResult.token);
        
        if (ENV_CONFIG.showApiDebug) {
          console.log('🎯 Authentication successful, access level:', tokenPayload?.accessLevel);
        }

        // Start NFT verification immediately after authentication
        await verifyWithFallback(address);
        
      } else {
        throw new Error('Backend signature verification failed');
      }
      
    } catch (error: any) {
      console.error('Authentication failed:', error);
      
      if (error.message?.includes('rejected') || error.message?.includes('denied')) {
        setAuthError({
          type: 'WALLET_REJECTED',
          message: PUNK_MESSAGES.walletRejected
        });
      } else if (error.message?.includes('timeout')) {
        setAuthError({
          type: 'NETWORK_ERROR',
          message: 'Authentication timeout - please try again'
        });
      } else if (error.message?.includes('verification failed')) {
        setAuthError({
          type: 'SIGNATURE_FAILED',
          message: 'Backend verification failed - please try again'
        });
      } else {
        setAuthError({
          type: 'SIGNATURE_FAILED',
          message: error.message || PUNK_MESSAGES.signatureFailed
        });
      }
    } finally {
      setSigningChallenge(false);
    }
  };

  // Refresh authentication token
  const refreshAuthToken = async (): Promise<boolean> => {
    if (!authToken) return false;

    try {
      if (ENV_CONFIG.showApiDebug) {
        console.log('🔄 Refreshing authentication token...');
      }

      const refreshResult = await authService.refreshToken(authToken);
      
      if (refreshResult.success) {
        setAuthenticated(true, refreshResult.token);
        
        if (ENV_CONFIG.showApiDebug) {
          console.log('✅ Token refreshed successfully');
        }
        
        return true;
      } else {
        throw new Error('Token refresh failed');
      }

    } catch (error) {
      console.warn('❌ Token refresh failed:', error);
      setAuthError({
        type: 'SESSION_EXPIRED',
        message: PUNK_MESSAGES.sessionExpired
      });
      logout();
      return false;
    }
  };

  // Validate current session with backend
  const validateSession = async (): Promise<boolean> => {
    if (!authToken) return false;

    try {
      const statusResult = await authService.validateSession(authToken);
      
      if (statusResult.valid) {
        if (ENV_CONFIG.showApiDebug) {
          console.log('✅ Session is valid');
        }
        return true;
      } else {
        if (ENV_CONFIG.showApiDebug) {
          console.log('❌ Session is invalid');
        }
        return false;
      }

    } catch (error) {
      console.warn('❌ Session validation failed:', error);
      return false;
    }
  };

  // Handle wallet connection state
  useEffect(() => {
    if (isConnected && address) {
      setConnected(true, address);
      
      // Check if we have a valid token
      if (authToken) {
        // First check if token is expired client-side
        if (authService.isTokenExpired(authToken)) {
          if (ENV_CONFIG.showApiDebug) {
            console.log('🕐 Token expired, attempting refresh...');
          }
          refreshAuthToken();
        } else {
          // Validate session with backend
          validateSession().then(isValid => {
            if (isValid) {
              // Session is valid, verify NFTs
              verifyWithFallback(address);
            } else {
              // Session invalid, clear auth
              setAuthError({
                type: 'SESSION_EXPIRED',
                message: PUNK_MESSAGES.sessionExpired
              });
              logout();
            }
          });
        }
      }
    } else {
      setConnected(false);
      if (isAuthenticated) {
        logout();
      }
    }
  }, [isConnected, address, setConnected, authToken, isAuthenticated, logout, setAuthError, verifyWithFallback]);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!authToken || !isAuthenticated) return;

    const timeUntilExpiry = authService.getTokenExpiryTime(authToken);
    const refreshBuffer = 5 * 60 * 1000; // 5 minutes before expiry

    if (timeUntilExpiry > refreshBuffer) {
      const refreshTimeout = setTimeout(() => {
        if (ENV_CONFIG.showApiDebug) {
          console.log('⏰ Auto-refreshing token before expiry...');
        }
        refreshAuthToken();
      }, timeUntilExpiry - refreshBuffer);

      return () => clearTimeout(refreshTimeout);
    }
  }, [authToken, isAuthenticated]);

  return {
    isConnected,
    isConnecting: isPending,
    isAuthenticated,
    address,
    connectWallet,
    disconnectWallet,
    initiateAuthentication,
    signChallenge,
    refreshAuthToken,
    validateSession,
    challenge,
  };
};