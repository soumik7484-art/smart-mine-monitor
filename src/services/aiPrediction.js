// MINEGUARD AI — AI/ML Strata Subsidence Prediction Engine
// Multi-parameter weighted risk scoring with 30-min forecast & XAI factor breakdown

/**
 * Calculate AI prediction from current sensor readings
 * @param {Array} sensors - Array of sensor objects
 * @returns {Object} AI prediction result
 */
export function calculateAIPrediction(sensors) {
  if (!sensors || sensors.length === 0) {
    return getDefaultPrediction();
  }

  // ─── 1. Weighted Risk Score (Ensemble Proxy) ──────────────────────────
  const weights = {
    displacement: 0.30,
    tilt: 0.25,
    vibration: 0.20,
    stress: 0.15,
    methane: 0.10,
  };

  const thresholds = {
    displacement: { safe: 2.0, warn: 5.0, crit: 10.0, max: 15.0 },
    tilt: { safe: 1.5, warn: 3.0, crit: 5.0, max: 10.0 },
    vibration: { safe: 0.15, warn: 0.4, crit: 0.7, max: 1.5 },
    stress: { safe: 5.0, warn: 12.0, crit: 20.0, max: 50.0 },
    methane: { safe: 0.5, warn: 1.0, crit: 1.5, max: 2.5 },
  };

  // Compute average readings across all sensors
  const avgReadings = {
    displacement: avg(sensors.map(s => s.displacement || 0)),
    tilt: avg(sensors.map(s => s.tilt || 0)),
    vibration: avg(sensors.map(s => s.vibration || 0)),
    stress: avg(sensors.map(s => s.stress || 0)),
    methane: avg(sensors.map(s => s.methane || 0)),
  };

  // Peak readings (worst case across all sensors)
  const peakReadings = {
    displacement: Math.max(...sensors.map(s => s.displacement || 0)),
    tilt: Math.max(...sensors.map(s => s.tilt || 0)),
    vibration: Math.max(...sensors.map(s => s.vibration || 0)),
    stress: Math.max(...sensors.map(s => s.stress || 0)),
    methane: Math.max(...sensors.map(s => s.methane || 0)),
  };

  // ─── 2. Normalize each parameter to 0-1 ──────────────────────────────
  const factors = {};
  let overallScore = 0;

  for (const [param, weight] of Object.entries(weights)) {
    const th = thresholds[param];
    const peakVal = peakReadings[param];
    const avgVal = avgReadings[param];
    const normalized = clamp(peakVal / th.max, 0, 1);
    const contribution = normalized * weight * 100;

    let severity = 'LOW';
    if (peakVal >= th.crit) severity = 'CRITICAL';
    else if (peakVal >= th.warn) severity = 'HIGH';
    else if (peakVal >= th.safe) severity = 'MEDIUM';

    factors[param] = {
      label: getParamLabel(param),
      unit: getParamUnit(param),
      avgValue: round2(avgVal),
      peakValue: round2(peakVal),
      normalized: round2(normalized),
      weight: weight,
      contribution: round2(contribution),
      severity,
      thresholds: th,
    };

    overallScore += contribution;
  }

  overallScore = clamp(Math.round(overallScore), 0, 100);

  // ─── 3. Risk Classification ───────────────────────────────────────────
  let riskLevel, riskColor, riskDescription;
  if (overallScore >= 80) {
    riskLevel = 'CRITICAL';
    riskColor = '#C4362E';
    riskDescription = 'Imminent subsidence risk detected. Immediate evacuation recommended. Multiple strata parameters exceed critical thresholds.';
  } else if (overallScore >= 60) {
    riskLevel = 'WARNING';
    riskColor = '#C4820E';
    riskDescription = 'Elevated subsidence risk. Accelerating strata deformation detected. Prepare evacuation protocols and monitor closely.';
  } else if (overallScore >= 35) {
    riskLevel = 'CAUTION';
    riskColor = '#D97706';
    riskDescription = 'Moderate ground movement detected. Increased monitoring frequency recommended. Review sensor drift trends.';
  } else {
    riskLevel = 'SAFE';
    riskColor = '#2D8A4E';
    riskDescription = 'All strata parameters within normal operational limits. Standard monitoring protocols in effect.';
  }

  // ─── 4. 30-Minute Predictive Deformation Forecast ─────────────────────
  const forecast = generate30MinForecast(peakReadings.displacement, overallScore);

  // ─── 5. Rate of Change Analysis ───────────────────────────────────────
  const rateOfChange = computeRateOfChange(sensors);

  return {
    overallScore,
    riskLevel,
    riskColor,
    riskDescription,
    factors,
    forecast,
    rateOfChange,
    peakReadings,
    avgReadings,
    sensorCount: sensors.length,
    timestamp: new Date().toISOString(),
    disclaimer: 'This is a prototype decision-support engine. Results must be verified by authorized mine safety personnel.',
  };
}

/**
 * Generate 30-minute predictive displacement forecast
 */
function generate30MinForecast(currentDisplacement, riskScore) {
  const points = [];
  const intervals = 30; // 1-minute intervals

  for (let i = 0; i <= intervals; i++) {
    const t = i; // minutes
    let predicted, upper, lower;

    if (riskScore >= 80) {
      // Exponential failure curve
      predicted = currentDisplacement * Math.exp(0.04 * t);
      upper = predicted * 1.25;
      lower = predicted * 0.85;
    } else if (riskScore >= 60) {
      // Accelerating linear
      predicted = currentDisplacement + (0.15 * t) + (0.003 * t * t);
      upper = predicted * 1.20;
      lower = predicted * 0.90;
    } else if (riskScore >= 35) {
      // Gentle linear drift
      predicted = currentDisplacement + (0.04 * t);
      upper = predicted * 1.15;
      lower = predicted * 0.92;
    } else {
      // Stable with micro-fluctuation
      predicted = currentDisplacement + (0.005 * t) + Math.sin(t * 0.3) * 0.02;
      upper = predicted + 0.15;
      lower = Math.max(0, predicted - 0.1);
    }

    points.push({
      time: `+${t}m`,
      minute: t,
      predicted: round2(predicted),
      upper: round2(upper),
      lower: round2(lower),
      criticalThreshold: 15.0,
    });
  }

  return points;
}

/**
 * Compute rate of change from sensor history
 */
function computeRateOfChange(sensors) {
  let totalRate = 0;
  let count = 0;

  sensors.forEach(s => {
    const hist = s.history?.displacement || [];
    if (hist.length >= 10) {
      const recent5 = hist.slice(-5);
      const older5 = hist.slice(-10, -5);
      const recentAvg = avg(recent5.map(h => h.value));
      const olderAvg = avg(older5.map(h => h.value));

      if (olderAvg > 0.01) {
        const rate = ((recentAvg - olderAvg) / olderAvg) * 100;
        totalRate += rate;
        count++;
      }
    }
  });

  const avgRate = count > 0 ? totalRate / count : 0;

  let severity = 'LOW';
  if (Math.abs(avgRate) > 30) severity = 'HIGH';
  else if (Math.abs(avgRate) > 10) severity = 'MEDIUM';

  return {
    percentChange: round2(avgRate),
    severity,
    description: avgRate > 10
      ? `Displacement increasing at ${round2(avgRate)}%/cycle — accelerating deformation`
      : avgRate < -5
      ? `Displacement decreasing at ${round2(Math.abs(avgRate))}%/cycle — stabilizing`
      : `Displacement stable — normal micro-fluctuation`,
  };
}

function getDefaultPrediction() {
  return {
    overallScore: 0,
    riskLevel: 'SAFE',
    riskColor: '#2D8A4E',
    riskDescription: 'No sensor data available.',
    factors: {},
    forecast: [],
    rateOfChange: { percentChange: 0, severity: 'LOW', description: 'No data' },
    peakReadings: {},
    avgReadings: {},
    sensorCount: 0,
    timestamp: new Date().toISOString(),
    disclaimer: 'This is a prototype decision-support engine.',
  };
}

function getParamLabel(param) {
  const labels = {
    displacement: 'Ground Displacement',
    tilt: 'Roof Tilt Angle',
    vibration: 'Seismic Vibration',
    stress: 'Pillar Stress',
    methane: 'Methane (CH₄)',
  };
  return labels[param] || param;
}

function getParamUnit(param) {
  const units = { displacement: 'mm', tilt: '°', vibration: 'g', stress: 'MPa', methane: '%LEL' };
  return units[param] || '';
}

function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function round2(v) { return Math.round(v * 100) / 100; }
