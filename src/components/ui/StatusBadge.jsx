import React from 'react';

const StatusBadge = ({ status }) => {
  const statusUpper = (status || '').toUpperCase();
  
  let bgClass = 'bg-mine-surface-alt';
  let textClass = 'text-mine-text-secondary';
  let borderClass = 'border-mine-border';
  let dotClass = 'bg-mine-text-secondary';

  if (['SAFE', 'RESOLVED'].includes(statusUpper)) {
    bgClass = 'bg-status-safe/10';
    textClass = 'text-status-safe';
    borderClass = 'border-status-safe/20';
    dotClass = 'bg-status-safe';
  } else if (['WARNING', 'MONITORING', 'CAUTION'].includes(statusUpper)) {
    bgClass = 'bg-status-attention/10'; // using attention for amber/orange
    textClass = 'text-status-attention';
    borderClass = 'border-status-attention/20';
    dotClass = 'bg-status-attention';
  } else if (['HIGH', 'INVESTIGATING'].includes(statusUpper)) {
    bgClass = 'bg-status-warning/10';
    textClass = 'text-status-warning';
    borderClass = 'border-status-warning/20';
    dotClass = 'bg-status-warning';
  } else if (['CRITICAL', 'EVACUATING'].includes(statusUpper)) {
    bgClass = 'bg-status-critical/10';
    textClass = 'text-status-critical';
    borderClass = 'border-status-critical/20';
    dotClass = 'bg-status-critical';
  } else if (statusUpper === 'OFFLINE') {
    bgClass = 'bg-mine-surface-alt';
    textClass = 'text-mine-text-secondary';
    borderClass = 'border-mine-border';
    dotClass = 'bg-mine-text-secondary';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] uppercase tracking-wider font-semibold border ${bgClass} ${textClass} ${borderClass}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></div>
      {statusUpper}
    </div>
  );
};

export default StatusBadge;
