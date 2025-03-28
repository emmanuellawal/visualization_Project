import React, { useEffect } from 'react';
import * as d3 from 'd3';

interface VehicleData {
  year: number;
  state: string;
  Auto: number;
  Motorcycle: number;
}

interface VehicleTypeProps {
  vehicleData: VehicleData[];
  activeState: string;
}

const VehicleTypeChart: React.FC<VehicleTypeProps> = ({ vehicleData, activeState }) => {
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
    const margin = { top: 60, right: 120, bottom: 140, left: 120 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create scales
    const xScale = d3.scaleBand<number>()
      .domain(stateData.map(d => d.year))
      .range([0, width])
      .padding(0.1);
    
    const yScale = d3.scaleLog()
      .domain([100000, Math.max(...stateData.map(d => d.Auto)) * 1.1])
      .range([height, 0]);
    
    const y2Scale = d3.scaleLog()
      .domain([100000, Math.max(...stateData.map(d => d.Motorcycle)) * 1.1])
      .range([height, 0]);
    
    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
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
          .tickFormat((_: number, __: number) => "")
      )
      .selectAll("line")
      .style("stroke", "#555")
      .style("stroke-opacity", 0.3);

    svg.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat((_: d3.NumberValue, __: number) => "")
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
        .tickFormat((d: number) => d.toString()))
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
      .call(d3.axisLeft(yScale)
        .tickValues([100000, 250000, 500000, 1000000, 2500000, 5000000, 7500000])
        .tickFormat((domainValue: d3.NumberValue, _: number) => {
          const value = domainValue.valueOf();
          if (value >= 1000000) {
            return d3.format(".1f")(value / 1000000) + "M";
          }
          return d3.format(",")(value);
        }))
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
      .text("Number of Auto Registrations");
    
    // Add Y axis for Motorcycle with improved font size
    svg.append("g")
      .attr("transform", `translate(${width}, 0)`)
      .call(d3.axisRight(y2Scale)
        .tickFormat((domainValue: d3.NumberValue, _: number) => {
          const value = domainValue.valueOf();
          return d3.format(".2s")(value);
        }))
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
      .text("Number of Motorcycle Registrations");
    
    // Add Auto line with improved width
    const autoLine = d3.line<VehicleData>()
      .x(d => (xScale(d.year) || 0) + xScale.bandwidth() / 2)
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
      .attr("cx", d => (xScale(d.year) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.Auto))
      .attr("r", 6)
      .attr("fill", colorScale('Auto'))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .append("title")
      .text(d => `Year: ${d.year}\nAuto: ${d.Auto.toLocaleString()} vehicles`);
    
    // Add Motorcycle line with improved width
    const motorcycleLine = d3.line<VehicleData>()
      .x(d => (xScale(d.year) || 0) + xScale.bandwidth() / 2)
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
      .attr("cx", d => (xScale(d.year) || 0) + xScale.bandwidth() / 2)
      .attr("cy", d => y2Scale(d.Motorcycle))
      .attr("r", 6)
      .attr("fill", colorScale('Motorcycle'))
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .append("title")
      .text(d => `Year: ${d.year}\nMotorcycle: ${d.Motorcycle.toLocaleString()} vehicles`);
    
    // Add title with improved spacing and size
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "22px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text(`${activeState} Vehicle Registrations (1994-2020)`);
    
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
      .attr("transform", `translate(${width/2 - 85}, ${height + 60})`);
    
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
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default VehicleTypeChart;