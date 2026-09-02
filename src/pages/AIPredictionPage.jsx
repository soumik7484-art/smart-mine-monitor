import React from 'react';
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
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  BrainCircuit,
  Sparkles,
  TrendingUp,
  Activity,
  Info,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

export default function AIPredictionPage() {
  const { aiPrediction, setIsSensorSimulatorOpen, isDarkMode } = useMine();

  const riskScore = aiPrediction?.overallScore || 18;
  const classification = aiPrediction?.riskLevel || 'SAFE';
  const factors = aiPrediction?.factors || {};
  const forecast = aiPrediction?.forecast || [];
  const rateOfChange = aiPrediction?.rateOfChange || { percentChange: 0, description: 'Stable' };

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
              AI Strata Subsidence Prediction Model
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary">
              MULTI-PARAM STRATA INFERENCE
            </span>
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Predictive Ground Deformation, Micro-Seismic Waveform Analysis & Collapse Risk Estimation
          </p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Prototype Geological Disclaimer */}
      <div className="card p-3.5 bg-status-attention-bg/40 border-l-4 border-l-status-attention border-mine-border flex items-start gap-3">
        <Info className="h-5 w-5 text-status-attention flex-shrink-0 mt-0.5" />
        <div className="text-xs text-mine-text-primary">
          <strong>Smart India Hackathon Demonstration Prototype:</strong> The strata subsidence risk model is calibrated on geotechnical strata physics for Raniganj Seam 3. Commercial mine deployment requires DGMS statutory validation and certified flameproof hardware.
        </div>
      </div>

      {/* Top Grid: Risk Gauge & Model Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overall Risk Gauge */}
        <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-status-attention" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
                Current Subsidence Risk Score
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
              <span className="text-mine-text-secondary">Model Confidence:</span>
              <strong className="text-status-safe font-mono font-semibold">94.2% (Ensemble Model)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-text-secondary">Strata Profile:</span>
              <strong className="text-mine-text-primary font-mono">Dishergarh Coal Seam 3</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-text-secondary">Sampling Rate:</span>
              <strong className="text-mine-text-primary font-mono">100 Hz Subsurface Polling</strong>
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
            <span className="text-xs text-mine-text-secondary">Weighted Ensemble</span>
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
            Decomposition of risk score into physical strata deformation components
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
    </div>
  );
}
