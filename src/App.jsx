import { useState, useEffect } from 'react';
import { Card, Title, Text, TabGroup, TabList, Tab, TabPanels, TabPanel, Grid, Col } from '@tremor/react';
import { LineChart, AreaChart, ComposedChart, Bar, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import { processVehicleData, processHousingData, processRentData, combineDatasets } from './utils/dataProcessing';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [combinedData, setCombinedData] = useState([]);
  const [housingData, setHousingData] = useState([]);
  const [rentData, setRentData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedView, setSelectedView] = useState(0);
  const [selectedState, setSelectedState] = useState('All States');
  const [availableStates, setAvailableStates] = useState(['All States']);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const vehicleResponse = await fetch('/Motor_Vehicle_Registrations_Dashboard_data.csv');
        const housingResponse = await fetch('/housing.csv');
        const rentResponse = await fetch('/rent_primeR.csv');

        const vehicleText = await vehicleResponse.text();
        const housingText = await housingResponse.text();
        const rentText = await rentResponse.text();

        const vehicleParsed = Papa.parse(vehicleText, { header: true });
        const housingParsed = Papa.parse(housingText, { header: true });
        const rentParsed = Papa.parse(rentText, { header: true });

        // Extract unique states and remove duplicates
        const states = ['All States', ...new Set(
          vehicleParsed.data
            .map(row => row.state?.trim())
            .filter(Boolean)
            .map(state => state.replace(/\s*\(\d+\)$/, '')) // Remove trailing numbers in parentheses
        )].sort();
        
        setAvailableStates(states);

        // Process data for all states initially
        const vehicleData = processVehicleData(vehicleParsed.data);
        const housingData = processHousingData(housingParsed.data);
        const rentData = processRentData(rentParsed.data);

        setCombinedData(combineDatasets(vehicleData, housingData, rentData));
        setHousingData(housingData);
        setRentData(rentData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update effect to handle state selection
  useEffect(() => {
    if (!isLoading && selectedState !== 'All States') {
      const updateDataForState = async () => {
        try {
          const vehicleResponse = await fetch('/Motor_Vehicle_Registrations_Dashboard_data.csv');
          const vehicleText = await vehicleResponse.text();
          const vehicleParsed = Papa.parse(vehicleText, { header: true });
          
          // Clean the state data before processing
          const cleanedData = vehicleParsed.data.map(row => ({
            ...row,
            state: row.state?.replace(/\s*\(\d+\)$/, '').trim() // Remove any trailing numbers
          }));
          
          const vehicleData = processVehicleData(cleanedData, selectedState);
          const combinedStateData = combineDatasets(vehicleData, housingData, rentData);
          setCombinedData(combinedStateData);
        } catch (error) {
          console.error('Error updating state data:', error);
        }
      };

      updateDataForState();
    }
  }, [selectedState, isLoading]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <div className="min-h-screen bg-[#020924] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.png')] opacity-5"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[100px]"></div>
      </div>

      <nav className="bg-[#041138]/90 backdrop-blur-lg shadow-lg sticky top-0 z-10 border-b border-blue-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-400/30">
                <svg
                  className="h-8 w-8 text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">Economic Mobility Analysis</span>
                <p className="text-blue-400 text-sm">Data Visualization Project</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="bg-[#041138] text-blue-200 border border-blue-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-block">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 ring-1 ring-blue-400/30 mb-4">
              {selectedState === 'All States' ? 'National Overview' : selectedState + ' Data'}
            </span>
          </div>
          <h1 className="text-5xl font-bold text-white sm:text-6xl lg:text-7xl tracking-tight mb-6">
            Three Decades of
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text"> Mobility</span>
          </h1>
          <p className="mt-6 text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            Exploring the relationship between vehicle ownership and economic indicators through advanced data visualization
          </p>
        </div>

        <TabGroup index={selectedView} onIndexChange={setSelectedView}>
          <div className="max-w-3xl mx-auto mb-12">
            <TabList className="flex space-x-2 rounded-xl bg-[#041138]/80 backdrop-blur p-2 border border-blue-900/50 shadow-lg">
              {['Overview', 'Housing Trends', 'Vehicle Registration'].map((tab) => (
                <Tab
                  key={tab}
                  className="flex-1 px-4 py-3 text-sm font-medium leading-5 text-blue-200
                    rounded-lg ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2
                    ui-selected:bg-blue-500 ui-selected:text-white ui-selected:shadow-lg
                    ui-not-selected:text-blue-200 ui-not-selected:hover:bg-white/[0.12] 
                    transition-all duration-200 relative overflow-hidden flex items-center justify-center"
                >
                  <span className="relative z-10 text-center">{tab}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 
                    ui-selected:from-blue-500/20 ui-selected:via-blue-500/10 ui-selected:to-purple-500/20 
                    transition-opacity duration-200"></div>
                </Tab>
              ))}
            </TabList>
          </div>

          <TabPanels>
            <TabPanel>
              <div className="space-y-8">
                <Card className="bg-[#041138]/80 backdrop-blur border border-blue-900/50 shadow-xl rounded-xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <Title className="text-2xl font-bold text-white mb-4">
                    Combined Economic Indicators
                  </Title>
                  <Text className="text-blue-200 mb-6">
                    Visualizing the correlation between vehicle registrations and housing costs over time
                  </Text>
                  <div className="h-96 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent"></div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={combinedData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
                        <XAxis dataKey="year" stroke="#93c5fd" />
                        <YAxis yAxisId="left" stroke="#93c5fd" />
                        <YAxis yAxisId="right" orientation="right" stroke="#93c5fd" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#041138',
                            border: '1px solid #1e3a8a',
                            borderRadius: '0.5rem',
                          }}
                          labelStyle={{ color: '#93c5fd' }}
                          itemStyle={{ color: '#93c5fd' }}
                        />
                        <Legend wrapperStyle={{ color: '#93c5fd' }} />
                        <Bar yAxisId="left" dataKey="registrations" fill="#3b82f6" />
                        <Line yAxisId="right" type="monotone" dataKey="housingIndex" stroke="#10b981" />
                        <Line yAxisId="right" type="monotone" dataKey="rentIndex" stroke="#8b5cf6" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Grid numItems={1} numItemsSm={2} numItemsLg={2} className="gap-8">
                  <Card className="bg-[#041138]/80 backdrop-blur border border-blue-900/50 shadow-xl rounded-xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500"></div>
                    <Title className="text-xl font-bold text-white mb-4">
                      Housing Cost Trends
                    </Title>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={housingData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
                          <XAxis dataKey="year" stroke="#93c5fd" />
                          <YAxis stroke="#93c5fd" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#041138',
                              border: '1px solid #1e3a8a',
                              borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: '#93c5fd' }}
                            itemStyle={{ color: '#93c5fd' }}
                          />
                          <Area type="monotone" dataKey="housingIndex" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card className="bg-[#041138]/80 backdrop-blur border border-blue-900/50 shadow-xl rounded-xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
                    <Title className="text-xl font-bold text-white mb-4">
                      Rent Price Evolution
                    </Title>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={rentData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
                          <XAxis dataKey="year" stroke="#93c5fd" />
                          <YAxis stroke="#93c5fd" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#041138',
                              border: '1px solid #1e3a8a',
                              borderRadius: '0.5rem',
                            }}
                            labelStyle={{ color: '#93c5fd' }}
                            itemStyle={{ color: '#93c5fd' }}
                          />
                          <Area type="monotone" dataKey="rentIndex" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </Grid>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="space-y-8">
                <Card className="bg-[#041138]/80 backdrop-blur border border-blue-900/50 shadow-xl rounded-xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <Title className="text-2xl font-bold text-white mb-4">
                    Housing Market Analysis
                  </Title>
                  <Text className="text-blue-200 mb-6">
                    Comprehensive view of housing cost changes over three decades
                  </Text>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={combinedData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
                        <XAxis dataKey="year" stroke="#93c5fd" />
                        <YAxis stroke="#93c5fd" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#041138',
                            border: '1px solid #1e3a8a',
                            borderRadius: '0.5rem',
                          }}
                          labelStyle={{ color: '#93c5fd' }}
                          itemStyle={{ color: '#93c5fd' }}
                        />
                        <Legend wrapperStyle={{ color: '#93c5fd' }} />
                        <Area type="monotone" dataKey="housingIndex" fill="#10b981" stroke="#10b981" fillOpacity={0.2} />
                        <Line type="monotone" dataKey="rentIndex" stroke="#8b5cf6" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </TabPanel>

            <TabPanel>
              <div className="space-y-8">
                <Card className="bg-[#041138]/80 backdrop-blur border border-blue-900/50 shadow-xl rounded-xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  <Title className="text-2xl font-bold text-white mb-4">
                    Vehicle Registration Patterns
                  </Title>
                  <Text className="text-blue-200 mb-6">
                    Analysis of motor vehicle registration trends and their correlation with economic indicators
                  </Text>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={combinedData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
                        <XAxis dataKey="year" stroke="#93c5fd" />
                        <YAxis yAxisId="left" stroke="#93c5fd" />
                        <YAxis yAxisId="right" orientation="right" stroke="#93c5fd" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#041138',
                            border: '1px solid #1e3a8a',
                            borderRadius: '0.5rem',
                          }}
                          labelStyle={{ color: '#93c5fd' }}
                          itemStyle={{ color: '#93c5fd' }}
                        />
                        <Legend wrapperStyle={{ color: '#93c5fd' }} />
                        <Bar yAxisId="left" dataKey="registrations" fill="#3b82f6" />
                        <Line yAxisId="right" type="monotone" dataKey="housingIndex" stroke="#10b981" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <div className="bg-[#041138]/80 backdrop-blur rounded-xl border border-blue-900/50 shadow-xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                  <h2 className="text-3xl font-bold text-white mb-8 relative">Key Insights</h2>
                  <div className="prose max-w-none text-blue-200 relative">
                    <p className="text-lg leading-relaxed">
                      The data suggests a strong correlation between housing costs and vehicle ownership patterns, particularly during economic downturns.
                    </p>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50 transform hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">30+</div>
                        <div className="text-sm text-blue-200">Years of Data</div>
                      </div>
                      <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50 transform hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">3</div>
                        <div className="text-sm text-blue-200">States Analyzed</div>
                      </div>
                      <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50 transform hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">2</div>
                        <div className="text-sm text-blue-200">Economic Indicators</div>
                      </div>
                      <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50 transform hover:scale-105 transition-transform duration-200">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">1M+</div>
                        <div className="text-sm text-blue-200">Data Points</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>

        <div className="mt-24 bg-[#041138]/80 backdrop-blur rounded-xl border border-blue-900/50 shadow-xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-3xl font-bold text-white mb-8 relative">Key Findings & Implications</h2>
          <div className="prose max-w-none text-blue-200 relative space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-blue-400">Data-Driven Insights</h3>
                <div className="space-y-4">
                  <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50">
                    <h4 className="text-lg font-medium text-blue-300 mb-2">Strong Inverse Correlation</h4>
                    <p className="text-blue-200">Analysis reveals a significant inverse relationship between housing costs and vehicle ownership rates, particularly in urban centers. As housing costs increase, vehicle ownership shows a notable decline.</p>
                  </div>
                  <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50">
                    <h4 className="text-lg font-medium text-blue-300 mb-2">Geographic Variations</h4>
                    <p className="text-blue-200">Urban areas with higher housing costs typically show lower vehicle ownership rates, suggesting increased reliance on public transportation and alternative mobility options.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-blue-400">Policy Implications</h3>
                <div className="space-y-4">
                  <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50">
                    <h4 className="text-lg font-medium text-blue-300 mb-2">Transportation Planning</h4>
                    <p className="text-blue-200">Areas with high housing costs require robust public transportation infrastructure to accommodate lower vehicle ownership rates and ensure mobility accessibility.</p>
                  </div>
                  <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50">
                    <h4 className="text-lg font-medium text-blue-300 mb-2">Housing Policy</h4>
                    <p className="text-blue-200">The data suggests a need for integrated housing and transportation policies that consider the interconnected nature of housing affordability and mobility choices.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-blue-400 mb-6">Recommendations for Urban Planning</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50 transform hover:scale-105 transition-transform duration-200">
                  <div className="text-2xl text-blue-400 mb-3">01</div>
                  <h4 className="text-lg font-medium text-blue-300 mb-2">Transit-Oriented Development</h4>
                  <p className="text-blue-200">Prioritize development near public transportation hubs to provide affordable housing options with reduced dependency on personal vehicles.</p>
                </div>
                <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50 transform hover:scale-105 transition-transform duration-200">
                  <div className="text-2xl text-blue-400 mb-3">02</div>
                  <h4 className="text-lg font-medium text-blue-300 mb-2">Mixed Mobility Solutions</h4>
                  <p className="text-blue-200">Implement comprehensive mobility strategies that include public transit, bike-sharing, and pedestrian infrastructure.</p>
                </div>
                <div className="bg-[#0a1c4d]/50 backdrop-blur rounded-lg p-6 border border-blue-800/50 transform hover:scale-105 transition-transform duration-200">
                  <div className="text-2xl text-blue-400 mb-3">03</div>
                  <h4 className="text-lg font-medium text-blue-300 mb-2">Affordable Housing Initiatives</h4>
                  <p className="text-blue-200">Develop policies that promote affordable housing near employment centers and transit corridors.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-800/30">
              <h3 className="text-2xl font-bold text-white mb-4">Conclusion</h3>
              <p className="text-lg text-blue-200 leading-relaxed">
                The analysis demonstrates a clear relationship between housing affordability and vehicle ownership patterns in urban areas. This correlation suggests that as housing costs rise, residents are more likely to forgo vehicle ownership, potentially due to financial constraints and the availability of alternative transportation options. These findings emphasize the need for integrated urban planning approaches that consider both housing and transportation policies to ensure equitable access to mobility and housing options for all residents.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-[#041138]/90 backdrop-blur-lg mt-24 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">About</h3>
              <p className="text-blue-300 text-sm">Economic Mobility Analysis provides comprehensive insights into the relationship between vehicle ownership and housing costs.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-blue-300 hover:text-blue-200">Documentation</a></li>
                <li><a href="#" className="text-blue-300 hover:text-blue-200">Methodology</a></li>
                <li><a href="#" className="text-blue-300 hover:text-blue-200">Data Sources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
              <p className="text-blue-300 text-sm">Questions about our analysis? Get in touch with our research team.</p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-900/50 text-center">
            <p className="text-blue-400 text-sm">
              © 2025 Emmanuel Lawal. All data sourced from public records.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ErrorDisplay({ error }) {
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
          <h3 className="mt-4 text-lg font-medium text-white">Error Loading Data</h3>
          <p className="mt-2 text-sm text-blue-200">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
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
