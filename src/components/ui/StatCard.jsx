import React from 'react';

const StatCard = ({ label, value, subtitle, status, icon }) => {
  const statusUpper = (status || '').toUpperCase();
  
  let borderLeftClass = '';
  if (statusUpper === 'SAFE') borderLeftClass = 'border-l-4 border-status-safe';
  else if (statusUpper === 'WARNING') borderLeftClass = 'border-l-4 border-status-warning';
  else if (statusUpper === 'CRITICAL') borderLeftClass = 'border-l-4 border-status-critical';
  else if (statusUpper === 'ATTENTION') borderLeftClass = 'border-l-4 border-status-attention';

  return (
    <div className={`bg-mine-surface border border-mine-border rounded-md shadow-sm p-4 flex flex-col ${borderLeftClass}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-mine-text-secondary">{label}</h3>
        {icon && (
          <div className="text-mine-text-secondary opacity-70">
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-semibold tabular-nums text-mine-text-primary mb-1">
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-mine-text-secondary">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
