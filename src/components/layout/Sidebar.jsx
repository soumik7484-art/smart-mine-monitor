import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useMine } from '../../context/MineContext';
import {
  LayoutDashboard,
  Map,
  Radio,
  BrainCircuit,
  HardHat,
  ShieldAlert,
  ClipboardList,
  Sliders,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  X,
  Wifi,
  UploadCloud,
  ShieldCheck,
  FolderKanban,
} from 'lucide-react';

const navItems = [
  { name: 'Command Dashboard', path: '/overview', icon: LayoutDashboard },
  { name: '2D Live Mine Map', path: '/mine-map', icon: Map },
  { name: 'Blueprint → 2D Map AI', path: '/blueprint-upload', icon: UploadCloud },
  { name: 'Strata Sensors (24)', path: '/sensor-network', icon: Radio },
  { name: 'AI Prediction & XAI', path: '/ai-prediction', icon: BrainCircuit },
  { name: 'Worker Safety (UPS)', path: '/worker-safety', icon: HardHat },
  { name: 'Emergency Evacuation', path: '/emergency', icon: ShieldAlert },
  { name: 'Incident Audit Log', path: '/incident-history', icon: ClipboardList },
];

const adminNavItems = [
  { name: 'Admin (Blueprint Upload)', path: '/admin', icon: ShieldCheck },
  { name: 'Mine Map Files', path: '/mine-map-files', icon: FolderKanban },
];

export default function Sidebar() {
  const {
    emergencyModeActive,
    isMuted,
    toggleMute,
    toggleTheme,
    isDarkMode,
    setIsSensorSimulatorOpen,
    isSidebarOpen,
    setIsSidebarOpen,
  } = useMine();

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setIsSidebarOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setIsSidebarOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSidebarOpen]);

  return (
    <>
      {/* ── Backdrop ─────────────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          isSidebarOpen
            ? 'bg-black/40 backdrop-blur-sm pointer-events-auto opacity-100'
            : 'bg-transparent pointer-events-none opacity-0'
        }`}
      />

      {/* ── Drawer ───────────────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 z-50 flex flex-col
          bg-mine-surface-alt border-r border-mine-border shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-mine-border flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-mine-text-primary to-neutral-600 dark:to-neutral-400 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm flex-shrink-0">
              MG
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm text-mine-text-primary tracking-wide leading-tight">
                  MINEGUARD AI
                </h1>
                <span className="bg-status-safe/15 text-status-safe text-[9px] font-bold px-1.5 rounded font-mono">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-mine-text-secondary tracking-wider mt-0.5">
                SIH • Command Center
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface transition"
            title="Close Navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-mine-text-secondary">
            Control Center Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isEmergency = item.name.includes('Emergency');
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-mine-surface text-mine-text-primary border border-mine-border shadow-card font-semibold'
                      : 'text-mine-text-secondary hover:bg-mine-surface/70 hover:text-mine-text-primary'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                      isEmergency && emergencyModeActive
                        ? 'text-status-critical animate-pulse'
                        : ''
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {isEmergency && emergencyModeActive && (
                  <span className="w-2 h-2 rounded-full bg-status-critical animate-ping flex-shrink-0" />
                )}
              </NavLink>
            );
          })}

          {/* Administration Section */}
          <div className="pt-3">
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-mine-text-secondary flex items-center justify-between">
              <span>Administration</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-mono font-bold">
                ADMIN
              </span>
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group relative ${
                      isActive
                        ? 'bg-mine-surface text-mine-text-primary border border-mine-border shadow-card font-semibold'
                        : 'text-mine-text-secondary hover:bg-mine-surface/70 hover:text-mine-text-primary'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 text-cyan-500" />
                    <span className="truncate">{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>

          {/* Quick Launchers */}
          <div className="pt-3">
            <div className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-mine-text-secondary">
              Simulation Controls
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSensorSimulatorOpen(true);
                setIsSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-mine-text-primary bg-mine-surface border border-mine-border hover:bg-mine-surface-alt transition shadow-card group"
            >
              <Sliders className="h-4 w-4 text-status-attention group-hover:rotate-45 transition-transform flex-shrink-0" />
              <span>Telemetry Sliders</span>
            </button>
          </div>
        </nav>

        {/* Footer — Network Status + Controls */}
        <div className="p-3.5 border-t border-mine-border bg-mine-surface-alt/70 space-y-3 flex-shrink-0">
          {/* Network status */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-mine-text-secondary flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-status-safe animate-pulse" />
                LoRa Mesh 868MHz
              </span>
              <span className="font-mono text-status-safe font-semibold">98.7% Up</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-mine-text-secondary flex items-center gap-1.5">
                <Wifi className="h-3 w-3 text-status-safe" />
                UWB Anchors
              </span>
              <span className="font-mono text-mine-text-primary font-semibold">10 / 10</span>
            </div>
          </div>

          {/* Audio + Theme */}
          <div className="flex items-center justify-between pt-2 border-t border-mine-border/60">
            <button
              type="button"
              onClick={toggleMute}
              className={`text-[11px] flex items-center gap-1.5 px-2 py-1.5 rounded-lg border transition ${
                isMuted
                  ? 'text-status-critical border-status-critical/30 bg-status-critical-bg'
                  : 'text-mine-text-secondary border-mine-border hover:text-mine-text-primary hover:bg-mine-surface'
              }`}
              title={isMuted ? 'Unmute siren audio' : 'Mute siren audio'}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span>{isMuted ? 'Muted' : 'Audio'}</span>
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="text-[11px] flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-mine-border text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface transition"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
