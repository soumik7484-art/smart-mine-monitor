import React, { useState, useMemo } from 'react';
import FilterBar from '../components/ui/FilterBar';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';

const DEFAULT_INCIDENTS = [
  { id: 'INC-2024-089', date: '2026-08-31', time: '14:22', location: 'Zone B — Panel LW-102', event: 'Micro-seismic acoustic emission surge (54.8Hz)', risk: 'CRITICAL', action: 'Zone B evacuated; 3 miners detoured via Exit E1', status: 'Resolved' },
  { id: 'INC-2024-088', date: '2026-08-30', time: '09:15', location: 'Zone B — Cross-Cut J9', event: 'LVDT roof displacement exceeded 8.2mm', risk: 'HIGH', action: 'Hydraulic props reinforced; rate monitored', status: 'Resolved' },
  { id: 'INC-2024-087', date: '2026-08-28', time: '16:45', location: 'Zone C — Depillaring DP-4', event: 'Pillar hydraulic load transfer peak 22.4 MPa', risk: 'HIGH', action: 'Caving boundary inspection; goaf barricaded', status: 'Resolved' },
  { id: 'INC-2024-086', date: '2026-08-25', time: '11:10', location: 'Zone A — Main Incline J2', event: 'NDIR methane sensor drift (0.85% LEL)', risk: 'MEDIUM', action: 'Auxiliary ventilation fan speed increased', status: 'Resolved' },
  { id: 'INC-2024-085', date: '2026-08-22', time: '03:30', location: 'Zone D — Return Airway J13', event: 'Clinometer angular deviation 2.4° in rib', risk: 'MEDIUM', action: 'Roof bolting pattern densified (1.2m grid)', status: 'Resolved' },
  { id: 'INC-2024-084', date: '2026-08-18', time: '18:05', location: 'Zone B — Face Gallery J10', event: 'LoRaWAN node S-11 transmission latency spike', risk: 'LOW', action: 'Repeater gateway rebooted; signal restored', status: 'Resolved' },
  { id: 'INC-2024-083', date: '2026-08-14', time: '08:40', location: 'Zone A — Intake Shaft J1', event: 'Routine DGMS statutory quarterly strata audit', risk: 'LOW', action: 'All extensometer benchmarks verified nominal', status: 'Resolved' },
];

export default function IncidentHistory({ incidents = [] }) {
  const allIncidents = incidents.length > 0 ? incidents : DEFAULT_INCIDENTS;

  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const severityFilters = [
    { key: 'All', label: 'All Events', count: allIncidents.length },
    { key: 'CRITICAL', label: 'Critical', count: allIncidents.filter(i => (i.risk || '').toUpperCase() === 'CRITICAL').length },
    { key: 'HIGH', label: 'High', count: allIncidents.filter(i => (i.risk || '').toUpperCase() === 'HIGH').length },
    { key: 'MEDIUM', label: 'Medium', count: allIncidents.filter(i => (i.risk || '').toUpperCase() === 'MEDIUM').length },
    { key: 'LOW', label: 'Low', count: allIncidents.filter(i => (i.risk || '').toUpperCase() === 'LOW').length },
  ];

  const filteredIncidents = useMemo(() => {
    return allIncidents.filter((incident) => {
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
        const act = (incident.action || '').toLowerCase();
        if (!loc.includes(query) && !evt.includes(query) && !act.includes(query)) {
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
  }, [allIncidents, severityFilter, searchQuery, dateFrom, dateTo]);

  const columns = [
    { key: 'id', label: 'DGMS Event ID', render: (val) => <span className="font-mono font-bold text-mine-text-primary text-xs">{val}</span> },
    { key: 'date', label: 'Date', render: (val) => <span className="tabular-nums font-mono text-xs text-mine-text-secondary">{val}</span> },
    { key: 'time', label: 'Time', render: (val) => <span className="tabular-nums font-mono text-xs text-mine-text-secondary">{val}</span> },
    { key: 'location', label: 'Subsurface Location', render: (val) => <span className="font-semibold text-mine-text-primary">{val}</span> },
    { key: 'event', label: 'Observed Strata Anomaly / Hazard' },
    {
      key: 'risk',
      label: 'DGMS Severity',
      render: (value) => <StatusBadge status={value} />
    },
    { key: 'action', label: 'Statutory Mitigation Action Taken' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const valUpper = (value || '').toUpperCase();
        let colorClass = 'text-status-safe font-semibold';
        if (valUpper === 'ACTIVE') colorClass = 'text-status-critical font-bold';
        else if (valUpper === 'PENDING') colorClass = 'text-status-attention';
        
        return <span className={`text-xs ${colorClass}`}>{value}</span>;
      }
    }
  ];

  return (
    <div className="flex flex-col space-y-6 animate-fadeIn">
      <div className="page-header">
        <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary">
          DGMS Statutory Incident & Safety Audit Log
        </h1>
        <p className="text-xs text-mine-text-secondary mt-1">
          Historical record of safety events, sensor threshold violations, and emergency evacuation responses (DGMS Coal Mines Regulations Sec-44)
        </p>
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
              placeholder="Search location, hazard, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-mine-surface border border-mine-border rounded px-3 py-1.5 text-xs text-mine-text-primary placeholder:text-mine-text-secondary/60 focus:outline-none focus:border-status-attention/50 w-64"
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
          Showing <span className="tabular-nums font-medium text-mine-text-primary">{filteredIncidents.length}</span> of <span className="tabular-nums font-medium text-mine-text-primary">{allIncidents.length}</span> recorded statutory entries
        </div>
        
        <div className="card bg-mine-surface border border-mine-border rounded-md shadow-card overflow-hidden">
          <DataTable columns={columns} data={filteredIncidents} emptyMessage="No incidents match the selected criteria." />
        </div>
      </div>
    </div>
  );
}
