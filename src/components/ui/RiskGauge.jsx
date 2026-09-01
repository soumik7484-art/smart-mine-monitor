import React from 'react';

const RiskGauge = ({ value, maxValue = 100, label, showLabel = true }) => {
  const numValue = Number(value) || 0;
  const percentage = Math.min(100, Math.max(0, (numValue / maxValue) * 100));
  
  let colorClass = 'bg-status-safe';
  let statusLabel = 'SAFE';
  let textColorClass = 'text-status-safe';
  
  if (percentage > 80) {
    colorClass = 'bg-status-critical';
    statusLabel = 'CRITICAL';
    textColorClass = 'text-status-critical';
  } else if (percentage > 65) {
    colorClass = 'bg-status-warning';
    statusLabel = 'HIGH';
    textColorClass = 'text-status-warning';
  } else if (percentage > 40) {
    colorClass = 'bg-status-attention';
    statusLabel = 'MODERATE';
    textColorClass = 'text-status-attention';
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-end">
        {showLabel && label && (
          <div className="text-xs font-semibold uppercase tracking-wider text-mine-text-secondary">
            {label}
          </div>
        )}
        <div className="text-2xl font-semibold tabular-nums text-mine-text-primary leading-none">
          {numValue}<span className="text-sm text-mine-text-secondary font-normal">/{maxValue}</span>
        </div>
      </div>
      
      <div className="h-2 w-full bg-mine-surface-alt rounded-full overflow-hidden relative border border-mine-border/50">
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      <div className={`text-[10px] font-bold uppercase tracking-wider ${textColorClass} self-end`}>
        {statusLabel}
      </div>
    </div>
  );
};

export default RiskGauge;
