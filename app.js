// app.js - Core component
import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import LineChartComponent from "./chart/LineChartComponent";
import "./app.css";

const app = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const motorVehicleData = await fetch("/Motor_Vehicle_Registrations_Dashboard_data.csv");
        const housingData = await fetch("/housing.csv");
        const rentData = await fetch("/rent_primeR.csv");

        const motorVehicleText = await motorVehicleData.text();
        const housingText = await housingData.text();
        const rentText = await rentData.text();

        const motorVehicleParsed = Papa.parse(motorVehicleText, { header: true, skipEmptyLines: true }).data;
        const housingParsed = Papa.parse(housingText, { header: true, skipEmptyLines: true }).data;
        const rentParsed = Papa.parse(rentText, { header: true, skipEmptyLines: true }).data;

        // Merging the datasets based on available year field
        const mergedData = motorVehicleParsed.map((entry) => {
          const year = entry.year;
          return {
            year: Number(year),
            vehicleRegistrations: Number(entry.vehicleRegistrations || 0),
            housingIndex: Number(housingParsed.find((h) => h.year === year)?.housingIndex || 0),
            rentIndex: Number(rentParsed.find((r) => r.year === year)?.rentIndex || 0),
          };
        });

        setData(mergedData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="app-container">
      <h1>Motor Vehicle Registrations vs Housing and Rent Costs</h1>
      <LineChartComponent data={data} />
    </div>
  );
};

export default app;