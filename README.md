# Three Decades of Mobility and Economics: Comparing Motor Vehicle Registration with Shifts in the Cost of Living

## Overview

This project investigates the relationship between trends in motor vehicle registration and changes in the cost of living over the past 30 years. This visualization addresses the question: Do areas with higher housing costs show different patterns of vehicle ownership? By merging historical data on annual motor vehicle registrations with economic indicators (such as the Consumer Price Index), this project aims to reveal how shifts in mobility and vehicle ownership relate to broader economic trends and living expenses.

## Data Sources

### Motor Vehicle Registration Data
- **Source:** U.S. Department of Transportation and state-level Departments of Motor Vehicles (DMVs) provide data on motor vehicle registrations.
- **Format:** Many datasets are available in machine‐readable formats (CSV or JSON).
- **Example:** The Federal Highway Administration (FHWA) publishes annual vehicle registration and travel statistics that can serve as a proxy for trends in vehicle ownership.

### Cost of Living Data
- **Source:** The U.S. Bureau of Labor Statistics (BLS) publishes the Consumer Price Index (CPI) for All Urban Consumers. In particular, the CPI for Rent of Primary Residence (or similar housing-related indices) can be used to gauge shifts in the cost of living.
- **Format:** Data can be downloaded in CSV or JSON format (e.g., via FRED at the Federal Reserve Bank of St. Louis).

## Features

- **Historical Analysis:**  
  Compute annual averages from monthly CPI data to track changes in the cost of living over the past 30 years.
  
- **Correlation Study:**  
  Merge the CPI data with annual motor vehicle registration data to explore the correlation between economic shifts and registration trends through an interactive line graph.
  
  - **Dual-Axis Line Graph:**  
  Plot two time series—annual motor vehicle registration counts on one y-axis and the cost of living index on the other—with the x-axis representing time (years). This layout facilitates direct visual comparison of trends.
  
- **Interactive Visualizations:**  
  Build an interactive dashboard using React and charting libraries (such as D3.js or Chart.js) to allow users to explore the data trends dynamically.

## Project Structure

