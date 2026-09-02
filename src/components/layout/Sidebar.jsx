import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Wifi,
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
    toggleTheme,
    isDarkMode,
    setIsSensorSimulatorOpen,
  } = useMine();

  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } flex-shrink-0 bg-mine-surface-alt border-r border-mine-border flex flex-col h-screen overflow-hidden select-none transition-all duration-300 relative z-20`}
    >
      {/* Brand Header */}
      <div className="p-3.5 border-b border-mine-border flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mine-text-primary to-neutral-700 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm flex-shrink-0">
            MG
          </div>
          {!collapsed && (
            <div className="truncate">
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-sm text-mine-text-primary tracking-wide leading-tight truncate">
                  MINEGUARD AI
                </h1>
                <span className="bg-status-safe/15 text-status-safe text-[9px] font-bold px-1.5 py-0.2 rounded font-mono">
                  LIVE
                </span>
              </div>
              <p className="text-[10px] text-mine-text-secondary tracking-wider truncate">
                SIH • Command Center
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className="p-1 rounded-md text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface transition flex-shrink-0"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-2.5 space-y-1">
        {!collapsed && (
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-mine-text-secondary">
            Control Center Modules
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              title={collapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2'
                } rounded-md text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-mine-surface text-mine-text-primary border border-mine-border shadow-card font-semibold'
                    : 'text-mine-text-secondary hover:bg-mine-surface/60 hover:text-mine-text-primary'
                }`
              }
            >
              <div className={`flex items-center ${collapsed ? '' : 'gap-2.5'} min-w-0`}>
                <Icon
                  className={`h-4 w-4 flex-shrink-0 transition-transform group-hover:scale-110 ${
                    item.name.includes('Emergency') && emergencyModeActive
                      ? 'text-status-critical animate-pulse'
                      : ''
                  }`}
                />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </div>

              {/* Status dot or alert ping */}
              {item.name.includes('Emergency') && emergencyModeActive ? (
                <span
                  className={`${
                    collapsed ? 'absolute top-1 right-1' : ''
                  } w-2 h-2 rounded-full bg-status-critical animate-ping`}
                />
              ) : null}
            </NavLink>
          );
        })}

        {/* Quick Launchers */}
        <div className="pt-3">
          {!collapsed && (
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-mine-text-secondary">
              Simulation Controls
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsSensorSimulatorOpen(true)}
            title={collapsed ? 'Strata Telemetry Sliders' : undefined}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'
            } rounded-md text-xs font-semibold text-mine-text-primary bg-mine-surface border border-mine-border hover:bg-mine-surface-alt transition shadow-card group`}
          >
            <Sliders className="h-4 w-4 text-status-attention group-hover:rotate-45 transition-transform" />
            {!collapsed && <span>Telemetry Sliders</span>}
          </button>
        </div>
      </nav>

      {/* Subsurface Network Status */}
      <div className="p-3 border-t border-mine-border bg-mine-surface-alt/70 space-y-2 text-xs">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-mine-text-secondary flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full bg-status-safe animate-pulse" />
                LoRa Mesh 868MHz
              </span>
              <span className="font-mono text-status-safe font-semibold">98.7% Up</span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-mine-text-secondary truncate">UWB Anchors</span>
              <span className="font-mono text-mine-text-primary font-semibold">10 / 10 Active</span>
            </div>
          </>
        ) : (
          <div className="flex justify-center" title="LoRa Mesh: 98.7% Up • 10/10 Anchors">
            <Wifi className="h-4 w-4 text-status-safe" />
          </div>
        )}

        <div
          className={`pt-1.5 flex items-center ${
            collapsed ? 'flex-col gap-2' : 'justify-between'
          } border-t border-mine-border/60`}
        >
          <button
            type="button"
            onClick={toggleMute}
            className={`text-[11px] text-mine-text-secondary hover:text-mine-text-primary flex items-center gap-1 p-1 rounded transition ${
              isMuted ? 'text-status-critical' : ''
            }`}
            title={isMuted ? 'Unmute siren audio' : 'Mute siren audio'}
          >
            {isMuted ? <VolumeX className="h-4 w-4 text-status-critical" /> : <Volume2 className="h-4 w-4" />}
            {!collapsed && <span>{isMuted ? 'Muted' : 'Audio'}</span>}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="text-[11px] text-mine-text-secondary hover:text-mine-text-primary flex items-center gap-1 p-1 rounded transition"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-mine-text-primary" />}
            {!collapsed && <span>{isDarkMode ? 'Light' : 'Dark'}</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
