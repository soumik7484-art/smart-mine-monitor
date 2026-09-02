import React from 'react';
import { useMine } from '../../context/MineContext';
import {
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Bell,
  Navigation,
  RotateCcw,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export default function TopBar() {
  const {
    stats = {},
    alerts = [],
    isMuted,
    toggleMute,
    triggerSubsidence,
    triggerCollapse,
    resetToNormal,
    advanceEvacuation,
    setIsSIHTourOpen,
    setIsSensorSimulatorOpen,
    setIsEmergencyHUDOpen,
    emergencyModeActive,
  } = useMine();

  const overallCondition = stats?.overallCondition || 'MONITORING';
  const evacuatingCount = stats?.evacuatingWorkers || 0;

  return (
    <header className="bg-mine-surface border-b border-mine-border px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 z-10">
      {/* Left: Mine Details & Status */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-mine-text-primary tracking-tight">
              Chandrapur Deep Mine
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-mine-surface-alt text-mine-text-secondary border border-mine-border">
              Raniganj Seam 3
            </span>
          </div>
          <p className="text-[11px] text-mine-text-secondary">
            DGMS Continuous Telemetry • Eastern Coalfields Ltd (ECL)
          </p>
        </div>

        <div
          className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border ${
            emergencyModeActive
              ? 'bg-status-critical-bg text-status-critical border-status-critical/30 animate-pulse'
              : overallCondition === 'CRITICAL'
              ? 'bg-status-critical-bg text-status-critical border-status-critical/30'
              : overallCondition === 'WARNING'
              ? 'bg-status-warning-bg text-status-warning border-status-warning/30'
              : 'bg-status-safe-bg text-status-safe border-status-safe/30'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              emergencyModeActive || overallCondition === 'CRITICAL'
                ? 'bg-status-critical'
                : overallCondition === 'WARNING'
                ? 'bg-status-warning'
                : 'bg-status-safe'
            }`}
          />
          {emergencyModeActive ? 'CODE RED EMERGENCY' : overallCondition}
        </div>
      </div>

      {/* Center: SIH Demo Bar (1-Click Scenario Injectors) */}
      <div className="flex flex-wrap items-center gap-1.5 bg-mine-surface-alt p-1 rounded-md border border-mine-border">
        <button
          type="button"
          onClick={resetToNormal}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
          title="Reset nominal mine baseline"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-status-safe" />
          Normal Mine
        </button>

        <button
          type="button"
          onClick={triggerSubsidence}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-status-warning-bg text-status-warning border border-status-warning/40 hover:bg-status-warning-bg/80 transition"
          title="Simulate increasing strata subsidence in Zone B"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Simulate Subsidence
        </button>

        <button
          type="button"
          onClick={() => triggerCollapse('T-12')}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-status-critical text-white hover:opacity-90 transition shadow-sm animate-pulse"
          title="Trigger catastrophic tunnel collapse & Dijkstra safe reroute"
        >
          <Flame className="h-3.5 w-3.5" />
          Collapse T-12 & Reroute
        </button>

        {evacuatingCount > 0 && (
          <button
            type="button"
            onClick={advanceEvacuation}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-status-attention text-white hover:opacity-90 transition shadow-sm"
            title="Step miners forward along safe route"
          >
            <Navigation className="h-3.5 w-3.5" />
            Step Evac ({evacuatingCount})
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsSensorSimulatorOpen(true)}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface transition"
          title="Open IoT Strata Telemetry Injector Sliders"
        >
          <Sliders className="h-3.5 w-3.5" />
          <span className="hidden xl:inline">Injector</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSIHTourOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-mine-text-primary text-white hover:opacity-90 transition shadow-sm"
          title="Launch Guided SIH Demonstration Tour"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          SIH Tour
        </button>
      </div>

      {/* Right: Quick Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={toggleMute}
          className={`p-1.5 rounded border transition ${
            isMuted
              ? 'bg-status-critical-bg text-status-critical border-status-critical/30'
              : 'bg-mine-surface border-mine-border text-mine-text-secondary hover:text-mine-text-primary'
          }`}
          title={isMuted ? 'Unmute Audio Siren & Chimes' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Emergency HUD Launcher */}
        {emergencyModeActive && (
          <button
            type="button"
            onClick={() => setIsEmergencyHUDOpen(true)}
            className="px-2 py-1 rounded text-xs font-bold bg-status-critical text-white animate-bounce shadow-sm"
          >
            HUD ACTIVE
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative text-mine-text-secondary">
          <Bell className="h-4 w-4" />
          {alerts.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-status-critical text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center tabular-nums">
              {alerts.length}
            </span>
          )}
        </div>

        {/* Operator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-mine-border">
          <div className="w-7 h-7 rounded bg-mine-surface-alt border border-mine-border flex items-center justify-center text-xs font-bold text-mine-text-primary">
            U
          </div>
          <div className="hidden sm:block text-left">
            <span className="text-xs font-semibold text-mine-text-primary block leading-none">User</span>
            <span className="text-[10px] text-mine-text-secondary">Control Room 1</span>
          </div>
        </div>
      </div>
    </header>
  );
}
