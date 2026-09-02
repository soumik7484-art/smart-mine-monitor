import React from 'react';
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
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Activity,
} from 'lucide-react';

const navItems = [
  { name: 'Command Dashboard', path: '/overview', icon: LayoutDashboard },
  { name: '2D Live Mine Map', path: '/mine-map', icon: Map },
  { name: 'Strata Sensors (24)', path: '/sensor-network', icon: Radio },
  { name: 'AI Prediction & XAI', path: '/ai-prediction', icon: BrainCircuit },
  { name: 'Worker Safety (UPS)', path: '/worker-safety', icon: HardHat },
  { name: 'Emergency Evacuation', path: '/emergency', icon: ShieldAlert },
  { name: 'Incident Audit Log', path: '/incident-history', icon: ClipboardList },
];

export default function Sidebar() {
  const {
    emergencyModeActive,
    isMuted,
    toggleMute,
    setIsSensorSimulatorOpen,
    stats = {},
  } = useMine();

  return (
    <aside className="w-64 flex-shrink-0 bg-mine-surface-alt border-r border-mine-border flex flex-col h-screen overflow-hidden select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-mine-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-mine-text-primary text-white flex items-center justify-center font-bold text-sm tracking-wider">
            MG
          </div>
          <div>
            <h1 className="font-bold text-base text-mine-text-primary tracking-wide leading-tight">
              MINEGUARD AI
            </h1>
            <p className="text-[11px] text-mine-text-secondary tracking-wider">
              Smart India Hackathon • SIH 2024
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-mine-text-secondary">
          Control Center Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-mine-surface text-mine-text-primary border border-mine-border shadow-card font-semibold'
                    : 'text-mine-text-secondary hover:bg-mine-surface/60 hover:text-mine-text-primary'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.name.includes('Emergency') && emergencyModeActive && (
                <span className="w-2 h-2 rounded-full bg-status-critical animate-ping" />
              )}
            </NavLink>
          );
        })}

        {/* Quick Launchers */}
        <div className="pt-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-mine-text-secondary">
          Simulation Controls
        </div>

        <button
          type="button"
          onClick={() => setIsSensorSimulatorOpen(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-xs font-semibold text-mine-text-primary bg-mine-surface border border-mine-border hover:bg-mine-surface-alt transition shadow-card"
        >
          <Sliders className="h-4 w-4 text-status-attention" />
          <span>Strata Telemetry Sliders</span>
        </button>
      </nav>

      {/* Subsurface Network Status */}
      <div className="p-3 border-t border-mine-border bg-mine-surface-alt/70 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-mine-text-secondary flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-safe" />
            LoRaWAN 868MHz Mesh
          </span>
          <span className="font-mono text-status-safe font-semibold">98.7% Up</span>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-mine-text-secondary">UWB Anchors</span>
          <span className="font-mono text-mine-text-primary font-semibold">10 / 10 Online</span>
        </div>

        <div className="pt-1 flex items-center justify-between border-t border-mine-border/60">
          <button
            type="button"
            onClick={toggleMute}
            className="text-[11px] text-mine-text-secondary hover:text-mine-text-primary flex items-center gap-1 transition"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5 text-status-critical" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{isMuted ? 'Muted' : 'Audio On'}</span>
          </button>
          <span className="text-[10px] text-mine-text-secondary font-mono">
            Ctrl+Shift+E: Alert
          </span>
        </div>
      </div>
    </aside>
  );
}
