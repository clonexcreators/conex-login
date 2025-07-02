import React from 'react';
import { clsx } from 'clsx';

interface StatusBadgeProps {
  status: 'active' | 'loading' | 'error' | 'success' | 'verified' | 'processing';
  text: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  text,
  size = 'md',
  pulse = false,
}) => {
  const statusClasses = {
    active: "bg-cyan-500 text-white border-2 border-cyan-600 shadow-sm shadow-cyan-500/50",
    loading: "bg-yellow-400 text-black border-2 border-yellow-500 shadow-sm shadow-yellow-400/50",
    error: "bg-red-500 text-white border-2 border-red-600 shadow-sm shadow-red-500/50",
    success: "bg-green-500 text-white border-2 border-green-600 shadow-sm shadow-green-500/50",
    verified: "bg-purple-500 text-white border-2 border-purple-600 shadow-sm shadow-purple-500/50",
    processing: "bg-orange-400 text-black border-2 border-orange-500 shadow-sm shadow-orange-400/50",
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };
  
  return (
    <div
      className={clsx(
        "inline-block font-bold uppercase tracking-wide rounded-xl",
        statusClasses[status],
        sizeClasses[size],
        pulse && "animate-pulse"
      )}
    >
      {text}
    </div>
  );
};