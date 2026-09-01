import React from 'react';
import EmergencyBanner from '../components/emergency/EmergencyBanner';
import EvacuationDetails from '../components/emergency/EvacuationDetails';
import MineMap from '../components/mine-map/MineMap';

export default function Emergency({
  emergencyState,
  sensorData,
  workers,
  mineLayout,
  selectedNode,
  setSelectedNode,
  triggerEmergency,
  resetEmergency
}) {
  const isActive = emergencyState?.isActive;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6 bg-mine-bg">
      <div className="page-header">
        <h1 className="text-xl font-semibold text-mine-text-primary">Emergency Center</h1>
        <p className="text-sm text-mine-text-secondary page-subtitle">Emergency response and evacuation management</p>
      </div>

      <EmergencyBanner emergencyState={emergencyState} />

      {!isActive ? (
        <div className="card bg-mine-surface border border-mine-border rounded-md shadow-card p-6">
          <h2 className="text-lg font-semibold text-mine-text-primary mb-2">Emergency Simulation</h2>
          <p className="text-sm text-mine-text-secondary mb-6">
            Trigger a simulated emergency to demonstrate the evacuation system. This will simulate ground instability in Section B-03.
          </p>
          <div className="flex items-center space-x-4">
            <button
              onClick={triggerEmergency}
              className="bg-status-attention text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Simulation
            </button>
            <span className="text-xs text-mine-text-secondary">You can also use Ctrl+Shift+E to toggle the simulation.</span>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <EvacuationDetails emergencyState={emergencyState} />
            </div>
            <div className="lg:col-span-2">
              <div className="card bg-mine-surface border border-mine-border rounded-md shadow-card overflow-hidden h-[500px] flex flex-col">
                <div className="card-header border-b border-mine-border p-3 bg-mine-surface-alt">
                  <h2 className="text-sm font-semibold text-mine-text-primary uppercase tracking-wider">Evacuation Map</h2>
                </div>
                <div className="card-body flex-1 relative bg-mine-bg">
                  <MineMap
                    mineLayout={mineLayout}
                    sensorData={sensorData}
                    workers={workers}
                    selectedNode={selectedNode}
                    onSelectNode={setSelectedNode}
                    emergencyState={emergencyState}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-start">
            <button
              onClick={resetEmergency}
              className="bg-mine-surface-alt border border-mine-border text-mine-text-secondary px-4 py-2 rounded text-sm font-medium hover:bg-mine-bg transition-colors"
            >
              Reset Simulation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
