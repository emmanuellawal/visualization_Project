import React from 'react';
import TimeSeriesChart from '../graphs/TimeSeriesChart';
import ScatterPlotChart from '../graphs/ScatterPlotChart';
import TrendComparisonChart from '../graphs/TrendComparisonChart';
import VehicleTypeChart from '../graphs/VehicleTypeChart';

interface PennsylvaniaDashboardProps {
  housingData: any[];
  rentData: any[];
  vehicleData: any[];
}

const PennsylvaniaDashboard: React.FC<PennsylvaniaDashboardProps> = ({ housingData, rentData, vehicleData }) => {
  const stateVehicleData = vehicleData.filter(d => d.state === 'Pennsylvania');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="chart-container">
        <TimeSeriesChart 
          housingData={housingData} 
          vehicleData={stateVehicleData} 
        />
      </div>
      
      <div className="chart-container">
        <ScatterPlotChart 
          housingData={housingData} 
          vehicleData={stateVehicleData} 
        />
      </div>
      
      <div className="chart-container">
        <TrendComparisonChart 
          rentData={rentData} 
          housingData={housingData} 
        />
      </div>
      
      <div className="chart-container">
        <VehicleTypeChart 
          vehicleData={vehicleData}
          activeState="Pennsylvania"
        />
      </div>
    </div>
  );
};

export default PennsylvaniaDashboard; 