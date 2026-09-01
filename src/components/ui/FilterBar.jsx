import React from 'react';

const FilterBar = ({ filters, activeFilter, onFilterChange }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        return (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors border ${
              isActive 
                ? 'bg-mine-text-primary text-white border-mine-text-primary shadow-sm' 
                : 'bg-mine-surface border-mine-border text-mine-text-secondary hover:bg-mine-surface-alt hover:text-mine-text-primary'
            }`}
          >
            {filter.label}
            {filter.count !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums leading-none ${
                isActive ? 'bg-white/20 text-white' : 'bg-mine-bg text-mine-text-secondary'
              }`}>
                {filter.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterBar;
