import React, { useState } from 'react';
import FilterBar from '../components/ui/FilterBar';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import SensorChart from '../components/ui/SensorChart';

const SensorNetwork = ({ sensorData, selectedNode, setSelectedNode }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const nodes = sensorData?.nodes || [];

  const counts = {
    All: nodes.length,
    Safe: nodes.filter(n => n.status === 'SAFE').length,
    Warning: nodes.filter(n => n.status === 'WARNING').length,
    Critical: nodes.filter(n => n.status === 'CRITICAL' || n.status === 'HIGH').length,
    Offline: nodes.filter(n => n.status === 'OFFLINE').length,
  };

  const filteredNodes = nodes.filter(node => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Safe') return node.status === 'SAFE';
    if (activeFilter === 'Warning') return node.status === 'WARNING';
    if (activeFilter === 'Critical') return node.status === 'CRITICAL' || node.status === 'HIGH';
    if (activeFilter === 'Offline') return node.status === 'OFFLINE';
    return true;
  });

  const columns = [
    { key: 'id', label: 'Node' },
    { key: 'location', label: 'Location' },
    { 
      key: 'tilt', 
      label: 'Tilt (°)', 
      render: (val, row) => <span className={`tabular-nums ${val > 2 ? 'text-status-warning' : val > 5 ? 'text-status-critical' : ''}`}>{val?.toFixed(2)}</span> 
    },
    { 
      key: 'vibration', 
      label: 'Vibration (g)', 
      render: (val, row) => <span className={`tabular-nums ${val > 0.05 ? 'text-status-warning' : val > 0.1 ? 'text-status-critical' : ''}`}>{val?.toFixed(3)}</span> 
    },
    { 
      key: 'displacement', 
      label: 'Displacement (mm)', 
      render: (val, row) => <span className={`tabular-nums ${val > 1 ? 'text-status-warning' : val > 3 ? 'text-status-critical' : ''}`}>{val?.toFixed(2)}</span> 
    },
    { 
      key: 'temperature', 
      label: 'Temperature (°C)', 
      render: (val, row) => <span className={`tabular-nums ${val > 35 ? 'text-status-warning' : val > 45 ? 'text-status-critical' : ''}`}>{val?.toFixed(1)}</span> 
    },
    { key: 'gas', label: 'Gas', render: (val, row) => `${val} (${row.gasValue?.toFixed(2)})` },
    { key: 'battery', label: 'Battery (%)', render: (val) => <span className="tabular-nums">{val}</span> },
    { key: 'signal', label: 'Signal', render: (val) => <span className="tabular-nums">{val}</span> },
    { 
      key: 'status', 
      label: 'Status', 
      render: (val) => <StatusBadge status={val} /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-mine-text-primary">Sensor Network</h1>
        <p className="text-mine-text-secondary text-sm mt-1">Detailed monitoring of all sensor nodes</p>
      </div>

      <FilterBar 
        filters={Object.keys(counts).map(key => ({
          id: key,
          label: key,
          count: counts[key]
        }))}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <div className="card">
        <DataTable 
          columns={columns}
          data={filteredNodes}
          onRowClick={(row) => setSelectedNode(row)}
          selectedId={selectedNode?.id}
        />
      </div>

      {selectedNode && (
        <div className="card mt-6">
          <div className="card-header flex justify-between items-center border-b border-mine-border pb-4">
            <div>
              <h3 className="font-semibold text-mine-text-primary text-lg">{selectedNode.id}</h3>
              <p className="text-mine-text-secondary text-sm">{selectedNode.location}</p>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-mine-text-secondary hover:text-mine-text-primary font-semibold text-sm"
            >
              Close
            </button>
          </div>
          <div className="card-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="bg-mine-surface-alt p-3 rounded border border-mine-border">
              <h4 className="text-xs uppercase tracking-wider text-mine-text-secondary mb-2">Displacement</h4>
              <SensorChart data={selectedNode.history || []} dataKey="displacement" color="#C4820E" height={60} />
            </div>
            <div className="bg-mine-surface-alt p-3 rounded border border-mine-border">
              <h4 className="text-xs uppercase tracking-wider text-mine-text-secondary mb-2">Tilt</h4>
              <SensorChart data={selectedNode.history || []} dataKey="tilt" color="#2D8A4E" height={60} />
            </div>
            <div className="bg-mine-surface-alt p-3 rounded border border-mine-border">
              <h4 className="text-xs uppercase tracking-wider text-mine-text-secondary mb-2">Vibration</h4>
              <SensorChart data={selectedNode.history || []} dataKey="vibration" color="#C4362E" height={60} />
            </div>
            <div className="bg-mine-surface-alt p-3 rounded border border-mine-border">
              <h4 className="text-xs uppercase tracking-wider text-mine-text-secondary mb-2">Temperature</h4>
              <SensorChart data={selectedNode.history || []} dataKey="temperature" color="#D97706" height={60} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorNetwork;
