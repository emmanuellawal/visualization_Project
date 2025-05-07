import React from 'react';

function ErrorDisplay({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020924]">
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 max-w-lg">
        <div className="flex items-center mb-4">
          <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-red-500">Error</h2>
        </div>
        <p className="text-red-300">{message || 'An unexpected error occurred. Please try again later.'}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export default ErrorDisplay; 