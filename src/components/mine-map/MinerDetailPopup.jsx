// MINEGUARD AI — Draggable Miner Detail Popup
// Features:
// 1. Draggable anywhere across the entire screen (fixed z-50 with bounded pointer tracking)
// 2. High-contrast themeable background (Tactical Slate, Obsidian Coal, Command Cyber)
// 3. Complete biometric & UPS coordinate HUD matching SIH command center specifications

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HardHat,
  X,
  Heart,
  BatteryFull,
  BatteryMedium,
  BatteryLow,
  Radio,
  Navigation2,
  ArrowRight,
  AlertTriangle,
  GripHorizontal,
  Compass,
} from 'lucide-react';

const BG_THEMES = [
  {
    id: 'tactical-slate',
    name: 'Tactical Slate',
    gradient: 'linear-gradient(180deg, #0b111e 0%, #060a12 100%)',
    border: 'rgba(56, 189, 248, 0.3)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85), 0 0 25px rgba(56, 189, 248, 0.15)',
    accent: '#38bdf8',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
  },
  {
    id: 'obsidian-coal',
    name: 'Obsidian Coal',
    gradient: 'linear-gradient(180deg, #14161b 0%, #0a0b0e 100%)',
    border: 'rgba(245, 158, 11, 0.35)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 25px rgba(245, 158, 11, 0.15)',
    accent: '#f59e0b',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
  },
  {
    id: 'command-cyber',
    name: 'Command Cyber',
    gradient: 'linear-gradient(180deg, #051417 0%, #020b0d 100%)',
    border: 'rgba(16, 185, 129, 0.35)',
    boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 25px rgba(16, 185, 129, 0.15)',
    accent: '#10b981',
    cardBg: 'rgba(255, 255, 255, 0.04)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
  },
];

/**
 * @param {{ worker: object, route: object|null, onClose: function, onHighlightRoute: function }} props
 */
export default function MinerDetailPopup({ worker, route, onClose, onHighlightRoute }) {
  if (!worker) return null;

  // Selected background theme (defaults to sleek Tactical Slate)
  const [bgThemeId, setBgThemeId] = useState('tactical-slate');
  const currentTheme = BG_THEMES.find((t) => t.id === bgThemeId) || BG_THEMES[0];

  // Draggable screen coordinates (fixed positioning)
  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      const defaultX = Math.max(16, window.innerWidth - 350);
      const defaultY = 85;
      return { x: defaultX, y: defaultY };
    }
    return { x: 750, y: 85 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const handlePointerDown = (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input')) return;

    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      const deltaX = e.clientX - dragStartRef.current.startX;
      const deltaY = e.clientY - dragStartRef.current.startY;

      const popupWidth = 325;
      const maxX = Math.max(20, window.innerWidth - popupWidth - 10);
      const maxY = Math.max(20, window.innerHeight - 100);

      const newX = Math.min(Math.max(10, dragStartRef.current.initialX + deltaX), maxX);
      const newY = Math.min(Math.max(10, dragStartRef.current.initialY + deltaY), maxY);

      setPosition({ x: newX, y: newY });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const isConnected = worker.helmet === 'Connected';
  const isEvac = worker.status === 'EVACUATING';
  const heartRate = worker.heartRate || 0;
  const tagBattery = worker.tagBattery ?? 100;

  const heartRateStatus =
    heartRate === 0
      ? 'offline'
      : heartRate < 50 || heartRate > 110
      ? 'critical'
      : heartRate >= 50 && heartRate < 60
      ? 'warning'
      : 'normal';

  const safetyStatus = isEvac ? 'EVACUATING' : worker.status || 'SAFE';

  const statusConfig = {
    SAFE: { label: 'SAFE', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 border' },
    EVACUATING: { label: 'EVACUATING', cls: 'bg-red-500/25 text-red-400 border-red-500/50 border animate-pulse' },
    WARNING: { label: 'WARNING', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/40 border' },
    CRITICAL: { label: 'CRITICAL', cls: 'bg-red-500/25 text-red-400 border-red-500/50 border animate-pulse' },
  };
  const safetyCfg = statusConfig[safetyStatus] || statusConfig['SAFE'];

  const BatteryIcon = tagBattery > 50 ? BatteryFull : tagBattery > 20 ? BatteryMedium : BatteryLow;
  const batteryColor = tagBattery > 50 ? 'text-emerald-400' : tagBattery > 20 ? 'text-amber-400' : 'text-red-400';

  const heartColor =
    heartRateStatus === 'offline'
      ? 'text-gray-500'
      : heartRateStatus === 'critical'
      ? 'text-red-400'
      : heartRateStatus === 'warning'
      ? 'text-amber-400'
      : 'text-emerald-400';

  const routeNodes = route?.routeNodes || [];
  const exitId = route?.exitId || '—';
  const totalDist = route?.totalDistance ? `${route.totalDistance} meters` : '— m';
  const estTime = route?.estimatedTime || '—';
  const displayNodes =
    routeNodes.length > 3
      ? [...routeNodes.slice(0, 1), '...', ...routeNodes.slice(-2)]
      : routeNodes;

  const popupElement = (
    <div
      className={`fixed z-50 w-[320px] rounded-2xl overflow-hidden backdrop-blur-xl select-none transition-shadow ${
        isDragging ? 'shadow-2xl ring-2 ring-cyan-400/50' : ''
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        background: currentTheme.gradient,
        border: `1px solid ${currentTheme.border}`,
        boxShadow: currentTheme.boxShadow,
      }}
    >
      {/* ── Drag Grip Bar ─────────────────────────────────────────────── */}
      <div
        onPointerDown={handlePointerDown}
        className="w-full py-1.5 px-3 flex items-center justify-between cursor-grab active:cursor-grabbing border-b border-white/5 bg-white/[0.03] hover:bg-white/[0.07] transition"
        title="Click and drag anywhere on the screen"
      >
        <div className="flex items-center gap-1.5 text-[9px] font-mono tracking-wider text-gray-400 uppercase">
          <GripHorizontal className="h-3 w-3 text-cyan-400" />
          <span>DRAG ANYWHERE</span>
        </div>

        {/* Color Palette Switcher */}
        <div className="flex items-center gap-1.5" title="Switch popup background color">
          {BG_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setBgThemeId(t.id);
              }}
              className={`w-3 h-3 rounded-full border transition ${
                bgThemeId === t.id
                  ? 'scale-125 ring-2 ring-white/60 border-white'
                  : 'border-white/20 opacity-50 hover:opacity-100'
              }`}
              style={{ backgroundColor: t.accent }}
            />
          ))}
        </div>
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        onPointerDown={handlePointerDown}
        className="flex items-center gap-3 px-4 pt-3.5 pb-3 border-b border-white/10 cursor-grab active:cursor-grabbing"
      >
        {/* Avatar */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
          style={{ background: 'rgba(217, 119, 6, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)' }}
        >
          <HardHat className="h-5 w-5 text-amber-400" />
        </div>

        {/* Name + Tag */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide truncate">{worker.name}</span>
            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 border border-white/10 flex-shrink-0">
              {worker.id}
            </span>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5 font-medium">
            {worker.role} &bull; ZONE-{worker.zone}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3.5 pb-3.5 space-y-2.5 mt-2.5">
        {/* ── Operational Safety Status ──────────────────────────────── */}
        <div
          className="flex items-center justify-between px-3 py-2 rounded-xl"
          style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.cardBorder}` }}
        >
          <span className="text-xs text-gray-300 font-medium">Operational Safety Status:</span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${safetyCfg.cls}`}>
            {safetyCfg.label}
          </span>
        </div>

        {/* ── Underground Positioning System (UPS) ────────────────────── */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-2.5 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-cyan-400 animate-pulse" />
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
              Underground Positioning System (UPS)
            </span>
          </div>
          <p className="text-[10px] text-gray-300 leading-relaxed">
            Localized via <strong className="text-cyan-300">UWB Anchors</strong> &amp; Helmet IMU Dead Reckoning (No GPS).
          </p>
          {/* Coordinates row */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {[
              { label: 'X COORD', val: `${worker.xCoord ?? '—'} m` },
              { label: 'Y COORD', val: `${worker.yCoord ?? '—'} m` },
              { label: 'SEAM DEPTH', val: `${worker.seamDepth ?? '—'} m` },
            ].map((c) => (
              <div
                key={c.label}
                className="rounded-lg bg-black/40 px-2 py-1.5 border border-white/5 text-center"
              >
                <div className="text-[8px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                  {c.label}
                </div>
                <div className="text-[11px] font-mono font-bold text-white">{c.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Biometrics row ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2">
          {/* Heart Rate */}
          <div
            className="rounded-xl p-2.5"
            style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.cardBorder}` }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Heart className={`h-3 w-3 ${heartColor}`} />
              <span className="text-[10px] text-gray-300 font-medium truncate">Biometric Heart Rate</span>
            </div>
            {heartRateStatus === 'offline' ? (
              <>
                <div className="text-base font-bold text-gray-400">NO SIGNAL</div>
                <div className="text-[9px] text-gray-500 mt-0.5">Helmet offline</div>
              </>
            ) : (
              <>
                <div className={`text-xl font-bold tracking-tight ${heartColor}`}>
                  {heartRate} <span className="text-xs font-normal text-gray-400">BPM</span>
                </div>
                <div className="text-[9px] text-gray-400 mt-0.5">Normal: 60–100</div>
              </>
            )}
          </div>

          {/* Smart Tag Battery */}
          <div
            className="rounded-xl p-2.5"
            style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.cardBorder}` }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <BatteryIcon className={`h-3 w-3 ${batteryColor}`} />
              <span className="text-[10px] text-gray-300 font-medium truncate">Smart Tag Battery</span>
            </div>
            <div className={`text-xl font-bold tracking-tight ${batteryColor}`}>{tagBattery}%</div>
            <div className="text-[9px] text-gray-400 mt-0.5 truncate">
              {tagBattery > 20 ? 'Est. ~48h runtime' : 'Recharge required'}
            </div>
          </div>
        </div>

        {/* ── Evacuation Route ─────────────────────────────────────────── */}
        <div
          className="rounded-xl p-2.5 space-y-1.5"
          style={{ background: currentTheme.cardBg, border: `1px solid ${currentTheme.cardBorder}` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Navigation2 className="h-3 w-3 text-cyan-400" />
              <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wide">
                Shortest Safe Evacuation Route
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 font-bold">Exit: {exitId}</span>
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-300">
            <span>
              Total: <strong className="text-white font-mono">{totalDist}</strong>
            </span>
            <span>
              Est. Walk: <strong className="text-white font-mono">~{estTime}</strong>
            </span>
          </div>

          {routeNodes.length > 0 ? (
            <div>
              <div className="text-[8px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">
                Waypoint Path Sequence:
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {displayNodes.map((node, i) => (
                  <React.Fragment key={i}>
                    {node === '...' ? (
                      <span className="text-gray-500 text-xs">···</span>
                    ) : (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/10 text-gray-200 border border-white/10">
                        {node}
                      </span>
                    )}
                    {i < displayNodes.length - 1 && (
                      <ArrowRight className="h-2 w-2 text-gray-500 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-[10px] text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="h-3 w-3" />
              Emergency protocol: Awaiting corridor clearance
            </div>
          )}
        </div>

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onHighlightRoute && onHighlightRoute(worker.id)}
            disabled={routeNodes.length === 0}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition shadow-lg
                       bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-black active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Compass className="h-3.5 w-3.5" />
            Highlight Route on Map
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(popupElement, document.body);
  }
  return popupElement;
}

