import React from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced custom tooltip component for charts with detailed contextual information
 * @param {Object} props - Component props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Data payload for the tooltip
 * @param {string} props.label - Label for the tooltip (usually year)
 * @param {string} props.selectedGeneration - Currently selected generation
 */
function CustomTooltip({ active, payload, label, selectedGeneration }) {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const getDataDescription = (dataKey, value) => {
    const descriptions = {
      unemploymentRate: {
        label: 'Unemployment Rate',
        unit: '%',
        description: 'Percentage of labor force that is unemployed',
        trend: value > 10 ? 'High unemployment' : value > 5 ? 'Moderate unemployment' : 'Low unemployment'
      },
      laborForceParticipation: {
        label: 'Labor Force Participation',
        unit: '%',
        description: 'Percentage of working-age population in labor force',
        trend: value > 75 ? 'High participation' : value > 60 ? 'Moderate participation' : 'Low participation'
      },
      medianWeeklyEarnings: {
        label: 'Median Weekly Earnings',
        unit: '$',
        description: 'Median weekly earnings for full-time workers',
        trend: value > 800 ? 'High earnings' : value > 600 ? 'Moderate earnings' : 'Low earnings'
      },
      realEarnings2023: {
        label: 'Real Earnings (2023 $)',
        unit: '$',
        description: 'Inflation-adjusted weekly earnings in 2023 dollars',
        trend: value > 800 ? 'High real earnings' : value > 600 ? 'Moderate real earnings' : 'Low real earnings'
      },
      employmentShare: {
        label: 'Employment Share',
        unit: '%',
        description: 'Percentage of generation employed in this industry',
        trend: value > 15 ? 'Major industry employer' : value > 5 ? 'Significant employer' : 'Minor employer'
      }
    };

    return descriptions[dataKey] || { label: dataKey, unit: '', description: '', trend: '' };
  };

  const getContextualInfo = (year, dataKey, value) => {
    const contextInfo = {
      unemploymentRate: {
        '2008': 'Financial crisis caused massive job losses across all generations, with youth particularly affected',
        '2010': 'Recovery period with slow job growth, unemployment remained elevated for younger workers',
        '2015': 'Strong labor market recovery with unemployment approaching pre-recession levels',
        '2020': 'COVID-19 pandemic caused severe job losses, with Gen Z and service workers hit hardest',
        '2023': 'Labor market recovery with low unemployment, but Gen Z faces unique challenges'
      },
      laborForceParticipation: {
        '2008': 'Labor force participation declined as discouraged workers stopped job searching',
        '2010': 'Continued low participation rates due to extended unemployment periods',
        '2015': 'Gradual improvement in participation as job market strengthened',
        '2020': 'Sharp decline in participation due to pandemic health concerns and childcare issues',
        '2023': 'Participation rates recovering but still below pre-pandemic levels for some groups'
      },
      medianWeeklyEarnings: {
        '2008': 'Wage growth slowed during recession as employers cut costs',
        '2015': 'Gradual wage growth resumed as labor market tightened',
        '2020': 'Mixed wage effects - some sectors saw increases while others declined',
        '2023': 'Strong wage growth driven by tight labor market and inflation adjustments'
      }
    };

    return contextInfo[dataKey]?.[year] || '';
  };

  const getGenerationalContext = (year) => {
    const generationalEvents = {
      '2008': 'Millennials entering job market during recession faced lasting career impacts',
      '2010': 'Gen X in prime earning years dealt with prolonged economic uncertainty',
      '2015': 'Millennials began reaching peak earning potential as economy recovered',
      '2020': 'Gen Z entered workforce during pandemic, facing unique digital-first job market',
      '2023': 'Gen Z establishes career patterns in post-pandemic economy with new work expectations'
    };

    return generationalEvents[year] || '';
  };

  const getCorrelationInsight = (payload) => {
    if (payload.length < 2) return '';
    
    const hasUnemployment = payload.some(p => p.dataKey === 'unemploymentRate');
    const hasParticipation = payload.some(p => p.dataKey === 'laborForceParticipation');
    const hasEarnings = payload.some(p => p.dataKey === 'medianWeeklyEarnings');
    
    if (hasUnemployment && hasParticipation) {
      return '💡 High unemployment often coincides with lower labor force participation rates';
    }
    if (hasEarnings && hasUnemployment) {
    if (hasEarnings && hasUnemployment) {
      return '💡 Lower unemployment typically corresponds with higher wages due to competition for workers';
    }
    if (hasParticipation && hasEarnings) {
      return '💡 Higher labor force participation often correlates with better wage outcomes';
    }
    
    return '';
  };
  };

  return (
    <div className="bg-gray-800/95 backdrop-blur-lg border border-gray-600 rounded-lg p-4 shadow-xl max-w-xs lg:max-w-sm">
      <div className="mb-3">
        <h4 className="text-white font-semibold text-lg mb-1">
          {label}
        </h4>
        {selectedGeneration && selectedGeneration !== 'All Generations' && (
          <p className="text-gray-300 text-sm">
            � {selectedGeneration}
          </p>
        )}
        {getGenerationalContext(label) && (
          <p className="text-emerald-300 text-xs mt-1 italic">
            📈 {getGenerationalContext(label)}
          </p>
        )}
      </div>

      <div className="space-y-3">
        {payload.map((entry, index) => {
          const dataInfo = getDataDescription(entry.dataKey, entry.value);
          const contextualInfo = getContextualInfo(label, entry.dataKey, entry.value);
          
          return (
            <div key={index} className="flex items-start space-x-3">
              <div 
                className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: entry.color }}
              ></div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-gray-300 text-sm font-medium">
                    {dataInfo.label}
                  </span>
                  <span className="text-white font-bold">
                    {entry.value?.toLocaleString()}
                    {dataInfo.unit && <span className="text-gray-400 text-xs ml-1">{dataInfo.unit}</span>}
                  </span>
                </div>
                <p className="text-gray-400 text-xs mb-1">
                  {dataInfo.description}
                </p>
                <p className="text-blue-300 text-xs mb-1">
                  📊 {dataInfo.trend}
                </p>
                {contextualInfo && (
                  <p className="text-green-300 text-xs italic">
                    💡 {contextualInfo}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Trend Analysis */}
      {payload.length > 1 && (
        <div className="mt-4 pt-3 border-t border-gray-600">
          <p className="text-gray-300 text-xs mb-2">
            <strong>📈 Trend Analysis:</strong>
          </p>
          <p className="text-gray-400 text-xs mb-2">
            {getCorrelationInsight(payload)}
          </p>
          <p className="text-gray-400 text-xs">
            💡 Hover over other data points to see more detailed insights
          </p>
        </div>
      )}

      {/* Mobile-friendly interaction hint */}
      <div className="mt-3 pt-2 border-t border-gray-600">
        <p className="text-gray-400 text-xs">
          📱 Tap and hold on mobile for detailed information
        </p>
      </div>
    </div>
  );
}

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
  selectedGeneration: PropTypes.string
};

export default CustomTooltip; 