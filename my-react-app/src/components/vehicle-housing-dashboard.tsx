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
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-xl font-medium">Loading data...</div>
      </div>
    );
  }
  
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
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
    
    // Set dimensions with improved margins for better spacing
    const margin = { top: 60, right: 100, bottom: 90, left: 80 };
    const width = 550 - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;
    
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
    
    // Create SVG with dark theme
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "#333")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add grid lines for better readability
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);

    svg.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScaleLeft)
          .tickSize(-width)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);
    
    // Add X axis with improved spacing
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("dy", "1.5em")
      .attr("dx", "-0.8em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .style("fill", "white");
    
    // Style X axis line and ticks
    svg.selectAll(".domain")
      .style("stroke", "white");
    svg.selectAll("line")
      .style("stroke", "white");
    
    // Add Y axis left with improved font size
    svg.append("g")
      .call(d3.axisLeft(yScaleLeft))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "white");
    
    // Add Y axis right with improved font size
    svg.append("g")
      .attr("transform", `translate(${width},0)`)
      .call(d3.axisRight(yScaleRight))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "white");
    
    // Add housing index line
    const housingLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScaleLeft(d.housingIndex));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#4dabf7")
      .attr("stroke-width", 3)
      .attr("d", housingLine);
    
    // Add auto registrations line
    const autoLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScaleRight(d.autoRegistrations));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#ff6b6b")
      .attr("stroke-width", 3)
      .attr("d", autoLine);
    
    // Add title with improved spacing and size
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "22px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text("Housing Index vs Auto Registrations");
    
    // Add X axis label with improved spacing
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 25)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Year");
    
    // Add Y axis labels with improved spacing
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 30)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Housing Index");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right - 30)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Auto Registrations");
    
    // Add legend with improved spacing and font sizes
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 160}, 10)`);
    
    // Add background rectangle for better visibility
    legend.append("rect")
      .attr("x", -10)
      .attr("y", -5)
      .attr("width", 170)
      .attr("height", 75)
      .attr("fill", "#444")
      .attr("stroke", "#777")
      .attr("rx", 5);
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 10)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "#4dabf7");
    
    legend.append("text")
      .attr("x", 30)
      .attr("y", 25)
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Housing Index");
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 40)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "#ff6b6b");
    
    legend.append("text")
      .attr("x", 30)
      .attr("y", 55)
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Auto Registrations");
    
  }, [housingData, vehicleData]);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
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
    
    // Set dimensions with improved margins
    const margin = { top: 60, right: 40, bottom: 90, left: 80 };
    const width = 550 - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;
    
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
    
    // Create SVG with dark theme
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "#333")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add grid lines for better readability
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);

    svg.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);
    
    // Add X axis with improved spacing and font size
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("dy", "1.5em")
      .attr("dx", "-0.8em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .style("fill", "white");
    
    // Style X axis line and ticks
    svg.selectAll(".domain")
      .style("stroke", "white");
    svg.selectAll("line")
      .style("stroke", "white");
    
    // Add Y axis with improved font size
    svg.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "white");
    
    // Add scatter plots with improved size
    svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.housingIndex))
      .attr("cy", d => yScale(d.autoRegistrations))
      .attr("r", 9)
      .attr("fill", d => colorScale(d.year))
      .attr("opacity", 0.8)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .append("title")
      .text(d => `Year: ${d.year}\nHousing Index: ${d.housingIndex.toLocaleString()}\nAutos: ${d.autoRegistrations.toLocaleString()}`);
    
    // Add title with improved spacing and size
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "22px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text("Housing Index vs Auto Registrations");
    
    // Add X axis label with improved spacing
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Housing Index");
    
    // Add Y axis label with improved spacing
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 30)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Auto Registrations");
    
    // Add a color legend for years with improved spacing
    const legendWidth = 250;
    const legendHeight = 20;
    
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
    const legendY = height + 40;
    
    // Add background for legend
    svg.append("rect")
      .attr("x", legendX - 15)
      .attr("y", legendY - 5)
      .attr("width", legendWidth + 30)
      .attr("height", legendHeight + 35)
      .attr("fill", "#444")
      .attr("stroke", "#777")
      .attr("rx", 5);
    
    svg.append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#color-legend-gradient)");
    
    svg.append("text")
      .attr("x", legendX)
      .attr("y", legendY + legendHeight + 20)
      .style("font-size", "14px")
      .style("fill", "white")
      .text(minYear);
    
    svg.append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY + legendHeight + 20)
      .attr("text-anchor", "end")
      .style("font-size", "14px")
      .style("fill", "white")
      .text(maxYear);
    
    svg.append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", legendY + legendHeight + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Year");
    
  }, [housingData, vehicleData]);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
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
    
    // Set dimensions with improved margins
    const margin = { top: 60, right: 40, bottom: 90, left: 80 };
    const width = 550 - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;
    
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
    
    // Create SVG with dark theme
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "#333")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add grid lines for better readability
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);

    svg.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);
    
    // Add X axis with improved spacing
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("dy", "1.5em")
      .attr("dx", "-0.8em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .style("fill", "white");
    
    // Style X axis line and ticks
    svg.selectAll(".domain")
      .style("stroke", "white");
    svg.selectAll("line")
      .style("stroke", "white");
    
    // Add Y axis with improved font size
    svg.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "white");
    
    // Add housing index line
    const housingLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.housingIndex));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#4dabf7")
      .attr("stroke-width", 3)
      .attr("d", housingLine);
    
    // Add data points for housing
    svg.selectAll(".housing-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "housing-dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.housingIndex))
      .attr("r", 5)
      .attr("fill", "#4dabf7")
      .append("title")
      .text(d => `Year: ${d.year}\nHousing Index: ${d.housingIndex}`);
    
    // Add rent index line
    const rentLine = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.rentIndex));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#51cf66")
      .attr("stroke-width", 3)
      .attr("d", rentLine);
    
    // Add data points for rent
    svg.selectAll(".rent-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "rent-dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.rentIndex))
      .attr("r", 5)
      .attr("fill", "#51cf66")
      .append("title")
      .text(d => `Year: ${d.year}\nRent Index: ${d.rentIndex}`);
    
    // Add title with improved spacing and size
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "22px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text("Housing Index vs Rent Index");
    
    // Add X axis label with improved spacing
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Year");
    
    // Add Y axis label with improved spacing
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 30)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Index Value");
    
    // Add legend with improved spacing and visibility
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 160}, 10)`);
    
    // Add background rectangle for better visibility
    legend.append("rect")
      .attr("x", -10)
      .attr("y", -5)
      .attr("width", 170)
      .attr("height", 75)
      .attr("fill", "#444")
      .attr("stroke", "#777")
      .attr("rx", 5);
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 10)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "#4dabf7");
    
    legend.append("text")
      .attr("x", 30)
      .attr("y", 25)
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Housing Index");
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 40)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", "#51cf66");
    
    legend.append("text")
      .attr("x", 30)
      .attr("y", 55)
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Rent Index");
    
  }, [housingData, rentData]);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
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
    
    // Set dimensions with improved margins
    const margin = { top: 60, right: 100, bottom: 90, left: 90 };
    const width = 550 - margin.left - margin.right;
    const height = 380 - margin.top - margin.bottom;
    
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
      .range(['#4dabf7', '#ffa94d']);
    
    // Create SVG with dark theme
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("background", "#333")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add grid lines for better readability
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);

    svg.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);
    
    // Filter years to avoid overcrowding x-axis
    const yearsToShow = stateData
      .filter((_, i) => i % 5 === 0 || i === stateData.length - 1)
      .map(d => d.year);
    
    // Add X axis with improved spacing
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickValues(yearsToShow)
        .tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .attr("dy", "1.5em")
      .attr("dx", "-0.8em")
      .style("text-anchor", "end")
      .style("font-size", "14px")
      .style("fill", "white");
    
    // Style X axis line and ticks
    svg.selectAll(".domain")
      .style("stroke", "white");
    svg.selectAll("line")
      .style("stroke", "white");
    
    // Add Y axis for Auto with improved font size
    svg.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => d3.format(".2s")(d)))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "white");
    
    svg.append("text")
      .attr("fill", "white")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 35)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Auto Registrations (log)");
    
    // Add Y axis for Motorcycle with improved font size
    svg.append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(y2Scale).tickFormat(d => d3.format(".2s")(d)))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "white");
    
    svg.append("text")
      .attr("fill", "white")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right - 40)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Motorcycle Registrations (log)");
    
    // Add Auto line with improved width
    const autoLine = d3.line()
      .x(d => xScale(d.year) + xScale.bandwidth() / 2)
      .y(d => yScale(d.Auto));
    
    svg.append("path")
      .datum(stateData)
      .attr("fill", "none")
      .attr("stroke", colorScale('Auto'))
      .attr("stroke-width", 3)
      .attr("d", autoLine);
    
    // Add Auto dots with improved size
    svg.selectAll(".auto-dot")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("class", "auto-dot")
      .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.Auto))
      .attr("r", 6)
      .attr("fill", colorScale('Auto'))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .append("title")
      .text(d => `Year: ${d.year}\nAuto: ${d.Auto.toLocaleString()}`);
    
    // Add Motorcycle line with improved width
    const motorcycleLine = d3.line()
      .x(d => xScale(d.year) + xScale.bandwidth() / 2)
      .y(d => y2Scale(d.Motorcycle));
    
    svg.append("path")
      .datum(stateData)
      .attr("fill", "none")
      .attr("stroke", colorScale('Motorcycle'))
      .attr("stroke-width", 3)
      .attr("d", motorcycleLine);
    
    // Add Motorcycle dots with improved size
    svg.selectAll(".motorcycle-dot")
      .data(stateData)
      .enter()
      .append("circle")
      .attr("class", "motorcycle-dot")
      .attr("cx", d => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("cy", d => y2Scale(d.Motorcycle))
      .attr("r", 6)
      .attr("fill", colorScale('Motorcycle'))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .append("title")
      .text(d => `Year: ${d.year}\nMotorcycle: ${d.Motorcycle.toLocaleString()}`);
    
    // Add title with improved spacing and size
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "22px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text(`${activeState} Vehicle Registrations`);
    
    // Add X axis label with improved spacing
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Year");
    
    // Add legend with improved spacing and visibility
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 160}, 10)`);
    
    // Add background rectangle for better visibility
    legend.append("rect")
      .attr("x", -10)
      .attr("y", -5)
      .attr("width", 170)
      .attr("height", 75)
      .attr("fill", "#444")
      .attr("stroke", "#777")
      .attr("rx", 5);
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 10)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", colorScale('Auto'));
    
    legend.append("text")
      .attr("x", 30)
      .attr("y", 25)
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Auto");
    
    legend.append("rect")
      .attr("x", 0)
      .attr("y", 40)
      .attr("width", 20)
      .attr("height", 20)
      .attr("fill", colorScale('Motorcycle'));
    
    legend.append("text")
      .attr("x", 30)
      .attr("y", 55)
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Motorcycle");
    
  }, [vehicleData, activeState]);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default Dashboard;