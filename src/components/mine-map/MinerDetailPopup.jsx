// MINEGUARD AI — Miner Detail Popup
// Shown when clicking a worker dot on the mine map.
// Design: matches reference card (UPS coords, biometrics, evacuation route, highlight action)

import React from 'react';
import {
  HardHat,
  X,
  Heart,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  MapPin,
  Radio,
  Navigation2,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RouteIcon,
} from 'lucide-react';

/**
 * @param {{ worker: object, route: object|null, onClose: function, onHighlightRoute: function }} props
 */
export default function MinerDetailPopup({ worker, route, onClose, onHighlightRoute }) {
  if (!worker) return null;

  const isConnected = worker.helmet === 'Connected';
  const isEvac = worker.status === 'EVACUATING';
  const heartRate = worker.heartRate || 0;
  const tagBattery = worker.tagBattery ?? 100;

  const heartRateStatus =
    heartRate === 0 ? 'offline'
    : heartRate < 50 || heartRate > 110 ? 'critical'
    : heartRate >= 50 && heartRate < 60 ? 'warning'
    : 'normal';

  const safetyStatus = isEvac ? 'EVACUATING' : worker.status || 'SAFE';

  const statusConfig = {
    SAFE:       { label: 'SAFE',       cls: 'bg-status-safe/20 text-status-safe border-status-safe/40 border' },
    EVACUATING: { label: 'EVACUATING', cls: 'bg-status-critical/20 text-status-critical border-status-critical/40 border animate-pulse' },
    WARNING:    { label: 'WARNING',    cls: 'bg-status-warning/20 text-status-warning border-status-warning/40 border' },
    CRITICAL:   { label: 'CRITICAL',   cls: 'bg-status-critical/20 text-status-critical border-status-critical/40 border animate-pulse' },
  };
  const safetyCfg = statusConfig[safetyStatus] || statusConfig['SAFE'];

  // Battery icon tier
  const BatteryIcon = tagBattery > 50 ? BatteryFull : tagBattery > 20 ? BatteryMedium : BatteryLow;
  const batteryColor = tagBattery > 50 ? 'text-status-safe' : tagBattery > 20 ? 'text-status-attention' : 'text-status-critical';

  // Heart rate display
  const heartColor =
    heartRateStatus === 'offline' ? 'text-mine-text-secondary'
    : heartRateStatus === 'critical' ? 'text-status-critical'
    : heartRateStatus === 'warning' ? 'text-status-attention'
    : 'text-status-safe';

  // Route display
  const routeNodes = route?.routeNodes || [];
  const exitId = route?.exitId || '—';
  const totalDist = route?.totalDistance ? `${route.totalDistance} meters` : '— m';
  const estTime = route?.estimatedTime || '—';
  // Show only final 3 nodes in path (or all if ≤ 3)
  const displayNodes = routeNodes.length > 3
    ? [...routeNodes.slice(0, 1), '...', ...routeNodes.slice(-2)]
    : routeNodes;

  return (
    <div className="absolute top-14 right-4 w-[310px] z-30 rounded-xl overflow-hidden shadow-2xl border border-white/10"
         style={{ background: 'linear-gradient(180deg, #1a1d2e 0%, #151825 100%)' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-white/10">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
             style={{ background: 'rgba(201, 130, 30, 0.2)', border: '1px solid rgba(201,130,30,0.4)' }}>
          <HardHat className="h-5 w-5 text-status-attention" />
        </div>
        {/* Name + Tag */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white truncate">{worker.name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-gray-300 flex-shrink-0">
              {worker.id}
            </span>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {worker.role} &bull; ZONE-{worker.zone}
          </div>
        </div>
        {/* Close */}
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-500 hover:text-white transition ml-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 pb-4 space-y-3 mt-3">

        {/* ── Operational Safety Status ──────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5">
          <span className="text-xs text-gray-400 font-medium">Operational Safety Status:</span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${safetyCfg.cls}`}>
            {safetyCfg.label}
          </span>
        </div>

        {/* ── UPS Section ─────────────────────────────────────────────── */}
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3 space-y-2">
          {/* Title */}
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
              Underground Positioning System (UPS)
            </span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Localized via <strong className="text-gray-300">UWB Anchors</strong> &amp; Helmet IMU Dead Reckoning (No GPS).
          </p>
          {/* Coordinates row */}
          <div className="grid grid-cols-3 gap-2 mt-1">
            {[
              { label: 'X COORD', val: `${worker.xCoord ?? '—'} m` },
              { label: 'Y COORD', val: `${worker.yCoord ?? '—'} m` },
              { label: 'SEAM DEPTH', val: `${worker.seamDepth ?? '—'} m` },
            ].map((c) => (
              <div key={c.label}
                   className="rounded bg-white/5 px-2 py-1.5 border border-white/5">
                <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">{c.label}</div>
                <div className="text-xs font-mono font-semibold text-white">{c.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Biometrics row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Heart Rate */}
          <div className="rounded-lg bg-white/5 border border-white/8 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Heart className={`h-3.5 w-3.5 ${heartColor}`} />
              <span className="text-[10px] text-gray-400 font-medium">Biometric Heart Rate</span>
            </div>
            {heartRateStatus === 'offline' ? (
              <>
                <div className="text-lg font-bold text-gray-500">NO SIGNAL</div>
                <div className="text-[10px] text-gray-600 mt-0.5">Helmet disconnected</div>
              </>
            ) : (
              <>
                <div className={`text-2xl font-bold ${heartColor}`}>
                  {heartRate} <span className="text-sm font-normal text-gray-400">BPM</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">Normal Range: 60–100</div>
              </>
            )}
          </div>

          {/* Smart Tag Battery */}
          <div className="rounded-lg bg-white/5 border border-white/8 p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <BatteryIcon className={`h-3.5 w-3.5 ${batteryColor}`} />
              <span className="text-[10px] text-gray-400 font-medium">Smart Tag Battery</span>
            </div>
            <div className={`text-2xl font-bold ${batteryColor}`}>{tagBattery}%</div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {tagBattery > 20 ? 'Estimated ~48h runtime' : 'Charge required soon'}
            </div>
          </div>
        </div>

        {/* ── Evacuation Route ─────────────────────────────────────────── */}
        <div className="rounded-lg bg-white/5 border border-white/8 p-3 space-y-2">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Navigation2 className="h-3.5 w-3.5 text-status-attention" />
              <span className="text-[11px] font-bold text-gray-200">Shortest Safe Evacuation Route</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">Exit: {exitId}</span>
          </div>

          {/* Distance + time */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">Total Distance: <strong className="text-white">{totalDist}</strong></span>
            <span className="text-gray-400">Est. Walk: <strong className="text-white">~{estTime}</strong></span>
          </div>

          {/* Waypoint path */}
          {routeNodes.length > 0 ? (
            <div>
              <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1.5 font-semibold">
                Waypoint Path Sequence:
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {displayNodes.map((node, i) => (
                  <React.Fragment key={i}>
                    {node === '...' ? (
                      <span className="text-gray-600 text-xs">···</span>
                    ) : (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-gray-200 border border-white/10">
                        {node}
                      </span>
                    )}
                    {i < displayNodes.length - 1 && (
                      <ArrowRight className="h-2.5 w-2.5 text-gray-600 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-status-critical flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              No safe route available — emergency protocol active
            </div>
          )}
        </div>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={() => onHighlightRoute && onHighlightRoute(worker.id)}
            disabled={routeNodes.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition
                       bg-cyan-500 hover:bg-cyan-400 text-black disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Navigation2 className="h-3.5 w-3.5" />
            Highlight Route on Map
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 text-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
