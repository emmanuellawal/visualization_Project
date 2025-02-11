# Thirty Years of Change: Correlating Homelessness Trends with Shifts in the Cost of Living

## Overview

This project examines the relationship between homelessness trends and changes in the cost of living over the past three decades. By analyzing historical data from government sources—including homelessness counts and Consumer Price Index (CPI) figures—we aim to uncover correlations that highlight how economic pressures have influenced homelessness rates.

## Data Sources

### Cost of Living Data
- **Consumer Price Index (CPI-U):**  
  Data is sourced from the U.S. Bureau of Labor Statistics (BLS). Monthly CPI-U data for the U.S. city average is available in CSV format from the BLS data repository. These values can be aggregated into annual averages.
  - [BLS CPI Data Repository](https://www.bls.gov/cpi/data.htm)

### Homelessness Data
- **Annual Homeless Assessment Report (AHAR):**  
  Homelessness count data is available via datasets published on Data.gov and local government portals. These datasets provide annual Point-in-Time (PIT) counts and other key indicators.
  - [Data.gov: AHAR Datasets](https://catalog.data.gov/dataset/?q=homelessness&sort=views_recent+desc&groups=local&res_format=JSON&ext_location=&ext_bbox=&ext_prev_extent=&tags=homelessness)

## Features

- **Historical Analysis:**  
  Compute annual averages from monthly CPI data to track changes in the cost of living over the past 30 years.
  
- **Correlation Study:**  
  Merge the CPI data with annual homelessness data to explore the correlation between economic shifts and homelessness trends.
  
- **Interactive Visualizations:**  
  Build an interactive dashboard using React and charting libraries (such as D3.js or Chart.js) to allow users to explore the data trends dynamically.

## Project Structure

