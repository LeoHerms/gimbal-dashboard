import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GimbalData } from '../types';

interface GimbalChartProps {
  data: GimbalData[];
}

const GimbalChart: React.FC<GimbalChartProps> = ({ data }) => {
  // Format data for the chart - keep only last 50 points for performance
  const chartData = data.slice(-50).map((point, index) => ({
    time: index, // Simple index instead of timestamp for cleaner x-axis
    x: point.x,
    y: point.y,
    timestamp: point.timestamp
  }));

  return (
    <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
      <h3>Real-Time Movement</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            type="number"
            scale="linear"
            domain={['dataMin', 'dataMax']}
          />
          <YAxis domain={[0, 180]} />
          <Tooltip 
            formatter={(value, name) => [value, name === 'x' ? 'Yaw (X)' : 'Pitch (Y)']}
            labelFormatter={(label) => `Point ${label}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="x" 
            stroke="#8884d8" 
            name="Yaw (X)"
            strokeWidth={2}
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="y" 
            stroke="#82ca9d" 
            name="Pitch (Y)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GimbalChart;