import React from 'react';

interface StickerCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'research-panel' | 'verification-card' | 'error-card' | 'success-card';
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const StickerCard: React.FC<StickerCardProps> = ({
  children,
  variant = 'default',
  className = '',
  onClick,
  hover = false
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'research-panel':
        return 'bg-gradient-to-br from-purple-100 to-pink-100 border-purple-500 shadow-purple-500/25';
      case 'verification-card':
        return 'bg-gradient-to-br from-teal-100 to-cyan-100 border-teal-500 shadow-teal-500/25';
      case 'error-card':
        return 'bg-gradient-to-br from-red-100 to-pink-100 border-red-500 shadow-red-500/25';
      case 'success-card':
        return 'bg-gradient-to-br from-green-100 to-teal-100 border-green-500 shadow-green-500/25';
      default:
        return 'bg-white border-gray-800 shadow-gray-500/25';
    }
  };

  const baseClasses = `
    rounded-2xl border-4 p-6 shadow-lg
    ${getVariantClasses()}
    ${hover || onClick ? 'transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl cursor-pointer' : ''}
    ${onClick ? 'active:scale-[0.98]' : ''}
    ${className}
  `;

  if (onClick) {
    return (
      <div className={baseClasses} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
};