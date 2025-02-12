// chart/LineChartComponent.js - Visualization Component
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const LineChartComponent = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis yAxisId="left" label={{ value: "Vehicle Registrations", angle: -90, position: "insideLeft" }} />
        <YAxis yAxisId="right" orientation="right" label={{ value: "Cost Indices", angle: 90, position: "insideRight" }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="vehicleRegistrations" stroke="#8884d8" yAxisId="left" name="Vehicle Registrations" />
        <Line type="monotone" dataKey="housingIndex" stroke="#82ca9d" yAxisId="right" name="Housing Index" />
        <Line type="monotone" dataKey="rentIndex" stroke="#ff7300" yAxisId="right" name="Rent Index" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineChartComponent;