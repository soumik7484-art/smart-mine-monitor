// MINEGUARD AI — Central React Context
// Replaces App.jsx prop drilling with context-based state management
// Integrates simulation engine + background ML backend health & polling bridge
// Tracks real-time interactive incident audit log for all manual & automated map/sensor changes

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { createSimulationEngine } from '../services/simulationEngine.js';
import { audioSynth } from '../utils/audioSynth.js';
import { checkMLBackendHealth, queryMLBackend, buildMLTelemetryPayload } from '../services/mlAdapter.js';
import { setLiveMLPrediction } from '../services/aiPrediction.js';
import { MINE_TUNNELS, MINE_NODES } from '../data/mineData.js';

const INITIAL_STATUTORY_INCIDENTS = [
  { id: 'INC-2024-089', date: '2026-08-31', time: '14:22', location: 'Zone B — Panel LW-102', event: 'Micro-seismic acoustic emission surge (54.8Hz)', risk: 'CRITICAL', action: 'Zone B evacuated; 3 miners detoured via Exit E1', status: 'Resolved' },
  { id: 'INC-2024-088', date: '2026-08-30', time: '09:15', location: 'Zone B — Cross-Cut J9', event: 'LVDT roof displacement exceeded 8.2mm', risk: 'HIGH', action: 'Hydraulic props reinforced; rate monitored', status: 'Resolved' },
  { id: 'INC-2024-087', date: '2026-08-28', time: '16:45', location: 'Zone C — Depillaring DP-4', event: 'Pillar hydraulic load transfer peak 22.4 MPa', risk: 'HIGH', action: 'Caving boundary inspection; goaf barricaded', status: 'Resolved' },
  { id: 'INC-2024-086', date: '2026-08-25', time: '11:10', location: 'Zone A — Main Incline J2', event: 'NDIR methane sensor drift (0.85% LEL)', risk: 'MEDIUM', action: 'Auxiliary ventilation fan speed increased', status: 'Resolved' },
  { id: 'INC-2024-085', date: '2026-08-22', time: '03:30', location: 'Zone D — Return Airway J13', event: 'Clinometer angular deviation 2.4° in rib', risk: 'MEDIUM', action: 'Roof bolting pattern densified (1.2m grid)', status: 'Resolved' },
  { id: 'INC-2024-084', date: '2026-08-18', time: '18:05', location: 'Zone B — Face Gallery J10', event: 'LoRaWAN node S-11 transmission latency spike', risk: 'LOW', action: 'Repeater gateway rebooted; signal restored', status: 'Resolved' },
  { id: 'INC-2024-083', date: '2026-08-14', time: '08:40', location: 'Zone A — Intake Shaft J1', event: 'Routine DGMS statutory quarterly strata audit', risk: 'LOW', action: 'All extensometer benchmarks verified nominal', status: 'Resolved' },
];

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
  const [isAddMinerModalOpen, setIsAddMinerModalOpen] = useState(false);
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

  // Live Incident Audit Log state (persisted across live map actions)
  const [incidentLog, setIncidentLog] = useState(() => {
    try {
      const saved = localStorage.getItem('mineguard_incident_log');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return INITIAL_STATUTORY_INCIDENTS;
  });

  // Parse admin session from URL parameter (?session=...) or localStorage
  const parseInitialSession = () => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        let sessionParam = urlParams.get('session');

        if (!sessionParam && window.location.hash.includes('session=')) {
          const hashParts = window.location.hash.split('?');
          if (hashParts.length > 1) {
            const hashParams = new URLSearchParams(hashParts[1]);
            sessionParam = hashParams.get('session');
          }
        }

        if (sessionParam) {
          const decoded = JSON.parse(decodeURIComponent(sessionParam));
          localStorage.setItem('mineguard_active_session', JSON.stringify(decoded));
          const cleanUrl = window.location.pathname + window.location.hash.split('?')[0];
          window.history.replaceState({}, document.title, cleanUrl);
          return decoded;
        }

        const raw = localStorage.getItem('mineguard_active_session');
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse admin session:', e);
    }
    return null;
  };

  // Active Admin Session (from Admin Registration & Blueprint Portal)
  const [adminSession, setAdminSession] = useState(parseInitialSession);

  // Sync custom workers into simulation engine when adminSession is loaded FROM STORAGE (initial mount only).
  // We compare worker counts to avoid re-loading when a miner was just added via addMiner()
  // (the engine already has the new worker; re-loading would duplicate it).
  useEffect(() => {
    if (adminSession?.miners && Array.isArray(adminSession.miners) && adminSession.miners.length > 0) {
      const engineWorkers = engine.getState().workers;
      // Only reload from session if the engine hasn't already been populated with these workers
      if (engineWorkers.length !== adminSession.miners.length) {
        engine.loadCustomWorkers(adminSession.miners);
        setMineState(engine.getState());
      }
    }
  }, [adminSession, engine]);

  // ─── Toasts System (declared early so other callbacks can use addToast) ───
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

  // ─── Incident Logging System ───────────────────────────────────────────
  const logIncident = useCallback(({ location, event, risk = 'MEDIUM', action, status = 'ACTIVE' }) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const id = `INC-${now.getFullYear()}-${String(Math.floor(100 + Math.random() * 900))}`;

    const newRecord = {
      id,
      date: dateStr,
      time: timeStr,
      location,
      event,
      risk: risk.toUpperCase(),
      action,
      status,
      isLive: true,
    };

    setIncidentLog((prev) => [newRecord, ...prev]);
    return newRecord;
  }, []);

  const resetIncidentLog = useCallback(() => {
    setIncidentLog(INITIAL_STATUTORY_INCIDENTS);
    try {
      localStorage.removeItem('mineguard_incident_log');
    } catch (e) {}
  }, []);

  // Sync incident log to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mineguard_incident_log', JSON.stringify(incidentLog));
    } catch (e) {}
  }, [incidentLog]);

  // ─── Admin Session Management ──────────────────────────────────────────
  const clearAdminSession = useCallback(() => {
    try {
      localStorage.removeItem('mineguard_active_session');
    } catch (e) {}
    setAdminSession(null);
    engine.resetCustomWorkers();
    setMineState(engine.getState());
  }, [engine]);

  // Comprehensive Admin Logout (resets session and optionally redirects to admin frontpage portal)
  const logoutAdmin = useCallback((redirectToPortal = false) => {
    try {
      localStorage.removeItem('mineguard_active_session');
    } catch (e) {}
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.pathname + window.location.hash.split('?')[0];
      window.history.replaceState({}, document.title, cleanUrl);
    }
    setAdminSession(null);
    engine.resetCustomWorkers();
    setMineState(engine.getState());
    addToast({
      title: 'Logged Out',
      message: 'Admin session closed. Reverted to standard shift baseline.',
      type: 'info',
    });
    if (redirectToPortal && typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = 'http://localhost:5000/';
      }, 400);
    }
  }, [engine, addToast]);

  // Dynamically add a miner directly from the dashboard
  const addMiner = useCallback((minerData) => {
    const newWorker = engine.addWorker(minerData);
    setMineState(engine.getState());

    // Update persistent adminSession in state & localStorage so the miner stays saved
    setAdminSession((prev) => {
      const currentMiners = prev?.miners && Array.isArray(prev.miners) ? prev.miners : [];
      const updatedSession = prev
        ? { ...prev, miners: [...currentMiners, newWorker] }
        : {
            timestamp: Date.now(),
            admin: { fullName: 'Safety Controller', role: 'Mine Manager', mineName: 'Chandrapur Deep Mine' },
            miners: [...engine.getState().workers],
          };
      try {
        localStorage.setItem('mineguard_active_session', JSON.stringify(updatedSession));
      } catch (e) {}
      return updatedSession;
    });

    logIncident({
      location: `Zone ${newWorker.zone} — Node ${newWorker.nodeId}`,
      event: `New underground personnel deployed: ${newWorker.name} (${newWorker.id})`,
      risk: 'LOW',
      action: `Smart helmet registered (${newWorker.helmet}); UWB tracking linked to junction ${newWorker.nodeId}`,
      status: 'ACTIVE',
    });

    addToast({
      title: 'Miner Deployed',
      message: `${newWorker.name} (${newWorker.id}) deployed to Node ${newWorker.nodeId} in Zone ${newWorker.zone}.`,
      type: 'success',
    });

    return newWorker;
  }, [engine, logIncident, addToast]);

  // ML Backend Live State
  const [mlBackendState, setMlBackendState] = useState({
    isConnected: false,
    modelName: 'Calibrated Geotechnical Ensemble (Local Fallback)',
    endpoint: 'http://localhost:8000/predict',
    lastChecked: null,
    latencyMs: null,
    isPredicting: false,
  });

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

  // ─── Async ML Model Polling Loop (Option 2: Non-blocking 5s cadence) ──
  useEffect(() => {
    let isSubscribed = true;

    const pollMLModel = async () => {
      const health = await checkMLBackendHealth();
      if (!isSubscribed) return;

      if (health.isConnected) {
        setMlBackendState(prev => ({
          ...prev,
          isConnected: true,
          modelName: health.modelName,
          lastChecked: health.lastChecked,
          latencyMs: health.latencyMs,
          isPredicting: true,
        }));

        const currentState = engine.getState();
        const payload = buildMLTelemetryPayload(currentState.sensors);
        const prediction = await queryMLBackend(payload);

        if (!isSubscribed) return;

        if (prediction) {
          setLiveMLPrediction(prediction);
          setMineState(engine.getState());
        }

        setMlBackendState(prev => ({ ...prev, isPredicting: false }));
      } else {
        setLiveMLPrediction(null);
        setMlBackendState(prev => ({
          ...prev,
          isConnected: false,
          modelName: 'Calibrated Geotechnical Ensemble (Local Fallback)',
          lastChecked: health.lastChecked,
          latencyMs: null,
          isPredicting: false,
        }));
      }
    };

    pollMLModel();
    const mlInterval = setInterval(pollMLModel, 5000);
    return () => {
      isSubscribed = false;
      clearInterval(mlInterval);
    };
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

  // ─── Scenario Actions With Automatic Audit Logging ───────────────────
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

    logIncident({
      location: 'Zone B — Active Face Dip 2',
      event: 'Accelerating ground deformation & subsidence threshold triggered (LVDT rate > 12mm/hr)',
      risk: 'CRITICAL',
      action: 'Automated audible siren sounder initiated; workers advised to move to refuge chamber REF-1',
      status: 'ACTIVE',
    });

    return result;
  }, [engine, addToast, logIncident]);

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

    const tunnelObj = MINE_TUNNELS.find(t => t.id === tunnelId);
    const loc = tunnelObj ? `Zone ${tunnelObj.zone} — ${tunnelObj.label} (${tunnelId})` : `Tunnel ${tunnelId}`;

    logIncident({
      location: loc,
      event: `Simulated roof strata collapse in gallery tunnel ${tunnelId}`,
      risk: 'CRITICAL',
      action: 'Dijkstra shortest-safe-path re-route computed; tunnel blocked on vector CAD schematic',
      status: 'ACTIVE',
    });

    return result;
  }, [engine, isMuted, addToast, logIncident]);

  const resetToNormal = useCallback(() => {
    engine.resetToNormal();

    // If an admin session with custom miners is active, restore them after reset
    // so the map keeps showing the registered shift crew, not the default mock workers
    if (adminSession?.miners && Array.isArray(adminSession.miners) && adminSession.miners.length > 0) {
      engine.loadCustomWorkers(adminSession.miners);
    }

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

    logIncident({
      location: 'All Sectors (Zone A - D)',
      event: 'Control room operator triggered baseline recovery reset',
      risk: 'LOW',
      action: 'Cleared all simulated blockages and strata offsets; returned sensors to nominal monitoring',
      status: 'Resolved',
    });
  }, [engine, adminSession, addToast, logIncident]);

  const advanceEvacuation = useCallback(() => {
    engine.advanceEvacuation();
    setMineState(engine.getState());
    audioSynth.playClick();
    addToast({
      title: 'Evacuation Step Advanced',
      message: 'Miners stepped 1 junction forward along safe computed detour.',
      type: 'info',
    });

    logIncident({
      location: 'Underground Evacuation Network',
      event: 'Dispatched dynamic waypoint navigation advance',
      risk: 'MEDIUM',
      action: 'Miners sequenced 1 junction forward towards designated surface shaft',
      status: 'ACTIVE',
    });
  }, [engine, addToast, logIncident]);

  // ─── Real Map Change Handler: Toggle Tunnel Block / Collapse ─────────
  const toggleTunnelBlock = useCallback((tunnelId) => {
    const wasCollapsed = mineState.tunnelStates?.[tunnelId]?.status === 'COLLAPSED';
    engine.toggleTunnelBlock(tunnelId);
    const newState = engine.getState();
    setMineState(newState);

    const tunnelObj = MINE_TUNNELS.find(t => t.id === tunnelId);
    const loc = tunnelObj ? `Zone ${tunnelObj.zone} — ${tunnelObj.label} (${tunnelId})` : `Tunnel ${tunnelId}`;

    if (!wasCollapsed) {
      // Tunnel was blocked / collapsed on map
      const adjacentNodes = tunnelObj ? [tunnelObj.from, tunnelObj.to] : [];
      const minersInRoad = (newState.workers || []).filter(w =>
        adjacentNodes.includes(w.nodeId) || (tunnelObj?.zone && w.zone === tunnelObj.zone.charAt(0))
      );

      if (minersInRoad.length > 0) {
        // A miner is in or adjacent to the collapsed road!
        audioSynth.playWarning();
        if (!isMuted) audioSynth.startSiren();
        setBannerNotification(
          `🚨 EMERGENCY: Tunnel ${tunnelId} collapsed with ${minersInRoad.length} miner(s) in affected road (${minersInRoad.map(m => m.name).join(', ')})! Siren active.`
        );
        addToast({
          title: `🚨 Siren Active: Tunnel ${tunnelId}`,
          message: `${minersInRoad.length} miner(s) affected in collapsed road (${tunnelId})! Evacuation siren sounded.`,
          type: 'critical',
        });
      } else {
        audioSynth.playWarning();
        addToast({
          title: `Map Updated: ${tunnelId} Blocked`,
          message: `Tunnel ${tunnelId} marked impassable. No personnel in this segment.`,
          type: 'warning',
        });
      }

      logIncident({
        location: loc,
        event: `Manual blockage simulated on Map: ${tunnelId} marked IMPASSABLE`,
        risk: minersInRoad.length > 0 ? 'CRITICAL' : 'HIGH',
        action: minersInRoad.length > 0
          ? `Evacuation siren activated; emergency detours computed for ${minersInRoad.length} personnel`
          : 'Dynamic rerouting initiated for all personnel; tunnel flagged on digital mine CAD',
        status: 'ACTIVE',
      });
    } else {
      // Tunnel was cleared / reopened on map
      const stillHasEvac = (newState.workers || []).some(w => w.status === 'EVACUATING');
      if (!stillHasEvac || newState.collapsedTunnelIds.length === 0) {
        audioSynth.stopSiren();
        setBannerNotification(null);
      }
      audioSynth.playSuccess();
      logIncident({
        location: loc,
        event: `Tunnel ${tunnelId} cleared and declared structurally secure`,
        risk: 'LOW',
        action: 'DGMS strata clearance logged; haulage path reopened on CAD network',
        status: 'Resolved',
      });
      addToast({
        title: `Map Updated: ${tunnelId} Reopened`,
        message: `Tunnel ${tunnelId} reopened. Incident audit log updated.`,
        type: 'success',
      });
    }
  }, [engine, mineState.tunnelStates, isMuted, logIncident, addToast]);

  // ─── Real Map Change Handler: Relocate Miner Underground ─────────────
  const relocateWorker = useCallback((workerId, nodeId) => {
    const worker = mineState.workers?.find(w => w.id === workerId);
    const prevNode = worker?.nodeId || 'Unknown';
    engine.relocateWorker(workerId, nodeId);
    setMineState(engine.getState());

    const nodeObj = MINE_NODES.find(n => n.id === nodeId);
    const nodeLabel = nodeObj ? `${nodeObj.label} (${nodeId})` : nodeId;

    logIncident({
      location: `Subsurface Node ${nodeId}`,
      event: `Personnel movement: Miner ${worker?.name || workerId} relocated from ${prevNode} to ${nodeId}`,
      risk: 'LOW',
      action: 'UWB positioning anchor confirmed miner tag fix; route re-evaluated',
      status: 'Resolved',
    });

    addToast({
      title: 'Miner Repositioned',
      message: `${worker?.name || workerId} moved to ${nodeLabel}. Audit log updated.`,
      type: 'info',
    });
  }, [engine, mineState.workers, logIncident, addToast]);

  // ─── Real Telemetry Override Handler (Sensor Simulator / Injections) ──
  const overrideSensorValue = useCallback((sensorId, param, value) => {
    engine.overrideSensorValue(sensorId, param, value);
    setMineState(engine.getState());

    // If overridden value exceeds warning thresholds, log incident
    const s = mineState.sensors?.find(sen => sen.id === sensorId);
    const isCritical = (param === 'displacement' && value >= 5.0) ||
                       (param === 'tilt' && value >= 3.0) ||
                       (param === 'vibration' && value >= 0.4) ||
                       (param === 'stress' && value >= 15.0);

    if (isCritical) {
      logIncident({
        location: `Zone ${s?.zone || 'Unknown'} — Node ${sensorId}`,
        event: `Telemetry override on map: ${param} set to ${value} (Threshold exceeded)`,
        risk: 'HIGH',
        action: 'Telemetry anomaly captured in control room audit record; safety team alerted',
        status: 'ACTIVE',
      });
    }
  }, [engine, mineState.sensors, logIncident]);

  const silenceSiren = useCallback(() => {
    audioSynth.stopSiren();
    setMineState(prev => ({ ...prev, sirenActive: false }));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      audioSynth.setMuted(next);
      return next;
    });
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
    isAddMinerModalOpen,
    isSidebarOpen,
    selectedSensor,
    selectedWorker,
    selectedTunnel,
    zoneFilter,
    theme,
    isDarkMode: theme === 'dark',
    toasts,
    mlBackendState,
    incidentLog,
    adminSession,
    clearAdminSession,
    logoutAdmin,

    // Actions
    addMiner,
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
    logIncident,
    resetIncidentLog,
    silenceSiren,
    toggleMute,
    setIsEmergencyHUDOpen,
    setIsSIHTourOpen,
    setIsSensorSimulatorOpen,
    setIsAddMinerModalOpen,
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
