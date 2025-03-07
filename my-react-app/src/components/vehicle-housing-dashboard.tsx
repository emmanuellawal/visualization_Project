import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import Papa from 'papaparse';
import intersection from 'lodash/intersection';

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-medium">Loading data...</div>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Three Decades of Mobility and Economics
      </h1>
      <p className="mb-6 text-center text-gray-600">
        Exploring the relationship between vehicle registrations and housing costs (1994-2020)
      </p>
      
      <div className="mb-6">
        <div className="text-lg font-medium mb-2">Select State:</div>
        <div className="flex space-x-2">
          {['New York', 'New Jersey', 'Pennsylvania'].map(state => (
            <button
              key={state}
              onClick={() => setActiveState(state)}
              className={`px-4 py-2 rounded ${
                activeState === state 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {state}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="chart-container">
          <TimeSeriesChart 
            housingData={housingData} 
            vehicleData={vehicleData.filter(d => d.state === activeState)} 
          />
        </div>
        
        <div className="chart-container">
          <ScatterPlotChart 
            housingData={housingData} 
            vehicleData={vehicleData.filter(d => d.state === activeState)} 
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
            activeState={activeState}
          />
        </div>
      </div>
    </div>
  );
};

// Time Series Chart: Housing Index vs Auto Registrations
const TimeSeriesChart = ({ housingData, vehicleData }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!housingData.length || !vehicleData.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Filter and prepare data
    const data = housingData.map(h => {
      const matchingVehicle = vehicleData.find(v => v.year === h.Year);
      return {
        year: h.Year,
        housingIndex: h.Annual,
        autoRegistrations: matchingVehicle ? matchingVehicle.Auto : null
      };
    }).filter(d => d.autoRegistrations !== null);
    
    // Set dimensions
    const margin = { top: 40, right: 80, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => +d.year))
      .range([0, width]);
    
    const yScaleLeft = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.housingIndex) * 1.1])
      .range([height, 0]);
    
    const yScaleRight = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.autoRegistrations) * 1.1])
      .range([height, 0]);
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
    
    // Add Y axis left (Housing Index)
    svg.append("g")
      .call(d3.axisLeft(yScaleLeft));
    
    // Add Y axis right (Auto Registrations)
    svg.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(yScaleRight));
    
    // Add housing index line
    const housingLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScaleLeft(d.housingIndex));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", housingLine);
    
    // Add auto registrations line
    const autoLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScaleRight(d.autoRegistrations));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "tomato")
      .attr("stroke-width", 2)
      .attr("d", autoLine);
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Housing Index vs Auto Registrations");
    
    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Year");
    
    // Add Y axis labels
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Housing Index");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right - 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Auto Registrations");
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 120}, 0)`);
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "steelblue");
    
    legend.append("text")
      .attr("x", 15)
      .attr("y", 10)
      .text("Housing Index");
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "tomato");
    
    legend.append("text")
      .attr("x", 15)
      .attr("y", 30)
      .text("Auto Registrations");
    
  }, [housingData, vehicleData]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <svg ref={svgRef}></svg>
    </div>
  );
};

// Scatter Plot Chart: Housing Index vs Auto Registrations
const ScatterPlotChart = ({ housingData, vehicleData }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!housingData.length || !vehicleData.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Filter and prepare data
    const data = housingData.map(h => {
      const matchingVehicle = vehicleData.find(v => v.year === h.Year);
      return {
        year: h.Year,
        housingIndex: h.Annual,
        autoRegistrations: matchingVehicle ? matchingVehicle.Auto : null
      };
    }).filter(d => d.autoRegistrations !== null);
    
    // Set dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.housingIndex) * 0.9, d3.max(data, d => d.housingIndex) * 1.1])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.autoRegistrations) * 1.1])
      .range([height, 0]);
    
    // Create color scale based on year
    const colorScale = d3.scaleSequential()
      .domain(d3.extent(data, d => d.year))
      .interpolator(d3.interpolateViridis);
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
    
    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(yScale));
    
    // Add scatter plots
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.housingIndex))
      .attr("cy", d => yScale(d.autoRegistrations))
      .attr("r", 6)
      .attr("fill", d => colorScale(d.year))
      .attr("opacity", 0.7)
      .append("title")
      .text(d => `Year: ${d.year}\nHousing Index: ${d.housingIndex.toLocaleString()}\nAutos: ${d.autoRegistrations.toLocaleString()}`);
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Housing Index vs Auto Registrations");
    
    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Housing Index");
    
    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Auto Registrations");
    
    // Add a color legend for years
    const legendWidth = 200;
    const legendHeight = 10;
    
    const minYear = d3.min(data, d => d.year);
    const maxYear = d3.max(data, d => d.year);
    
    const defs = svg.append("defs");
    
    const linearGradient = defs.append("linearGradient")
      .attr("id", "color-legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");
    
    for (let i = 0; i <= 10; i++) {
      const offset = i * 10 + "%";
      const year = minYear + (i / 10) * (maxYear - minYear);
      linearGradient.append("stop")
        .attr("offset", offset)
        .attr("stop-color", colorScale(year));
    }
    
    const legendX = (width - legendWidth) / 2;
    const legendY = height + 30;
    
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#color-legend-gradient)");
    
    svg.append("text")
      .attr("x", legendX)
      .attr("y", legendY + 25)
      .text(minYear);
    
    svg.append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY + 25)
      .attr("text-anchor", "end")
      .text(maxYear);
    
    svg.append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", legendY + 25)
      .attr("text-anchor", "middle")
      .text("Year");
    
  }, [housingData, vehicleData]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <svg ref={svgRef}></svg>
    </div>
  );
};

// Trend Comparison Chart: Housing vs Rent
const TrendComparisonChart = ({ housingData, rentData }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!housingData.length || !rentData.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Filter and prepare data for years where both datasets have values
    const years = intersection(
      housingData.map(d => d.Year),
      rentData.map(d => d.Year)
    );
    
    const data = years.map(year => {
      const housing = housingData.find(d => d.Year === year);
      const rent = rentData.find(d => d.Year === year);
      return {
        year,
        housingIndex: housing.Annual,
        rentIndex: rent.Annual
      };
    });
    
    // Set dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 60 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([
        Math.min(
          d3.min(data, d => d.housingIndex),
          d3.min(data, d => d.rentIndex)
        ) * 0.9,
        Math.max(
          d3.max(data, d => d.housingIndex),
          d3.max(data, d => d.rentIndex)
        ) * 1.1
      ])
      .range([height, 0]);
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
    
    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(yScale));
    
    // Add housing index line
    const housingLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.housingIndex));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", housingLine);
    
    // Add rent index line
    const rentLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.rentIndex));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "darkgreen")
      .attr("stroke-width", 2)
      .attr("d", rentLine);
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Housing Index vs Rent Index");
    
    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Year");
    
    // Add Y axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Index Value");
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 120}, 0)`);
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "steelblue");
    
    legend.append("text")
      .attr("x", 15)
      .attr("y", 10)
      .text("Housing Index");
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "darkgreen");
    
    legend.append("text")
      .attr("x", 15)
      .attr("y", 30)
      .text("Rent Index");
    
  }, [housingData, rentData]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <svg ref={svgRef}></svg>
    </div>
  );
};

// Vehicle Type Chart: Autos vs Motorcycles Over Time
const VehicleTypeChart = ({ vehicleData, activeState }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!vehicleData.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Filter data for the active state and sort by year
    const stateData = vehicleData
      .filter(d => d.state === activeState)
      .sort((a, b) => a.year - b.year);
    
    // Set dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleBand()
      .domain(stateData.map(d => d.year))
      .range([0, width])
      .padding(0.1);
    
    const yScale = d3.scaleLog()
      .domain([100, Math.max(...stateData.map(d => d.Auto)) * 1.1])
      .range([height, 0]);
    
    const y2Scale = d3.scaleLog()
      .domain([100, Math.max(...stateData.map(d => d.Motorcycle)) * 1.1])
      .range([height, 0]);
    
    // Create color scale
    const colorScale = d3.scaleOrdinal()
      .domain(['Auto', 'Motorcycle'])
      .range(['steelblue', 'orange']);
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Filter years to avoid overcrowding x-axis
    const yearsToShow = stateData
      .filter((_, i) => i % 5 === 0 || i === stateData.length - 1)
      .map(d => d.year);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickValues(yearsToShow)
        .tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");
    
    // Add Y axis for Auto
    svg.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => d3.format(".2s")(d)))
      .append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Auto Registrations (log)");
    
    // Add Y axis for Motorcycle
    svg.append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(y2Scale).tickFormat(d => d3.format(".2s")(d)))
      .append("text")
      .attr("fill", "black")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.right - 20)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .text("Motorcycle Registrations (log)");
    
    // Add Auto line
    const autoLine = d3.line()
      .x(d => xScale(d.year) + xScale.bandwidth() / 2)
      .y(d => yScale(d.Auto));
    
    svg.append("path")
      .datum(stateData)
      .attr("fill", "none")
      .attr("stroke", colorScale('Auto'))
      .attr("stroke-width", 2)
      .attr("d", autoLine);
    
    // Add Auto dots
    svg.selectAll(".auto-dot")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("class", "auto-dot")
      .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.Auto))
      .attr("r", 4)
      .attr("fill", colorScale('Auto'))
      .append("title")
      .text(d => `Year: ${d.year}\nAuto: ${d.Auto.toLocaleString()}`);
    
    // Add Motorcycle line
    const motorcycleLine = d3.line()
      .x(d => xScale(d.year) + xScale.bandwidth() / 2)
      .y(d => y2Scale(d.Motorcycle));
    
    svg.append("path")
      .datum(stateData)
      .attr("fill", "none")
      .attr("stroke", colorScale('Motorcycle'))
      .attr("stroke-width", 2)
      .attr("d", motorcycleLine);
    
    // Add Motorcycle dots
    svg.selectAll(".motorcycle-dot")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("class", "motorcycle-dot")
      .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("cy", d => y2Scale(d.Motorcycle))
      .attr("r", 4)
      .attr("fill", colorScale('Motorcycle'))
      .append("title")
      .text(d => `Year: ${d.year}\nMotorcycle: ${d.Motorcycle.toLocaleString()}`);
    
    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(`${activeState} Vehicle Registrations`);
    
    // Add X axis label
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .text("Year");
    
    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 120}, 0)`);
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScale('Auto'));
    
    legend.append("text")
      .attr("x", 15)
      .attr("y", 10)
      .text("Auto");
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", colorScale('Motorcycle'));
    
    legend.append("text")
      .attr("x", 15)
      .attr("y", 30)
      .text("Motorcycle");
    
  }, [vehicleData, activeState]);
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Dashboard;