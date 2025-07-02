import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wifi, LogOut, Zap, Shield, Activity } from 'lucide-react';
import { useWalletConnection } from '../hooks/useWalletConnection';
import { useAuthStore } from '../stores/authStore';
import { PUNK_MESSAGES } from '../constants/punkMessages';
import { ENV_CONFIG } from '../config/environment';

export const WalletButton: React.FC = () => {
  // If Web3 is disabled, don't render the wallet button to avoid wagmi hook errors
  if (ENV_CONFIG.disableWeb3) {
    return null;
  }

  const { 
    isConnected, 
    isConnecting, 
    isAuthenticated,
    connectWallet, 
    disconnectWallet,
    initiateAuthentication 
  } = useWalletConnection();
  
  const { isSigningChallenge } = useAuthStore();

  // Show authenticated state - Lab Badge Style
  if (isAuthenticated) {
    return (
      <ConnectButton.Custom>
        {({ account, openAccountModal }) => (
          <div className="flex items-center gap-4">
            <button
              onClick={openAccountModal}
              className="lab-profile-badge flex items-center gap-3 hover:scale-105 transition-transform duration-150"
            >
              <div className="w-2 h-2 bg-[#6EFFC7] rounded-full animate-pulse"></div>
              <div>
                <div className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wide">
                  AUTHENTICATED
                </div>
                <div className="text-sm font-bold text-black">
                  {account?.displayName?.split(' ')[0] || 'USER'}
                </div>
              </div>
              <Shield className="w-4 h-4 text-[#6EFFC7]" strokeWidth={2.5} />
            </button>
            
            <button
              onClick={disconnectWallet}
              className="lab-button-outline px-4 py-3 hover:bg-[#FF3B3B] hover:text-white hover:border-[#FF3B3B] transition-colors duration-150"
              title="DISCONNECT"
            >
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </ConnectButton.Custom>
    );
  }

  // Show connected but not authenticated state
  if (isConnected) {
    return (
      <ConnectButton.Custom>
        {({ account, openAccountModal }) => (
          <div className="flex items-center gap-4">
            <button
              onClick={openAccountModal}
              className="lab-surface flex items-center gap-3 px-4 py-3 hover:scale-105 transition-transform duration-150"
            >
              <div className="w-2 h-2 bg-[#00C2FF] rounded-full animate-pulse"></div>
              <div>
                <div className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wide">
                  CONNECTED
                </div>
                <div className="text-sm font-bold text-black">
                  {account?.displayName?.split(' ')[0] || 'WALLET'}
                </div>
              </div>
              <Wifi className="w-4 h-4 text-[#00C2FF]" strokeWidth={2.5} />
            </button>
            
            <button
              onClick={initiateAuthentication}
              disabled={isSigningChallenge}
              className="dna-scanner disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:transform-none"
            >
              {isSigningChallenge ? (
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                  <span>DNA SEQUENCING...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" strokeWidth={2.5} />
                  <span>SCAN DNA</span>
                </div>
              )}
            </button>
            
            <button
              onClick={disconnectWallet}
              className="lab-button-outline px-4 py-3 text-[#4A4A4A] hover:bg-[#4A4A4A] hover:text-white transition-colors duration-150"
              title="DISCONNECT"
            >
              <LogOut className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </ConnectButton.Custom>
    );
  }

  // Show connect state - DNA Scanner
  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="dna-scanner disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:transform-none"
    >
      {isConnecting ? (
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 animate-pulse" strokeWidth={2.5} />
          <span>INITIALIZING DNA SCANNER...</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5" strokeWidth={2.5} />
          <span>CONNECT DNA SCANNER</span>
        </div>
      )}
    </button>
  );
};