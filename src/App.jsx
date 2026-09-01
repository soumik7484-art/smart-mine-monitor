import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from './components/layout/AppLayout';
import Overview from './pages/Overview';
import MineMapPage from './pages/MineMap';
import SensorNetwork from './pages/SensorNetwork';
import RiskAnalysis from './pages/RiskAnalysis';
import WorkerSafety from './pages/WorkerSafety';
import Emergency from './pages/Emergency';
import IncidentHistory from './pages/IncidentHistory';
import { createSensorSimulation } from './data/sensorSimulation';
import { initialWorkers } from './data/workers';
import { mineLayout, calculateEvacuationRoute } from './data/mineLayout';
import { useRiskEngine } from './hooks/useRiskEngine';

export default function App() {
  const [simulation] = useState(() => createSensorSimulation());
  const [sensorData, setSensorData] = useState(simulation.getState());
  const [workers, setWorkers] = useState(initialWorkers);
  const [emergencyState, setEmergencyState] = useState({
    active: false,
    section: null,
    description: null,
    affectedWorkers: [],
    blockedTunnels: [],
    evacuationRoute: null,
    triggeredAt: null,
  });
  const [alerts, setAlerts] = useState([
    {
      id: 'a1',
      time: '10:42',
      location: 'Section B-03',
      sensor: 'Displacement',
      event: 'Rapid increase detected',
      severity: 'HIGH',
      status: 'Investigating',
    },
    {
      id: 'a2',
      time: '10:38',
      location: 'Section C-02',
      sensor: 'Vibration',
      event: 'Abnormal vibration pattern',
      severity: 'MEDIUM',
      status: 'Monitoring',
    },
    {
      id: 'a3',
      time: '10:21',
      location: 'Section A-04',
      sensor: 'Temperature',
      event: 'Temperature rise above threshold',
      severity: 'LOW',
      status: 'Resolved',
    },
  ]);
  const [incidents, setIncidents] = useState([
    { id: 'i1', date: '2026-08-31', time: '14:22', location: 'Section B-03', event: 'Ground displacement spike', risk: 'HIGH', action: 'Section evacuated', status: 'Resolved' },
    { id: 'i2', date: '2026-08-30', time: '09:15', location: 'Section C-01', event: 'Vibration anomaly detected', risk: 'MEDIUM', action: 'Monitoring intensified', status: 'Resolved' },
    { id: 'i3', date: '2026-08-29', time: '16:48', location: 'Section A-02', event: 'Gas level warning', risk: 'MEDIUM', action: 'Ventilation increased', status: 'Resolved' },
    { id: 'i4', date: '2026-08-28', time: '11:30', location: 'Section D-01', event: 'Sensor node offline', risk: 'LOW', action: 'Node replaced', status: 'Resolved' },
    { id: 'i5', date: '2026-08-27', time: '08:05', location: 'Section B-02', event: 'Tilt threshold exceeded', risk: 'HIGH', action: 'Structural inspection', status: 'Resolved' },
    { id: 'i6', date: '2026-08-25', time: '13:40', location: 'Section A-01', event: 'Water ingress detected', risk: 'MEDIUM', action: 'Pumping activated', status: 'Resolved' },
    { id: 'i7', date: '2026-08-24', time: '07:22', location: 'Section C-03', event: 'Communication loss', risk: 'LOW', action: 'Repeater installed', status: 'Resolved' },
    { id: 'i8', date: '2026-08-22', time: '15:55', location: 'Section B-01', event: 'Minor subsidence event', risk: 'HIGH', action: 'Area cordoned', status: 'Resolved' },
  ]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [lastSync, setLastSync] = useState(new Date());

  const riskData = useRiskEngine(sensorData);

  // Update sensor data every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      simulation.tick();
      setSensorData({ ...simulation.getState() });
      setLastSync(new Date());
    }, 2000);
    return () => clearInterval(interval);
  }, [simulation]);

  // Update workers based on emergency state
  useEffect(() => {
    if (emergencyState.active) {
      setWorkers(prev =>
        prev.map(w => {
          if (w.zone === emergencyState.section || emergencyState.affectedWorkers.includes(w.id)) {
            return { ...w, risk: 'High', status: 'EVACUATING' };
          }
          return w;
        })
      );
    } else {
      setWorkers(initialWorkers);
    }
  }, [emergencyState.active, emergencyState.section, emergencyState.affectedWorkers]);

  const triggerEmergency = useCallback(() => {
    simulation.triggerAnomaly('N-07');
    const route = calculateEvacuationRoute('B-03', 'EXIT-1', ['B-03_B-04']);
    setEmergencyState({
      active: true,
      section: 'Section B-03',
      description: 'Ground instability detected. Rapid displacement increase and elevated vibration levels in Section B-03.',
      affectedWorkers: ['W-104', 'W-108', 'W-112', 'W-115'],
      blockedTunnels: ['B-03_B-04'],
      evacuationRoute: route,
      triggeredAt: new Date(),
    });
    setAlerts(prev => [
      {
        id: `a-em-${Date.now()}`,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        location: 'Section B-03',
        sensor: 'Multiple',
        event: 'EMERGENCY — Ground instability',
        severity: 'CRITICAL',
        status: 'Emergency Active',
      },
      ...prev,
    ]);
    setIncidents(prev => [
      {
        id: `i-em-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        location: 'Section B-03',
        event: 'Emergency evacuation triggered',
        risk: 'CRITICAL',
        action: 'Evacuation in progress',
        status: 'Active',
      },
      ...prev,
    ]);
  }, [simulation]);

  const resetEmergency = useCallback(() => {
    simulation.reset();
    setEmergencyState({
      active: false,
      section: null,
      description: null,
      affectedWorkers: [],
      blockedTunnels: [],
      evacuationRoute: null,
      triggeredAt: null,
    });
  }, [simulation]);

  // Keyboard shortcut for emergency simulation
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        if (emergencyState.active) {
          resetEmergency();
        } else {
          triggerEmergency();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [emergencyState.active, triggerEmergency, resetEmergency]);

  const appState = {
    sensorData,
    workers,
    emergencyState,
    alerts,
    incidents,
    riskData,
    selectedNode,
    setSelectedNode,
    lastSync,
    mineLayout,
    triggerEmergency,
    resetEmergency,
  };

  return (
    <Routes>
      <Route path="/" element={<AppLayout appState={appState} />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<Overview {...appState} />} />
        <Route path="mine-map" element={<MineMapPage {...appState} />} />
        <Route path="sensor-network" element={<SensorNetwork {...appState} />} />
        <Route path="risk-analysis" element={<RiskAnalysis {...appState} />} />
        <Route path="worker-safety" element={<WorkerSafety {...appState} />} />
        <Route path="emergency" element={<Emergency {...appState} />} />
        <Route path="incident-history" element={<IncidentHistory {...appState} />} />
      </Route>
    </Routes>
  );
}
