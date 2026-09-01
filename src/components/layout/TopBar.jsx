import React from 'react';

const TopBar = ({ lastSync, overallCondition, alertCount }) => {
  const syncTime = lastSync instanceof Date
    ? lastSync.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : lastSync || '--:--:--';

  return (
    <div className="h-14 w-full bg-mine-surface border-b border-mine-border flex items-center justify-between px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-mine-text-primary text-base">Chandrapur Deep Mine</h2>
        <div className={`px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 ${
          overallCondition === 'SAFE' ? 'bg-status-safe/10 text-status-safe border border-status-safe/20' :
          overallCondition === 'WARNING' ? 'bg-status-warning/10 text-status-warning border border-status-warning/20' :
          overallCondition === 'CRITICAL' ? 'bg-status-critical/10 text-status-critical border border-status-critical/20' :
          'bg-mine-surface-alt text-mine-text-secondary border border-mine-border'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            overallCondition === 'SAFE' ? 'bg-status-safe' :
            overallCondition === 'WARNING' ? 'bg-status-warning' :
            overallCondition === 'CRITICAL' ? 'bg-status-critical' :
            'bg-mine-text-secondary'
          }`}></div>
          {overallCondition || 'UNKNOWN'}
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xs text-mine-text-secondary">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span className="font-mono tabular-nums">{syncTime}</span>
        </div>
        
        <div className="relative cursor-pointer text-mine-text-secondary hover:text-mine-text-primary transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {alertCount > 0 && (
            <div className="absolute -top-1.5 -right-1.5 bg-status-critical text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center tabular-nums">
              {alertCount}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-mine-surface-alt border border-mine-border flex items-center justify-center text-xs font-semibold text-mine-text-primary">
            U
          </div>
          <span className="text-sm font-medium text-mine-text-primary hidden sm:block">User</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
