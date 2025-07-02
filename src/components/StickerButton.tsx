import React from 'react';

interface StickerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const StickerButton: React.FC<StickerButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-white hover:from-pink-600 hover:to-purple-700 shadow-pink-500/25';
      case 'secondary':
        return 'bg-gradient-to-r from-teal-400 to-cyan-500 text-black border-black hover:from-teal-500 hover:to-cyan-600 shadow-teal-500/25';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-600 text-white border-white hover:from-red-600 hover:to-pink-700 shadow-red-500/25';
      case 'ghost':
        return 'bg-white text-gray-800 border-gray-800 hover:bg-gray-50 shadow-gray-500/25';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-6 py-3 text-base';
      case 'lg':
        return 'px-8 py-4 text-lg';
      case 'xl':
        return 'px-10 py-5 text-xl';
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
      <span>LOADING...</span>
    </div>
  );

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        font-black uppercase tracking-wider rounded-2xl border-4
        transform transition-all duration-200
        hover:scale-105 active:scale-95
        shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        focus:outline-none focus:ring-4 focus:ring-purple-500/50
        ${className}
      `}
    >
      {loading ? <LoadingSpinner /> : children}
    </button>
  );
};