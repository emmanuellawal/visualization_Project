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
 * Validates if a year is within the expected range (1990-2024)
 * @param {string|number} year - The year to validate
 * @returns {boolean} True if year is valid, false otherwise
 */
const validateYear = (year) => {
  const parsed = parseInt(year);
  return !isNaN(parsed) && parsed >= 1990 && parsed <= 2024;
};

/**
 * Cleans state names by removing trailing numbers and whitespace
 * @param {string} state - The state name to clean
 * @returns {string} Cleaned state name or 'All States' if empty
 */
const cleanStateName = (state) => {
  if (!state) return 'All States';
  return state.replace(/\s*\(\d+\)$/, '').trim();
};

/**
 * Calculates average vehicle registrations by year for a given state
 * @param {Array<Object>} data - Raw vehicle data from CSV
 * @param {string|null} stateFilter - State to filter by, or null for all states
 * @returns {Array<Object>} Processed data with year, registrations, and state
 */
const calculateAverageByYear = (data, stateFilter = null) => {
  const yearMap = new Map();
  
  data.forEach(row => {
    const cleanedState = cleanStateName(row.state);
    if (!stateFilter || cleanedState === stateFilter) {
      const year = parseInt(row.year);
      if (validateYear(year)) {
        const auto = parseInt(row.Auto) || 0;
        const motorcycle = parseInt(row.Motorcycle) || 0;
        
        if (!yearMap.has(year)) {
          yearMap.set(year, { total: 0, count: 0 });
        }
        
        const entry = yearMap.get(year);
        entry.total += (auto + motorcycle);
        entry.count += 1;
      }
    }
  });
  
  return Array.from(yearMap.entries())
    .map(([year, data]) => ({
      year: year.toString(),
      registrations: Math.round(data.total / data.count),
      state: stateFilter || 'All States'
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
};

/**
 * Processes vehicle registration data, filtering by state if specified
 * @param {Array<Object>} data - Raw vehicle data from CSV
 * @param {string|null} stateFilter - State to filter by, or null for all states
 * @returns {Array<Object>} Processed data with year, registrations, and state
 */
export const processVehicleData = (data, stateFilter = null) => {
  if (!Array.isArray(data)) {
    console.warn('processVehicleData: Invalid data provided, expected array');
    return [];
  }
  
  return calculateAverageByYear(data, stateFilter);
};

/**
 * Processes housing data, filtering by state if specified
 * @param {Array<Object>} data - Raw housing data from CSV
 * @param {string|null} stateFilter - State to filter by, or null for all states
 * @returns {Array<Object>} Processed data with year, housingIndex, and state
 */
export const processHousingData = (data, stateFilter = null) => {
  if (!Array.isArray(data)) {
    console.warn('processHousingData: Invalid data provided, expected array');
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
      housingIndex: normalizeValue(row.Annual),
      state: cleanStateName(row.State)
    }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
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