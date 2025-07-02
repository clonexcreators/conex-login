import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  variant?: 'primary' | 'secondary' | 'white';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message = 'LOADING...',
  variant = 'primary',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6';
      case 'md':
        return 'w-8 h-8';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      default:
        return 'w-8 h-8';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'border-pink-500 border-t-transparent';
      case 'secondary':
        return 'border-teal-500 border-t-transparent';
      case 'white':
        return 'border-white border-t-transparent';
      default:
        return 'border-pink-500 border-t-transparent';
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'primary':
        return 'text-pink-600';
      case 'secondary':
        return 'text-teal-600';
      case 'white':
        return 'text-white';
      default:
        return 'text-pink-600';
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className={`
        ${getSizeClasses()} 
        ${getVariantClasses()}
        border-4 rounded-full animate-spin
      `}></div>
      
      {message && (
        <p className={`font-black uppercase tracking-wider text-sm ${getTextClasses()}`}>
          {message}
        </p>
      )}
    </div>
  );
};