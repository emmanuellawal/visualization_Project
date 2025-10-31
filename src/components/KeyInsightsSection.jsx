import React from 'react';

/**
 * Key insights section component that highlights main findings and patterns
 * @param {Object} props - Component props
 * @param {string} props.selectedGeneration - Currently selected generation for dynamic insights
 */
function KeyInsightsSection({ selectedGeneration }) {
  const insights = [
    {
      title: "Gen Z Employment Challenges",
      description: "Analysis reveals Gen Z faces unique employment challenges with higher unemployment rates compared to other generations at similar career stages.",
      icon: "�",
      color: "from-red-500 to-orange-500",
      details: [
        "Gen Z unemployment rates consistently higher than Millennials were at the same age",
        "Greater vulnerability to economic downturns due to service sector concentration",
        "Impact of COVID-19 pandemic particularly pronounced for Gen Z workers"
      ]
    },
    {
      title: "Generational Wage Growth Patterns",
      description: "Different generations show distinct wage growth trajectories influenced by economic conditions during their career development.",
      icon: "�",
      color: "from-emerald-500 to-teal-500",
      details: [
        "Millennials experienced wage stagnation during early career due to 2008 recession",
        "Gen X benefited from strong economic growth during prime earning years",
        "Boomers achieved highest lifetime earnings through decades of economic expansion"
      ]
    },
    {
      title: "Industry Employment Patterns",
      description: "Different generations show distinct patterns in industry employment distribution reflecting economic shifts over time.",
      icon: "🏢",
      color: "from-blue-500 to-cyan-500",
      details: [
        "Gen Z overrepresented in service sectors making them vulnerable to economic downturns",
        "Millennials concentrated in professional services and healthcare",
        "Technology sector employment varies significantly by generation"
      ]
    },
    {
      title: "Policy Implications",
      description: "The data suggests the need for generation-specific employment policies and workforce development programs.",
      icon: "🏛️",
      color: "from-purple-500 to-pink-500",
      details: [
        "Need for targeted training programs for Gen Z entering the job market",
        "Skills gap addressing automation and technology changes",
        "Support for transition from gig economy to stable employment"
      ]
    }
  ];

  const getGenerationSpecificInsight = (generation) => {
    if (generation === 'All Generations') {
      return "National data shows consistent patterns across generations, with each facing unique challenges shaped by the economic conditions of their time.";
    }
    
    const generationInsights = {
      'Gen Z': "Gen Z faces higher unemployment rates and unique challenges as they enter the workforce during and after the COVID-19 pandemic.",
      'Millennials': "Millennials experienced lasting impacts from the 2008 recession, leading to delayed homeownership and different career progression patterns.",
      'Gen X': "Gen X demonstrates more stable employment patterns and benefited from economic growth during their prime working years.",
      'Boomers': "Boomers maintain higher labor force participation into later ages and achieved the highest lifetime earnings."
    };
    
    return generationInsights[generation] || `Data for ${generation} reveals unique employment patterns compared to other generations.`;
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Key <span className="gradient-text">Insights</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Discover the patterns and trends that shape generational employment experiences
          </p>
          
          {/* Generation-specific insight */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 backdrop-blur-lg border border-white/20">
            <svg className="w-5 h-5 mr-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-gray-300">{getGenerationSpecificInsight(selectedGeneration)}</span>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {insights.map((insight, index) => (
            <div key={index} className="card p-8 hover:scale-105 transition-transform duration-300">
              <div className="flex items-start space-x-4">
                <div className={`w-16 h-16 bg-gradient-to-br ${insight.color} rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                  {insight.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-3">{insight.title}</h3>
                  <p className="text-gray-300 mb-4 leading-relaxed">{insight.description}</p>
                  
                  {/* Key Points */}
                  <ul className="space-y-2">
                    {insight.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300 text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Methodology Section */}
        <div className="card p-8">
          <h3 className="text-2xl font-bold text-white mb-6">Methodology & Data Sources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Data Collection</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Motor vehicle registration data from state DMV records</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Housing cost indices from federal housing agencies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Rental price data from market research firms</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Analysis Approach</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Correlation analysis between housing and vehicle data</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Geographic clustering by urban/rural characteristics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                  <span className="text-gray-300 text-sm">Time series analysis for trend identification</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Explore the Interactive Dashboard
          </div>
        </div>
      </div>
    </section>
  );
}

export default KeyInsightsSection; 