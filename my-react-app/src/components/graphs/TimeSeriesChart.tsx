import React, { useEffect } from 'react';
import * as d3 from 'd3';

interface TimeSeriesProps {
  housingData: any[];
  vehicleData: any[];
}

interface DataPoint {
  year: number;
  housingIndex: number;
  autoRegistrations: number;
}

const TimeSeriesChart: React.FC<TimeSeriesProps> = ({ housingData, vehicleData }) => {
  const svgRef = React.useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!housingData.length || !vehicleData.length) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Filter and prepare data
    const data: DataPoint[] = housingData.map(h => {
      const matchingVehicle = vehicleData.find(v => v.year === h.Year);
      return {
        year: h.Year,
        housingIndex: h.Annual,
        autoRegistrations: matchingVehicle ? matchingVehicle.Auto : null
      };
    }).filter(d => d.autoRegistrations !== null);
    
    // Set dimensions with improved margins
    const margin = { top: 60, right: 120, bottom: 140, left: 120 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleLinear()
      .domain([d3.min(data, d => d.year) || 0, d3.max(data, d => d.year) || 0])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.housingIndex) || 0])
      .range([height, 0]);
    
    const y2Scale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.autoRegistrations) || 0])
      .range([height, 0]);
    
    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(['Housing Index', 'Auto Registrations'])
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
          .tickFormat(() => "")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);

    svg.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat(() => "")
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
    
    // Add Y axis for Housing Index with improved font size and position
    svg.append("g")
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "white");
    
    svg.append("text")
      .attr("fill", "white")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 30)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Housing Index");
    
    // Add Y axis for Auto Registrations with improved font size and position
    svg.append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(y2Scale))
      .selectAll("text")
      .style("font-size", "14px")
      .style("fill", "white");
    
    svg.append("text")
      .attr("fill", "white")
      .attr("transform", "rotate(-90)")
      .attr("y", width + margin.right - 30)
      .attr("x", -height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Auto Registrations");
    
    // Add housing index line
    const housingLine = d3.line<DataPoint>()
      .x(d => xScale(d.year))
      .y(d => yScale(d.housingIndex));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colorScale('Housing Index'))
      .attr("stroke-width", 3)
      .attr("d", housingLine);
    
    // Add housing index dots
    svg.selectAll(".housing-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "housing-dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.housingIndex))
      .attr("r", 6)
      .attr("fill", colorScale('Housing Index'))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .append("title")
      .text(d => `Year: ${d.year}\nHousing Index: ${d.housingIndex.toLocaleString()}`);
    
    // Add auto registrations line
    const autoLine = d3.line<DataPoint>()
      .x(d => xScale(d.year))
      .y(d => y2Scale(d.autoRegistrations));
    
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colorScale('Auto Registrations'))
      .attr("stroke-width", 3)
      .attr("d", autoLine);
    
    // Add auto registrations dots
    svg.selectAll(".auto-dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "auto-dot")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => y2Scale(d.autoRegistrations))
      .attr("r", 6)
      .attr("fill", colorScale('Auto Registrations'))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .append("title")
      .text(d => `Year: ${d.year}\nAuto Registrations: ${d.autoRegistrations.toLocaleString()}`);
    
    // Add title with improved spacing and size
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "22px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text("Housing Index and Auto Registrations Over Time");
    
    // Add X axis label with improved spacing
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Year");
    
    // Add legend with improved spacing and visibility - moved below the graph
    const legend = svg.append("g")
      .attr("transform", `translate(${width/2 - 85}, ${height + 60})`); // Centered below the graph
    
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
      .attr("fill", colorScale('Housing Index'));
    
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
      .attr("fill", colorScale('Auto Registrations'));
    
    legend.append("text")
      .attr("x", 30)
      .attr("y", 55)
      .style("font-size", "14px")
      .style("fill", "white")
      .text("Auto Registrations");
    
  }, [housingData, vehicleData]);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TimeSeriesChart; 