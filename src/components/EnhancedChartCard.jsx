import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced chart card component with contextual information and better tooltips
 * @param {Object} props - Component props
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Chart subtitle
 * @param {string} props.gradient - CSS gradient classes
 * @param {string} props.icon - Icon name
 * @param {React.ReactNode} props.children - Chart content
 * @param {string} props.description - Detailed description of the chart
 * @param {Array} props.keyInsights - Array of key insights about the data
 * @param {string} props.dataSource - Source of the data
 * @param {string} props.timeRange - Time range of the data
 */
function EnhancedChartCard({ 
  title, 
  subtitle, 
  gradient, 
  icon, 
  children, 
  description,
  keyInsights = [],
  dataSource,
  timeRange,
  className = ""
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const getIcon = (iconName) => {
    const icons = {
      analytics: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ),
      house: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      ),
      car: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      ),
      trend: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      )
    };
    return icons[iconName] || icons.analytics;
  };

  return (
    <div className={`card ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-600/50">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getIcon(icon)}
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
              <p className="text-gray-400 text-sm">{subtitle}</p>
            </div>
          </div>
          
          {/* Interactive Buttons */}
          <div className="flex items-center space-x-2">
            {/* Info Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
              aria-label="Show chart details"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {/* Help Button */}
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10 relative"
              aria-label="Chart help"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              
              {/* Tooltip */}
              {showTooltip && (
                <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-800 border border-gray-600 rounded-lg shadow-lg text-sm text-gray-300 z-10">
                  <p>Hover over data points to see detailed values. Use the legend to toggle different data series.</p>
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Expandable Details Section */}
      {showDetails && (
        <div className="border-t border-slate-600/50 p-6 bg-slate-700/30">
          <div className="space-y-6">
            {/* Description */}
            {description && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">About This Chart</h4>
                <p className="text-gray-300 leading-relaxed">{description}</p>
              </div>
            )}

            {/* Key Insights */}
            {keyInsights.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Key Insights</h4>
                <ul className="space-y-2">
                  {keyInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-300 text-sm">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Data Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-600/30">
              {dataSource && (
                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-1">Data Source</h5>
                  <p className="text-gray-300 text-sm">{dataSource}</p>
                </div>
              )}
              {timeRange && (
                <div>
                  <h5 className="text-sm font-medium text-gray-400 mb-1">Time Range</h5>
                  <p className="text-gray-300 text-sm">{timeRange}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

EnhancedChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  gradient: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  description: PropTypes.string,
  keyInsights: PropTypes.arrayOf(PropTypes.string),
  dataSource: PropTypes.string,
  timeRange: PropTypes.string,
  className: PropTypes.string
};

export default EnhancedChartCard; 