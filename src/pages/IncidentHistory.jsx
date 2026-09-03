import React, { useState, useMemo } from 'react';
import { useMine } from '../context/MineContext';
import FilterBar from '../components/ui/FilterBar';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import {
  ClipboardList,
  ShieldAlert,
  RotateCcw,
  Radio,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export default function IncidentHistory() {
  const { incidentLog = [], resetIncidentLog } = useMine();

  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const liveEntriesCount = incidentLog.filter((i) => i.isLive).length;

  const severityFilters = [
    { key: 'All', label: 'All Events', count: incidentLog.length },
    { key: 'CRITICAL', label: 'Critical', count: incidentLog.filter(i => (i.risk || '').toUpperCase() === 'CRITICAL').length },
    { key: 'HIGH', label: 'High', count: incidentLog.filter(i => (i.risk || '').toUpperCase() === 'HIGH').length },
    { key: 'MEDIUM', label: 'Medium', count: incidentLog.filter(i => (i.risk || '').toUpperCase() === 'MEDIUM').length },
    { key: 'LOW', label: 'Low', count: incidentLog.filter(i => (i.risk || '').toUpperCase() === 'LOW').length },
  ];

  const filteredIncidents = useMemo(() => {
    return incidentLog.filter((incident) => {
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
        const id = (incident.id || '').toLowerCase();
        if (!loc.includes(query) && !evt.includes(query) && !act.includes(query) && !id.includes(query)) {
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
  }, [incidentLog, severityFilter, searchQuery, dateFrom, dateTo]);

  const columns = [
    {
      key: 'id',
      label: 'DGMS Event ID',
      render: (val, row) => (
        <div className="flex items-center gap-1.5">
          <span className="font-mono font-bold text-mine-text-primary text-xs">{val}</span>
          {row.isLive && (
            <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-status-attention/15 text-status-attention border border-status-attention/30 text-[9px] font-bold font-mono uppercase">
              Live Map
            </span>
          )}
        </div>
      ),
    },
    { key: 'date', label: 'Date', render: (val) => <span className="tabular-nums font-mono text-xs text-mine-text-secondary">{val}</span> },
    { key: 'time', label: 'Time', render: (val) => <span className="tabular-nums font-mono text-xs text-mine-text-secondary">{val}</span> },
    {
      key: 'location',
      label: 'Subsurface Location',
      render: (val) => (
        <div className="flex items-center gap-1.5 font-semibold text-mine-text-primary">
          <MapPin className="h-3 w-3 text-mine-text-secondary flex-shrink-0" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'event',
      label: 'Observed Strata Anomaly / Map Action',
      render: (val, row) => (
        <span className={row.isLive ? 'text-mine-text-primary font-medium' : 'text-mine-text-secondary'}>
          {val}
        </span>
      ),
    },
    {
      key: 'risk',
      label: 'DGMS Severity',
      render: (value) => <StatusBadge status={value} />,
    },
    { key: 'action', label: 'Statutory Mitigation Action Taken' },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const valUpper = (value || '').toUpperCase();
        let colorClass = 'text-status-safe font-semibold';
        if (valUpper === 'ACTIVE') colorClass = 'text-status-critical font-bold animate-pulse';
        else if (valUpper === 'PENDING') colorClass = 'text-status-attention font-semibold';
        
        return <span className={`text-xs ${colorClass}`}>{value}</span>;
      },
    },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary">
              DGMS Statutory Incident & Safety Audit Log
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-status-safe animate-pulse" />
              LIVE TELEMETRY SYNCED
            </span>
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Official immutable record of safety events, tunnel blockages, miner relocations & sensor threshold violations (DGMS Coal Mines Regulations Sec-44)
          </p>
        </div>

        {liveEntriesCount > 0 && (
          <button
            type="button"
            onClick={resetIncidentLog}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Baseline Log
          </button>
        )}
      </div>

      {/* Live Map Interaction Notice */}
      <div className="card p-3.5 bg-mine-surface border border-mine-border flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-mine-text-secondary">
          <Clock className="h-4 w-4 text-status-attention" />
          <span>
            Real-time audit active: <strong>{liveEntriesCount} live entries</strong> recorded from map interactions and sensor injections during this session.
          </span>
        </div>
        <span className="text-[11px] font-mono text-mine-text-secondary">
          All interactive changes on the 2D Mine Map write directly into this statutory ledger.
        </span>
      </div>

      {/* Filter and Search Bar */}
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
              placeholder="Search location, hazard, action, ID..."
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

      {/* Table Data */}
      <div className="space-y-2">
        <div className="text-xs text-mine-text-secondary">
          Showing <span className="tabular-nums font-medium text-mine-text-primary">{filteredIncidents.length}</span> of <span className="tabular-nums font-medium text-mine-text-primary">{incidentLog.length}</span> recorded statutory entries
        </div>
        
        <div className="card bg-mine-surface border border-mine-border rounded-md shadow-card overflow-hidden">
          <DataTable columns={columns} data={filteredIncidents} emptyMessage="No incidents match the selected criteria." />
        </div>
      </div>
    </div>
  );
}
