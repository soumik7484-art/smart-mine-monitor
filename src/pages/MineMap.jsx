import React from 'react';
import MineMapComponent from '../components/mine-map/MineMap';
import NodeInfoPanel from '../components/mine-map/NodeInfoPanel';

const MineMap = ({ sensorData, workers, emergencyState, selectedNode, setSelectedNode, mineLayout }) => {
  return (
    <div className="bg-mine-bg min-h-screen p-6 flex flex-col">
      <div className="mb-4">
        <h1 className="page-header text-mine-text-primary text-2xl font-semibold">Mine Map</h1>
        <p className="page-subtitle text-mine-text-secondary mt-1">Underground tunnel monitoring and spatial analysis</p>
      </div>

      {/* Legend bar */}
      <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-mine-surface rounded-md border border-mine-border shadow-card text-sm text-mine-text-primary font-medium tracking-wide">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-status-safe"></span>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-status-warning"></span>
          <span>Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-status-critical"></span>
          <span>Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-mine-text-secondary"></span>
          <span>Offline</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 border-2 border-mine-text-primary rounded-sm flex items-center justify-center text-[10px] font-bold">E</span>
          <span>Entrance</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-8 border-t-2 border-dashed border-status-safe"></span>
          <span>Evacuation Route</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[600px]">
        {/* Left: Map */}
        <div className="card flex-1 p-2 flex items-center justify-center bg-mine-surface rounded-md border border-mine-border shadow-card overflow-hidden relative">
          <MineMapComponent 
            mineLayout={mineLayout}
            sensorData={sensorData}
            workers={workers}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            emergencyState={emergencyState}
          />
        </div>

        {/* Right: Node Info Panel */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col">
          {selectedNode ? (
            <NodeInfoPanel 
              node={selectedNode}
              sensorData={sensorData}
              onClose={() => setSelectedNode(null)}
            />
          ) : (
            <div className="card h-full w-full flex items-center justify-center p-6 text-center border-dashed border-2 border-mine-border bg-mine-surface-alt rounded-md">
              <p className="text-mine-text-secondary text-sm font-medium">
                Select a sensor node on the map to view details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MineMap;
