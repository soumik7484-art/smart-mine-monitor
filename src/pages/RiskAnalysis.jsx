import React from 'react';
import { useMine } from '../context/MineContext';
import RiskGauge from '../components/ui/RiskGauge';
import SensorChart from '../components/ui/SensorChart';
import StatusBadge from '../components/ui/StatusBadge';
import { BrainCircuit, Info, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RiskAnalysis() {
  const { aiPrediction, sensors = [] } = useMine();
  const navigate = useNavigate();

  const overallRisk = aiPrediction?.overallScore || 18;
  const overallCondition = aiPrediction?.riskLevel || 'SAFE';
  const factors = aiPrediction?.factors || {};

  const currentRiskColor =
    overallRisk > 75 ? '#C4362E' : overallRisk > 50 ? '#C4820E' : overallRisk > 25 ? '#D97706' : '#2D8A4E';

  // Build risk history from forecast or sensor history
  const dispSensor = sensors[0];
  const historyData = dispSensor?.history?.displacement || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary">
              Strata Stability Risk Analysis
            </h1>
            <StatusBadge status={overallCondition} />
          </div>
          <p className="text-mine-text-secondary text-xs mt-1">
            Dynamic strata deformation assessment engine • Multi-parameter hazard scoring
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/ai-prediction')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
        >
          <BrainCircuit className="h-4 w-4 text-status-attention" />
          Full AI Prediction Engine &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Risk */}
        <div className="card flex flex-col items-center justify-between p-6 lg:col-span-1 bg-mine-surface border border-mine-border">
          <div className="w-full flex items-center justify-between border-b border-mine-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
              Composite Strata Risk
            </h2>
            <StatusBadge status={overallCondition} />
          </div>

          <div className="my-6 w-full flex flex-col items-center">
            <RiskGauge value={overallRisk} />
            <p className="text-xs text-mine-text-secondary text-center mt-3">
              {aiPrediction?.riskDescription}
            </p>
          </div>

          <div className="w-full text-xs text-mine-text-secondary pt-3 border-t border-mine-border flex justify-between">
            <span>Sampling: 100 Hz</span>
            <span className="font-mono">Zone B Priority</span>
          </div>
        </div>

        {/* Risk Timeline */}
        <div className="card p-6 lg:col-span-2 bg-mine-surface border border-mine-border space-y-3">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
              Ground Displacement Waveform Trend
            </h2>
            <span className="text-xs font-mono text-mine-text-secondary">Rolling 30 Minutes</span>
          </div>
          <SensorChart data={historyData} dataKey="value" color={currentRiskColor} height={180} />
        </div>

        {/* Contributing Factors */}
        <div className="card p-6 lg:col-span-3 bg-mine-surface border border-mine-border space-y-4">
          <div className="border-b border-mine-border pb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
              Contributing Strata Factors Matrix
            </h2>
            <span className="text-xs text-mine-text-secondary">Weighted Ensemble Multi-Sensor Breakdown</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {Object.entries(factors).map(([key, factor]) => (
              <div
                key={key}
                className="p-3.5 rounded bg-mine-surface-alt border border-mine-border space-y-1.5"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-mine-text-primary">{factor.label}</span>
                  <StatusBadge status={factor.severity} />
                </div>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-mine-text-secondary">Peak:</span>
                  <strong className="font-mono text-mine-text-primary">{factor.peakValue} {factor.unit}</strong>
                </div>
                <div className="flex justify-between text-[11px] text-mine-text-secondary">
                  <span>Weight: {(factor.weight * 100).toFixed(0)}%</span>
                  <span>+{factor.contribution} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
