import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { StatusBadge } from './StatusBadge';
import { PUNK_MESSAGES } from '../constants/punkMessages';
import { CheckCircle, XCircle, Activity, Wifi } from 'lucide-react';

export const AuthStatus: React.FC = () => {
  const { 
    isConnected, 
    isAuthenticated, 
    isLoading, 
    isSigningChallenge, 
    error,
    walletAddress 
  } = useAuthStore();

  const getStatusIcon = () => {
    if (error) return <XCircle className="w-5 h-5 text-[#FF3B3B]" strokeWidth={2.5} />;
    if (isLoading || isSigningChallenge) return <Activity className="w-5 h-5 text-[#FFB800] animate-pulse" strokeWidth={2.5} />;
    if (isAuthenticated) return <CheckCircle className="w-5 h-5 text-[#6EFFC7]" strokeWidth={2.5} />;
    if (isConnected) return <Wifi className="w-5 h-5 text-[#00C2FF]" strokeWidth={2.5} />;
    return null;
  };

  const getStatusText = () => {
    if (error) return error;
    if (isSigningChallenge) return "DNA SEQUENCING IN PROGRESS";
    if (isLoading) return "AUTHENTICATING SPECIMEN";
    if (isAuthenticated) return "LABORATORY ACCESS GRANTED";
    if (isConnected) return "DNA SCANNER CONNECTED";
    return "";
  };

  const getStatusType = () => {
    if (error) return 'error';
    if (isLoading || isSigningChallenge) return 'processing';
    if (isAuthenticated) return 'success';
    if (isConnected) return 'active';
    return 'loading';
  };

  if (!isConnected && !error) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      {walletAddress && (
        <div className="lab-surface px-4 py-2">
          <span className="text-[#00C2FF] font-bold tracking-wide">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </span>
        </div>
      )}
      
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <StatusBadge 
          status={getStatusType() as any}
          text={getStatusText()}
          size="md"
          pulse={isLoading || isSigningChallenge}
        />
      </div>
    </div>
  );
};