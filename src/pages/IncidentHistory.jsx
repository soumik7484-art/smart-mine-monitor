import React, { useState, useMemo } from 'react';
import FilterBar from '../components/ui/FilterBar';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';

export default function IncidentHistory({ incidents = [] }) {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Filter by severity
      if (severityFilter !== 'All' && incident.risk !== severityFilter) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !(incident.location && incident.location.toLowerCase().includes(query)) &&
          !(incident.event && incident.event.toLowerCase().includes(query))
        ) {
          return false;
        }
      }

      // Filter by date
      if (dateFrom || dateTo) {
        const incidentDate = new Date(incident.date);
        if (dateFrom) {
          const from = new Date(dateFrom);
          if (incidentDate < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          if (incidentDate > to) return false;
        }
      }

      return true;
    });
  }, [incidents, severityFilter, searchQuery, dateFrom, dateTo]);

  const severityOptions = ['All', 'Critical', 'High', 'Medium', 'Low'];

  const columns = [
    { key: 'date', label: 'Date' },
    { key: 'time', label: 'Time' },
    { key: 'location', label: 'Location' },
    { key: 'event', label: 'Event' },
    {
      key: 'risk',
      label: 'Risk',
      render: (value) => {
        let status = 'safe';
        if (value === 'Critical') status = 'critical';
        else if (value === 'High') status = 'attention';
        else if (value === 'Medium') status = 'warning';
        return <StatusBadge status={status} label={value} />;
      }
    },
    { key: 'action', label: 'Action Taken' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        let colorClass = 'text-mine-text-primary';
        if (value === 'Resolved') colorClass = 'text-status-safe';
        else if (value === 'Active') colorClass = 'text-status-critical';
        else if (value === 'Pending') colorClass = 'text-status-attention';
        
        return <span className={`font-medium ${colorClass}`}>{value}</span>;
      }
    }
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6 bg-mine-bg">
      <div className="page-header">
        <h1 className="text-xl font-semibold text-mine-text-primary">Incident History</h1>
        <p className="text-sm text-mine-text-secondary page-subtitle">Historical record of safety events and interventions</p>
      </div>

      <div className="card bg-mine-surface border border-mine-border rounded-md shadow-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FilterBar
              options={severityOptions}
              activeFilter={severityFilter}
              onFilterChange={setSeverityFilter}
            />
            <input
              type="text"
              placeholder="Search location or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-mine-surface border border-mine-border rounded px-3 py-1.5 text-sm text-mine-text-primary placeholder:text-mine-text-secondary/60 focus:outline-none focus:border-status-attention/50 w-64"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="dateFrom" className="text-xs uppercase tracking-wider text-mine-text-secondary font-semibold">From</label>
              <input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-mine-surface border border-mine-border rounded px-2 py-1 text-sm text-mine-text-primary focus:outline-none focus:border-status-attention/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="dateTo" className="text-xs uppercase tracking-wider text-mine-text-secondary font-semibold">To</label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-mine-surface border border-mine-border rounded px-2 py-1 text-sm text-mine-text-primary focus:outline-none focus:border-status-attention/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-mine-text-secondary">
          Showing <span className="tabular-nums font-medium text-mine-text-primary">{filteredIncidents.length}</span> of <span className="tabular-nums font-medium text-mine-text-primary">{incidents.length}</span> incidents
        </div>
        
        {filteredIncidents.length > 0 ? (
          <div className="card bg-mine-surface border border-mine-border rounded-md shadow-card overflow-hidden">
            <DataTable columns={columns} data={filteredIncidents} />
          </div>
        ) : (
          <div className="card bg-mine-surface border border-mine-border rounded-md shadow-card p-8 text-center">
            <p className="text-sm text-mine-text-secondary">No incidents match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
