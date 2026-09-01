import React, { useState, useMemo } from 'react';
import FilterBar from '../components/ui/FilterBar';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';

export default function IncidentHistory({ incidents = [] }) {
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const severityFilters = [
    { key: 'All', label: 'All', count: incidents.length },
    { key: 'CRITICAL', label: 'Critical', count: incidents.filter(i => (i.risk || '').toUpperCase() === 'CRITICAL').length },
    { key: 'HIGH', label: 'High', count: incidents.filter(i => (i.risk || '').toUpperCase() === 'HIGH').length },
    { key: 'MEDIUM', label: 'Medium', count: incidents.filter(i => (i.risk || '').toUpperCase() === 'MEDIUM').length },
    { key: 'LOW', label: 'Low', count: incidents.filter(i => (i.risk || '').toUpperCase() === 'LOW').length },
  ];

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      // Filter by severity
      if (severityFilter !== 'All') {
        if ((incident.risk || '').toUpperCase() !== severityFilter.toUpperCase()) {
          return false;
        }
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const loc = (incident.location || '').toLowerCase();
        const evt = (incident.event || '').toLowerCase();
        if (!loc.includes(query) && !evt.includes(query)) {
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

  const columns = [
    { key: 'date', label: 'Date', render: (val) => <span className="tabular-nums font-mono text-xs">{val}</span> },
    { key: 'time', label: 'Time', render: (val) => <span className="tabular-nums font-mono text-xs">{val}</span> },
    { key: 'location', label: 'Location', render: (val) => <span className="font-semibold text-mine-text-primary">{val}</span> },
    { key: 'event', label: 'Event' },
    {
      key: 'risk',
      label: 'Risk',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'action', label: 'Action Taken' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const valUpper = (value || '').toUpperCase();
        let colorClass = 'text-mine-text-primary';
        if (valUpper === 'RESOLVED') colorClass = 'text-status-safe';
        else if (valUpper === 'ACTIVE') colorClass = 'text-status-critical font-semibold';
        else if (valUpper === 'PENDING') colorClass = 'text-status-attention';
        
        return <span className={`text-xs ${colorClass}`}>{value}</span>;
      }
    }
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="page-header">
        <h1 className="text-xl font-semibold text-mine-text-primary">Incident History</h1>
        <p className="text-sm text-mine-text-secondary page-subtitle">Historical record of safety events, sensor threshold violations, and emergency responses</p>
      </div>

      <div className="card bg-mine-surface border border-mine-border rounded-md shadow-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <FilterBar
              filters={severityFilters}
              activeFilter={severityFilter}
              onFilterChange={setSeverityFilter}
            />
            <input
              type="text"
              placeholder="Search location or event..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-mine-surface border border-mine-border rounded px-3 py-1.5 text-xs text-mine-text-primary placeholder:text-mine-text-secondary/60 focus:outline-none focus:border-status-attention/50 w-56"
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
                className="bg-mine-surface border border-mine-border rounded px-2 py-1 text-xs text-mine-text-primary focus:outline-none focus:border-status-attention/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="dateTo" className="text-xs uppercase tracking-wider text-mine-text-secondary font-semibold">To</label>
              <input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-mine-surface border border-mine-border rounded px-2 py-1 text-xs text-mine-text-primary focus:outline-none focus:border-status-attention/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-mine-text-secondary">
          Showing <span className="tabular-nums font-medium text-mine-text-primary">{filteredIncidents.length}</span> of <span className="tabular-nums font-medium text-mine-text-primary">{incidents.length}</span> recorded incidents
        </div>
        
        <div className="card bg-mine-surface border border-mine-border rounded-md shadow-card overflow-hidden">
          <DataTable columns={columns} data={filteredIncidents} emptyMessage="No incidents match the selected filters." />
        </div>
      </div>
    </div>
  );
}
