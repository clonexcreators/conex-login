import React from 'react';
import { WalletButton } from './WalletButton';
import { Activity } from 'lucide-react';
import { ENV_CONFIG } from '../config/environment';
import { useAuthStore } from '../stores/authStore';

export const Header: React.FC = () => {
  const { isAuthenticated, getCurrentAccessLevel, getCurrentSubdomainAccess } = useAuthStore();
  
  return (
    <header className="w-full px-6 py-6 border-b-2 border-[#1C1C1C] bg-[#FAFAF0]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="lab-surface-elevated p-3 flex items-center justify-center">
            <Activity className="w-6 h-6 text-[#FF5AF7]" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black text-black tracking-tight">
              CLONEX
            </h1>
            <p className="text-sm font-bold text-[#4A4A4A] tracking-wide uppercase">
              Research Facility
              {ENV_CONFIG.currentSubdomain && ENV_CONFIG.currentSubdomain !== 'www' && (
                <span className="ml-2 text-[#FF5AF7]">
                  • {ENV_CONFIG.currentSubdomain}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Cross-domain session indicator */}
          {ENV_CONFIG.isCloneXDomain && isAuthenticated && (
            <div className="hidden md:flex items-center gap-2">
              <div className="lab-surface px-3 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6EFFC7] rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-[#4A4A4A] uppercase tracking-wide">
                    Cross-Domain Session
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <WalletButton />
        </div>
      </div>
    </header>
  );
};