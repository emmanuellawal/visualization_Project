import React from 'react';

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020924]">
      <div className="relative">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-900 opacity-25"></div>
        
        {/* Spinning ring */}
        <div className="w-16 h-16 rounded-full border-4 border-t-blue-400 border-r-blue-400 border-b-transparent border-l-transparent animate-spin"></div>
        
        {/* Inner pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="ml-4 text-blue-400 text-lg font-semibold">Loading Data...</div>
    </div>
  );
}

export default LoadingSpinner; 