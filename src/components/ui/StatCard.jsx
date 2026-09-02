import React from 'react';

const StatCard = ({ label, value, subtitle, status, icon, trend, trendValue }) => {
  const statusUpper = (status || '').toUpperCase();

  let borderStyle = 'border-l-4 border-status-safe';
  let glowStyle = 'from-status-safe/5';
  let dotColor = 'bg-status-safe';

  if (statusUpper === 'CRITICAL') {
    borderStyle = 'border-l-4 border-status-critical shadow-red-500/10';
    glowStyle = 'from-status-critical/10';
    dotColor = 'bg-status-critical animate-ping';
  } else if (statusUpper === 'WARNING') {
    borderStyle = 'border-l-4 border-status-warning shadow-amber-500/10';
    glowStyle = 'from-status-warning/10';
    dotColor = 'bg-status-warning';
  } else if (statusUpper === 'ATTENTION') {
    borderStyle = 'border-l-4 border-status-attention shadow-orange-500/10';
    glowStyle = 'from-status-attention/10';
    dotColor = 'bg-status-attention';
  }

  return (
    <div
      className={`bg-mine-surface border border-mine-border rounded-lg shadow-card hover:shadow-card-hover transition-all duration-200 p-4 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br ${glowStyle} to-transparent ${borderStyle}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          <h3 className="text-[11px] uppercase tracking-wider font-semibold text-mine-text-secondary truncate">
            {label}
          </h3>
        </div>
        {icon && (
          <div className="text-mine-text-secondary opacity-70 p-1 rounded-md bg-mine-surface-alt/60">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2 my-0.5">
        <div className="text-2xl font-bold tabular-nums text-mine-text-primary tracking-tight">
          {value}
        </div>
        {trendValue && (
          <span
            className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full ${
              trend === 'up'
                ? 'text-status-warning bg-status-warning-bg'
                : trend === 'down'
                ? 'text-status-critical bg-status-critical-bg'
                : 'text-status-safe bg-status-safe-bg'
            }`}
          >
            {trendValue}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="text-[11px] text-mine-text-secondary mt-1 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};

export default StatCard;
