import React, { useState, useEffect } from 'react';
import { useMine } from '../../context/MineContext';
import {
  Sliders,
  Volume2,
  VolumeX,
  Bell,
  Navigation,
  AlertTriangle,
  Flame,
  Sun,
  Moon,
  Clock,
  Radio,
  RotateCcw,
  UserPlus,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function TopBar() {
  const {
    stats = {},
    alerts = [],
    isMuted,
    toggleMute,
    toggleTheme,
    isDarkMode,
    triggerSubsidence,
    triggerCollapse,
    resetToNormal,
    advanceEvacuation,
    setIsSensorSimulatorOpen,
    setIsEmergencyHUDOpen,
    emergencyModeActive,
    adminSession,
    clearAdminSession,
    logoutAdmin,
    setIsAddMinerModalOpen,
  } = useMine();

  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const overallCondition = stats?.overallCondition || 'MONITORING';
  const evacuatingCount = stats?.evacuatingWorkers || 0;

  // Format time with IST timezone indicator
  const timeString = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="bg-mine-surface/90 backdrop-blur-md border-b border-mine-border px-4 py-2 flex flex-wrap items-center justify-between gap-3 flex-shrink-0 z-10 select-none">
      {/* Left: Mine Location & Status Badge */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-mine-text-primary tracking-tight">
              {adminSession?.admin?.mineName || 'Chandrapur Deep Mine'}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-mine-surface-alt text-mine-text-secondary border border-mine-border">
              {adminSession?.admin?.mineId || 'Seam 3'}
            </span>
            {adminSession?.admin?.fullName && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                Admin: {adminSession.admin.fullName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-mine-text-secondary">
            <span>{adminSession?.admin?.mineLocation || 'DGMS Telemetry • Eastern Coalfields (ECL)'}</span>
            <span className="hidden md:inline-block text-mine-border">•</span>
            <span className="hidden md:inline-flex items-center gap-1 font-mono text-[10px] text-status-safe">
              <span className="w-1.5 h-1.5 rounded-full bg-status-safe animate-pulse" />
              {adminSession?.miners?.length ? `${adminSession.miners.length} Registered Miners (Active Shift)` : 'LoRa 868MHz (14ms)'}
            </span>
          </div>
        </div>

        {/* Global Mine Condition Indicator */}
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
            emergencyModeActive
              ? 'bg-status-critical-bg text-status-critical border-status-critical/40 animate-pulse shadow-sm shadow-red-500/20'
              : overallCondition === 'CRITICAL'
              ? 'bg-status-critical-bg text-status-critical border-status-critical/40'
              : overallCondition === 'WARNING'
              ? 'bg-status-warning-bg text-status-warning border-status-warning/40'
              : 'bg-status-safe-bg text-status-safe border-status-safe/40'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              emergencyModeActive || overallCondition === 'CRITICAL'
                ? 'bg-status-critical animate-ping'
                : overallCondition === 'WARNING'
                ? 'bg-status-warning'
                : 'bg-status-safe'
            }`}
          />
          {emergencyModeActive ? 'CODE RED EVACUATION' : overallCondition}
        </div>
      </div>

      {/* Center: SIH Demo Bar (1-Click Scenario Injectors) */}
      <div className="flex flex-wrap items-center gap-1.5 bg-mine-surface-alt/80 backdrop-blur-sm p-1 rounded-lg border border-mine-border">
        <button
          type="button"
          onClick={resetToNormal}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
          title="Reset nominal mine baseline"
        >
          <RotateCcw className="h-3 w-3 text-status-safe" />
          <span>Normal Baseline</span>
        </button>

        <button
          type="button"
          onClick={triggerSubsidence}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-status-warning-bg text-status-warning border border-status-warning/40 hover:bg-status-warning-bg/80 transition shadow-sm"
          title="Simulate increasing strata subsidence in Zone B"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Simulate Subsidence</span>
        </button>

        <button
          type="button"
          onClick={() => triggerCollapse('T-12')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-status-critical text-white hover:opacity-90 transition shadow-sm shadow-red-500/20"
          title="Trigger catastrophic tunnel collapse & Dijkstra safe reroute"
        >
          <Flame className="h-3.5 w-3.5 animate-pulse" />
          <span>Collapse T-12 & Reroute</span>
        </button>

        {evacuatingCount > 0 && (
          <button
            type="button"
            onClick={advanceEvacuation}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-status-attention text-white hover:opacity-90 transition shadow-sm animate-bounce"
            title="Step miners forward along safe route"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Step Evac ({evacuatingCount})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setIsSensorSimulatorOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
          title="Open IoT Strata Telemetry Injector Sliders"
        >
          <Sliders className="h-3.5 w-3.5 text-status-attention" />
          <span className="hidden sm:inline">Telemetry</span>
        </button>
      </div>

      {/* Right: Live Clock & Quick Controls */}
      <div className="flex items-center gap-2.5">
        {/* Live Clock & Shift Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-mine-surface-alt border border-mine-border text-xs font-mono text-mine-text-primary">
          <Clock className="h-3.5 w-3.5 text-mine-text-secondary" />
          <span>{timeString}</span>
          <span className="text-[10px] text-mine-text-secondary font-sans font-medium ml-1">
            (Shift 3)
          </span>
        </div>

        {/* Audio Mute/Unmute */}
        <button
          type="button"
          onClick={toggleMute}
          className={`p-1.5 rounded-md border transition flex items-center gap-1 ${
            isMuted
              ? 'bg-status-critical-bg text-status-critical border-status-critical/30'
              : 'bg-mine-surface border-mine-border text-mine-text-secondary hover:text-mine-text-primary'
          }`}
          title={isMuted ? 'Audio Muted — Click to unmute sirens' : 'Audio Active — Click to mute'}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <>
              <Volume2 className="h-4 w-4 text-status-safe" />
              <div className="hidden sm:flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-1.5 bg-status-safe rounded-full animate-pulse" />
                <span className="w-0.5 h-3 bg-status-safe rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-0.5 h-2 bg-status-safe rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </>
          )}
        </button>

        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-md border border-mine-border bg-mine-surface text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-mine-text-primary" />}
        </button>

        {/* Emergency HUD Quick Launcher */}
        {emergencyModeActive && (
          <button
            type="button"
            onClick={() => {
              setIsEmergencyHUDOpen(true);
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            className="px-2.5 py-1 rounded-md text-xs font-bold bg-status-critical text-white shadow-sm shadow-red-500/30 animate-pulse"
          >
            HUD ACTIVE
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative text-mine-text-secondary p-1">
          <Bell className="h-4 w-4" />
          {alerts.length > 0 && (
            <span className="absolute top-0 right-0 bg-status-critical text-white text-[9px] font-bold px-1 min-w-[14px] h-[14px] rounded-full flex items-center justify-center tabular-nums shadow-sm">
              {alerts.length}
            </span>
          )}
        </div>

        {/* Operator Profile & Admin Actions */}
        <div className="flex items-center gap-2 pl-2 border-l border-mine-border">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 text-white flex items-center justify-center text-xs font-bold shadow-sm flex-shrink-0">
            {adminSession?.admin?.fullName ? adminSession.admin.fullName.slice(0, 2).toUpperCase() : 'DG'}
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-semibold text-mine-text-primary block leading-none truncate max-w-[130px]">
              {adminSession?.admin?.fullName || 'Safety Controller'}
            </span>
            <span className="text-[10px] text-mine-text-secondary truncate max-w-[130px] block">
              {adminSession?.admin?.role || 'DGMS Portal'}
            </span>
          </div>

          {/* Quick Add Miner Button */}
          <button
            type="button"
            onClick={() => setIsAddMinerModalOpen(true)}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-status-attention/15 border border-status-attention/40 text-status-attention hover:bg-status-attention hover:text-white transition font-semibold shadow-sm"
            title="Deploy new miner underground"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Add Miner</span>
          </button>

          {/* Admin Logout Button */}
          {adminSession ? (
            <button
              type="button"
              onClick={() => logoutAdmin(false)}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition font-semibold shadow-sm"
              title="Logout as Admin and revert shift baseline"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          ) : (
            <a
              href="http://localhost:5500/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-mine-surface border border-mine-border text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface-alt transition font-semibold shadow-card"
              title="Open Admin Registration & Blueprint Upload Portal"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="hidden sm:inline">Admin Login</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
