import React, { useState } from 'react';

const DataTable = ({ columns, data, onRowClick, emptyMessage = "No data available" }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data;
    
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-mine-surface border border-mine-border rounded-md p-8 text-center text-mine-text-secondary text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-mine-surface border border-mine-border rounded-md shadow-sm">
      <table className="w-full text-left border-collapse text-[13px]">
        <thead>
          <tr className="bg-mine-surface-alt border-b border-mine-border">
            {columns.map((col) => (
              <th 
                key={col.key}
                className={`py-2 px-4 text-xs uppercase tracking-wider font-semibold text-mine-text-secondary ${col.sortable !== false ? 'cursor-pointer hover:text-mine-text-primary select-none' : ''}`}
                onClick={() => col.sortable !== false && handleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable !== false && sortConfig.key === col.key && (
                    <span className="text-[10px]">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                  {col.sortable !== false && sortConfig.key !== col.key && (
                    <span className="text-[10px] opacity-20 hover:opacity-50">▲</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={`border-b border-mine-border last:border-b-0 hover:bg-mine-bg/50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick && onRowClick(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-2 px-4 text-mine-text-primary whitespace-nowrap">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
