import React from 'react';
import { useMine } from '../../context/MineContext';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  Send,
  Radio,
  X,
  Compass,
  CheckCircle2,
  PhoneCall,
  HardHat,
  DoorOpen,
  Users,
  ArrowRight,
  Shield,
} from 'lucide-react';

export const EmergencyHUDModal = () => {
  const {
    isEmergencyHUDOpen,
    setIsEmergencyHUDOpen,
    emergencyModeActive,
    sirenActive,
    collapsedTunnelIds,
    affectedWorkerIds,
    workers,
    workerRoutes,
    silenceSiren,
    triggerCollapse,
    resetToNormal,
    isMuted,
    toggleMute,
    setBannerNotification,
  } = useMine();

  if (!isEmergencyHUDOpen) return null;

  const affectedWorkers = workers.filter((w) => affectedWorkerIds?.includes(w.id));
  const otherWorkers = workers.filter((w) => !affectedWorkerIds?.includes(w.id));

  const handleDispatchSMS = () => {
    setBannerNotification('📱 EMERGENCY BROADCAST SENT: Evacuation coordinates pushed to miner helmet tags via LoRaWAN/BLE mesh.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 animate-fadeIn">
      {/* Container Box — sticky header + footer, scrollable body */}
      <div className="w-full max-w-7xl mx-auto bg-mine-surface border-2 border-status-critical rounded-lg shadow-2xl flex flex-col my-auto" style={{ maxHeight: '95vh' }}>
        {/* Top Critical Alert Bar — STICKY */}
        <div className="flex items-center justify-between border-b border-status-critical bg-status-critical-bg px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 rounded-md bg-status-critical flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-wider text-status-critical uppercase">
                  EMERGENCY EVACUATION MODE ACTIVATED
                </h1>
                <span className="text-xs font-bold bg-status-critical text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  DGMS SEC-44 PROTOCOL
                </span>
              </div>
              <p className="text-xs text-mine-text-secondary mt-0.5">
                Coal Seam 3 Strata Rupture Detected • Dynamic Shortest Safe Route Detour Engaged
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEmergencyHUDOpen(false)}
            className="p-1.5 text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface-alt rounded transition"
            title="Close Alert HUD"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 min-h-0">
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 bg-mine-bg">
            {/* Left Column: Diagnostics & Dispatch Actions */}
            <div className="space-y-4">
              {/* Diagnostic Card */}
              <div className="card p-4 space-y-3 bg-mine-surface border border-mine-border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-mine-text-secondary flex items-center gap-2">
                  <Radio className="h-4 w-4 text-status-critical" />
                  Incident Diagnostic Summary
                </h3>

                <div className="space-y-2 text-xs divide-y divide-mine-border/60">
                  <div className="flex justify-between pt-1.5 first:pt-0">
                    <span className="text-mine-text-secondary">Impacted Zone:</span>
                    <strong className="text-status-critical font-semibold">ZONE B (Active Face LW-102)</strong>
                  </div>
                  <div className="flex justify-between pt-1.5">
                    <span className="text-mine-text-secondary">Impassable Tunnel:</span>
                    <strong className="text-status-critical font-semibold">
                      {collapsedTunnelIds.length > 0 ? collapsedTunnelIds.join(', ') : 'Tunnel T-12'} (COLLAPSED)
                    </strong>
                  </div>
                  <div className="flex justify-between pt-1.5">
                    <span className="text-mine-text-secondary">Routing Penalty:</span>
                    <strong className="text-status-critical font-semibold">Cost = &infin; (Pruned from Graph)</strong>
                  </div>
                  <div className="flex justify-between pt-1.5">
                    <span className="text-mine-text-secondary">Miners at Risk:</span>
                    <strong className="text-status-attention font-semibold">{affectedWorkers.length} Personnel in Zone B</strong>
                  </div>
                  <div className="flex justify-between pt-1.5">
                    <span className="text-mine-text-secondary">Active Safe Detour:</span>
                    <strong className="text-status-safe font-semibold">Via Cross-Cut J9 &rarr; Exit E1 / REF-1</strong>
                  </div>
                </div>
              </div>

              {/* Quick Action Center */}
              <div className="card p-4 space-y-3 bg-mine-surface border border-mine-border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-mine-text-secondary flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-status-attention" />
                  Command Dispatch Controls
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={silenceSiren}
                    className="flex items-center justify-center gap-2 rounded px-3 py-2 text-xs font-semibold bg-mine-surface-alt border border-mine-border text-mine-text-primary hover:bg-mine-border/50 transition"
                  >
                    <VolumeX className="h-4 w-4 text-mine-text-secondary" />
                    Silence Siren
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatchSMS}
                    className="flex items-center justify-center gap-2 rounded px-3 py-2 text-xs font-semibold bg-status-attention text-white hover:opacity-90 transition"
                  >
                    <Send className="h-4 w-4" />
                    Dispatch SMS &amp; Tags
                  </button>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmergencyHUDOpen(false);
                      resetToNormal();
                    }}
                    className="flex-1 rounded px-3 py-2 text-xs font-semibold border border-mine-border bg-mine-surface hover:bg-mine-surface-alt text-mine-text-primary transition"
                  >
                    Clear Incident &amp; Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Center & Right Column: Evacuation Guidance Per Miner */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mine-border pb-3">
                  <div className="flex items-center gap-2">
                    <HardHat className="h-4 w-4 text-status-attention" />
                    <h3 className="text-sm font-semibold text-mine-text-primary">
                      Dynamic Safe Evacuation Routing (Dijkstra Penalty Engine)
                    </h3>
                  </div>
                  <span className="text-xs font-medium text-status-safe bg-status-safe-bg px-2.5 py-0.5 rounded border border-status-safe/30">
                    Avoids Collapsed Tunnels (Weight = &infin;)
                  </span>
                </div>

                {/* Affected Miners List — independently scrollable */}
                <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '340px' }}>
                  {affectedWorkers.length > 0 ? (
                    affectedWorkers.map((worker) => {
                      const route = workerRoutes[worker.id];
                      return (
                        <div
                          key={worker.id}
                          className="rounded border border-status-attention/40 bg-status-attention-bg/30 p-3.5 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-status-attention animate-ping" />
                              <strong className="text-mine-text-primary text-sm font-semibold">{worker.name} ({worker.id})</strong>
                              <span className="text-xs text-mine-text-secondary font-mono">[{worker.role}] • Sector {worker.zone}</span>
                            </div>
                            <span className="text-xs font-bold text-status-critical bg-status-critical-bg px-2 py-0.5 rounded border border-status-critical/30">
                              EVACUATING
                            </span>
                          </div>

                          {route ? (
                            <div className="rounded bg-mine-surface p-3 border border-mine-border space-y-2 text-xs">
                              <div className="flex items-center justify-between text-mine-text-secondary">
                                <span>Target Surface Exit:</span>
                                <strong className="text-status-safe font-semibold flex items-center gap-1">
                                  <DoorOpen className="h-3.5 w-3.5" />
                                  {route.exitLabel} ({route.totalDistance}m • ~{route.estimatedTime})
                                </strong>
                              </div>

                              <div>
                                <span className="text-mine-text-secondary block mb-1">SAFE ROUTE DETOUR PATH:</span>
                                <div className="flex flex-wrap items-center gap-1.5 bg-mine-surface-alt p-2 rounded border border-mine-border">
                                  {route.routeNodes.map((node, i) => (
                                    <React.Fragment key={i}>
                                      <span className="px-2 py-0.5 rounded bg-mine-surface font-semibold text-mine-text-primary border border-mine-border">
                                        {node}
                                      </span>
                                      {i < route.routeNodes.length - 1 && <span className="text-mine-text-secondary">&rarr;</span>}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-mine-text-secondary">Calculating safe trajectory...</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-mine-text-secondary">No workers currently in affected sectors.</p>
                  )}
                </div>

                {/* Other Mine Zones Status */}
                <div className="pt-2 border-t border-mine-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-mine-text-secondary mb-2 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-status-safe" />
                    Other Sectors (Zones A, C, D) — {otherWorkers.length} Personnel Secure
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {otherWorkers.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between rounded bg-mine-surface-alt p-2 border border-mine-border"
                      >
                        <span className="text-mine-text-primary">{w.name} ({w.id})</span>
                        <span className="text-status-safe flex items-center gap-1 font-medium text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Normal (Zone {w.zone})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer — STICKY */}
        <div className="bg-mine-surface-alt border-t border-mine-border px-6 py-3 flex justify-between items-center text-xs text-mine-text-secondary flex-shrink-0">
          <span>DGMS Emergency Procedure 11(A) • Automated Shortest Safe Route Synthesizer</span>
          <button
            onClick={() => setIsEmergencyHUDOpen(false)}
            className="px-4 py-1.5 rounded bg-mine-surface border border-mine-border hover:bg-mine-surface-alt font-medium text-mine-text-primary transition"
          >
            Close HUD
          </button>
        </div>
      </div>
    </div>
  );
};
