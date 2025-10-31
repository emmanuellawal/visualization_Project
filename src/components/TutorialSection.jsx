import React, { useState } from 'react';

/**
 * Enhanced tutorial section component that provides comprehensive guidance on using the dashboard
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the tutorial is visible
 * @param {Function} props.onClose - Callback to close the tutorial
 */
function TutorialSection({ isVisible, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to the Economic Mobility Dashboard",
      content: "This interactive dashboard helps you explore the relationship between vehicle ownership and economic indicators like housing costs and rent prices across different states. You'll discover patterns that can inform policy decisions and understand economic mobility trends.",
      icon: "📊",
      tips: [
        "Take your time exploring each section",
        "Use the state selector to compare different regions",
        "Hover over data points for detailed information"
      ]
    },
    {
      title: "How to Navigate the Dashboard",
      content: "Use the three main tabs to explore different aspects of the data: Overview (combined analysis), Housing Trends (housing cost analysis), and Vehicle Registration (ownership patterns). Each view provides unique insights into economic mobility.",
      icon: "🧭",
      tips: [
        "Start with the Overview tab for a complete picture",
        "Switch between tabs to focus on specific indicators",
        "Use the navigation menu to jump to different sections"
      ]
    },
    {
      title: "State Selection and Filtering",
      content: "Use the dropdown in the navigation bar to select a specific state or view 'All States' for a national overview. The charts will update automatically to show data for your selection, allowing you to compare regional patterns.",
      icon: "🗺️",
      tips: [
        "Compare urban vs rural states for different patterns",
        "Look for states with unique economic characteristics",
        "Use 'All States' to see national trends first"
      ]
    },
    {
      title: "Understanding the Charts and Data",
      content: "Hover over data points to see detailed information including contextual explanations. The charts show trends over time, with vehicle registrations as bars and housing/rent costs as lines for easy comparison. Look for correlations and patterns.",
      icon: "📈",
      tips: [
        "Blue bars represent vehicle registrations",
        "Green lines show housing cost trends",
        "Purple lines indicate rent price changes",
        "Look for inverse relationships between indicators"
      ]
    },
    {
      title: "Key Insights and Patterns to Look For",
      content: "Look for patterns like inverse relationships between housing costs and vehicle ownership, especially in urban areas. These insights can inform transportation and housing policies. Pay attention to economic events that affected all indicators.",
      icon: "💡",
      tips: [
        "Notice how 2008 recession affected all indicators",
        "Look for urban vs rural differences",
        "Identify periods of economic growth and decline",
        "Consider policy implications of the patterns"
      ]
    },
    {
      title: "Mobile and Accessibility Features",
      content: "The dashboard is fully responsive and works on all devices. On mobile, tap and hold on data points for detailed information. All interactive elements are keyboard accessible and screen reader friendly.",
      icon: "📱",
      tips: [
        "Use landscape mode on mobile for better chart viewing",
        "Tap and hold for detailed tooltips on mobile",
        "Use keyboard navigation (Tab, Enter, Arrow keys)",
        "All charts are accessible to screen readers"
      ]
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">How to Use This Dashboard</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded"
              aria-label="Close tutorial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Step {currentStep + 1} of {tutorialSteps.length}</span>
              <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step Content */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">{tutorialSteps[currentStep].icon}</div>
            <h3 className="text-xl font-semibold text-white mb-4">
              {tutorialSteps[currentStep].title}
            </h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              {tutorialSteps[currentStep].content}
            </p>
            
            {/* Tips Section */}
            {tutorialSteps[currentStep].tips && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <h4 className="text-blue-300 font-semibold mb-3">💡 Pro Tips:</h4>
                <ul className="text-left space-y-2">
                  {tutorialSteps[currentStep].tips.map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span className="text-gray-300 text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label="Go to previous step"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            
            {currentStep < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="btn-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Go to next step"
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={onClose}
                className="btn-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Start exploring the dashboard"
              >
                Get Started
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            )}
          </div>

          {/* Skip Button */}
          <div className="text-center mt-6">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded px-2 py-1"
              aria-label="Skip tutorial and start exploring"
            >
              Skip tutorial
            </button>
          </div>

          {/* Keyboard Shortcuts Info */}
          <div className="mt-6 pt-4 border-t border-gray-600">
            <p className="text-gray-400 text-xs text-center">
              💡 Tip: Press 'T' key anytime to toggle test mode and see interactive feedback
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialSection; 