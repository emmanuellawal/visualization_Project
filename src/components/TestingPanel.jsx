import React, { useState } from 'react';

/**
 * Testing panel component for validating interactive elements and functionality
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the testing panel is visible
 * @param {Function} props.onClose - Callback to close the testing panel
 * @param {Array} props.testResults - Array of test results
 * @param {Function} props.runTests - Function to run tests
 */
function TestingPanel({ isVisible, onClose, testResults = [], runTests }) {
  const [activeTab, setActiveTab] = useState('tests');

  const testCategories = [
    {
      id: 'tests',
      name: 'Test Results',
      icon: '🧪'
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      icon: '♿'
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: '⚡'
    },
    {
      id: 'mobile',
      name: 'Mobile',
      icon: '📱'
    }
  ];

  const accessibilityChecks = [
    'All interactive elements have proper ARIA labels',
    'Color contrast meets WCAG guidelines',
    'Keyboard navigation works correctly',
    'Screen reader compatibility verified',
    'Focus indicators are visible and clear'
  ];

  const performanceChecks = [
    'Charts render within 2 seconds',
    'Data loading is optimized',
    'Mobile responsiveness maintained',
    'Smooth animations and transitions',
    'Memory usage is optimized'
  ];

  const mobileChecks = [
    'Touch targets are at least 44px',
    'Dropdowns work on touch devices',
    'Charts are readable on small screens',
    'Navigation is touch-friendly',
    'No horizontal scrolling on mobile'
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Testing & Validation Panel</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
              aria-label="Close testing panel"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-2 mb-6">
            {testCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                  activeTab === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>

          {/* Test Results Tab */}
          {activeTab === 'tests' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Interactive Element Tests</h3>
                <button
                  onClick={runTests}
                  className="btn-primary text-sm"
                >
                  Run Tests
                </button>
              </div>
              
              <div className="space-y-4">
                {testResults.length > 0 ? (
                  testResults.map((result, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                      <div className={`w-4 h-4 rounded-full ${
                        result.status === 'pass' ? 'bg-green-500' : 
                        result.status === 'fail' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{result.name}</p>
                        <p className="text-gray-400 text-sm">{result.description}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        result.status === 'pass' ? 'bg-green-500/20 text-green-300' :
                        result.status === 'fail' ? 'bg-red-500/20 text-red-300' :
                        'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No test results available. Click "Run Tests" to start testing.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Accessibility Checklist</h3>
              <div className="space-y-3">
                {accessibilityChecks.map((check, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      id={`accessibility-${index}`}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor={`accessibility-${index}`} className="text-gray-300 text-sm">
                      {check}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Performance Checklist</h3>
              <div className="space-y-3">
                {performanceChecks.map((check, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      id={`performance-${index}`}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor={`performance-${index}`} className="text-gray-300 text-sm">
                      {check}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile Tab */}
          {activeTab === 'mobile' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Mobile Optimization Checklist</h3>
              <div className="space-y-3">
                {mobileChecks.map((check, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
                    <input
                      type="checkbox"
                      id={`mobile-${index}`}
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor={`mobile-${index}`} className="text-gray-300 text-sm">
                      {check}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-600">
            <div className="flex justify-between items-center">
              <p className="text-gray-400 text-sm">
                💡 Use this panel to validate your dashboard's functionality and accessibility
              </p>
              <button
                onClick={onClose}
                className="btn-secondary text-sm"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestingPanel; 