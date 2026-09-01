/**
 * Sensor Simulation Engine
 *
 * Generates realistic time-series data for 28 mine sensor nodes.
 * Data follows realistic patterns: stable → gradual drift → spike → recovery.
 *
 * This module is intentionally separated from the UI so it can later
 * be replaced with real ESP32 WebSocket feeds.
 */

const SECTIONS = [
  { key: 'A', nodeCount: 7, startId: 1 },
  { key: 'B', nodeCount: 7, startId: 8 },
  { key: 'C', nodeCount: 7, startId: 15 },
  { key: 'D', nodeCount: 7, startId: 22 },
];

const HISTORY_SIZE = 30;

// Baseline ranges
const BASELINES = {
  tilt: { min: 0.5, max: 2.0 },
  vibration: { min: 0.05, max: 0.20 },
  displacement: { min: 0.1, max: 1.0 },
  temperature: { min: 26, max: 30 },
  gasValue: { min: 0, max: 20 },
};

// Thresholds
const THRESHOLDS = {
  tilt: { warn: 3, crit: 5 },
  vibration: { warn: 0.3, crit: 0.7 },
  displacement: { warn: 1.5, crit: 3.5 },
  temperature: { warn: 30, crit: 34 },
  gasValue: { warn: 20, crit: 50 },
};

function randBetween(min, max) {
  return min + Math.random() * (max - min);
}

function formatTime(date) {
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function computeStatus(tilt, vibration, displacement, temperature, gasValue) {
  let risk = 0;
  const fields = [
    { value: tilt, warn: THRESHOLDS.tilt.warn, crit: THRESHOLDS.tilt.crit },
    { value: vibration, warn: THRESHOLDS.vibration.warn, crit: THRESHOLDS.vibration.crit },
    { value: displacement, warn: THRESHOLDS.displacement.warn, crit: THRESHOLDS.displacement.crit },
    { value: temperature, warn: THRESHOLDS.temperature.warn, crit: THRESHOLDS.temperature.crit },
    { value: gasValue, warn: THRESHOLDS.gasValue.warn, crit: THRESHOLDS.gasValue.crit },
  ];

  for (const f of fields) {
    if (f.value >= f.crit) risk += 25;
    else if (f.value >= f.warn) risk += 10;
  }

  // Clamp
  risk = Math.min(100, Math.max(0, risk));

  let status = 'SAFE';
  if (risk >= 80) status = 'CRITICAL';
  else if (risk >= 50) status = 'HIGH';
  else if (risk >= 20) status = 'WARNING';

  return { riskScore: risk, status };
}

function generateNodes() {
  const nodes = [];
  const now = Date.now();

  for (const section of SECTIONS) {
    for (let i = 0; i < section.nodeCount; i++) {
      const num = section.startId + i;
      const id = `N-${String(num).padStart(2, '0')}`;
      const location = `Section ${section.key}-${String(i + 1).padStart(2, '0')}`;

      const tilt = randBetween(BASELINES.tilt.min, BASELINES.tilt.max);
      const vibration = randBetween(BASELINES.vibration.min, BASELINES.vibration.max);
      const displacement = randBetween(BASELINES.displacement.min, BASELINES.displacement.max);
      const temperature = randBetween(BASELINES.temperature.min, BASELINES.temperature.max);
      const gasValue = randBetween(BASELINES.gasValue.min, BASELINES.gasValue.max);
      const battery = Math.round(randBetween(70, 100));

      // Generate history as keyed arrays
      const history = {
        displacement: [],
        tilt: [],
        vibration: [],
        temperature: [],
        gasValue: [],
      };

      for (let h = HISTORY_SIZE - 1; h >= 0; h--) {
        const t = formatTime(new Date(now - h * 60000)); // 1-minute intervals for 30 min
        history.displacement.push({ time: t, value: randBetween(BASELINES.displacement.min, BASELINES.displacement.max) });
        history.tilt.push({ time: t, value: randBetween(BASELINES.tilt.min, BASELINES.tilt.max) });
        history.vibration.push({ time: t, value: randBetween(BASELINES.vibration.min, BASELINES.vibration.max) });
        history.temperature.push({ time: t, value: randBetween(BASELINES.temperature.min, BASELINES.temperature.max) });
        history.gasValue.push({ time: t, value: randBetween(BASELINES.gasValue.min, BASELINES.gasValue.max) });
      }

      const { riskScore, status } = computeStatus(tilt, vibration, displacement, temperature, gasValue);

      nodes.push({
        id,
        location,
        tilt,
        vibration,
        displacement,
        temperature,
        gas: gasValue > 50 ? 'High' : gasValue > 20 ? 'Elevated' : 'Normal',
        gasValue,
        battery,
        signal: battery > 50 ? 'Good' : battery > 30 ? 'Fair' : 'Poor',
        status,
        riskScore,
        lastUpdate: new Date(),
        history,
      });
    }
  }

  return nodes;
}

export function createSensorSimulation() {
  let nodes = generateNodes();
  let anomalyActive = false;
  let anomalyNodeId = null;
  let tickCount = 0;

  // Track overall risk history for the risk timeline chart
  let riskHistory = [];
  const now = Date.now();
  for (let i = HISTORY_SIZE - 1; i >= 0; i--) {
    riskHistory.push({
      time: formatTime(new Date(now - i * 60000)),
      value: randBetween(15, 30),
    });
  }

  function tick() {
    tickCount++;
    const timestamp = new Date();
    const timeStr = formatTime(timestamp);

    nodes = nodes.map(node => {
      // Determine fluctuation
      let tiltDelta = (Math.random() - 0.5) * 0.08;
      let vibDelta = (Math.random() - 0.5) * 0.015;
      let dispDelta = (Math.random() - 0.5) * 0.04;
      let tempDelta = (Math.random() - 0.5) * 0.15;
      let gasDelta = (Math.random() - 0.5) * 0.8;

      const isTargetNode = anomalyActive && node.id === anomalyNodeId;
      const isNeighborNode = anomalyActive && anomalyNodeId && (() => {
        // Neighbors: same section nodes
        const targetNum = parseInt(anomalyNodeId.replace('N-', ''));
        const nodeNum = parseInt(node.id.replace('N-', ''));
        return Math.abs(targetNum - nodeNum) <= 2 && Math.abs(targetNum - nodeNum) > 0
          && Math.floor((targetNum - 1) / 7) === Math.floor((nodeNum - 1) / 7);
      })();

      if (isTargetNode) {
        // Rapid increase toward critical
        tiltDelta = randBetween(0.15, 0.45);
        vibDelta = randBetween(0.03, 0.08);
        dispDelta = randBetween(0.12, 0.35);
        tempDelta = randBetween(0.1, 0.5);
        gasDelta = randBetween(1, 4);
      } else if (isNeighborNode) {
        // Moderate increase for neighboring nodes
        tiltDelta = randBetween(0.05, 0.15);
        vibDelta = randBetween(0.01, 0.03);
        dispDelta = randBetween(0.04, 0.12);
        tempDelta = randBetween(0.05, 0.2);
        gasDelta = randBetween(0.3, 1.5);
      } else if (node.location.includes('Section B')) {
        // Section B has a gradual upward drift
        tiltDelta += 0.008;
        vibDelta += 0.001;
        dispDelta += 0.005;
      }

      const newTilt = Math.max(0.1, node.tilt + tiltDelta);
      const newVib = Math.max(0.01, node.vibration + vibDelta);
      const newDisp = Math.max(0.05, node.displacement + dispDelta);
      const newTemp = Math.max(22, Math.min(45, node.temperature + tempDelta));
      const newGasV = Math.max(0, Math.min(100, node.gasValue + gasDelta));

      const { riskScore, status } = computeStatus(newTilt, newVib, newDisp, newTemp, newGasV);

      const gas = newGasV > 50 ? 'High' : newGasV > 20 ? 'Elevated' : 'Normal';
      const battery = Math.max(10, node.battery - (Math.random() > 0.98 ? 1 : 0));

      // Update history arrays
      const history = {
        displacement: [...node.history.displacement.slice(1), { time: timeStr, value: newDisp }],
        tilt: [...node.history.tilt.slice(1), { time: timeStr, value: newTilt }],
        vibration: [...node.history.vibration.slice(1), { time: timeStr, value: newVib }],
        temperature: [...node.history.temperature.slice(1), { time: timeStr, value: newTemp }],
        gasValue: [...node.history.gasValue.slice(1), { time: timeStr, value: newGasV }],
      };

      return {
        ...node,
        tilt: newTilt,
        vibration: newVib,
        displacement: newDisp,
        temperature: newTemp,
        gasValue: newGasV,
        gas,
        battery,
        signal: battery > 50 ? 'Good' : battery > 30 ? 'Fair' : 'Poor',
        status,
        riskScore,
        lastUpdate: timestamp,
        history,
      };
    });

    // Update risk history
    const avgRisk = nodes.reduce((s, n) => s + n.riskScore, 0) / nodes.length;
    riskHistory = [...riskHistory.slice(1), { time: timeStr, value: Math.round(avgRisk * 10) / 10 }];
  }

  function getState() {
    let totalRisk = 0;
    let criticalCount = 0;
    let warningCount = 0;
    let offlineCount = 0;

    for (const n of nodes) {
      totalRisk += n.riskScore;
      if (n.status === 'CRITICAL') criticalCount++;
      if (n.status === 'WARNING' || n.status === 'HIGH') warningCount++;
      if (n.status === 'OFFLINE') offlineCount++;
    }

    const overallRisk = Math.round((totalRisk / nodes.length) * 10) / 10;

    let overallCondition = 'SAFE';
    if (criticalCount > 0) overallCondition = 'CRITICAL';
    else if (warningCount >= 3) overallCondition = 'WARNING';

    const activeNodes = nodes.length - offlineCount;
    const systemHealth = Math.round((activeNodes / nodes.length) * 1000) / 10;

    return {
      nodes: [...nodes],
      overallRisk,
      overallCondition,
      activeNodes,
      totalNodes: 28,
      systemHealth,
      riskHistory: [...riskHistory],
    };
  }

  function triggerAnomaly(nodeId) {
    anomalyActive = true;
    anomalyNodeId = nodeId;
  }

  function reset() {
    anomalyActive = false;
    anomalyNodeId = null;
    tickCount = 0;
    nodes = generateNodes();
    const now = Date.now();
    riskHistory = [];
    for (let i = HISTORY_SIZE - 1; i >= 0; i--) {
      riskHistory.push({
        time: formatTime(new Date(now - i * 60000)),
        value: randBetween(15, 30),
      });
    }
  }

  return { getState, tick, triggerAnomaly, reset };
}
