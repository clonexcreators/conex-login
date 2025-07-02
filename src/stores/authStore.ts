import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, AuthChallenge, AuthError } from '../types';
import { authService } from '../services/authService';
import { cookieService } from '../services/cookieService';
import { ENV_CONFIG } from '../config/environment';

interface JWTClaims {
  walletAddress: string;
  accessLevel: string;
  collections: string[];
  subdomainAccess: string[];
  iat: number;
  exp: number;
  nonce?: string;
}

interface AuthStore extends AuthState {
  // User Management
  setUser: (user: User | null) => void;
  
  // Connection Management
  setConnected: (connected: boolean, address?: string) => void;
  
  // Authentication Flow
  setChallenge: (challenge: AuthChallenge | null) => void;
  setSigningChallenge: (signing: boolean) => void;
  setAuthenticated: (authenticated: boolean, token?: string) => void;
  
  // Loading States
  setLoading: (loading: boolean) => void;
  
  // Error Handling
  setError: (error: string | null) => void;
  setAuthError: (error: AuthError | null) => void;
  
  // Session Management
  updateLastAuthTime: () => void;
  clearSession: () => void;
  
  // Cross-Domain Session Management
  syncCrossDomainSession: () => void;
  checkCrossDomainSession: () => boolean;
  clearCrossDomainSession: () => void;
  validateSubdomainAccess: (subdomain?: string) => boolean;
  
  // JWT Token Management
  getTokenClaims: () => JWTClaims | null;
  getAccessLevel: () => string | null;
  getCollections: () => string[];
  getSubdomainAccess: () => string[];
  isTokenValid: () => boolean;
  
  // Complete logout
  logout: () => void;
}

const AUTH_TOKEN_KEY = 'clonex_auth_token';
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours (fallback)

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      isConnected: false,
      isAuthenticated: false,
      walletAddress: null,
      authToken: null,
      challenge: null,
      isLoading: false,
      isSigningChallenge: false,
      error: null,
      lastAuthTime: null,

      // User Management
      setUser: (user) => set({ user }),

      // Connection Management
      setConnected: (isConnected, walletAddress) => 
        set({ isConnected, walletAddress: walletAddress || null }),

      // Authentication Flow
      setChallenge: (challenge) => set({ challenge }),
      
      setSigningChallenge: (isSigningChallenge) => set({ isSigningChallenge }),
      
      setAuthenticated: (isAuthenticated, authToken) => {
        if (isAuthenticated && authToken) {
          // Store in localStorage
          localStorage.setItem(AUTH_TOKEN_KEY, authToken);
          
          // Set cross-domain cookies for *.clonex.wtf
          if (ENV_CONFIG.isCloneXDomain) {
            const claims = authService.decodeToken(authToken);
            const expiryTime = claims?.exp ? claims.exp * 1000 : Date.now() + SESSION_TIMEOUT;
            
            cookieService.setAuthSession(authToken, expiryTime);
            
            if (ENV_CONFIG.showCrossDomainDebug) {
              console.log('🌐 Set cross-domain session for *.clonex.wtf');
            }
          }
          
          // Decode token to get expiry
          const claims = authService.decodeToken(authToken);
          const expiryTime = claims?.exp ? claims.exp * 1000 : Date.now() + SESSION_TIMEOUT;
          
          if (ENV_CONFIG.showApiDebug) {
            console.log('🔐 Token stored, expires at:', new Date(expiryTime).toLocaleString());
            console.log('🎯 Access level:', claims?.accessLevel);
            console.log('📦 Collections:', claims?.collections);
            console.log('🏠 Subdomain access:', claims?.subdomainAccess);
          }
          
          set({ 
            isAuthenticated, 
            authToken, 
            lastAuthTime: Date.now(),
            error: null,
            challenge: null 
          });
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          
          // Clear cross-domain cookies
          if (ENV_CONFIG.isCloneXDomain) {
            cookieService.clearAuthSession();
          }
          
          set({ 
            isAuthenticated: false, 
            authToken: null,
            lastAuthTime: null 
          });
        }
      },

      // Loading States
      setLoading: (isLoading) => set({ isLoading }),

      // Error Handling
      setError: (error) => set({ error }),
      
      setAuthError: (authError) => {
        if (authError) {
          set({ error: authError.message });
        } else {
          set({ error: null });
        }
      },

      // Session Management
      updateLastAuthTime: () => set({ lastAuthTime: Date.now() }),
      
      clearSession: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        
        // Clear cross-domain cookies
        if (ENV_CONFIG.isCloneXDomain) {
          cookieService.clearAuthSession();
        }
        
        set({ 
          authToken: null, 
          isAuthenticated: false, 
          lastAuthTime: null,
          challenge: null 
        });
      },

      // Cross-Domain Session Management
      syncCrossDomainSession: () => {
        if (!ENV_CONFIG.isCloneXDomain) return;
        
        const { token, sessionInfo } = cookieService.getAuthSession();
        const currentToken = get().authToken;
        
        // If we have a cookie token but no local token, sync it
        if (token && !currentToken && cookieService.isSessionValid()) {
          if (ENV_CONFIG.showCrossDomainDebug) {
            console.log('🔄 Syncing cross-domain session to local state');
          }
          
          localStorage.setItem(AUTH_TOKEN_KEY, token);
          set({
            authToken: token,
            isAuthenticated: true,
            lastAuthTime: sessionInfo?.setAt || Date.now()
          });
        }
        
        // Sync localStorage with cookies for compatibility
        cookieService.syncWithLocalStorage();
      },

      checkCrossDomainSession: (): boolean => {
        if (!ENV_CONFIG.isCloneXDomain) {
          return false;
        }
        
        return cookieService.isSessionValid();
      },

      clearCrossDomainSession: () => {
        if (ENV_CONFIG.isCloneXDomain) {
          cookieService.clearAuthSession();
          
          if (ENV_CONFIG.showCrossDomainDebug) {
            console.log('🧹 Cleared cross-domain session');
          }
        }
      },

      validateSubdomainAccess: (subdomain?: string): boolean => {
        const targetSubdomain = subdomain || ENV_CONFIG.currentSubdomain;
        if (!targetSubdomain) return true; // Allow access if subdomain can't be determined
        
        const subdomainAccess = get().getSubdomainAccess();
        
        // Allow access to 'www' and 'research' by default for authenticated users
        const defaultAccess = ['www', 'research', 'lab'];
        const allowedSubdomains = [...subdomainAccess, ...defaultAccess];
        
        const hasAccess = allowedSubdomains.includes(targetSubdomain);
        
        if (ENV_CONFIG.showCrossDomainDebug) {
          console.log(`🏠 Subdomain access check for '${targetSubdomain}':`, hasAccess);
          console.log('🗝️ Allowed subdomains:', allowedSubdomains);
        }
        
        return hasAccess;
      },

      // JWT Token Management
      getTokenClaims: (): JWTClaims | null => {
        const { authToken } = get();
        if (!authToken) return null;
        
        return authService.decodeToken(authToken);
      },

      getAccessLevel: (): string | null => {
        const claims = get().getTokenClaims();
        return claims?.accessLevel || null;
      },

      getCollections: (): string[] => {
        const claims = get().getTokenClaims();
        return claims?.collections || [];
      },

      getSubdomainAccess: (): string[] => {
        const claims = get().getTokenClaims();
        return claims?.subdomainAccess || [];
      },

      isTokenValid: (): boolean => {
        const { authToken } = get();
        if (!authToken) return false;
        
        return !authService.isTokenExpired(authToken);
      },

      // Complete logout
      logout: () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        
        // Clear cross-domain session
        if (ENV_CONFIG.isCloneXDomain) {
          cookieService.clearAuthSession();
        }
        
        if (ENV_CONFIG.showApiDebug) {
          console.log('👋 User logged out from all subdomains');
        }
        
        set({ 
          user: null,
          isConnected: false,
          isAuthenticated: false,
          walletAddress: null,
          authToken: null,
          challenge: null,
          isLoading: false,
          isSigningChallenge: false,
          error: null,
          lastAuthTime: null
        });
      },
    }),
    {
      name: 'clonex-auth-storage',
      partialize: (state) => ({
        authToken: state.authToken,
        lastAuthTime: state.lastAuthTime,
        isAuthenticated: state.isAuthenticated,
      }),
      // Rehydrate auth state on app load
      onRehydrateStorage: () => (state) => {
        if (state?.authToken) {
          // Validate token on rehydration
          const isValid = !authService.isTokenExpired(state.authToken);
          
          if (!isValid) {
            if (ENV_CONFIG.showApiDebug) {
              console.log('🕐 Stored token expired, clearing session');
            }
            localStorage.removeItem(AUTH_TOKEN_KEY);
            if (ENV_CONFIG.isCloneXDomain) {
              cookieService.clearAuthSession();
            }
            state.authToken = null;
            state.isAuthenticated = false;
            state.lastAuthTime = null;
          } else {
            if (ENV_CONFIG.showApiDebug) {
              console.log('✅ Stored token is valid');
            }
            
            // Sync with cross-domain cookies if on CloneX domain
            if (ENV_CONFIG.isCloneXDomain && state.authToken) {
              const claims = authService.decodeToken(state.authToken);
              const expiryTime = claims?.exp ? claims.exp * 1000 : Date.now() + SESSION_TIMEOUT;
              cookieService.setAuthSession(state.authToken, expiryTime);
            }
          }
        }
        
        // Always check for cross-domain session on rehydration
        if (ENV_CONFIG.isCloneXDomain) {
          const store = useAuthStore.getState();
          store.syncCrossDomainSession();
        }
      }
    }
  )
);

// Session validation helper with cross-domain support
export const isSessionValid = () => {
  const { authToken, isTokenValid, checkCrossDomainSession } = useAuthStore.getState();
  
  // Check local token first
  if (authToken && isTokenValid()) {
    return true;
  }
  
  // Check cross-domain session if on CloneX domain
  if (ENV_CONFIG.isCloneXDomain) {
    return checkCrossDomainSession();
  }
  
  return false;
};

// Get current user's access level
export const getCurrentAccessLevel = (): string | null => {
  const { getAccessLevel } = useAuthStore.getState();
  return getAccessLevel();
};

// Get current user's collections
export const getCurrentCollections = (): string[] => {
  const { getCollections } = useAuthStore.getState();
  return getCollections();
};

// Get current user's subdomain access
export const getCurrentSubdomainAccess = (): string[] => {
  const { getSubdomainAccess } = useAuthStore.getState();
  return getSubdomainAccess();
};

// Validate access to specific subdomain
export const validateSubdomainAccess = (subdomain?: string): boolean => {
  const { validateSubdomainAccess } = useAuthStore.getState();
  return validateSubdomainAccess(subdomain);
};

// Cross-domain session utilities
export const syncCrossDomainSession = (): void => {
  const { syncCrossDomainSession } = useAuthStore.getState();
  syncCrossDomainSession();
};

export const checkCrossDomainSession = (): boolean => {
  const { checkCrossDomainSession } = useAuthStore.getState();
  return checkCrossDomainSession();
};