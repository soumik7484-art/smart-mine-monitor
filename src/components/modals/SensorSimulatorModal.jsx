import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import { Sliders, X, RotateCcw, Activity, Gauge, Info } from 'lucide-react';
import RiskGauge from '../ui/RiskGauge';

export const SensorSimulatorModal = () => {
  const {
    isSensorSimulatorOpen,
    setIsSensorSimulatorOpen,
    sensors,
    overrideSensorValue,
    aiPrediction,
    resetToNormal,
  } = useMine();

  // Selected sensor for override
  const [selectedSensorId, setSelectedSensorId] = useState('S-07');

  const activeSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  const [dispVal, setDispVal] = useState(activeSensor?.displacement || 2.5);
  const [tiltVal, setTiltVal] = useState(activeSensor?.tilt || 1.2);
  const [vibVal, setVibVal] = useState(activeSensor?.vibration || 0.15);
  const [stressVal, setStressVal] = useState(activeSensor?.stress || 4.2);

  if (!isSensorSimulatorOpen) return null;

  const handleSensorSelect = (id) => {
    setSelectedSensorId(id);
    const s = sensors.find((sen) => sen.id === id);
    if (s) {
      setDispVal(s.displacement);
      setTiltVal(s.tilt);
      setVibVal(s.vibration);
      setStressVal(s.stress);
    }
  };

  const handleDispChange = (val) => {
    const num = parseFloat(val);
    setDispVal(num);
    overrideSensorValue(selectedSensorId, 'displacement', num);
  };

  const handleTiltChange = (val) => {
    const num = parseFloat(val);
    setTiltVal(num);
    overrideSensorValue(selectedSensorId, 'tilt', num);
  };

  const handleVibChange = (val) => {
    const num = parseFloat(val);
    setVibVal(num);
    overrideSensorValue(selectedSensorId, 'vibration', num);
  };

  const handleStressChange = (val) => {
    const num = parseFloat(val);
    setStressVal(num);
    overrideSensorValue(selectedSensorId, 'stress', num);
  };

  const handleReset = () => {
    resetToNormal();
    setDispVal(0.6);
    setTiltVal(0.8);
    setVibVal(0.08);
    setStressVal(3.0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-mine-surface border border-mine-border rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-mine-border bg-mine-surface-alt px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-status-attention text-white">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-mine-text-primary uppercase tracking-wider">
                Live IoT Strata Telemetry Injector
              </h2>
              <p className="text-xs text-mine-text-secondary">
                Simulate micro-seismic pre-collapse movements & observe AI model reaction
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSensorSimulatorOpen(false)}
            className="p-1 text-mine-text-secondary hover:text-mine-text-primary rounded transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 bg-mine-bg">
          {/* Target Sensor Selection */}
          <div className="card p-3.5 bg-mine-surface border border-mine-border space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-mine-text-secondary block">
              Select Target Node to Override
            </label>
            <div className="flex flex-wrap gap-1.5">
              {sensors.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSensorSelect(s.id)}
                  className={`px-2 py-1 text-xs font-mono font-semibold rounded border transition ${
                    selectedSensorId === s.id
                      ? 'bg-status-attention text-white border-status-attention'
                      : 'bg-mine-surface border-mine-border text-mine-text-secondary hover:bg-mine-surface-alt'
                  }`}
                >
                  {s.id} ({s.zone})
                </button>
              ))}
            </div>
          </div>

          {/* Current Composite Risk Impact */}
          <div className="card p-4 bg-mine-surface border border-mine-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-mine-text-secondary">
                Model Composite Risk Output
              </span>
              <span className="text-xs font-bold text-mine-text-primary font-mono">
                {aiPrediction?.overallScore || 0} / 100 • {aiPrediction?.riskLevel || 'SAFE'}
              </span>
            </div>
            <RiskGauge value={aiPrediction?.overallScore || 0} showLabel={false} />
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Displacement Slider */}
            <div className="card p-4 bg-mine-surface border border-mine-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-mine-text-primary">LVDT Displacement</span>
                <span className="font-mono font-bold text-status-critical tabular-nums">{dispVal.toFixed(1)} mm</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="15.0"
                step="0.1"
                value={dispVal}
                onChange={(e) => handleDispChange(e.target.value)}
                className="w-full h-1.5 bg-mine-surface-alt rounded-lg appearance-none cursor-pointer accent-status-critical"
              />
              <div className="flex justify-between text-[10px] text-mine-text-secondary">
                <span>0.1 mm (Nominal)</span>
                <span>5.0 mm (Warning)</span>
                <span>15.0 mm (Failure)</span>
              </div>
            </div>

            {/* Tilt Angle Slider */}
            <div className="card p-4 bg-mine-surface border border-mine-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-mine-text-primary">BNO055 Clinometer Tilt</span>
                <span className="font-mono font-bold text-status-warning tabular-nums">{tiltVal.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="10.0"
                step="0.1"
                value={tiltVal}
                onChange={(e) => handleTiltChange(e.target.value)}
                className="w-full h-1.5 bg-mine-surface-alt rounded-lg appearance-none cursor-pointer accent-status-warning"
              />
              <div className="flex justify-between text-[10px] text-mine-text-secondary">
                <span>0.5° (Safe)</span>
                <span>3.0° (Caution)</span>
                <span>10.0° (Severe)</span>
              </div>
            </div>

            {/* Vibration Slider */}
            <div className="card p-4 bg-mine-surface border border-mine-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-mine-text-primary">14Hz Geophone Vibration</span>
                <span className="font-mono font-bold text-status-attention tabular-nums">{vibVal.toFixed(2)} g</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="1.50"
                step="0.01"
                value={vibVal}
                onChange={(e) => handleVibChange(e.target.value)}
                className="w-full h-1.5 bg-mine-surface-alt rounded-lg appearance-none cursor-pointer accent-status-attention"
              />
              <div className="flex justify-between text-[10px] text-mine-text-secondary">
                <span>0.05 g (Quiet)</span>
                <span>0.40 g (Seismic)</span>
                <span>1.50 g (Fracture)</span>
              </div>
            </div>

            {/* Hydraulic Pressure Cell Stress Slider */}
            <div className="card p-4 bg-mine-surface border border-mine-border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-mine-text-primary">Hydraulic Pillar Stress</span>
                <span className="font-mono font-bold text-status-safe tabular-nums">{stressVal.toFixed(1)} MPa</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="50.0"
                step="0.5"
                value={stressVal}
                onChange={(e) => handleStressChange(e.target.value)}
                className="w-full h-1.5 bg-mine-surface-alt rounded-lg appearance-none cursor-pointer accent-status-safe"
              />
              <div className="flex justify-between text-[10px] text-mine-text-secondary">
                <span>3.0 MPa (Normal)</span>
                <span>15.0 MPa (High)</span>
                <span>50.0 MPa (Crush)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-mine-surface-alt border-t border-mine-border px-6 py-3 flex justify-between items-center">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition"
          >
            <RotateCcw className="h-3.5 w-3.5 text-status-attention" />
            Reset Nominal Baseline
          </button>

          <button
            type="button"
            onClick={() => setIsSensorSimulatorOpen(false)}
            className="px-4 py-1.5 rounded text-xs font-semibold bg-status-attention text-white hover:opacity-90 transition"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
