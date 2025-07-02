/**
 * Production Authentication Challenge Component
 */

import React from 'react';
import { useProductionAuth } from '../hooks/useProductionAuth';
import { StickerButton } from './StickerButton';
import { StickerCard } from './StickerCard';
import { StatusBadge } from './StatusBadge';
import { Shield, Activity, Zap, AlertCircle } from 'lucide-react';

export const ProductionAuthChallenge: React.FC = () => {
  const { 
    challenge, 
    isSigningChallenge, 
    error, 
    signChallenge,
    clearError 
  } = useProductionAuth();

  if (!challenge) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <StickerCard variant="research-panel">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-[#FF5AF7] border-2 border-[#1C1C1C] rounded-[12px] mx-auto mb-6 flex items-center justify-center">
              <Shield className="w-10 h-10 text-black" strokeWidth={2.5} />
            </div>
            
            <h2 className="lab-heading-xl mb-4">
              WALLET AUTHENTICATION
            </h2>
            
            <div className="lab-surface inline-block px-6 py-3 mb-6">
              <p className="lab-heading-md text-[#FF5AF7]">
                SIGNATURE VERIFICATION REQUIRED
              </p>
            </div>
          </div>

          {/* Challenge Message Display */}
          <StickerCard variant="bordered" className="bg-[#1C1C1C] text-[#6EFFC7] font-mono text-sm text-left mb-8 p-4">
            <div className="mb-2 text-xs opacity-75">
              MESSAGE TO SIGN:
            </div>
            <pre className="whitespace-pre-wrap font-medium text-xs leading-relaxed">
              {challenge.message}
            </pre>
            <div className="mt-4 text-xs opacity-75">
              Nonce: {challenge.nonce}
            </div>
          </StickerCard>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-[#FF3B3B] border-2 border-[#1C1C1C] rounded-[12px]">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                <span className="font-bold text-white text-sm uppercase">Authentication Error</span>
              </div>
              <p className="text-white text-sm">{error}</p>
              <button
                onClick={clearError}
                className="mt-3 px-4 py-2 bg-white text-[#FF3B3B] rounded-[8px] font-bold text-xs hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-6">
            <StickerButton
              variant="primary"
              size="lg"
              onClick={signChallenge}
              disabled={isSigningChallenge}
              className="w-full md:w-auto"
              scanEffect={!isSigningChallenge}
            >
              {isSigningChallenge ? (
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 animate-pulse" strokeWidth={2.5} />
                  <span>SIGNING CHALLENGE...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5" strokeWidth={2.5} />
                  <span>SIGN CHALLENGE</span>
                </div>
              )}
            </StickerButton>

            <div className="space-y-3">
              <div className="lab-text-sm">
                THIS PROCESS REQUIRES NO GAS FEES
              </div>
              
              <div className="lab-text-sm text-[#4A4A4A]">
                Your wallet will prompt you to sign a message.<br />
                This proves ownership without any blockchain transaction.
              </div>
            </div>
          </div>

          {/* Security Info */}
          <div className="mt-8 p-4 bg-[#F5F5F5] border-2 border-[#1C1C1C] rounded-[12px]">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#4A4A4A]" strokeWidth={2.5} />
              <span className="font-bold text-[#4A4A4A] text-xs uppercase">Security Notice</span>
            </div>
            <p className="text-[#4A4A4A] text-xs leading-relaxed">
              Message signing is completely safe and free. No funds can be moved or transactions executed. 
              We only verify wallet ownership for authentication purposes.
            </p>
          </div>
        </div>
      </StickerCard>
    </div>
  );
};