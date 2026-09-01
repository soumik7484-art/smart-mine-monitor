import React from 'react';

const FilterBar = ({ filters = [], options, activeFilter, onFilterChange }) => {
  // Normalize items whether passed as filters (objects) or options (strings/objects)
  const rawList = filters.length > 0 ? filters : (options || []);
  const normalizedList = rawList.map(item => {
    if (typeof item === 'string') {
      return { key: item, label: item };
    }
    return item;
  });

  return (
    <div className="flex flex-wrap gap-2">
      {normalizedList.map((filter) => {
        const isActive = String(activeFilter).toUpperCase() === String(filter.key).toUpperCase();
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onFilterChange && onFilterChange(filter.key)}
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
