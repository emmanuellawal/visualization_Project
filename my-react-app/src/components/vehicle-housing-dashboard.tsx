import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import NewYorkDashboard from './states/NewYorkDashboard';
import NewJerseyDashboard from './states/NewJerseyDashboard';
import PennsylvaniaDashboard from './states/PennsylvaniaDashboard';

const Dashboard = () => {
  interface HousingData {
    Year: number;
    Annual: number;
  }
  
  interface RentData {
    Year: number;
    Annual: number;
  }
  
  interface VehicleData {
    year: number;
    state: string;
    Auto: number;
    Motorcycle: number;
  }
  
  const [housingData, setHousingData] = useState<HousingData[]>([]);
  const [rentData, setRentData] = useState<RentData[]>([]);
  const [vehicleData, setVehicleData] = useState<VehicleData[]>([]);
  const [activeState, setActiveState] = useState('New York');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all data files from the public directory
        const housingResponse = await fetch('/housing.csv').then(response => response.text());
        const rentResponse = await fetch('/rent_primeR.csv').then(response => response.text());
        const vehicleResponse = await fetch('/Motor_Vehicle_Registrations_Dashboard_data.csv').then(response => response.text());
        
        // Parse CSV files
        const parseOptions = { 
          header: true, 
          dynamicTyping: true,
          skipEmptyLines: true
        };
        
        const parsedHousing = Papa.parse(housingResponse, parseOptions).data;
        const parsedRent = Papa.parse(rentResponse, parseOptions).data;
        const parsedVehicle = Papa.parse(vehicleResponse, parseOptions).data;
        
        setHousingData(parsedHousing);
        setRentData(parsedRent);
        setVehicleData(parsedVehicle);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-xl font-medium">Loading data...</div>
      </div>
    );
  }
  
  const renderStateDashboard = () => {
    const props = {
      housingData,
      rentData,
      vehicleData
    };

    switch (activeState) {
      case 'New York':
        return <NewYorkDashboard {...props} />;
      case 'New Jersey':
        return <NewJerseyDashboard {...props} />;
      case 'Pennsylvania':
        return <PennsylvaniaDashboard {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6 text-center">
        Three Decades of Mobility and Economics
      </h1>
      <p className="mb-8 text-center text-gray-300 text-lg">
        Exploring the relationship between vehicle registrations and housing costs (1994-2020)
      </p>
      
      <div className="mb-8">
        <div className="text-xl font-medium mb-3">Select State:</div>
        <div className="flex space-x-4">
          {['New York', 'New Jersey', 'Pennsylvania'].map(state => (
            <button
              key={state}
              onClick={() => setActiveState(state)}
              className={`px-6 py-3 rounded-lg text-lg ${
                activeState === state 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-200'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>
      
      {renderStateDashboard()}
    </div>
  );
};

export default Dashboard;