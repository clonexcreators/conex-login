/**
 * UE5 Integration Status Component
 * 
 * Development component to show UE5 integration status, available endpoints,
 * and testing interface for UE5 API calls.
 */

import React, { useState, useEffect } from 'react';
import { ENV_CONFIG } from '../config/environment';
import { ue5APIClient } from '../api/ue5Routes';
import { ue5AuthService } from '../api/ue5AuthService';
import { useAuthStore } from '../stores/authStore';
import { useUE5Auth } from '../hooks/useUE5Auth';
import { StickerCard } from './StickerCard';
import { StickerButton } from './StickerButton';
import { StatusBadge } from './StatusBadge';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Database, 
  Users, 
  Shield,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export const UE5Status: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [availableRoutes, setAvailableRoutes] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [showTestInterface, setShowTestInterface] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { isAuthenticated, walletAddress } = useAuthStore();
  const { 
    isUE5Authenticated, 
    ue5Token, 
    ue5User, 
    ue5AccessLevel,
    ue5NFTs,
    connectToUE5,
    getUE5Debug 
  } = useUE5Auth();

  // Check UE5 API status on component mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setApiStatus('checking');
    
    try {
      // Test basic API connectivity
      const debugResponse = await ue5APIClient.debug.getStatus();
      
      if (debugResponse.success) {
        setApiStatus('online');
        
        // Get available routes
        const routesResponse = await ue5APIClient.debug.getRoutes();
        if (routesResponse.success && routesResponse.data) {
          setAvailableRoutes(routesResponse.data.routes);
        }
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      console.error('UE5 API status check failed:', error);
      setApiStatus('offline');
    }
  };

  const runAPITests = async () => {
    setIsLoading(true);
    const results: Record<string, any> = {};

    try {
      // Test 1: Get supported contracts
      console.log('🧪 Testing UE5 Contracts API...');
      const contractsResponse = await ue5APIClient.nft.getContracts();
      results.contracts = {
        success: contractsResponse.success,
        data: contractsResponse.data,
        characterCount: contractsResponse.data?.characters.length || 0,
        itemCount: contractsResponse.data?.items.length || 0
      };

      // Test 2: Get NFTs (if wallet connected)
      if (walletAddress) {
        console.log('🧪 Testing UE5 NFT API...');
        const nftResponse = await ue5APIClient.nft.getNFTs(walletAddress, true);
        results.nfts = {
          success: nftResponse.success,
          data: nftResponse.data,
          characterCount: nftResponse.data?.characters.length || 0,
          itemCount: nftResponse.data?.items.length || 0
        };

        // Test 3: User profile
        console.log('🧪 Testing UE5 User Profile API...');
        const profileResponse = await ue5APIClient.user.getProfile(walletAddress);
        results.profile = {
          success: profileResponse.success,
          data: profileResponse.data
        };
      }

      // Test 4: Auth status (if UE5 authenticated)
      if (ue5Token) {
        console.log('🧪 Testing UE5 Auth Status API...');
        const statusResponse = await ue5APIClient.auth.status(ue5Token);
        results.authStatus = {
          success: statusResponse.success,
          data: statusResponse.data
        };
      }

      setTestResults(results);

    } catch (error) {
      console.error('API tests failed:', error);
      results.error = error;
      setTestResults(results);
    } finally {
      setIsLoading(false);
    }
  };

  const testUE5Authentication = async () => {
    if (!isAuthenticated) {
      alert('Please connect your wallet and authenticate with CloneX first');
      return;
    }

    setIsLoading(true);
    
    try {
      await connectToUE5();
      await checkApiStatus();
    } catch (error) {
      console.error('UE5 authentication test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render in production unless explicitly enabled
  if (!ENV_CONFIG.showUE5Debug && !ENV_CONFIG.enableUE5Auth) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <StickerCard variant="research-panel" className="bg-[#6EFFC7]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1C1C1C] border-2 border-[#1C1C1C] rounded-[12px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#6EFFC7]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="lab-heading-md text-black">UE5 INTEGRATION STATUS</h2>
              <p className="lab-text text-black font-bold">ProjectPhoenix-BEFE Compatibility</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <StatusBadge 
              status={apiStatus === 'online' ? 'success' : apiStatus === 'offline' ? 'error' : 'loading'}
              text={apiStatus.toUpperCase()}
              size="md"
            />
            
            <StickerButton
              variant="secondary"
              size="sm"
              onClick={checkApiStatus}
              disabled={apiStatus === 'checking'}
            >
              <RefreshCw className={`w-4 h-4 ${apiStatus === 'checking' ? 'animate-spin' : ''}`} strokeWidth={2.5} />
            </StickerButton>
          </div>
        </div>

        {/* API Endpoint Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="lab-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-[#FF5AF7]" strokeWidth={2.5} />
              <span className="lab-text-sm font-bold text-black">Authentication</span>
            </div>
            <div className="space-y-1 text-xs">
              <div>✅ POST /api/ue5/auth/login</div>
              <div>✅ POST /api/ue5/auth/register</div>
              <div>✅ GET /api/ue5/auth/status</div>
              <div>✅ POST /api/ue5/auth/refresh</div>
            </div>
          </div>

          <div className="lab-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-[#00C2FF]" strokeWidth={2.5} />
              <span className="lab-text-sm font-bold text-black">User Management</span>
            </div>
            <div className="space-y-1 text-xs">
              <div>✅ GET /api/ue5/user/profile</div>
              <div>✅ GET /api/ue5/auth/wallet</div>
              <div>✅ POST /api/ue5/auth/update-wallet</div>
            </div>
          </div>

          <div className="lab-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-[#6EFFC7]" strokeWidth={2.5} />
              <span className="lab-text-sm font-bold text-black">NFT & Contracts</span>
            </div>
            <div className="space-y-1 text-xs">
              <div>✅ GET /api/ue5/auth/contracts</div>
              <div>✅ GET /api/ue5/auth/nfts</div>
              <div>✅ POST /api/ue5/nft/verify</div>
            </div>
          </div>
        </div>

        {/* UE5 Integration Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="lab-heading-md text-black">CloneX → UE5 Integration</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="lab-text text-black">CloneX Authentication</span>
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <CheckCircle className="w-5 h-5 text-[#00D26A]" strokeWidth={2.5} />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#FF3B3B]" strokeWidth={2.5} />
                  )}
                  <StatusBadge 
                    status={isAuthenticated ? 'success' : 'error'}
                    text={isAuthenticated ? 'CONNECTED' : 'NOT CONNECTED'}
                    size="sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="lab-text text-black">UE5 Authentication</span>
                <div className="flex items-center gap-2">
                  {isUE5Authenticated ? (
                    <CheckCircle className="w-5 h-5 text-[#00D26A]" strokeWidth={2.5} />
                  ) : (
                    <XCircle className="w-5 h-5 text-[#FF3B3B]" strokeWidth={2.5} />
                  )}
                  <StatusBadge 
                    status={isUE5Authenticated ? 'success' : 'error'}
                    text={isUE5Authenticated ? 'ACTIVE' : 'INACTIVE'}
                    size="sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="lab-text text-black">Access Level</span>
                <StatusBadge 
                  status="active"
                  text={ue5AccessLevel || 'NONE'}
                  size="sm"
                />
              </div>

              {ue5NFTs && (
                <div className="flex items-center justify-between">
                  <span className="lab-text text-black">Characters Available</span>
                  <StatusBadge 
                    status="success"
                    text={`${ue5NFTs.characters.length} CHARACTERS`}
                    size="sm"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="lab-heading-md text-black">API Testing</h3>
            
            <div className="space-y-3">
              <StickerButton
                variant="primary"
                size="md"
                onClick={testUE5Authentication}
                disabled={isLoading || !isAuthenticated}
                className="w-full"
              >
                {isLoading ? (
                  <Activity className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                ) : (
                  'TEST UE5 AUTHENTICATION'
                )}
              </StickerButton>

              <StickerButton
                variant="secondary"
                size="md"
                onClick={runAPITests}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Activity className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                ) : (
                  'RUN API TESTS'
                )}
              </StickerButton>

              <StickerButton
                variant="outline"
                size="md"
                onClick={() => setShowTestInterface(!showTestInterface)}
                className="w-full"
              >
                {showTestInterface ? (
                  <EyeOff className="w-4 h-4" strokeWidth={2.5} />
                ) : (
                  <Eye className="w-4 h-4" strokeWidth={2.5} />
                )}
                {showTestInterface ? 'HIDE' : 'SHOW'} TEST INTERFACE
              </StickerButton>
            </div>
          </div>
        </div>
      </StickerCard>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <StickerCard variant="research-panel" className="bg-[#F5F5F5]">
          <h3 className="lab-heading-md mb-4">API Test Results</h3>
          
          <div className="space-y-4">
            {Object.entries(testResults).map(([test, result]) => (
              <div key={test} className="lab-surface p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-black uppercase">{test}</span>
                  <StatusBadge 
                    status={result.success ? 'success' : 'error'}
                    text={result.success ? 'PASS' : 'FAIL'}
                    size="sm"
                  />
                </div>
                <pre className="text-xs bg-[#1C1C1C] text-[#6EFFC7] p-3 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </StickerCard>
      )}

      {/* Test Interface */}
      {showTestInterface && (
        <StickerCard variant="research-panel">
          <h3 className="lab-heading-md mb-4">UE5 API Test Interface</h3>
          
          <div className="space-y-4">
            <p className="lab-text">
              Use this interface to test UE5 API endpoints directly. This simulates how UE5 would interact with the authentication system.
            </p>
            
            <div className="lab-surface p-4">
              <h4 className="font-bold text-black mb-2">Available Routes ({availableRoutes.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableRoutes.map((route, index) => (
                  <div key={index} className="text-xs font-mono bg-[#1C1C1C] text-[#6EFFC7] p-2 rounded">
                    {route}
                  </div>
                ))}
              </div>
            </div>

            {ENV_CONFIG.showUE5Debug && (
              <div className="lab-surface p-4">
                <h4 className="font-bold text-black mb-2">Debug Information</h4>
                <pre className="text-xs bg-[#1C1C1C] text-[#6EFFC7] p-3 rounded overflow-auto">
                  {JSON.stringify(getUE5Debug(), null, 2)}
                </pre>
              </div>
            )}
          </div>
        </StickerCard>
      )}

      {/* Documentation Links */}
      <StickerCard variant="research-panel" className="bg-[#00C2FF]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="lab-heading-md text-black mb-2">UE5 Integration Ready</h3>
            <p className="lab-text text-black font-bold">
              UE5 can now connect to: <code className="font-mono">auth.clonex.wtf/api/ue5</code>
            </p>
          </div>
          
          <ExternalLink className="w-8 h-8 text-black" strokeWidth={2.5} />
        </div>
      </StickerCard>
    </div>
  );
};