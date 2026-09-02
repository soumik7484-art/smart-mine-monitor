import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import MineMap from '../components/mine-map/MineMap';
import StatusBadge from '../components/ui/StatusBadge';
import {
  ShieldAlert,
  Flame,
  RotateCcw,
  Navigation,
  ArrowRight,
  DoorOpen,
  Send,
  Volume2,
  VolumeX,
  HardHat,
  AlertTriangle,
} from 'lucide-react';

export default function Emergency() {
  const {
    emergencyModeActive,
    sirenActive,
    collapsedTunnelIds = [],
    affectedWorkerIds = [],
    workers = [],
    workerRoutes = {},
    activeRouteWorkerId,
    triggerCollapse,
    resetToNormal,
    advanceEvacuation,
    silenceSiren,
    setIsEmergencyHUDOpen,
    setBannerNotification,
  } = useMine();

  const [selectedWorkerId, setSelectedWorkerId] = useState(activeRouteWorkerId || 'W-003');

  const evacuatingWorkers = workers.filter((w) => w.status === 'EVACUATING');
  const targetWorker = workers.find((w) => w.id === selectedWorkerId) || workers[0];
  const currentRoute = targetWorker ? workerRoutes[targetWorker.id] : null;

  const isCollapsed = emergencyModeActive || collapsedTunnelIds.length > 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary">
              Intelligent Emergency Evacuation Center
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary">
              DIJKSTRA SAFE PATH ROUTING
            </span>
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Graph-Based Hazard Penalty Dijkstra/A* Pathfinding with Real-Time Subsurface Rerouting
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <>
              <button
                type="button"
                onClick={resetToNormal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
              >
                <RotateCcw className="h-4 w-4 text-status-safe" />
                Reset & Clear Blockages
              </button>
              <button
                type="button"
                onClick={() => setIsEmergencyHUDOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-status-critical text-white shadow-sm animate-pulse"
              >
                <AlertTriangle className="h-4 w-4" />
                Open Red Alert HUD
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => triggerCollapse('T-12')}
              className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-bold bg-status-critical text-white hover:opacity-90 transition shadow-sm animate-pulse"
            >
              <Flame className="h-4 w-4" />
              Simulate Collapse (T-12) & Safe Reroute
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Recalculation Alert Banner */}
      {isCollapsed && (
        <div className="card p-4 bg-status-critical-bg border-2 border-status-critical text-mine-text-primary space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded bg-status-critical text-white flex-shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-status-critical">
                  🚨 DYNAMIC ROUTE RE-CALCULATION ACTIVE: HAZARD DETECTED
                </h3>
                <p className="text-xs text-mine-text-primary">
                  Tunnel <strong>{collapsedTunnelIds.join(', ') || 'T-12'}</strong> in Sector B has suffered a strata breach and is impassable (Cost = &infin;).
                  The Dijkstra engine automatically excised the blocked segment and calculated the shortest safe detour avoiding the hazard perimeter.
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
                  <span className="text-mine-text-secondary line-through">
                    Old Blocked Path: J10 &rarr; T-12 &rarr; J9 (IMPASSABLE)
                  </span>
                  <span className="text-status-safe font-bold flex items-center gap-1">
                    <ArrowRight className="h-3.5 w-3.5" />
                    New Safe Detour: J10 &rarr; J12 &rarr; J11 &rarr; J9 &rarr; Exit E1
                  </span>
                </div>
              </div>
            </div>

            {evacuatingWorkers.length > 0 && (
              <button
                type="button"
                onClick={advanceEvacuation}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-bold bg-status-attention text-white hover:opacity-90 transition shadow-sm flex-shrink-0"
              >
                <Navigation className="h-3.5 w-3.5" />
                Step Evac ({evacuatingWorkers.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Grid: Map + Turn-by-Turn Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vector Mine Map with Evacuation Highlight */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
              Subsurface Evacuation Vector Map (Green Polyline = Safe Path)
            </span>
            {targetWorker && (
              <span className="text-xs font-mono font-semibold text-status-safe">
                Inspecting Route for: {targetWorker.name} ({targetWorker.id})
              </span>
            )}
          </div>
          <MineMap height={480} />
        </div>

        {/* Right Col: Selected Worker Turn-by-Turn Guidance Card */}
        <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b border-mine-border pb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
                Miner Navigation Guidance
              </h2>
              <span className="text-xs font-mono text-mine-text-secondary">Dijkstra Weights</span>
            </div>

            {/* Select Worker to Inspect */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-mine-text-primary block">
                Select Underground Miner:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {workers.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => setSelectedWorkerId(w.id)}
                    className={`p-2 rounded text-left border transition text-xs ${
                      selectedWorkerId === w.id
                        ? 'bg-mine-surface-alt border-mine-text-primary font-semibold'
                        : 'bg-mine-surface border-mine-border text-mine-text-secondary hover:bg-mine-surface-alt'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{w.name}</span>
                      {w.status === 'EVACUATING' && (
                        <span className="w-2 h-2 rounded-full bg-status-critical animate-ping" />
                      )}
                    </div>
                    <span className="text-[10px] text-mine-text-secondary font-mono">{w.id} • Zone {w.zone}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Route Summary */}
            {currentRoute ? (
              <div className="rounded bg-mine-surface-alt p-3.5 border border-mine-border space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-mine-text-secondary">Target Safe Exit:</span>
                  <strong className="text-status-safe font-semibold flex items-center gap-1 font-mono">
                    <DoorOpen className="h-4 w-4" />
                    {currentRoute.exitLabel}
                  </strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-mine-text-secondary">Distance / Est. Time:</span>
                  <strong className="font-mono text-mine-text-primary">
                    {currentRoute.totalDistance}m • {currentRoute.estimatedTime}
                  </strong>
                </div>

                <div className="pt-2 border-t border-mine-border space-y-1.5">
                  <span className="font-semibold text-mine-text-primary block">
                    Turn-by-Turn Junction Trajectory:
                  </span>
                  <div className="flex flex-wrap items-center gap-1 font-mono text-[11px]">
                    {currentRoute.routeNodes.map((node, i) => (
                      <React.Fragment key={i}>
                        <span className="px-2 py-0.5 rounded bg-mine-surface border border-mine-border font-bold text-mine-text-primary">
                          {node}
                        </span>
                        {i < currentRoute.routeNodes.length - 1 && (
                          <span className="text-mine-text-secondary">&rarr;</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-mine-text-secondary">No safe route available or worker already at safe exit.</p>
            )}
          </div>

          <div className="pt-3 border-t border-mine-border text-[11px] text-mine-text-secondary">
            DGMS Sec-44 Evacuation Rule: All underground personnel must proceed along designated green safe vector corridors.
          </div>
        </div>
      </div>
    </div>
  );
}
