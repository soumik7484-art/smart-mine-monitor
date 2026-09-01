import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-mine-surface border border-mine-border shadow-md rounded p-2 text-[13px]">
        <p className="text-mine-text-secondary text-xs mb-1 font-mono">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="font-semibold tabular-nums" style={{ color: entry.color || '#292722' }}>
            {entry.name || 'Value'}: {entry.value} {unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SensorChart = ({ data, dataKey = 'value', label, unit, color = '#292722', height = 200 }) => {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <h3 className="text-xs uppercase tracking-wider font-semibold text-mine-text-secondary mb-4">
          {label}
        </h3>
      )}
      <div style={{ height: height }} className="w-full">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#D8D3CA" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 11, fill: '#6F6A61', fontFamily: 'monospace' }} 
                stroke="#6F6A61"
                tickMargin={8}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: '#6F6A61', fontFamily: 'monospace' }} 
                stroke="#6F6A61"
                tickMargin={8}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip unit={unit} />} cursor={{ stroke: '#D8D3CA', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={color} 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 4, fill: color, stroke: '#FFFFFF', strokeWidth: 2 }}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center border border-dashed border-mine-border rounded bg-mine-surface-alt/50 text-mine-text-secondary text-sm">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorChart;
