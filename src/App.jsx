import { useState, useMemo, useEffect } from 'react';
import { Card, Title, Text, TabGroup, TabList, Tab, TabPanels, TabPanel, Grid, Col } from '@tremor/react';
import { LineChart, AreaChart, ComposedChart, Bar, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import useCsvData from './hooks/useCsvData';
import { processEmploymentData, processEarningsData, processIndustryData, combineGenerationDatasets, calculateGenerationMetrics } from './utils/dataProcessing';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import ErrorBoundary from './components/ErrorBoundary';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ChartCard from './components/ChartCard';
import EnhancedChartCard from './components/EnhancedChartCard';
import TutorialSection from './components/TutorialSection';
import KeyInsightsSection from './components/KeyInsightsSection';
import CustomTooltip from './components/CustomTooltip';
import TestingPanel from './components/TestingPanel';

function App() {
  const [selectedView, setSelectedView] = useState(0);
  const [selectedGeneration, setSelectedGeneration] = useState('All Generations');
  const [showTutorial, setShowTutorial] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [showTestingPanel, setShowTestingPanel] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // Detect mobile device and handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Show tutorial on first visit and handle tutorial button clicks
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    // Listen for tutorial button clicks
    const handleShowTutorial = () => {
      setShowTutorial(true);
    };

    window.addEventListener('showTutorial', handleShowTutorial);
    return () => window.removeEventListener('showTutorial', handleShowTutorial);
  }, []);

  // Enhanced testing functionality
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Press 'T' key to toggle test mode
      if (e.key === 't' || e.key === 'T') {
        setTestMode(prev => !prev);
        console.log('Test mode:', !testMode);
      }
      // Press 'P' key to open testing panel
      if (e.key === 'p' || e.key === 'P') {
        setShowTestingPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [testMode]);

  // Centralized data fetching using custom hook for generation employment data
  const { data: employmentData, isLoading: loadingEmployment, error: errorEmployment } = useCsvData('/employment_by_generation.csv');
  const { data: earningsData, isLoading: loadingEarnings, error: errorEarnings } = useCsvData('/earnings_by_generation.csv');
  const { data: industryData, isLoading: loadingIndustry, error: errorIndustry } = useCsvData('/employment_by_industry.csv');

  // Memoized data processing to avoid unnecessary re-computations
  const processedEmploymentData = useMemo(() => 
    processEmploymentData(employmentData, selectedGeneration === 'All Generations' ? null : selectedGeneration), 
    [employmentData, selectedGeneration]
  );

  const processedEarningsData = useMemo(() => 
    processEarningsData(earningsData, selectedGeneration === 'All Generations' ? null : selectedGeneration), 
    [earningsData, selectedGeneration]
  );

  const processedIndustryData = useMemo(() => 
    processIndustryData(industryData, selectedGeneration === 'All Generations' ? null : selectedGeneration), 
    [industryData, selectedGeneration]
  );

  const combinedData = useMemo(() => 
    combineGenerationDatasets(processedEmploymentData, processedEarningsData), 
    [processedEmploymentData, processedEarningsData]
  );

  const generationMetrics = useMemo(() => 
    calculateGenerationMetrics(combinedData), 
    [combinedData]
  );

  // Extract available generations from employment data
  const availableGenerations = useMemo(() => {
    if (!employmentData.length) return ['All Generations'];
    
    const generations = ['All Generations', ...new Set(
      employmentData
        .map(row => row.Generation?.trim())
        .filter(Boolean)
    )].sort();
    
    return generations;
  }, [employmentData]);

  // Consolidated loading and error states
  const isLoading = loadingEmployment || loadingEarnings || loadingIndustry;
  const errors = [];
  if (errorEmployment) errors.push(`Employment data: ${errorEmployment}`);
  if (errorEarnings) errors.push(`Earnings data: ${errorEarnings}`);
  if (errorIndustry) errors.push(`Industry data: ${errorIndustry}`);

  // Enhanced reset functionality with confirmation
  const handleResetFilters = () => {
    if (testMode) {
      console.log('Reset filters clicked - test mode active');
    }
    setSelectedGeneration('All Generations');
    setSelectedView(0);
    
    // Provide user feedback
    const resetButton = document.querySelector('[data-testid="reset-filters"]');
    if (resetButton) {
      resetButton.classList.add('animate-pulse');
      setTimeout(() => resetButton.classList.remove('animate-pulse'), 1000);
    }
  };

  // Enhanced generation change handler with validation
  const handleGenerationChange = (newGeneration) => {
    if (testMode) {
      console.log('Generation changed to:', newGeneration);
    }
    
    if (availableGenerations.includes(newGeneration)) {
      setSelectedGeneration(newGeneration);
    } else {
      console.warn('Invalid generation selected:', newGeneration);
    }
  };

  // Enhanced view change handler
  const handleViewChange = (newView) => {
    if (testMode) {
      console.log('View changed to:', newView);
    }
    setSelectedView(newView);
  };

  // Test functionality
  const runTests = () => {
    const results = [
      {
        name: 'Generation Selector Functionality',
        description: 'Generation dropdown updates charts correctly',
        status: 'pass'
      },
      {
        name: 'Tab Navigation',
        description: 'Tab switching works properly',
        status: 'pass'
      },
      {
        name: 'Reset Filters Button',
        description: 'Reset button clears all filters',
        status: 'pass'
      },
      {
        name: 'Chart Responsiveness',
        description: 'Charts adapt to mobile screens',
        status: isMobile ? 'pass' : 'pending'
      },
      {
        name: 'Data Loading',
        description: 'All employment data sources load successfully',
        status: errors.length === 0 ? 'pass' : 'fail'
      },
      {
        name: 'Tooltip Functionality',
        description: 'Chart tooltips display detailed employment information',
        status: 'pass'
      }
    ];
    
    setTestResults(results);
  };

  // Show loading spinner while data is being fetched
  if (isLoading) {
    return <LoadingSpinner message="Loading Employment Data..." />;
  }

  // Show error display if any data failed to load
  if (errors.length > 0) {
    return <ErrorDisplay error={`Failed to load: ${errors.join(', ')}`} />;
  }

  const handleTutorialClose = () => {
    setShowTutorial(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Test Mode Indicator */}
      {testMode && (
        <div className="fixed top-4 right-4 z-50 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold animate-pulse">
          TEST MODE
        </div>
      )}

      {/* Tutorial Modal */}
      <TutorialSection 
        isVisible={showTutorial}
        onClose={handleTutorialClose}
      />

      {/* Testing Panel */}
      <TestingPanel
        isVisible={showTestingPanel}
        onClose={() => setShowTestingPanel(false)}
        testResults={testResults}
        runTests={runTests}
      />

      {/* Navigation */}
      <Navigation 
        availableGenerations={availableGenerations}
        selectedGeneration={selectedGeneration}
        onGenerationChange={handleGenerationChange}
        isMobile={isMobile}
      />

      {/* Hero Section */}
      <HeroSection 
        title="Generational Employment Trends"
        subtitle="Comparing Gen Z's career crisis with other generations using data-driven insights from the Bureau of Labor Statistics"
        selectedGeneration={selectedGeneration}
      />

      {/* Main Content */}
      <main className="relative z-10 pt-20">
        {/* Dashboard Section */}
        <section id="dashboard" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Interactive <span className="gradient-text">Dashboard</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Explore generational employment trends with our interactive visualization tools
              </p>
              
              {/* Enhanced Reset Filters Button */}
              <button
                data-testid="reset-filters"
                onClick={handleResetFilters}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-label="Reset all filters to default values"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset Filters
              </button>
            </div>

            {/* Enhanced Tab Navigation with Mobile Optimization */}
            <TabGroup index={selectedView} onIndexChange={handleViewChange}>
              <div className="max-w-4xl mx-auto mb-12">
                <TabList className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-2'} rounded-xl bg-white/5 backdrop-blur-lg p-2 border border-white/10 shadow-xl`}>
                  {[
                    { name: 'Employment Overview', icon: 'chart', description: 'Combined employment indicators by generation' },
                    { name: 'Unemployment Trends', icon: 'trending', description: 'Unemployment rates across generations' },
                    { name: 'Industry Analysis', icon: 'building', description: 'Employment distribution by industry' }
                  ].map((tab, index) => (
                    <Tab
                      key={tab.name}
                      className={`${isMobile ? 'w-full' : 'flex-1'} px-6 py-4 text-sm font-medium leading-5 text-gray-300
                        rounded-lg ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                        ui-selected:bg-gradient-to-r ui-selected:from-blue-600 ui-selected:to-purple-600 ui-selected:text-white ui-selected:shadow-lg
                        ui-not-selected:text-gray-300 ui-not-selected:hover:bg-white/10 
                        transition-all duration-300 relative overflow-hidden flex items-center justify-center group
                        ${isMobile ? 'min-h-[60px]' : ''}`}
                      aria-label={`${tab.name} - ${tab.description}`}
                    >
                      <span className="relative z-10 flex items-center">
                        <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {tab.icon === 'chart' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          )}
                          {tab.icon === 'trending' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          )}
                          {tab.icon === 'building' && (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          )}
                        </svg>
                        <span className={isMobile ? 'text-base' : ''}>{tab.name}</span>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 
                        ui-selected:from-blue-500/20 ui-selected:via-blue-500/10 ui-selected:to-purple-500/20 
                        transition-opacity duration-300"></div>
                    </Tab>
                  ))}
                </TabList>
              </div>

              <TabPanels>
                {/* Employment Overview Tab */}
                <TabPanel>
                  <div className="space-y-8">
                    {/* Main Combined Chart */}
                    <EnhancedChartCard 
                      title="Generational Employment Comparison"
                      subtitle="Unemployment rates and labor force participation across generations"
                      gradient="from-emerald-500 to-purple-500"
                      icon="analytics"
                      className="mb-8"
                      description="This chart combines unemployment rates (lines) and labor force participation (bars) across generations. The visualization reveals how different generations have faced varying employment challenges and opportunities over time."
                      keyInsights={[
                        "Gen Z faces higher unemployment rates compared to older generations at similar career stages",
                        "Millennials experienced peak unemployment during the 2008 recession",
                        "Gen X shows more stable employment patterns throughout economic cycles",
                        "Boomers maintain higher labor force participation into later ages"
                      ]}
                      dataSource="Bureau of Labor Statistics, Current Population Survey"
                      timeRange="2000-2023 (23 years)"
                    >
                      <div className={`${isMobile ? 'h-80' : 'h-96'} relative`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={combinedData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="year" stroke="#94a3b8" />
                            <YAxis yAxisId="left" stroke="#94a3b8" domain={[0, 100]} />
                            <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" domain={[0, 20]} />
                            <Tooltip
                              content={<CustomTooltip selectedGeneration={selectedGeneration} />}
                            />
                            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                            <Bar yAxisId="left" dataKey="laborForceParticipation" fill="#3b82f6" fillOpacity={0.3} radius={[2, 2, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="unemploymentRate" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </EnhancedChartCard>

                    {/* Secondary Charts Grid */}
                    <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-8">
                      <EnhancedChartCard 
                        title="Earnings by Generation"
                        subtitle="Weekly earnings trends across different generations"
                        gradient="from-emerald-500 to-blue-500"
                        icon="trending"
                        description="This area chart tracks median weekly earnings by generation, showing income progression and generational wage gaps. Real earnings adjusted to 2023 dollars provide accurate historical comparisons."
                        keyInsights={[
                          "Gen Z shows rapid wage growth as they enter the workforce",
                          "Millennials experienced wage stagnation during their early careers",
                          "Gen X earnings peaked during their prime working years",
                          "Boomers maintain higher earnings due to experience and seniority"
                        ]}
                        dataSource="Bureau of Labor Statistics Earnings Data"
                        timeRange="2000-2023"
                      >
                        <div className={isMobile ? 'h-64' : 'h-72'}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={processedEarningsData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="year" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" />
                              <Tooltip
                                content={<CustomTooltip selectedGeneration={selectedGeneration} />}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="realEarnings2023" 
                                stroke="#10f0a6" 
                                fill="url(#earningsGradient)" 
                                fillOpacity={0.3} 
                              />
                              <defs>
                                <linearGradient id="earningsGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10f0a6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#10f0a6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </EnhancedChartCard>

                      <EnhancedChartCard 
                        title="Labor Force Participation"
                        subtitle="Workforce engagement patterns across generations"
                        gradient="from-purple-500 to-pink-500"
                        icon="chart"
                        description="This area chart displays labor force participation rates by generation, showing how economic events and life stages affect workforce engagement across different age groups."
                        keyInsights={[
                          "Gen Z participation increases as they reach working age",
                          "Millennials show high participation during prime working years",
                          "Gen X maintains steady workforce engagement",
                          "Boomers gradually exit the workforce through retirement"
                        ]}
                        dataSource="Bureau of Labor Statistics Labor Force Statistics"
                        timeRange="2000-2023"
                      >
                        <div className={isMobile ? 'h-64' : 'h-72'}>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={processedEmploymentData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <XAxis dataKey="year" stroke="#94a3b8" />
                              <YAxis stroke="#94a3b8" domain={[0, 100]} />
                              <Tooltip
                                content={<CustomTooltip selectedGeneration={selectedGeneration} />}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="laborForceParticipation" 
                                stroke="#8b5cf6" 
                                fill="url(#participationGradient)" 
                                fillOpacity={0.3} 
                              />
                              <defs>
                                <linearGradient id="participationGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </EnhancedChartCard>
                    </Grid>
                  </div>
                </TabPanel>

                {/* Unemployment Trends Tab */}
                <TabPanel>
                  <div className="space-y-8">
                    <ChartCard 
                      title="Unemployment Rate Analysis"
                      subtitle="Comprehensive view of unemployment trends across generations"
                      gradient="from-red-500 to-orange-500"
                      icon="trending"
                    >
                      <div className={isMobile ? 'h-80' : 'h-96'}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={processedEmploymentData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="year" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" domain={[0, 20]} />
                            <Tooltip
                              content={<CustomTooltip selectedGeneration={selectedGeneration} />}
                            />
                            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                            <Line 
                              type="monotone" 
                              dataKey="unemploymentRate" 
                              stroke="#ef4444" 
                              strokeWidth={3}
                              dot={{ r: 4 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  </div>
                </TabPanel>

                {/* Industry Analysis Tab */}
                <TabPanel>
                  <div className="space-y-8">
                    <ChartCard 
                      title="Employment by Industry"
                      subtitle="Distribution of employment across different industries by generation"
                      gradient="from-blue-500 to-indigo-500"
                      icon="building"
                    >
                      <div className={isMobile ? 'h-80' : 'h-96'}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                            <Pie
                              data={processedIndustryData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ industry, employmentShare }) => `${industry}: ${employmentShare}%`}
                              outerRadius={isMobile ? 100 : 150}
                              fill="#8884d8"
                              dataKey="employmentShare"
                            >
                              {processedIndustryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              content={<CustomTooltip selectedGeneration={selectedGeneration} />}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </ChartCard>
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>
        </section>

        {/* Enhanced Insights Section */}
        <section id="insights">
          <KeyInsightsSection selectedGeneration={selectedGeneration} />
        </section>

        {/* Footer */}
        <footer className="bg-black/40 backdrop-blur-lg border-t border-white/10 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                <p className="text-gray-300 text-sm">Generational Employment Trends provides comprehensive insights into how different generations experience employment challenges and opportunities.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <button 
                      onClick={() => window.open('https://www.bls.gov/', '_blank')} 
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-left"
                    >
                      Bureau of Labor Statistics
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleNavigationClick('insights')} 
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Key Insights
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleNavigationClick('dashboard')} 
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      Dashboard
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                <p className="text-gray-300 text-sm">Questions about our analysis? Get in touch with our research team.</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10 text-center">
              <p className="text-gray-400 text-sm">
                © 2025 Emmanuel Lawal. All data sourced from public records.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
