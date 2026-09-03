import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import RiskGauge from '../components/ui/RiskGauge';
import StatusBadge from '../components/ui/StatusBadge';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  BrainCircuit,
  Sparkles,
  Info,
  Sliders,
  Server,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Code2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AIPredictionPage() {
  const { aiPrediction, setIsSensorSimulatorOpen, isDarkMode, mlBackendState } = useMine();
  const [showPayloadModal, setShowPayloadModal] = useState(false);
  const [showArchitectureGuide, setShowArchitectureGuide] = useState(false);

  const riskScore = aiPrediction?.overallScore || 18;
  const classification = aiPrediction?.riskLevel || 'SAFE';
  const factors = aiPrediction?.factors || {};
  const forecast = aiPrediction?.forecast || [];
  const rateOfChange = aiPrediction?.rateOfChange || { percentChange: 0, description: 'Stable' };
  const mlMeta = aiPrediction?.mlModelMeta || {};
  const mlTelemetry = aiPrediction?.mlTelemetry || {};

  // XAI Feature ranking data for bar chart
  const xaiData = Object.entries(factors).map(([key, f]) => ({
    name: f.label,
    contribution: f.contribution,
    peakValue: `${f.peakValue} ${f.unit}`,
    severity: f.severity,
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary">
              AI Strata Subsidence & Ground Motion Model
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary">
              SIH HARDWARE-ALIGNED ML
            </span>
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Real-Time Edge Telemetry Ingestion (ESP32/LoRa) • Random Forest / XGBoost Inference • Geotechnical XAI
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPayloadModal(!showPayloadModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
          >
            <Code2 className="h-4 w-4 text-status-info" />
            14-Feature Payload
          </button>
          <button
            type="button"
            onClick={() => setIsSensorSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
          >
            <Sliders className="h-4 w-4 text-status-attention" />
            Adjust Strata Sliders
          </button>
        </div>
      </div>

      {/* Hardware-Aligned ML Integration Bridge Banner (Interactive Placeholder) */}
      <div className="card p-4 bg-mine-surface border border-mine-border shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mine-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg ${mlBackendState?.isConnected ? 'bg-status-safe/10 text-status-safe' : 'bg-status-attention/10 text-status-attention'}`}>
              <Server className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-mine-text-primary">
                  ML Model Backend Connector
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  mlBackendState?.isConnected
                    ? 'bg-status-safe/15 text-status-safe border border-status-safe/30'
                    : 'bg-status-attention/15 text-status-attention border border-status-attention/30'
                }`}>
                  {mlBackendState?.isConnected ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      CONNECTED: FASTAPI (PORT 8000)
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3" />
                      ACTIVE FALLBACK: LOCAL HEURISTIC ENGINE
                    </>
                  )}
                </span>
                {mlBackendState?.isPredicting && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-mine-text-secondary animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Inferencing...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-mine-text-secondary mt-0.5">
                Target: <code className="font-mono text-xs bg-mine-surface-alt px-1 py-0.5 rounded border border-mine-border">{mlBackendState?.endpoint || 'http://localhost:8000/predict'}</code> • Expected Model: <strong>Random Forest (14 Hardware Features)</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowArchitectureGuide(!showArchitectureGuide)}
            className="flex items-center gap-1 text-xs text-status-info font-medium hover:underline"
          >
            {showArchitectureGuide ? 'Hide Model Spec' : 'View ML Integration Guide'}
            {showArchitectureGuide ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Collapsible Architecture Guide */}
        {showArchitectureGuide && (
          <div className="mt-3 pt-3 border-t border-mine-border/60 text-xs text-mine-text-secondary space-y-2.5 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2.5 rounded bg-mine-surface-alt border border-mine-border">
                <span className="font-semibold text-mine-text-primary block mb-1">1. Direct Physical Sensors (9)</span>
                <p className="text-[11px] font-mono leading-relaxed">
                  acc_x, acc_y, acc_z (MPU6050)<br/>
                  ppv_mms, geophone_mms (Geophone)<br/>
                  frequency_hz, psd_value (Edge FFT)<br/>
                  seismometer_ms2, temperature_c
                </p>
              </div>
              <div className="p-2.5 rounded bg-mine-surface-alt border border-mine-border">
                <span className="font-semibold text-mine-text-primary block mb-1">2. Derived Physics Features (5)</span>
                <p className="text-[11px] font-mono leading-relaxed">
                  vibration_magnitude_ms2 (3D shock)<br/>
                  vibration_horizontal_ms2 (Shear)<br/>
                  kinetic_energy_proxy (0.5 · PPV²)<br/>
                  accel_to_velocity_ratio<br/>
                  spectral_power_product
                </p>
              </div>
              <div className="p-2.5 rounded bg-mine-surface-alt border border-mine-border">
                <span className="font-semibold text-mine-text-primary block mb-1">3. How to Connect Your Model</span>
                <p className="text-[11px] leading-relaxed">
                  Start your FastAPI server at port 8000 with <code>POST /predict</code>. The dashboard automatically detects it within 5 seconds and switches live inferences over.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Grid: Risk Gauge & Model Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Risk Gauge */}
        <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-status-attention" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
                Current Ground Hazard Level
              </h2>
            </div>
            <StatusBadge status={classification} />
          </div>

          <div className="py-2 flex flex-col items-center justify-center">
            <RiskGauge value={riskScore} />
            <p className="text-xs text-center text-mine-text-secondary mt-3">
              {aiPrediction?.riskDescription}
            </p>
          </div>

          <div className="rounded bg-mine-surface-alt p-3 border border-mine-border space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-mine-text-secondary">Active Inference Source:</span>
              <strong className="text-mine-text-primary font-mono font-semibold">
                {mlMeta?.modelName || 'Calibrated Heuristic'}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-text-secondary">Prediction Confidence:</span>
              <strong className="text-status-safe font-mono font-semibold">
                {mlMeta?.confidence || 94.2}%
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-text-secondary">Hardware Target:</span>
              <strong className="text-mine-text-primary font-mono">ESP32 + ADXL355/Geophone</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-text-secondary">Telemetry Polling:</span>
              <strong className="text-mine-text-primary font-mono">100 Hz Edge / 2s Master Loop</strong>
            </div>
          </div>
        </div>

        {/* Center & Right: Model Feature Inputs Matrix */}
        <div className="lg:col-span-2 card p-5 space-y-4 bg-mine-surface border border-mine-border">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-status-attention" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
                Model Multi-Parameter Feature Weights & Peak Telemetry
              </h2>
            </div>
            <span className="text-xs text-mine-text-secondary">Calibrated Geotechnical Ensemble</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.entries(factors).map(([param, f]) => (
              <div
                key={param}
                className="rounded bg-mine-surface-alt p-3 border border-mine-border space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-mine-text-primary">{f.label}</span>
                  <StatusBadge status={f.severity} />
                </div>
                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-xs text-mine-text-secondary">Peak Detected:</span>
                  <span className="font-mono text-sm font-bold text-mine-text-primary tabular-nums">
                    {f.peakValue} {f.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-mine-text-secondary">
                  <span>Weight: {(f.weight * 100).toFixed(0)}%</span>
                  <span>Contribution: +{f.contribution} pts</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-mine-text-secondary border-t border-mine-border">
            <span>Rate of Change: <strong>{rateOfChange.description}</strong></span>
            <span className="font-mono">Updated: {new Date().toLocaleTimeString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* 30-Minute Predictive Deformation Forecast Curve */}
      <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mine-border pb-3">
          <div>
            <h2 className="text-sm font-semibold text-mine-text-primary">
              30-Minute Predictive Ground Deformation Forecast
            </h2>
            <p className="text-xs text-mine-text-secondary">
              Extrapolated strata subsidence trajectory with 95% statistical confidence bounds
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-status-critical" />
              Predicted (mm)
            </span>
            <span className="flex items-center gap-1.5 text-mine-text-secondary">
              <span className="w-3 h-2 bg-status-critical/15 rounded" />
              95% Confidence Band
            </span>
            <span className="flex items-center gap-1.5 text-status-critical font-semibold">
              --- Critical Limit (15.0mm)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecast} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="#D8D3CA" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6F6A61', fontFamily: 'monospace' }} stroke="#6F6A61" />
              <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fill: '#6F6A61', fontFamily: 'monospace' }} stroke="#6F6A61" unit=" mm" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-mine-surface border border-mine-border p-2.5 rounded shadow-dropdown text-xs space-y-1">
                        <p className="font-bold text-mine-text-primary">Time Horizon: {label}</p>
                        <p className="text-status-critical font-semibold">Predicted: {data.predicted} mm</p>
                        <p className="text-mine-text-secondary">Upper Bound: {data.upper} mm</p>
                        <p className="text-mine-text-secondary">Lower Bound: {data.lower} mm</p>
                        <p className="text-status-critical/80 text-[10px]">Safety Threshold: 15.0 mm</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="upper" fill="#C4362E" fillOpacity={0.08} stroke="none" />
              <Area type="monotone" dataKey="lower" fill={isDarkMode ? '#1C1E23' : '#FFFFFF'} fillOpacity={1} stroke="none" />
              <Line type="monotone" dataKey="predicted" stroke="#C4362E" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="criticalThreshold" stroke="#C4362E" strokeDasharray="5 5" strokeWidth={1.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* XAI Dominant Factor Ranking */}
      <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border">
        <div className="border-b border-mine-border pb-3">
          <h2 className="text-sm font-semibold text-mine-text-primary">
            Explainable AI (XAI) — Strata Failure Factor Ranking
          </h2>
          <p className="text-xs text-mine-text-secondary">
            Feature importance decomposition into dynamic physical vibration and deformation vectors
          </p>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={xaiData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
              <CartesianGrid stroke="#D8D3CA" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#6F6A61', fontFamily: 'monospace' }} stroke="#6F6A61" unit=" pts" />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#292722' }} stroke="#6F6A61" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-mine-surface border border-mine-border p-2 rounded shadow-dropdown text-xs">
                        <p className="font-semibold text-mine-text-primary">{item.name}</p>
                        <p className="text-status-attention font-bold font-mono">Contribution: +{item.contribution} pts</p>
                        <p className="text-mine-text-secondary">Peak Value: {item.peakValue}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="contribution" fill="#D97706" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 14-Feature Hardware Telemetry Payload Modal / Drawer */}
      {showPayloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-mine-surface border border-mine-border rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-mine-border pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-status-attention" />
                <h3 className="text-base font-bold text-mine-text-primary">
                  14-Feature Live Edge Telemetry Vector (Kaggle/ESP32 Format)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPayloadModal(false)}
                className="text-xs px-2 py-1 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary hover:text-mine-text-primary"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-mine-text-secondary leading-relaxed">
              This is the exact JSON payload assembled from your current live sensor readings. When your FastAPI backend runs at <code>http://localhost:8000/predict</code>, this JSON is posted automatically every 5 seconds.
            </p>

            <div className="rounded bg-mine-surface-alt p-3.5 border border-mine-border font-mono text-xs overflow-x-auto text-mine-text-primary">
              <pre>{JSON.stringify(mlTelemetry, null, 2)}</pre>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(JSON.stringify(mlTelemetry, null, 2));
                  alert('Telemetry JSON copied to clipboard!');
                }}
                className="px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface border border-mine-border hover:bg-mine-surface-alt text-mine-text-primary"
              >
                Copy Payload JSON
              </button>
              <button
                type="button"
                onClick={() => setShowPayloadModal(false)}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-status-attention text-mine-surface hover:opacity-90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
