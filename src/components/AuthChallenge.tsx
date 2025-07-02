import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { StickerButton } from './StickerButton';
import { StickerCard } from './StickerCard';
import { StatusBadge } from './StatusBadge';
import { PUNK_MESSAGES } from '../constants/punkMessages';
import { Shield, Activity, Zap } from 'lucide-react';

interface AuthChallengeProps {
  onSignChallenge: () => void;
}

export const AuthChallenge: React.FC<AuthChallengeProps> = ({ onSignChallenge }) => {
  const { isSigningChallenge, error, challenge } = useAuthStore();

  return (
    <div className="max-w-2xl mx-auto">
      <StickerCard variant="research-panel">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-[#FF5AF7] border-2 border-[#1C1C1C] rounded-[12px] mx-auto mb-6 flex items-center justify-center">
              <Shield className="w-10 h-10 text-black" strokeWidth={2.5} />
            </div>
            
            <h2 className="lab-heading-xl mb-4">
              DNA AUTHENTICATION
            </h2>
            
            <div className="lab-surface inline-block px-6 py-3 mb-6">
              <p className="lab-heading-md text-[#FF5AF7]">
                SPECIMEN VERIFICATION REQUIRED
              </p>
            </div>
          </div>

          {challenge && (
            <StickerCard variant="bordered" className="bg-[#1C1C1C] text-[#6EFFC7] font-mono text-sm text-left mb-8 p-4">
              <pre className="whitespace-pre-wrap font-medium text-xs">
                {challenge.message}
              </pre>
            </StickerCard>
          )}

          <div className="space-y-6">
            <StickerButton
              variant="primary"
              size="lg"
              onClick={onSignChallenge}
              disabled={isSigningChallenge}
              className="w-full md:w-auto"
              scanEffect={!isSigningChallenge}
            >
              {isSigningChallenge ? (
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 animate-pulse" strokeWidth={2.5} />
                  <span>ANALYZING DNA SEQUENCE...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5" strokeWidth={2.5} />
                  <span>INITIATE DNA SCAN</span>
                </div>
              )}
            </StickerButton>

            {error && (
              <StatusBadge status="error" text={error} size="md" />
            )}

            <div className="lab-text-sm">
              THIS PROCESS REQUIRES NO GAS FEES
            </div>
          </div>
        </div>
      </StickerCard>
    </div>
  );
};