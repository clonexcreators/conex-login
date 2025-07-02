import { authService } from '../services/authService';

// Development helper functions for testing API connectivity
export const testApiConnection = async () => {
  try {
    console.log('🧪 Testing API connection...');
    const health = await authService.healthCheck();
    console.log('✅ API Health Check:', health);
    return health;
  } catch (error) {
    console.error('❌ API Connection Failed:', error);
    throw error;
  }
};

export const testTokenManagement = () => {
  console.log('🧪 Testing token management...');
  
  // Test token storage
  const testToken = 'test.jwt.token';
  authService.setToken(testToken);
  
  const retrieved = authService.getToken();
  console.log('Token stored and retrieved:', retrieved === testToken ? '✅' : '❌');
  
  // Test token expiry check
  const isExpired = authService.isTokenExpired(testToken);
  console.log('Token expiry check working:', typeof isExpired === 'boolean' ? '✅' : '❌');
  
  // Clean up
  authService.clearToken();
  console.log('Token cleanup:', authService.getToken() === null ? '✅' : '❌');
};

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).cloneXTest = {
    apiConnection: testApiConnection,
    tokenManagement: testTokenManagement,
    authService
  };
}