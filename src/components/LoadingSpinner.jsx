import React from 'react';
import PropTypes from 'prop-types';

/**
 * Loading spinner component with animated visual feedback
 * @param {Object} props - Component props
 * @param {string} props.message - Optional loading message to display
 * @param {string} props.size - Size of the spinner ('sm', 'md', 'lg')
 */
function LoadingSpinner({ message = "Loading Data...", size = "md" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16", 
    lg: "w-24 h-24"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl"
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020924]">
      <div className="relative">
        {/* Outer ring */}
        <div className={`absolute inset-0 rounded-full border-4 border-blue-900 opacity-25 ${sizeClasses[size]}`}></div>
        
        {/* Spinning ring */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-t-blue-400 border-r-blue-400 border-b-transparent border-l-transparent animate-spin`}></div>
        
        {/* Inner pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-4 h-4' : 'w-6 h-6'} bg-blue-400 rounded-full animate-pulse`}></div>
        </div>
      </div>
      <div className={`ml-4 text-blue-400 font-semibold ${textSizes[size]}`}>{message}</div>
    </div>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default LoadingSpinner; 