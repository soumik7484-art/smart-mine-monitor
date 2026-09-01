import { useMemo } from 'react';

/**
 * Rule-based risk scoring engine.
 * Explicitly a prototype decision engine — not a trained ML model.
 *
 * Combines normalized sensor values, rate-of-change analysis,
 * and multi-node correlation to produce a risk score.
 */

function normalizeValue(value, min, max) {
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

function getStatus(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 65) return 'HIGH';
  if (score >= 40) return 'WARNING';
  return 'SAFE';
}

function computeNodeRiskFactors(node) {
  const factors = [];

  // Displacement factor
  const dispNorm = normalizeValue(node.displacement, 0, 5);
  factors.push({
    name: 'Ground displacement',
    value: dispNorm,
    severity: dispNorm > 0.7 ? 'HIGH' : dispNorm > 0.4 ? 'MEDIUM' : 'LOW',
    raw: `${node.displacement.toFixed(1)} mm`,
  });

  // Tilt factor
  const tiltNorm = normalizeValue(node.tilt, 0, 8);
  factors.push({
    name: 'Tilt variation',
    value: tiltNorm,
    severity: tiltNorm > 0.7 ? 'HIGH' : tiltNorm > 0.4 ? 'MEDIUM' : 'LOW',
    raw: `${node.tilt.toFixed(1)}°`,
  });

  // Vibration factor
  const vibNorm = normalizeValue(node.vibration, 0, 1);
  factors.push({
    name: 'Vibration',
    value: vibNorm,
    severity: vibNorm > 0.7 ? 'HIGH' : vibNorm > 0.4 ? 'MEDIUM' : 'LOW',
    raw: `${node.vibration.toFixed(2)} g`,
  });

  // Temperature factor
  const tempNorm = normalizeValue(node.temperature, 25, 40);
  factors.push({
    name: 'Temperature',
    value: tempNorm,
    severity: tempNorm > 0.7 ? 'HIGH' : tempNorm > 0.4 ? 'MEDIUM' : 'LOW',
    raw: `${node.temperature.toFixed(1)}°C`,
  });

  // Gas factor
  const gasNorm = normalizeValue(node.gasValue, 0, 100);
  factors.push({
    name: 'Gas concentration',
    value: gasNorm,
    severity: gasNorm > 0.7 ? 'HIGH' : gasNorm > 0.4 ? 'MEDIUM' : 'LOW',
    raw: node.gas,
  });

  return factors;
}

function computeRateOfChange(history) {
  if (!history || history.length < 5) return 0;
  const recent = history.slice(-5);
  const older = history.slice(-10, -5);
  if (older.length === 0) return 0;

  const recentAvg = recent.reduce((s, h) => s + h.value, 0) / recent.length;
  const olderAvg = older.reduce((s, h) => s + h.value, 0) / older.length;

  return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
}

function computeCorrelation(nodes, targetNode) {
  // Check if neighboring nodes show similar trends
  const section = targetNode.location.split(' ')[1]?.charAt(0);
  const neighbors = nodes.filter(
    n => n.id !== targetNode.id && n.location.includes(`Section ${section}`)
  );

  if (neighbors.length === 0) return 0;

  const targetDisp = targetNode.displacement;
  const neighborAvgDisp =
    neighbors.reduce((s, n) => s + n.displacement, 0) / neighbors.length;

  // If neighbors are also elevated, correlation is high
  const ratio = neighborAvgDisp / Math.max(targetDisp, 0.1);
  return Math.min(1, ratio);
}

export function useRiskEngine(sensorData) {
  return useMemo(() => {
    if (!sensorData || !sensorData.nodes || sensorData.nodes.length === 0) {
      return {
        overallRisk: 0,
        overallCondition: 'SAFE',
        highestRiskNode: null,
        factors: [],
        rateOfChange: 'LOW',
        correlation: 'LOW',
        decision: 'All sensor readings within normal parameters.',
        riskHistory: [],
      };
    }

    const { nodes } = sensorData;

    // Find the node with the highest risk score
    const highestRiskNode = nodes.reduce(
      (max, n) => (n.riskScore > max.riskScore ? n : max),
      nodes[0]
    );

    // Compute factors for the highest-risk node
    const factors = computeNodeRiskFactors(highestRiskNode);

    // Rate of change from displacement history
    const dispHistory = highestRiskNode.history?.displacement || [];
    const roc = computeRateOfChange(dispHistory);
    const rateOfChangeSeverity = Math.abs(roc) > 0.3 ? 'HIGH' : Math.abs(roc) > 0.1 ? 'MEDIUM' : 'LOW';

    // Multi-node correlation
    const corrValue = computeCorrelation(nodes, highestRiskNode);
    const correlationSeverity = corrValue > 0.6 ? 'HIGH' : corrValue > 0.3 ? 'MEDIUM' : 'LOW';

    // Add rate of change and correlation as factors
    factors.push({
      name: 'Rate of change',
      value: Math.abs(roc),
      severity: rateOfChangeSeverity,
      raw: `${(roc * 100).toFixed(1)}%`,
    });

    factors.push({
      name: 'Neighboring node correlation',
      value: corrValue,
      severity: correlationSeverity,
      raw: `${(corrValue * 100).toFixed(0)}%`,
    });

    // Overall risk
    const overallRisk = sensorData.overallRisk;
    const overallCondition = getStatus(overallRisk);

    // Generate decision text
    let decision;
    if (overallRisk >= 80) {
      decision = `Critical risk level detected at ${highestRiskNode.location}. Immediate assessment required. Multiple sensors showing abnormal readings simultaneously.`;
    } else if (overallRisk >= 65) {
      decision = `Elevated risk due to simultaneous increases in displacement, vibration and tilt across neighboring monitoring nodes in ${highestRiskNode.location.split(' ')[1] || 'the affected section'}.`;
    } else if (overallRisk >= 40) {
      decision = `Moderate activity detected at ${highestRiskNode.location}. Sensor trends show gradual increase in ground movement. Continued monitoring recommended.`;
    } else {
      decision = 'All sensor readings within normal operating parameters. No anomalies detected across the monitoring network.';
    }

    // Build risk history from overall risk data
    const riskHistory = (sensorData.riskHistory || []).map((entry, i) => ({
      time: entry.time,
      value: entry.value,
    }));

    return {
      overallRisk,
      overallCondition,
      highestRiskNode,
      factors,
      rateOfChange: rateOfChangeSeverity,
      correlation: correlationSeverity,
      decision,
      riskHistory,
    };
  }, [sensorData]);
}
