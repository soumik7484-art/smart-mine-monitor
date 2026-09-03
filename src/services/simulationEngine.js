// MINEGUARD AI — Central Simulation Engine
// State machine managing 24 sensors, 8 workers, tunnel states, anomaly injection, collapse simulation

import { INITIAL_SENSORS, INITIAL_WORKERS, MINE_TUNNELS, MINE_NODES, MINE_EXITS } from '../data/mineData.js';
import { computeSafeRoute, computeAllWorkerRoutes } from './graphRouting.js';
import { calculateAIPrediction } from './aiPrediction.js';

const HISTORY_LENGTH = 30;

export function createSimulationEngine() {
  // Deep clone initial data
  let sensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
  let workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
  let tunnelStates = {};
  MINE_TUNNELS.forEach(t => {
    tunnelStates[t.id] = { riskLevel: 'SAFE', status: 'OPEN' };
  });

  let mode = 'NORMAL'; // NORMAL | SUBSIDENCE | COLLAPSE | EMERGENCY
  let emergencyModeActive = false;
  let sirenActive = false;
  let collapsedTunnelIds = [];
  let affectedWorkerIds = [];
  let anomalyZone = null;
  let tickCount = 0;
  let alerts = [];
  let workerRoutes = {};
  let activeRouteWorkerId = 'W-003'; // Default to Zone B worker

  const nodePositionMap = {};
  MINE_NODES.forEach(n => { nodePositionMap[n.id] = { x: n.x, y: n.y }; });
  MINE_EXITS.forEach(e => { nodePositionMap[e.id] = { x: e.x, y: e.y }; });


  // Initialize sensor history
  sensors.forEach(s => {
    const now = Date.now();
    for (let i = HISTORY_LENGTH; i >= 0; i--) {
      const time = new Date(now - i * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      s.history.displacement.push({ time, value: s.displacement + (Math.random() - 0.5) * 0.1 });
      s.history.tilt.push({ time, value: s.tilt + (Math.random() - 0.5) * 0.1 });
      s.history.vibration.push({ time, value: s.vibration + (Math.random() - 0.5) * 0.02 });
      s.history.stress.push({ time, value: s.stress + (Math.random() - 0.5) * 0.3 });
      s.history.temperature.push({ time, value: +(s.temperature + (Math.random() - 0.5) * 0.2).toFixed(1) });
      s.history.humidity.push({ time, value: +(s.humidity + (Math.random() - 0.5) * 1.0).toFixed(1) });
    }
  });

  function tick() {
    tickCount++;
    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    sensors.forEach(s => {
      // Base micro-fluctuation
      let dDisp = (Math.random() - 0.5) * 0.04;
      let dTilt = (Math.random() - 0.5) * 0.06;
      let dVib = (Math.random() - 0.5) * 0.015;
      let dStress = (Math.random() - 0.5) * 0.15;
      let dTemp = (Math.random() - 0.5) * 0.1;
      let dMethane = (Math.random() - 0.5) * 0.02;

      // Zone B natural drift
      if (s.zone === 'B') {
        dDisp += 0.008;
        dTilt += 0.005;
      }

      // Subsidence injection (ramp up Zone B)
      if ((mode === 'SUBSIDENCE' || mode === 'COLLAPSE' || mode === 'EMERGENCY') && s.zone === 'B') {
        dDisp += 0.12 + Math.random() * 0.25;
        dTilt += 0.08 + Math.random() * 0.15;
        dVib += 0.03 + Math.random() * 0.06;
        dStress += 0.5 + Math.random() * 1.2;
        dTemp += 0.05;
        dMethane += 0.01 + Math.random() * 0.03;
      }

      // Neighboring zone elevated readings during emergency
      if ((mode === 'COLLAPSE' || mode === 'EMERGENCY') && (s.zone === 'A' || s.zone === 'C')) {
        dDisp += 0.03 + Math.random() * 0.05;
        dTilt += 0.02 + Math.random() * 0.03;
      }

      s.displacement = Math.max(0, s.displacement + dDisp);
      s.tilt = Math.max(0, s.tilt + dTilt);
      s.vibration = Math.max(0, s.vibration + dVib);
      s.stress = Math.max(0.5, s.stress + dStress);
      s.temperature = Math.max(20, Math.min(50, s.temperature + dTemp));
      s.methane = Math.max(0, Math.min(2.5, s.methane + dMethane));
      s.humidity = Math.max(40, Math.min(95, s.humidity + (Math.random() - 0.5) * 0.5));

      // Update status and risk score
      let risk = 0;
      if (s.displacement > 10) risk += 30;
      else if (s.displacement > 5) risk += 15;
      else if (s.displacement > 2) risk += 5;

      if (s.tilt > 5) risk += 25;
      else if (s.tilt > 3) risk += 12;
      else if (s.tilt > 1.5) risk += 4;

      if (s.vibration > 0.7) risk += 20;
      else if (s.vibration > 0.4) risk += 10;
      else if (s.vibration > 0.15) risk += 3;

      if (s.stress > 20) risk += 15;
      else if (s.stress > 12) risk += 8;
      else if (s.stress > 5) risk += 2;

      if (s.methane > 1.5) risk += 10;
      else if (s.methane > 1.0) risk += 5;

      s.riskScore = Math.min(100, risk);

      if (s.riskScore >= 80) s.status = 'CRITICAL';
      else if (s.riskScore >= 50) s.status = 'WARNING';
      else if (s.riskScore >= 20) s.status = 'CAUTION';
      else s.status = 'SAFE';

      // Update tunnel risk based on sensor readings
      const zoneTunnels = MINE_TUNNELS.filter(t => t.zone === s.zone || t.zone.includes(s.zone));
      zoneTunnels.forEach(t => {
        if (tunnelStates[t.id]?.status !== 'COLLAPSED') {
          if (s.riskScore >= 80) tunnelStates[t.id].riskLevel = 'CRITICAL';
          else if (s.riskScore >= 50) tunnelStates[t.id].riskLevel = 'WARNING';
          else if (s.riskScore >= 20) tunnelStates[t.id].riskLevel = 'CAUTION';
          else tunnelStates[t.id].riskLevel = 'SAFE';
        }
      });

      // Push history
      s.history.displacement.push({ time, value: s.displacement });
      s.history.tilt.push({ time, value: s.tilt });
      s.history.vibration.push({ time, value: s.vibration });
      s.history.stress.push({ time, value: s.stress });
      s.history.temperature.push({ time, value: +s.temperature.toFixed(1) });
      s.history.humidity.push({ time, value: +s.humidity.toFixed(1) });

      if (s.history.displacement.length > HISTORY_LENGTH) s.history.displacement.shift();
      if (s.history.tilt.length > HISTORY_LENGTH) s.history.tilt.shift();
      if (s.history.vibration.length > HISTORY_LENGTH) s.history.vibration.shift();
      if (s.history.stress.length > HISTORY_LENGTH) s.history.stress.shift();
      if (s.history.temperature.length > HISTORY_LENGTH) s.history.temperature.shift();
      if (s.history.humidity.length > HISTORY_LENGTH) s.history.humidity.shift();
    });

    // Battery drain simulation
    if (tickCount % 15 === 0) {
      sensors.forEach(s => {
        s.battery = Math.max(5, s.battery - 1);
      });
    }

    // Worker biometric micro-simulation (Smart Helmet & Tag)
    workers.forEach(w => {
      if (w.helmet === 'Connected') {
        if (w.status === 'EVACUATING') {
          const cur = w.heartRate || 108;
          w.heartRate = Math.min(125, Math.max(98, Math.round(cur + (Math.random() - 0.45) * 3)));
        } else {
          const base = w.heartRate || 72;
          w.heartRate = Math.min(84, Math.max(64, Math.round(base + (Math.random() - 0.5) * 2)));
        }
      } else {
        w.heartRate = 0;
      }
      if (tickCount % 60 === 0 && w.tagBattery > 5) {
        w.tagBattery = Math.max(5, w.tagBattery - 1);
      }
    });
  }

  function triggerSubsidence() {
    mode = 'SUBSIDENCE';
    anomalyZone = 'B';
    alerts.unshift({
      id: `ALT-${Date.now()}`,
      severity: 'WARNING',
      title: 'Strata Subsidence Detected',
      location: 'Zone B — Active Face',
      description: 'Accelerating ground displacement detected across Zone B sensors. Monitoring intensified.',
      timestamp: new Date().toISOString(),
    });
    return { mode, alert: alerts[0] };
  }

  function triggerCollapse(tunnelId = 'T-12') {
    mode = 'COLLAPSE';
    emergencyModeActive = true;
    sirenActive = true;

    // Collapse the specified tunnel
    collapsedTunnelIds = [tunnelId];
    tunnelStates[tunnelId] = { riskLevel: 'COLLAPSED', status: 'COLLAPSED' };

    // Also set Zone B tunnels to WARNING
    ['T-11', 'T-13', 'T-16'].forEach(tid => {
      if (tunnelStates[tid] && tid !== tunnelId) {
        tunnelStates[tid].riskLevel = 'WARNING';
      }
    });

    // Mark Zone B workers as EVACUATING
    affectedWorkerIds = workers.filter(w => w.zone === 'B').map(w => w.id);
    workers.forEach(w => {
      if (w.zone === 'B') {
        w.status = 'EVACUATING';
        w.movement = 'Rapid';
      }
    });

    // Compute safe routes for all workers
    workerRoutes = computeAllWorkerRoutes(workers, tunnelStates);

    alerts.unshift({
      id: `ALT-${Date.now()}`,
      severity: 'CRITICAL',
      title: `🚨 TUNNEL ${tunnelId} COLLAPSED — REROUTING`,
      location: 'Zone B — Active Face',
      description: `Roof collapse in ${tunnelId}. Previous route unsafe. Alternative safe evacuation routes calculated via Dijkstra shortest-safe-path.`,
      timestamp: new Date().toISOString(),
    });

    return { mode, collapsedTunnelIds, affectedWorkerIds, workerRoutes, alert: alerts[0] };
  }

  function advanceEvacuation() {
    // Move evacuating workers one step along their route
    workers.forEach(w => {
      if (w.status === 'EVACUATING') {
        const route = workerRoutes[w.id];
        if (route && route.routeNodes.length > 0) {
          const currentIndex = route.routeNodes.indexOf(w.nodeId);
          if (currentIndex >= 0 && currentIndex < route.routeNodes.length - 1) {
            const nextNodeId = route.routeNodes[currentIndex + 1];
            w.nodeId = nextNodeId;
            if (nodePositionMap[nextNodeId]) {
              w.xCoord = nodePositionMap[nextNodeId].x;
              w.yCoord = nodePositionMap[nextNodeId].y;
            }
          } else if (currentIndex === route.routeNodes.length - 1) {
            w.status = 'SAFE';
            w.movement = 'Stationary';
          }
        }
      }
    });

  }

  function resetToNormal() {
    mode = 'NORMAL';
    emergencyModeActive = false;
    sirenActive = false;
    anomalyZone = null;
    collapsedTunnelIds = [];
    affectedWorkerIds = [];
    workerRoutes = {};

    // Reset tunnels
    MINE_TUNNELS.forEach(t => {
      tunnelStates[t.id] = { riskLevel: 'SAFE', status: 'OPEN' };
    });

    // Reset sensors
    sensors = JSON.parse(JSON.stringify(INITIAL_SENSORS));
    sensors.forEach(s => {
      const now = Date.now();
      s.history = { displacement: [], tilt: [], vibration: [], stress: [], temperature: [], humidity: [] };
      for (let i = HISTORY_LENGTH; i >= 0; i--) {
        const time = new Date(now - i * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        s.history.displacement.push({ time, value: s.displacement + (Math.random() - 0.5) * 0.1 });
        s.history.tilt.push({ time, value: s.tilt + (Math.random() - 0.5) * 0.1 });
        s.history.vibration.push({ time, value: s.vibration + (Math.random() - 0.5) * 0.02 });
        s.history.stress.push({ time, value: s.stress + (Math.random() - 0.5) * 0.3 });
        s.history.temperature.push({ time, value: +(s.temperature + (Math.random() - 0.5) * 0.2).toFixed(1) });
        s.history.humidity.push({ time, value: +(s.humidity + (Math.random() - 0.5) * 1.0).toFixed(1) });
      }
    });

    // Reset workers
    workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
    alerts = [];

    return { mode };
  }

  function overrideSensorValue(sensorId, param, value) {
    const sensor = sensors.find(s => s.id === sensorId);
    if (sensor && param in sensor) {
      sensor[param] = value;
    }
  }

  function toggleTunnelBlock(tunnelId) {
    const state = tunnelStates[tunnelId];
    if (state) {
      if (state.status === 'COLLAPSED') {
        state.status = 'OPEN';
        state.riskLevel = 'SAFE';
        collapsedTunnelIds = collapsedTunnelIds.filter(id => id !== tunnelId);
      } else {
        state.status = 'COLLAPSED';
        state.riskLevel = 'COLLAPSED';
        if (!collapsedTunnelIds.includes(tunnelId)) {
          collapsedTunnelIds.push(tunnelId);
        }
      }
      // Recompute routes
      workerRoutes = computeAllWorkerRoutes(workers, tunnelStates);
    }
  }

  function relocateWorker(workerId, nodeId) {
    const worker = workers.find(w => w.id === workerId);
    if (worker) {
      worker.nodeId = nodeId;
      if (nodePositionMap[nodeId]) {
        worker.xCoord = nodePositionMap[nodeId].x;
        worker.yCoord = nodePositionMap[nodeId].y;
      }
      // Recompute route for this worker
      const route = computeSafeRoute(nodeId, null, tunnelStates);
      if (route) {
        workerRoutes[workerId] = route;
      }
    }
  }

  function getState() {
    const aiPrediction = calculateAIPrediction(sensors);

    const activeSensors = sensors.filter(s => s.battery > 5).length;
    const criticalSensors = sensors.filter(s => s.status === 'CRITICAL').length;
    const warningSensors = sensors.filter(s => s.status === 'WARNING' || s.status === 'CAUTION').length;

    const overallRisk = Math.round(sensors.reduce((sum, s) => sum + s.riskScore, 0) / sensors.length);
    let overallCondition = 'MONITORING';
    if (emergencyModeActive) overallCondition = 'EMERGENCY';
    else if (overallRisk >= 60) overallCondition = 'CRITICAL';
    else if (overallRisk >= 30) overallCondition = 'WARNING';

    return {
      sensors: [...sensors],
      workers: [...workers],
      tunnelStates: { ...tunnelStates },
      mode,
      emergencyModeActive,
      sirenActive,
      collapsedTunnelIds: [...collapsedTunnelIds],
      affectedWorkerIds: [...affectedWorkerIds],
      workerRoutes: { ...workerRoutes },
      alerts: [...alerts],
      aiPrediction,
      activeRouteWorkerId,
      stats: {
        activeSensors,
        totalSensors: 24,
        criticalSensors,
        warningSensors,
        workersUnderground: workers.length,
        evacuatingWorkers: workers.filter(w => w.status === 'EVACUATING').length,
        systemHealth: Math.round((activeSensors / 24) * 100 * 10) / 10,
        overallRisk,
        overallCondition,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    tick,
    getState,
    triggerSubsidence,
    triggerCollapse,
    advanceEvacuation,
    resetToNormal,
    overrideSensorValue,
    toggleTunnelBlock,
    relocateWorker,
    setActiveRouteWorker: (id) => { activeRouteWorkerId = id; },
  };
}
