import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMine } from '../context/MineContext';
import MineMapComponent from '../components/mine-map/MineMap';
import {
  MapPin,
  Shield,
  Radio,
  HardHat,
  DoorOpen,
  Sliders,
  Wind,
  UploadCloud,
  RotateCcw,
  Cpu,
  Layers,
} from 'lucide-react';

export default function MineMap() {
  const navigate = useNavigate();
  const {
    sensors = [],
    workers = [],
    selectedSensor,
    setSelectedSensor,
    activeMap,
    isCustomMapActive,
    resetToDefaultMap,
  } = useMine();

  const [inspectedItem, setInspectedItem] = useState(null);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Page Header with Map Switcher & Studio CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mine-border pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary">
              2D Underground Mine Vector Network
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary">
              {activeMap?.map?.scale?.label || 'CAD SCHEMATIC • 1:500m'}
            </span>
            {isCustomMapActive && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                CUSTOM BLUEPRINT MAP
              </span>
            )}
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Real-time subsurface spatial monitoring across {activeMap?.mineName || 'Raniganj Deep Colliery (Seam 4)'} with live personnel tracking & dynamic hazard routing
          </p>
        </div>

        {/* Top Actions: Blueprint Studio CTA & Revert */}
        <div className="flex items-center gap-2">
          {isCustomMapActive ? (
            <button
              type="button"
              onClick={resetToDefaultMap}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface hover:bg-mine-surface-alt text-mine-text-secondary hover:text-mine-text-primary border border-mine-border transition"
              title="Revert to baseline blueprint map"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Revert to Baseline Blueprint</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => navigate('/blueprint-upload')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold bg-status-safe text-white hover:opacity-90 transition shadow-sm"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Blueprint → 2D Map</span>
          </button>
        </div>
      </div>

      {/* Legend & Telemetry Bar */}
      <div className="card p-3 bg-mine-surface border border-mine-border flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-safe" />
            <span className="text-mine-text-primary">Normal Strata</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-warning" />
            <span className="text-mine-text-primary">Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-critical" />
            <span className="text-mine-text-primary">Critical / Collapsed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-status-safe text-white text-[9px] font-bold flex items-center justify-center">E</span>
            <span className="text-mine-text-primary">Surface Shaft</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-status-attention text-white text-[9px] font-bold flex items-center justify-center">R</span>
            <span className="text-mine-text-primary">Refuge Station</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3 rounded bg-[#1E293B] text-white text-[8px] font-bold flex items-center justify-center font-mono">MS</span>
            <span className="text-mine-text-primary">Monitoring Station</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 border-t-2 border-dashed border-status-safe" />
            <span className="text-status-safe font-semibold">Safe Evacuation Route</span>
          </div>
        </div>

        <div className="text-mine-text-secondary font-mono text-[11px]">
          Click any gallery tunnel, junction, sensor or miner to inspect properties
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="w-full">
        <MineMapComponent height={620} onSelectNode={(node) => setInspectedItem(node)} />
      </div>
    </div>
  );
}
