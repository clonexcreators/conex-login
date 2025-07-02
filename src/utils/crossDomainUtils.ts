/**
 * Cross-domain session management utilities for CloneX Universal Login
 */

import { ENV_CONFIG } from '../config/environment';
import { cookieService } from '../services/cookieService';
import { authService } from '../services/authService';
import { useAuthStore } from '../stores/authStore';

export interface CrossDomainSessionInfo {
  isActive: boolean;
  currentSubdomain: string | null;
  accessLevel: string | null;
  allowedSubdomains: string[];
  sessionExpiry: number | null;
}

/**
 * Initialize cross-domain session on app load
 */
export const initializeCrossDomainSession = async (): Promise<CrossDomainSessionInfo> => {
  const sessionInfo: CrossDomainSessionInfo = {
    isActive: false,
    currentSubdomain: ENV_CONFIG.currentSubdomain,
    accessLevel: null,
    allowedSubdomains: [],
    sessionExpiry: null
  };

  if (!ENV_CONFIG.isCloneXDomain) {
    return sessionInfo;
  }

  try {
    const { syncCrossDomainSession, getTokenClaims, isTokenValid } = useAuthStore.getState();
    
    // Sync session from cookies
    syncCrossDomainSession();
    
    // Validate current token
    if (isTokenValid()) {
      const claims = getTokenClaims();
      
      if (claims) {
        sessionInfo.isActive = true;
        sessionInfo.accessLevel = claims.accessLevel;
        sessionInfo.allowedSubdomains = claims.subdomainAccess || [];
        sessionInfo.sessionExpiry = claims.exp * 1000;
        
        if (ENV_CONFIG.showCrossDomainDebug) {
          console.log('✅ Cross-domain session initialized successfully');
          console.log('🎯 Access level:', claims.accessLevel);
          console.log('🏠 Allowed subdomains:', claims.subdomainAccess);
        }
      }
    }
    
    return sessionInfo;
    
  } catch (error) {
    console.warn('❌ Cross-domain session initialization failed:', error);
    return sessionInfo;
  }
};

/**
 * Redirect to appropriate subdomain based on access level
 */
export const redirectToAuthorizedSubdomain = (accessLevel: string): void => {
  if (!ENV_CONFIG.isCloneXDomain) {
    return;
  }

  const subdomainMap: Record<string, string> = {
    'NONE': 'www',
    'COLLECTOR': 'www',
    'ACTIVE_RESEARCHER': 'research',
    'SENIOR_RESEARCHER': 'lab', 
    'ECOSYSTEM_NATIVE': 'gro'
  };

  const targetSubdomain = subdomainMap[accessLevel] || 'www';
  
  if (targetSubdomain !== ENV_CONFIG.currentSubdomain) {
    if (ENV_CONFIG.showCrossDomainDebug) {
      console.log(`🔄 Redirecting to authorized subdomain: ${targetSubdomain}`);
    }
    
    window.location.href = `https://${targetSubdomain}.clonex.wtf${window.location.pathname}`;
  }
};

/**
 * Check if current subdomain is accessible with current access level
 */
export const validateCurrentSubdomainAccess = (): {
  hasAccess: boolean;
  accessLevel: string | null;
  currentSubdomain: string | null;
  suggestedSubdomain?: string;
} => {
  const { validateSubdomainAccess, getCurrentAccessLevel } = useAuthStore.getState();
  
  const accessLevel = getCurrentAccessLevel();
  const currentSubdomain = ENV_CONFIG.currentSubdomain;
  
  if (!currentSubdomain || !accessLevel) {
    return {
      hasAccess: true, // Allow access if we can't determine requirements
      accessLevel,
      currentSubdomain
    };
  }
  
  const hasAccess = validateSubdomainAccess(currentSubdomain);
  
  let suggestedSubdomain: string | undefined;
  if (!hasAccess) {
    // Suggest appropriate subdomain based on access level
    const subdomainMap: Record<string, string> = {
      'NONE': 'www',
      'COLLECTOR': 'www',
      'ACTIVE_RESEARCHER': 'research',
      'SENIOR_RESEARCHER': 'lab',
      'ECOSYSTEM_NATIVE': 'gro'
    };
    suggestedSubdomain = subdomainMap[accessLevel] || 'www';
  }
  
  return {
    hasAccess,
    accessLevel,
    currentSubdomain,
    suggestedSubdomain
  };
};

/**
 * Logout from all CloneX subdomains
 */
export const logoutFromAllSubdomains = (): void => {
  const { logout } = useAuthStore.getState();
  
  // Clear auth store (this will also clear cross-domain cookies)
  logout();
  
  if (ENV_CONFIG.showCrossDomainDebug) {
    console.log('👋 Logged out from all CloneX subdomains');
  }
  
  // Optional: Redirect to main domain
  if (ENV_CONFIG.isCloneXDomain && ENV_CONFIG.currentSubdomain !== 'www') {
    setTimeout(() => {
      window.location.href = 'https://www.clonex.wtf';
    }, 1000);
  }
};

/**
 * Navigate to another subdomain while preserving authentication
 */
export const navigateToSubdomain = (targetSubdomain: string): void => {
  if (!ENV_CONFIG.isCloneXDomain) {
    console.warn('Cross-subdomain navigation only available on CloneX domain');
    return;
  }
  
  const { validateSubdomainAccess } = useAuthStore.getState();
  
  // Check if user has access to target subdomain
  const hasAccess = validateSubdomainAccess(targetSubdomain);
  
  if (!hasAccess) {
    console.warn(`❌ Access denied to subdomain: ${targetSubdomain}`);
    return;
  }
  
  if (ENV_CONFIG.showCrossDomainDebug) {
    console.log(`🌐 Navigating to subdomain: ${targetSubdomain}`);
  }
  
  // Navigate to target subdomain
  window.location.href = `https://${targetSubdomain}.clonex.wtf${window.location.pathname}`;
};

/**
 * Get all available subdomains for current user
 */
export const getAvailableSubdomains = (): string[] => {
  const { getCurrentSubdomainAccess } = useAuthStore.getState();
  return getCurrentSubdomainAccess();
};

/**
 * Debug cross-domain session status
 */
export const debugCrossDomainSession = (): void => {
  if (!ENV_CONFIG.showCrossDomainDebug) {
    return;
  }
  
  const sessionStatus = authService.getCrossDomainSessionStatus();
  const { token, sessionInfo } = cookieService.getAuthSession();
  const domainInfo = cookieService.getDomainInfo();
  const { getTokenClaims } = useAuthStore.getState();
  
  console.group('🌐 Cross-Domain Session Debug');
  console.log('📊 Session Status:', sessionStatus);
  console.log('🍪 Cookie Token:', token ? 'Present' : 'Not found');
  console.log('📋 Session Info:', sessionInfo);
  console.log('🌍 Domain Info:', domainInfo);
  console.log('🎫 Token Claims:', getTokenClaims());
  console.groupEnd();
};

/**
 * Monitor cross-domain session for changes
 */
export const setupCrossDomainSessionMonitoring = (): (() => void) => {
  if (!ENV_CONFIG.isCloneXDomain) {
    return () => {}; // No cleanup needed
  }
  
  let lastTokenState: string | null = null;
  
  const checkSessionChanges = () => {
    const { authToken } = useAuthStore.getState();
    
    if (authToken !== lastTokenState) {
      lastTokenState = authToken;
      
      if (ENV_CONFIG.showCrossDomainDebug) {
        console.log('🔄 Cross-domain session state changed');
        debugCrossDomainSession();
      }
    }
  };
  
  const intervalId = setInterval(checkSessionChanges, 5000); // Check every 5 seconds
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
};