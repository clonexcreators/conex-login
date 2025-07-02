import { 
  API_CONFIG, 
  API_URL,
  NonceResponse, 
  AuthResponse, 
  SessionStatusResponse, 
  NFTVerificationResponse,
  APIError 
} from '../config/api';

class AuthService {
  private getHeaders(includeAuth = false): Record<string, string> {
    const headers: Record<string, string> = {
      ...API_CONFIG.headers,
      'Origin': window.location.origin
    };
    
    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: 'Unknown error', 
        message: response.statusText 
      }));
      
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  async generateNonce(walletAddress: string): Promise<NonceResponse> {
    const response = await fetch(`${API_URL}/api/auth/wallet/nonce`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ walletAddress })
    });
    
    return this.handleResponse<NonceResponse>(response);
  }

  async verifySignature(
    walletAddress: string, 
    signature: string, 
    nonce: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/wallet/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ walletAddress, signature, nonce })
    });
    
    return this.handleResponse<AuthResponse>(response);
  }

  async validateSession(): Promise<SessionStatusResponse> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const response = await fetch(`${API_URL}/api/auth/status`, {
      headers: this.getHeaders(true),
      credentials: 'include'
    });
    
    return this.handleResponse<SessionStatusResponse>(response);
  }

  async verifyNFTs(walletAddress: string): Promise<NFTVerificationResponse> {
    const response = await fetch(`${API_URL}/api/nft/verify/${walletAddress}`, {
      headers: this.getHeaders(true),
      credentials: 'include'
    });
    
    return this.handleResponse<NFTVerificationResponse>(response);
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: this.getHeaders(true),
      credentials: 'include'
    });
    
    return this.handleResponse<AuthResponse>(response);
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem('clonex_auth_token');
  }

  setToken(token: string): void {
    localStorage.setItem('clonex_auth_token', token);
    console.log('🔑 Auth token stored');
  }

  clearToken(): void {
    localStorage.removeItem('clonex_auth_token');
    console.log('🗑️ Auth token cleared');
  }

  // Utility methods
  isTokenExpired(token?: string): boolean {
    const authToken = token || this.getToken();
    if (!authToken) return true;

    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.warn('Invalid token format:', error);
      return true;
    }
  }

  async healthCheck(): Promise<any> {
    const response = await fetch(`${API_URL}/api/health`, {
      headers: this.getHeaders(),
      credentials: 'include'
    });
    
    return this.handleResponse(response);
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export class for testing
export { AuthService };