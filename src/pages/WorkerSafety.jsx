import React, { useState } from 'react';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';

const WorkerSafety = ({ workers = [], emergencyState }) => {
  const [selectedWorker, setSelectedWorker] = useState(null);

  const workersUnderground = workers.length;
  const helmetsConnected = workers.filter(w => w.helmet === 'Connected').length;
  const safetyAlerts = workers.filter(w => w.risk !== 'Low').length;

  const columns = [
    { key: 'id', label: 'Worker ID' },
    { key: 'name', label: 'Name' },
    { key: 'zone', label: 'Zone' },
    { key: 'helmet', label: 'Helmet' },
    { 
      key: 'temperature', 
      label: 'Temp (°C)', 
      render: (val) => <span className="tabular-nums">{val?.toFixed(1)}</span>
    },
    { key: 'movement', label: 'Movement' },
    { key: 'connection', label: 'Connection' },
    { 
      key: 'risk', 
      label: 'Risk',
      render: (val) => {
        let colorClass = 'text-status-safe';
        if (val === 'Medium') colorClass = 'text-status-warning';
        if (val === 'High') colorClass = 'text-status-critical';
        return <span className={`font-semibold ${colorClass}`}>{val}</span>;
      }
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => <StatusBadge status={val} />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-mine-text-primary">Worker Safety</h1>
        <p className="text-mine-text-secondary text-sm mt-1">Underground personnel monitoring and helmet telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Workers Underground" value={workersUnderground} />
        <StatCard title="Helmets Connected" value={helmetsConnected} />
        <StatCard 
          title="Safety Alerts" 
          value={safetyAlerts} 
          valueClassName={safetyAlerts > 0 ? "text-status-critical" : "text-mine-text-primary"} 
        />
      </div>

      <div className="card">
        <DataTable 
          columns={columns}
          data={workers}
          onRowClick={(row) => setSelectedWorker(row)}
          selectedId={selectedWorker?.id}
        />
      </div>

      {selectedWorker && (
        <div className="card mt-6 border-l-4 border-l-status-attention">
          <div className="card-header flex justify-between items-center border-b border-mine-border pb-4">
            <div>
              <h3 className="font-semibold text-mine-text-primary text-lg">{selectedWorker.name} ({selectedWorker.id})</h3>
              <p className="text-mine-text-secondary text-sm">Zone: {selectedWorker.zone}</p>
            </div>
            <button 
              onClick={() => setSelectedWorker(null)}
              className="text-mine-text-secondary hover:text-mine-text-primary font-semibold text-sm"
            >
              Close
            </button>
          </div>
          <div className="card-body p-4 bg-mine-surface-alt">
            <h4 className="text-sm font-semibold text-mine-text-primary mb-4">Helmet Telemetry Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="block text-xs uppercase tracking-wider text-mine-text-secondary">Temperature</span>
                <span className="block text-sm font-medium tabular-nums">{selectedWorker.temperature}°C</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-mine-text-secondary">Humidity</span>
                <span className="block text-sm font-medium tabular-nums">{selectedWorker.humidity}%</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-mine-text-secondary">Movement</span>
                <span className="block text-sm font-medium">{selectedWorker.movement}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-mine-text-secondary">Location</span>
                <span className="block text-sm font-medium">{selectedWorker.zone}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-mine-text-secondary">Connection</span>
                <span className="block text-sm font-medium">{selectedWorker.connection}</span>
              </div>
              <div>
                <span className="block text-xs uppercase tracking-wider text-mine-text-secondary">Emergency Status</span>
                <span className={`block text-sm font-medium ${emergencyState || selectedWorker.status === 'EMERGENCY' ? 'text-status-critical' : 'text-status-safe'}`}>
                  {emergencyState || selectedWorker.status === 'EMERGENCY' ? 'ACTIVE ALERT' : 'Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerSafety;
