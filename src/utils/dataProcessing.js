const normalizeValue = (value) => {
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const validateYear = (year) => {
  const parsed = parseInt(year);
  return !isNaN(parsed) && parsed >= 1990 && parsed <= 2024;
};

const cleanStateName = (state) => {
  if (!state) return 'All States';
  return state.replace(/\s*\(\d+\)$/, '').trim();
};

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

export const processVehicleData = (data, stateFilter = null) => {
  return calculateAverageByYear(data, stateFilter);
};

export const processHousingData = (data, stateFilter = null) => {
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

export const processRentData = (data, stateFilter = null) => {
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

export const combineDatasets = (vehicleData, housingData, rentData) => {
  const yearMap = new Map();
  
  vehicleData.forEach(row => {
    yearMap.set(row.year, { 
      registrations: row.registrations,
      state: cleanStateName(row.state)
    });
  });
  
  housingData.forEach(row => {
    if (yearMap.has(row.year)) {
      const entry = yearMap.get(row.year);
      entry.housingIndex = row.housingIndex;
      if (!entry.state || entry.state === 'All States') {
        entry.state = cleanStateName(row.state);
      }
    }
  });
  
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