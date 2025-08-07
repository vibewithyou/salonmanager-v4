import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'border-primary-600 border-t-transparent',
    secondary: 'border-secondary-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    success: 'border-green-600 border-t-transparent',
    danger: 'border-red-600 border-t-transparent',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          ${sizeClasses[size]} 
          ${colorClasses[color]}
          border-2 rounded-full animate-spin
        `}
      />
    </div>
  );
};

export default LoadingSpinner;