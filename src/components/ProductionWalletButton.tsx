/**
 * Production Wallet Button Component
 */

import React from 'react';
import { Wallet, Shield, LogOut, Zap, Activity, Crown, Star } from 'lucide-react';
import { useProductionAuth } from '../hooks/useProductionAuth';
import { ACCESS_LEVEL_CONFIG } from '../constants/accessLevels';
import { ENV_CONFIG } from '../config/environment';

export const ProductionWalletButton: React.FC = () => {
  const {
    user,
    isConnected,
    isAuthenticated,
    isConnecting,
    isSigningChallenge,
    isLoading,
    error,
    challenge,
    connectWallet,
    generateChallenge,
    signChallenge,
    logout,
    clearError
  } = useProductionAuth();

  // Show authenticated state
  if (isAuthenticated && user) {
    const accessConfig = ACCESS_LEVEL_CONFIG[user.accessLevel];
    
    return (
      <div className="flex items-center gap-4">
        {/* User Profile */}
        <div className="lab-profile-badge flex items-center gap-3 hover:scale-105 transition-transform duration-150">
          <div className="w-3 h-3 bg-[#6EFFC7] rounded-full animate-pulse"></div>
          <div>
            <div className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wide">
              {accessConfig.title}
            </div>
            <div className="text-sm font-bold text-black">
              {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
            </div>
          </div>
          <div className={`w-8 h-8 ${accessConfig.color} rounded-[8px] flex items-center justify-center`}>
            {user.accessLevel === 'COSMIC_CHAMPION' && <Crown className="w-4 h-4 text-white" strokeWidth={2.5} />}
            {user.accessLevel === 'CLONE_VANGUARD' && <Star className="w-4 h-4 text-white" strokeWidth={2.5} />}
            {user.accessLevel !== 'COSMIC_CHAMPION' && user.accessLevel !== 'CLONE_VANGUARD' && (
              <Shield className="w-4 h-4 text-white" strokeWidth={2.5} />
            )}
          </div>
        </div>

        {/* Collection Summary */}
        <div className="hidden md:flex items-center gap-2">
          {user.collections.clonex > 0 && (
            <div className="lab-badge">
              {user.collections.clonex} CloneX
            </div>
          )}
          {user.collections.animus > 0 && (
            <div className="lab-badge-accent">
              {user.collections.animus} Animus
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="lab-button-outline px-4 py-3 hover:bg-[#FF3B3B] hover:text-white hover:border-[#FF3B3B] transition-colors duration-150"
          title="Logout"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  // Show connected but not authenticated state
  if (isConnected) {
    return (
      <div className="flex items-center gap-4">
        <div className="lab-surface flex items-center gap-3 px-4 py-3">
          <div className="w-3 h-3 bg-[#00C2FF] rounded-full animate-pulse"></div>
          <div>
            <div className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wide">
              Wallet Connected
            </div>
            <div className="text-sm font-bold text-black">
              Ready to Authenticate
            </div>
          </div>
          <Wallet className="w-4 h-4 text-[#00C2FF]" strokeWidth={2.5} />
        </div>

        {challenge ? (
          <button
            onClick={signChallenge}
            disabled={isSigningChallenge}
            className="dna-scanner disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSigningChallenge ? (
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                <span>SIGNING CHALLENGE...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" strokeWidth={2.5} />
                <span>SIGN CHALLENGE</span>
              </div>
            )}
          </button>
        ) : (
          <button
            onClick={generateChallenge}
            disabled={isLoading}
            className="lab-button-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" strokeWidth={2.5} />
                <span>LOADING...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" strokeWidth={2.5} />
                <span>AUTHENTICATE</span>
              </div>
            )}
          </button>
        )}

        <button
          onClick={logout}
          className="lab-button-outline px-4 py-3 text-[#4A4A4A] hover:bg-[#4A4A4A] hover:text-white transition-colors duration-150"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  // Show connect state - PROMINENT WALLET CONNECTION
  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="lab-badge-danger max-w-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs">{error}</span>
            <button
              onClick={clearError}
              className="text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Connect Button - Large and Prominent */}
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full max-w-md bg-gradient-to-r from-[#FF5AF7] via-[#00C2FF] to-[#6EFFC7] text-black font-black py-6 px-12 rounded-2xl text-xl uppercase tracking-wider border-4 border-[#1C1C1C] shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:transform-none relative overflow-hidden"
      >
        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full animate-pulse"></div>
        
        <div className="relative z-10 flex items-center justify-center gap-4">
          {isConnecting ? (
            <>
              <Activity className="w-6 h-6 animate-pulse" strokeWidth={2.5} />
              <span>CONNECTING WALLET...</span>
            </>
          ) : (
            <>
              <Wallet className="w-6 h-6" strokeWidth={2.5} />
              <span>TAP IN</span>
            </>
          )}
        </div>
      </button>

      {/* Subtext */}
      <p className="text-sm font-bold text-[#4A4A4A] text-center max-w-md">
        Connect your wallet to decode your digital DNA and access the CloneX ecosystem
      </p>
    </div>
  );
};