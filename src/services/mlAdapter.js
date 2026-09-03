// MINEGUARD AI — ML Integration Adapter & Hardware Telemetry Bridge
// Prepares physical sensor payload matching the Kaggle/ESP32 14-feature architecture
// Handles live connection status, backend health check, and model inference fallback.

const DEFAULT_BACKEND_URL = 'http://localhost:8000';

let mlConnectionStatus = {
  isConfigured: true,
  isConnected: false,
  endpoint: `${DEFAULT_BACKEND_URL}/predict`,
  healthEndpoint: `${DEFAULT_BACKEND_URL}/health`,
  modelName: 'Random Forest (SIH Hardware-Aligned)',
  lastChecked: null,
  latencyMs: null,
  error: null,
};

export function buildMLTelemetryPayload(sensors = [], nodeId = 'ESP32_GATEWAY_NODE_01') {
  if (!sensors || sensors.length === 0) {
    return {
      node_id: nodeId,
      acc_x_ms2: 0.05,
      acc_y_ms2: 0.05,
      acc_z_ms2: 0.08,
      ppv_mms: 1.25,
      frequency_hz: 24.5,
      psd_value: 0.15,
      geophone_mms: 1.10,
      seismometer_ms2: 0.85,
      temperature_c: 28.0,
      tilt_x_deg: 0.5,
      tilt_y_deg: 0.4,
      displacement_mm: 0.5,
      humidity_pct: 60.0,
    };
  }

  const peakVib = Math.max(...sensors.map(s => s.vibration || 0.05));
  const avgVib = sensors.reduce((acc, s) => acc + (s.vibration || 0), 0) / sensors.length;
  const peakDisp = Math.max(...sensors.map(s => s.displacement || 0.1));
  const peakTilt = Math.max(...sensors.map(s => s.tilt || 0.1));
  const avgTemp = sensors.reduce((acc, s) => acc + (s.temperature || 28), 0) / sensors.length;
  const avgHumidity = sensors.reduce((acc, s) => acc + (s.humidity || 60), 0) / sensors.length;

  const acc_z_ms2 = +(peakVib * 9.81 * 0.55).toFixed(4);
  const acc_x_ms2 = +(peakVib * 9.81 * 0.30).toFixed(4);
  const acc_y_ms2 = +(peakVib * 9.81 * 0.25).toFixed(4);

  const ppv_mms = +(peakVib * 5.2).toFixed(3);
  const geophone_mms = +(avgVib * 4.1).toFixed(3);
  const seismometer_ms2 = +(peakVib * 3.5).toFixed(3);

  const frequency_hz = +(18.0 + peakVib * 30.0).toFixed(2);
  const psd_value = +(0.08 + Math.pow(peakVib, 2) * 2.5).toFixed(4);

  return {
    node_id: nodeId,
    acc_x_ms2,
    acc_y_ms2,
    acc_z_ms2,
    ppv_mms,
    frequency_hz,
    psd_value,
    geophone_mms,
    seismometer_ms2,
    temperature_c: +avgTemp.toFixed(1),
    tilt_x_deg: +peakTilt.toFixed(2),
    tilt_y_deg: +(peakTilt * 0.8).toFixed(2),
    displacement_mm: +peakDisp.toFixed(2),
    humidity_pct: +avgHumidity.toFixed(1),
    timestamp: new Date().toISOString(),
  };
}

export async function checkMLBackendHealth(baseUrl = DEFAULT_BACKEND_URL) {
  const startTime = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const latency = Math.round(performance.now() - startTime);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      mlConnectionStatus = {
        isConfigured: true,
        isConnected: true,
        endpoint: `${baseUrl}/predict`,
        healthEndpoint: `${baseUrl}/health`,
        modelName: data.model_name || 'Random Forest (Hardware-Aligned)',
        featuresCount: data.features_count || 14,
        lastChecked: new Date().toLocaleTimeString('en-IN'),
        latencyMs: latency,
        error: null,
      };
      return mlConnectionStatus;
    }
  } catch (err) {
    // Backend is offline or not running
  }

  mlConnectionStatus = {
    isConfigured: true,
    isConnected: false,
    endpoint: `${baseUrl}/predict`,
    healthEndpoint: `${baseUrl}/health`,
    modelName: 'Random Forest (Awaiting Backend Startup)',
    featuresCount: 14,
    lastChecked: new Date().toLocaleTimeString('en-IN'),
    latencyMs: null,
    error: 'Backend offline on http://localhost:8000',
  };

  return mlConnectionStatus;
}

export function getMLConnectionStatus() {
  return mlConnectionStatus;
}

export async function queryMLBackend(payload, baseUrl = DEFAULT_BACKEND_URL) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const result = await response.json();
      return result;
    }
  } catch (err) {
    // Silently fall back to heuristic
  }
  return null;
}
