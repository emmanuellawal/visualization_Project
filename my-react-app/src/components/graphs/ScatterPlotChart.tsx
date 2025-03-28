import React, { useEffect } from 'react';
import * as d3 from 'd3';

interface ScatterPlotProps {
  housingData: any[];
  vehicleData: any[];
}

interface DataPoint {
  year: number;
  housingIndex: number;
  autoRegistrations: number;
}

const ScatterPlotChart: React.FC<ScatterPlotProps> = ({ housingData, vehicleData }) => {
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
      .domain([
        (d3.min(data, d => d.housingIndex) || 0) * 0.9,
        (d3.max(data, d => d.housingIndex) || 0) * 1.1
      ])
      .range([0, width]);
    
    const yScale = d3.scaleLinear()
      .domain([
        100000,
        (d3.max(data, d => d.autoRegistrations) || 0) * 1.1
      ])
      .range([height, 0]);
    
    // Create color scale based on year
    const minYear = d3.min(data, d => d.year) || 1994;
    const maxYear = d3.max(data, d => d.year) || 2020;
    const colorScale = d3.scaleSequential()
      .domain([minYear, maxYear])
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
          .tickFormat((_: d3.NumberValue, __: number) => "")
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
    
    // Add Y axis with improved font size and custom ticks
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
    
    // Add a color legend for years with improved spacing and position
    const legendWidth = 300;
    const legendHeight = 20;
    
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
    const legendY = height + 60;
    
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
      .text(minYear.toString());
    
    svg.append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY + legendHeight + 20)
      .attr("text-anchor", "end")
      .style("font-size", "14px")
      .style("fill", "white")
      .text(maxYear.toString());
    
    svg.append("text")
      .attr("x", legendX + legendWidth / 2)
      .attr("y", legendY + legendHeight + 20)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "white")
      .text("Year");
    
  }, [housingData, vehicleData]);
  
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default ScatterPlotChart; 