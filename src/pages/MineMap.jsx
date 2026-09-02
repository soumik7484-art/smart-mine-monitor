import React, { useState } from 'react';
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
} from 'lucide-react';

export default function MineMap() {
  const {
    sensors = [],
    workers = [],
    selectedSensor,
    setSelectedSensor,
  } = useMine();

  const [inspectedItem, setInspectedItem] = useState(null);

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary">
              2D Underground Mine Vector Network
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary">
              CAD SCHEMATIC • 1:500m
            </span>
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Real-time subsurface spatial monitoring across Raniganj Seam 3 with live UWB trilateration & hazard perimeters
          </p>
        </div>
      </div>

      {/* Legend Bar */}
      <div className="card p-3.5 bg-mine-surface border border-mine-border flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-5">
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
            <span className="text-mine-text-primary">Surface Exit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-status-attention text-white text-[9px] font-bold flex items-center justify-center">R</span>
            <span className="text-mine-text-primary">Refuge Station</span>
          </div>
          <div className="flex items-center gap-1.5">
            <polygon className="w-2.5 h-2.5 text-[#2563EB]" />
            <span className="text-mine-text-primary">UWB Anchor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-6 border-t-2 border-dashed border-status-safe" />
            <span className="text-status-safe font-semibold">Safe Evacuation Route</span>
          </div>
        </div>

        <div className="text-mine-text-secondary font-mono text-[11px]">
          Click any tunnel or junction on map to inspect properties
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="w-full">
        <MineMapComponent height={580} onSelectNode={(node) => setInspectedItem(node)} />
      </div>
    </div>
  );
}
