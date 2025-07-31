import React from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced error display component with retry functionality and detailed error information
 * @param {Object} props - Component props
 * @param {string} props.error - Error message to display
 * @param {Function} props.onRetry - Optional retry function
 */
function ErrorDisplay({ error, onRetry }) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020924]">
      <div className="max-w-md w-full bg-[#041138] shadow-xl rounded-xl border border-blue-900 p-8">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-red-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-white">Data Loading Error</h3>
          <p className="mt-2 text-sm text-blue-200">{error}</p>
          <p className="mt-2 text-xs text-gray-400">
            Check the console for details or contact support.
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

ErrorDisplay.propTypes = {
  error: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
};

export default ErrorDisplay; 