/**
 * Normalizes a value by parsing it as a float, returning 0 if invalid
 * @param {string|number} value - The value to normalize
 * @returns {number} Normalized value or 0 if invalid
 */
const normalizeValue = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Validates if a year is within the expected range (2000-2025)
 * @param {string|number} year - The year to validate
 * @returns {boolean} True if year is valid, false otherwise
 */
const validateYear = (year) => {
  const parsed = parseInt(year);
  return !isNaN(parsed) && parsed >= 2000 && parsed <= 2025;
};

/**
 * Gets generation color for charts
 * @param {string} generation - The generation name
 * @returns {string} Hex color code
 */
const getGenerationColor = (generation) => {
  const colors = {
    'Gen Z': '#10f0a6',
    'Millennials': '#ff6b35', 
    'Gen X': '#4ecdc4',
    'Boomers': '#9b59b6'
  };
  return colors[generation] || '#8b5cf6';
};

/**
 * Processes employment data by generation
 * @param {Array<Object>} data - Raw employment data from CSV
 * @param {string|null} generationFilter - Generation to filter by, or null for all
 * @returns {Array<Object>} Processed data with year, unemployment rate, and generation
 */
export const processEmploymentData = (data, generationFilter = null) => {
  if (!Array.isArray(data)) {
    console.warn('processEmploymentData: Invalid data provided, expected array');
    return [];
  }

  return data
    .filter(row => {
      const year = parseInt(row.Year);
      return validateYear(year) && (!generationFilter || row.Generation === generationFilter);
    })
    .map(row => ({
      year: parseInt(row.Year),
      generation: row.Generation,
      unemploymentRate: normalizeValue(row.Unemployment_Rate),
      laborForceParticipation: normalizeValue(row.Labor_Force_Participation_Rate),
      laborForce: normalizeValue(row.Labor_Force),
      employed: normalizeValue(row.Employed),
      unemployed: normalizeValue(row.Unemployed),
      color: getGenerationColor(row.Generation)
    }))
    .sort((a, b) => a.year - b.year);
};

/**
 * Processes earnings data by generation
 * @param {Array<Object>} data - Raw earnings data from CSV
 * @param {string|null} generationFilter - Generation to filter by, or null for all
 * @returns {Array<Object>} Processed data with year, earnings, and generation
 */
export const processEarningsData = (data, generationFilter = null) => {
  if (!Array.isArray(data)) {
    console.warn('processEarningsData: Invalid data provided, expected array');
    return [];
  }

  return data
    .filter(row => {
      const year = parseInt(row.Year);
      return validateYear(year) && (!generationFilter || row.Generation === generationFilter);
    })
    .map(row => ({
      year: parseInt(row.Year),
      generation: row.Generation,
      medianWeeklyEarnings: normalizeValue(row.Median_Weekly_Earnings),
      realEarnings2023: normalizeValue(row.Real_Earnings_2023_Dollars),
      annualGrowthRate: normalizeValue(row.Annual_Growth_Rate),
      color: getGenerationColor(row.Generation)
    }))
    .sort((a, b) => a.year - b.year);
};

/**
 * Processes industry employment data by generation
 * @param {Array<Object>} data - Raw industry data from CSV
 * @param {string|null} generationFilter - Generation to filter by, or null for all
 * @returns {Array<Object>} Processed data with industry, employment share, and generation
 */
export const processIndustryData = (data, generationFilter = null) => {
  if (!Array.isArray(data)) {
    console.warn('processIndustryData: Invalid data provided, expected array');
    return [];
  }

  return data
    .filter(row => !generationFilter || row.Generation === generationFilter)
    .map(row => ({
      generation: row.Generation,
      industry: row.Industry,
      employmentShare: normalizeValue(row.Employment_Share),
      jobTypeCategory: row.Job_Type_Category,
      color: getGenerationColor(row.Generation)
    }))
    .sort((a, b) => b.employmentShare - a.employmentShare);
};

/**
 * Combines employment and earnings datasets for comprehensive generation analysis
 * @param {Array<Object>} employmentData - Processed employment data
 * @param {Array<Object>} earningsData - Processed earnings data
 * @returns {Array<Object>} Combined dataset with employment and earnings indicators
 */
export const combineGenerationDatasets = (employmentData, earningsData) => {
  if (!Array.isArray(employmentData) || !Array.isArray(earningsData)) {
    console.warn('combineGenerationDatasets: Invalid data provided, expected arrays');
    return [];
  }

  const combinedMap = new Map();
  
  // Add employment data
  employmentData.forEach(row => {
    const key = `${row.year}-${row.generation}`;
    combinedMap.set(key, { 
      year: row.year,
      generation: row.generation,
      unemploymentRate: row.unemploymentRate,
      laborForceParticipation: row.laborForceParticipation,
      laborForce: row.laborForce,
      employed: row.employed,
      unemployed: row.unemployed,
      color: row.color
    });
  });
  
  // Add earnings data
  earningsData.forEach(row => {
    const key = `${row.year}-${row.generation}`;
    if (combinedMap.has(key)) {
      const existing = combinedMap.get(key);
      existing.medianWeeklyEarnings = row.medianWeeklyEarnings;
      existing.realEarnings2023 = row.realEarnings2023;
      existing.annualGrowthRate = row.annualGrowthRate;
    }
  });
  
  return Array.from(combinedMap.values())
    .filter(row => row.unemploymentRate !== undefined && row.medianWeeklyEarnings !== undefined)
    .sort((a, b) => a.year - b.year || a.generation.localeCompare(b.generation));
};

/**
 * Calculates generation comparison metrics
 * @param {Array<Object>} data - Combined generation data
 * @returns {Object} Comparison statistics by generation
 */
export const calculateGenerationMetrics = (data) => {
  if (!Array.isArray(data)) {
    console.warn('calculateGenerationMetrics: Invalid data provided, expected array');
    return {};
  }

  const metrics = {};
  const generations = ['Gen Z', 'Millennials', 'Gen X', 'Boomers'];
  
  generations.forEach(generation => {
    const genData = data.filter(row => row.generation === generation);
    if (genData.length === 0) return;
    
    // Calculate averages
    const avgUnemployment = genData.reduce((sum, row) => sum + row.unemploymentRate, 0) / genData.length;
    const avgEarnings = genData.reduce((sum, row) => sum + (row.medianWeeklyEarnings || 0), 0) / genData.length;
    const avgParticipation = genData.reduce((sum, row) => sum + row.laborForceParticipation, 0) / genData.length;
    
    // Calculate trends (2023 vs earliest available year)
    const sortedData = genData.sort((a, b) => a.year - b.year);
    const firstYear = sortedData[0];
    const lastYear = sortedData[sortedData.length - 1];
    
    metrics[generation] = {
      averageUnemploymentRate: Math.round(avgUnemployment * 10) / 10,
      averageWeeklyEarnings: Math.round(avgEarnings),
      averageLaborParticipation: Math.round(avgParticipation * 10) / 10,
      unemploymentTrend: lastYear.unemploymentRate - firstYear.unemploymentRate,
      earningsTrend: (lastYear.medianWeeklyEarnings || 0) - (firstYear.medianWeeklyEarnings || 0),
      participationTrend: lastYear.laborForceParticipation - firstYear.laborForceParticipation,
      color: getGenerationColor(generation),
      totalDataPoints: genData.length
    };
  });
  
  return metrics;
};

/**
 * Processes rent data, filtering by state if specified
 * @param {Array<Object>} data - Raw rent data from CSV
 * @param {string|null} stateFilter - State to filter by, or null for all states
 * @returns {Array<Object>} Processed data with year, rentIndex, and state
 */
export const processRentData = (data, stateFilter = null) => {
  if (!Array.isArray(data)) {
    console.warn('processRentData: Invalid data provided, expected array');
    return [];
  }

  return data
    .filter(row => {
      const year = parseInt(row.Year);
      const cleanedState = cleanStateName(row.State);
      return validateYear(year) && (!stateFilter || cleanedState === stateFilter);
    })
    .map(row => ({
      year: row.Year.toString(),
      rentIndex: normalizeValue(row.Annual),
      state: cleanStateName(row.State)
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
};

/**
 * Combines vehicle, housing, and rent datasets into a single dataset
 * Filters out incomplete rows and sorts by year
 * @param {Array<Object>} vehicleData - Processed vehicle data
 * @param {Array<Object>} housingData - Processed housing data
 * @param {Array<Object>} rentData - Processed rent data
 * @returns {Array<Object>} Combined dataset with all indicators
 */
export const combineDatasets = (vehicleData, housingData, rentData) => {
  if (!Array.isArray(vehicleData) || !Array.isArray(housingData) || !Array.isArray(rentData)) {
    console.warn('combineDatasets: Invalid data provided, expected arrays');
    return [];
  }

  const yearMap = new Map();
  
  // Add vehicle data
  vehicleData.forEach(row => {
    yearMap.set(row.year, { 
      registrations: row.registrations,
      state: cleanStateName(row.state)
    });
  });
  
  // Add housing data
  housingData.forEach(row => {
    if (yearMap.has(row.year)) {
      const entry = yearMap.get(row.year);
      entry.housingIndex = row.housingIndex;
      if (!entry.state || entry.state === 'All States') {
        entry.state = cleanStateName(row.state);
      }
    }
  });
  
  // Add rent data
  rentData.forEach(row => {
    if (yearMap.has(row.year)) {
      const entry = yearMap.get(row.year);
      entry.rentIndex = row.rentIndex;
      if (!entry.state || entry.state === 'All States') {
        entry.state = cleanStateName(row.state);
      }
    }
  });
  
  return Array.from(yearMap.entries())
    .map(([year, data]) => ({
      year,
      ...data
    }))
    .filter(row => row.registrations && row.housingIndex && row.rentIndex)
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
}; 