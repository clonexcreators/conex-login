import { ENV_CONFIG } from '../config/environment';

export interface CookieOptions {
  domain?: string;
  path?: string;
  expires?: Date | number; // Date object or days from now
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  httpOnly?: boolean; // Note: Cannot be set from client-side JS
}

class CrossDomainCookieService {
  private readonly defaultOptions: CookieOptions = {
    domain: ENV_CONFIG.cloneXDomain || undefined,
    path: '/',
    secure: ENV_CONFIG.cookieSecure,
    sameSite: ENV_CONFIG.cookieSameSite
  };

  /**
   * Set a cookie that works across *.clonex.wtf subdomains
   */
  setCookie(name: string, value: string, options: CookieOptions = {}): boolean {
    try {
      const finalOptions = { ...this.defaultOptions, ...options };
      
      let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
      
      // Add domain for cross-subdomain access
      if (finalOptions.domain && ENV_CONFIG.isCloneXDomain) {
        cookieString += `; Domain=${finalOptions.domain}`;
      }
      
      // Add path
      if (finalOptions.path) {
        cookieString += `; Path=${finalOptions.path}`;
      }
      
      // Add expiration
      if (finalOptions.expires) {
        const expiresDate = typeof finalOptions.expires === 'number' 
          ? new Date(Date.now() + finalOptions.expires * 24 * 60 * 60 * 1000)
          : finalOptions.expires;
        cookieString += `; Expires=${expiresDate.toUTCString()}`;
      }
      
      // Add security flags
      if (finalOptions.secure) {
        cookieString += '; Secure';
      }
      
      if (finalOptions.sameSite) {
        cookieString += `; SameSite=${finalOptions.sameSite}`;
      }
      
      // Set the cookie
      document.cookie = cookieString;
      
      if (ENV_CONFIG.showCrossDomainDebug) {
        console.log(`🍪 Set cross-domain cookie: ${name} for domain ${finalOptions.domain}`);
      }
      
      return true;
      
    } catch (error) {
      console.error('Failed to set cookie:', error);
      return false;
    }
  }

  /**
   * Get a cookie value
   */
  getCookie(name: string): string | null {
    try {
      const nameEQ = `${encodeURIComponent(name)}=`;
      const cookies = document.cookie.split(';');
      
      for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.indexOf(nameEQ) === 0) {
          const value = cookie.substring(nameEQ.length);
          return decodeURIComponent(value);
        }
      }
      
      return null;
      
    } catch (error) {
      console.error('Failed to get cookie:', error);
      return null;
    }
  }

  /**
   * Delete a cookie across all subdomains
   */
  deleteCookie(name: string): boolean {
    try {
      // Delete for current domain
      this.setCookie(name, '', { expires: new Date(0) });
      
      // Delete for root domain if on CloneX domain
      if (ENV_CONFIG.isCloneXDomain && ENV_CONFIG.cloneXDomain) {
        this.setCookie(name, '', { 
          expires: new Date(0),
          domain: ENV_CONFIG.cloneXDomain
        });
      }
      
      // Delete without domain (for localhost/dev)
      document.cookie = `${encodeURIComponent(name)}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      
      if (ENV_CONFIG.showCrossDomainDebug) {
        console.log(`🗑️ Deleted cross-domain cookie: ${name}`);
      }
      
      return true;
      
    } catch (error) {
      console.error('Failed to delete cookie:', error);
      return false;
    }
  }

  /**
   * Set authentication session across subdomains
   */
  setAuthSession(token: string, expiresAt: number): boolean {
    const expires = new Date(expiresAt);
    
    // Set access token cookie
    const tokenSet = this.setCookie(ENV_CONFIG.accessTokenCookieName, token, {
      expires,
      secure: ENV_CONFIG.cookieSecure,
      sameSite: 'Lax' // Allow cross-subdomain requests
    });
    
    // Set session info cookie
    const sessionInfo = {
      isAuthenticated: true,
      expiresAt,
      domain: ENV_CONFIG.currentSubdomain,
      setAt: Date.now()
    };
    
    const sessionSet = this.setCookie(ENV_CONFIG.sessionCookieName, JSON.stringify(sessionInfo), {
      expires,
      secure: ENV_CONFIG.cookieSecure,
      sameSite: 'Lax'
    });
    
    return tokenSet && sessionSet;
  }

  /**
   * Get authentication session
   */
  getAuthSession(): { token: string | null; sessionInfo: any } {
    const token = this.getCookie(ENV_CONFIG.accessTokenCookieName);
    const sessionInfoStr = this.getCookie(ENV_CONFIG.sessionCookieName);
    
    let sessionInfo = null;
    if (sessionInfoStr) {
      try {
        sessionInfo = JSON.parse(sessionInfoStr);
      } catch (error) {
        console.warn('Failed to parse session info cookie:', error);
      }
    }
    
    return { token, sessionInfo };
  }

  /**
   * Clear authentication session across all subdomains
   */
  clearAuthSession(): boolean {
    const tokenCleared = this.deleteCookie(ENV_CONFIG.accessTokenCookieName);
    const sessionCleared = this.deleteCookie(ENV_CONFIG.sessionCookieName);
    
    if (ENV_CONFIG.showCrossDomainDebug) {
      console.log('🧹 Cleared cross-domain auth session');
    }
    
    return tokenCleared && sessionCleared;
  }

  /**
   * Check if session is valid across domains
   */
  isSessionValid(): boolean {
    const { token, sessionInfo } = this.getAuthSession();
    
    if (!token || !sessionInfo) {
      return false;
    }
    
    // Check expiration
    if (Date.now() > sessionInfo.expiresAt) {
      if (ENV_CONFIG.showCrossDomainDebug) {
        console.log('🕐 Cross-domain session expired');
      }
      return false;
    }
    
    return true;
  }

  /**
   * Sync localStorage with cookies for compatibility
   */
  syncWithLocalStorage(): void {
    const { token } = this.getAuthSession();
    
    if (token) {
      // Sync cookie to localStorage
      localStorage.setItem('clonex_auth_token', token);
      if (ENV_CONFIG.showCrossDomainDebug) {
        console.log('🔄 Synced cookie to localStorage');
      }
    } else {
      // Clear localStorage if no cookie
      const localToken = localStorage.getItem('clonex_auth_token');
      if (localToken) {
        localStorage.removeItem('clonex_auth_token');
        if (ENV_CONFIG.showCrossDomainDebug) {
          console.log('🧹 Cleared localStorage (no cookie found)');
        }
      }
    }
  }

  /**
   * Get current domain info for debugging
   */
  getDomainInfo(): {
    currentDomain: string;
    cloneXDomain: string | null;
    isCloneXDomain: boolean;
    currentSubdomain: string | null;
  } {
    return {
      currentDomain: window.location.hostname,
      cloneXDomain: ENV_CONFIG.cloneXDomain,
      isCloneXDomain: ENV_CONFIG.isCloneXDomain,
      currentSubdomain: ENV_CONFIG.currentSubdomain
    };
  }
}

// Export singleton instance
export const cookieService = new CrossDomainCookieService();