import React, { useEffect } from 'react';
import * as d3 from 'd3';
import intersection from 'lodash/intersection';

interface TrendComparisonProps {
  housingData: any[];
  rentData: any[];
}

const TrendComparisonChart: React.FC<TrendComparisonProps> = ({ housingData, rentData }) => {
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
    const margin = { top: 60, right: 120, bottom: 140, left: 120 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
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
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full">
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default TrendComparisonChart; 