import { useState, useEffect } from 'react';
import Papa from 'papaparse';

/**
 * Custom hook for fetching and parsing CSV data
 * @param {string} url - The URL of the CSV file to fetch
 * @returns {Object} Object containing data, loading state, and error state
 */
function useCsvData(url) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }
            setData(results.data);
            setIsLoading(false);
          },
          error: (err) => {
            const fileName = url.split('/').pop();
            setError(`Failed to parse ${fileName}: ${err.message}`);
            setIsLoading(false);
          },
        });
      } catch (err) {
        const fileName = url.split('/').pop();
        setError(`Failed to load ${fileName}: ${err.message}`);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, isLoading, error };
}

export default useCsvData; 