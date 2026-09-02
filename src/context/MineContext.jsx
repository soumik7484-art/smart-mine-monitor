// MINEGUARD AI — Central React Context
// Replaces App.jsx prop drilling with context-based state management

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createSimulationEngine } from '../services/simulationEngine.js';
import { audioSynth } from '../utils/audioSynth.js';

const MineContext = createContext(null);

export const MineProvider = ({ children }) => {
  const engineRef = useRef(null);
  if (!engineRef.current) {
    engineRef.current = createSimulationEngine();
  }
  const engine = engineRef.current;

  const [mineState, setMineState] = useState(() => engine.getState());
  const [isMuted, setIsMuted] = useState(false);
  const [bannerNotification, setBannerNotification] = useState(null);
  const [isEmergencyHUDOpen, setIsEmergencyHUDOpen] = useState(false);
  const [isSIHTourOpen, setIsSIHTourOpen] = useState(false);
  const [isSensorSimulatorOpen, setIsSensorSimulatorOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedTunnel, setSelectedTunnel] = useState(null);
  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mineguard_theme') || 'light';
    }
    return 'light';
  });
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 5000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newToast = { id, title, message, type, time };
    setToasts((prev) => [newToast, ...prev].slice(0, 5));
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('mineguard_theme', theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // ─── Simulation Tick (2s) ─────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      engine.tick();
      setMineState(engine.getState());
    }, 2000);
    return () => clearInterval(interval);
  }, [engine]);

  // ─── Audio sync ───────────────────────────────────────────────────────
  useEffect(() => {
    audioSynth.setMuted(isMuted);
  }, [isMuted]);

  useEffect(() => {
    if (mineState.sirenActive && !isMuted) {
      audioSynth.startSiren();
    } else {
      audioSynth.stopSiren();
    }
  }, [mineState.sirenActive, isMuted]);

  // ─── Banner auto-dismiss ──────────────────────────────────────────────
  useEffect(() => {
    if (bannerNotification) {
      const timer = setTimeout(() => setBannerNotification(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [bannerNotification]);

  // ─── Scenario Actions ─────────────────────────────────────────────────
  const triggerSubsidence = useCallback(() => {
    const result = engine.triggerSubsidence();
    setMineState(engine.getState());
    audioSynth.playWarning();
    setBannerNotification(`⚠️ SUBSIDENCE ALERT: Accelerating ground displacement detected in Zone B`);
    addToast({
      title: 'Subsidence Alert',
      message: 'Accelerating ground displacement detected in Zone B (LVDT #3)',
      type: 'warning',
    });
    return result;
  }, [engine, addToast]);

  const triggerCollapse = useCallback((tunnelId = 'T-12') => {
    const result = engine.triggerCollapse(tunnelId);
    setMineState(engine.getState());
    audioSynth.playWarning();
    if (!isMuted) audioSynth.startSiren();
    setBannerNotification(`🚨 ROUTE UPDATED: Previous route through ${tunnelId} is unsafe. Alternative safe evacuation route calculated.`);
    addToast({
      title: `Tunnel Collapse: ${tunnelId}`,
      message: 'Detour computed! Safe alternate path via Crosscut-4 to Exit E1',
      type: 'critical',
    });
    setIsEmergencyHUDOpen(true);
    return result;
  }, [engine, isMuted, addToast]);

  const resetToNormal = useCallback(() => {
    engine.resetToNormal();
    setMineState(engine.getState());
    audioSynth.stopSiren();
    audioSynth.playSuccess();
    setBannerNotification(null);
    setIsEmergencyHUDOpen(false);
    setBannerNotification('✅ System restored to normal operations.');
    addToast({
      title: 'Baseline Restored',
      message: 'All sensors and gallery tunnels restored to nominal state.',
      type: 'success',
    });
  }, [engine, addToast]);

  const advanceEvacuation = useCallback(() => {
    engine.advanceEvacuation();
    setMineState(engine.getState());
    audioSynth.playClick();
    addToast({
      title: 'Evacuation Step Advanced',
      message: 'Miners stepped 1 junction forward along safe computed detour.',
      type: 'info',
    });
  }, [engine, addToast]);

  const toggleTunnelBlock = useCallback((tunnelId) => {
    engine.toggleTunnelBlock(tunnelId);
    setMineState(engine.getState());
    audioSynth.playClick();
  }, [engine]);

  const relocateWorker = useCallback((workerId, nodeId) => {
    engine.relocateWorker(workerId, nodeId);
    setMineState(engine.getState());
  }, [engine]);

  const overrideSensorValue = useCallback((sensorId, param, value) => {
    engine.overrideSensorValue(sensorId, param, value);
    setMineState(engine.getState());
  }, [engine]);

  const silenceSiren = useCallback(() => {
    audioSynth.stopSiren();
    // Note: doesn't change emergencyModeActive, just silences audio
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  // ─── Keyboard Shortcut: Ctrl+Shift+E ─────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        if (mineState.emergencyModeActive) {
          resetToNormal();
        } else {
          triggerSubsidence();
          setTimeout(() => triggerCollapse('T-12'), 3000);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mineState.emergencyModeActive, resetToNormal, triggerSubsidence, triggerCollapse]);

  const value = {
    // State
    ...mineState,
    isMuted,
    bannerNotification,
    isEmergencyHUDOpen,
    isSIHTourOpen,
    isSensorSimulatorOpen,
    isSidebarOpen,
    selectedSensor,
    selectedWorker,
    selectedTunnel,
    zoneFilter,
    theme,
    isDarkMode: theme === 'dark',
    toasts,

    // Actions
    addToast,
    removeToast,
    toggleTheme,
    triggerSubsidence,
    triggerCollapse,
    resetToNormal,
    advanceEvacuation,
    toggleTunnelBlock,
    relocateWorker,
    overrideSensorValue,
    silenceSiren,
    toggleMute,
    setIsEmergencyHUDOpen,
    setIsSIHTourOpen,
    setIsSensorSimulatorOpen,
    setIsSidebarOpen,
    setSelectedSensor,
    setSelectedWorker,
    setSelectedTunnel,
    setZoneFilter,
    setBannerNotification,
  };

  return (
    <MineContext.Provider value={value}>
      {children}
    </MineContext.Provider>
  );
};

export const useMine = () => {
  const context = useContext(MineContext);
  if (!context) {
    throw new Error('useMine must be used within a MineProvider');
  }
  return context;
};
