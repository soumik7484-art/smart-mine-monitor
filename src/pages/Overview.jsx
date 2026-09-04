import React from 'react';
import { useMine } from '../context/MineContext';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import RiskGauge from '../components/ui/RiskGauge';
import SensorChart from '../components/ui/SensorChart';
import MineMap from '../components/mine-map/MineMap';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Radio,
  HardHat,
  AlertTriangle,
  DoorOpen,
  Shield,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

export default function Overview() {
  const {
    sensors = [],
    workers = [],
    stats = {},
    alerts = [],
    aiPrediction,
    emergencyModeActive,
    setIsEmergencyHUDOpen,
    activeMap,
  } = useMine();

  const navigate = useNavigate();

  const activeSensors = stats?.activeSensors || 24;
  const totalSensors = stats?.totalSensors || 24;
  const workersCount = workers.length;
  const overallRisk = aiPrediction?.overallScore || 18;
  const riskLevel = aiPrediction?.riskLevel || 'SAFE';

  // Find representative sensors for live telemetry waveforms
  const dispSensor = sensors.find((s) => s.type === 'LVDT') || sensors[0] || { history: { displacement: [] } };
  const tiltSensor = sensors.find((s) => s.type === 'Tiltmeter') || sensors[1] || { history: { tilt: [] } };
  const vibSensor = sensors.find((s) => s.type === 'Geophone') || sensors[2] || { history: { vibration: [] } };
  const stressSensor = sensors.find((s) => s.type === 'PressureCell') || sensors[3] || { history: { stress: [] } };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary">
              Mine Control Center Dashboard
            </h1>
            <StatusBadge status={riskLevel} />
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Real-Time Strata Telemetry, AI Subsidence Risk & Intelligent Safe Evacuation Routing
          </p>
        </div>

        <div className="flex items-center gap-2">
          {emergencyModeActive ? (
            <button
              type="button"
              onClick={() => setIsEmergencyHUDOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold bg-status-critical text-white shadow-sm animate-pulse"
            >
              <AlertTriangle className="h-4 w-4" />
              Open Emergency HUD &rarr;
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/emergency')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
            >
              <Shield className="h-4 w-4 text-status-attention" />
              Evacuation Navigator &rarr;
            </button>
          )}
        </div>
      </div>

      {/* 5 KPI Stat Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="MINE OPERATION STATUS"
          value={emergencyModeActive ? 'EMERGENCY' : 'MONITORING'}
          subtitle="DGMS Safety Protocol Sec-44"
          status={emergencyModeActive ? 'CRITICAL' : 'SAFE'}
        />

        <StatCard
          label="ACTIVE STRATA SENSORS"
          value={`${activeSensors} / ${totalSensors}`}
          subtitle="LoRaWAN 868MHz Mesh"
          status={activeSensors < totalSensors ? 'WARNING' : 'SAFE'}
        />

        <StatCard
          label="MINERS UNDERGROUND"
          value={workersCount}
          subtitle="UWB / BLE Mesh Tagged"
        />

        <StatCard
          label="ACTIVE ALARMS"
          value={String(alerts.length).padStart(2, '0')}
          subtitle={emergencyModeActive ? 'Hazard Flag Active' : 'Normal Boundaries'}
          status={alerts.length > 0 ? 'WARNING' : 'SAFE'}
        />

        <StatCard
          label="AI RISK PREDICTION"
          value={`${overallRisk} / 100`}
          subtitle={`${riskLevel} Level Risk`}
          status={riskLevel}
        />
      </div>

      {/* Main Grid: Mine Map Canvas & Stability Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Vector Mine Map Embed */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
              Underground 2D Blueprint Route Network ({activeMap?.mineName || 'Raniganj Deep Colliery (Seam 4)'})
            </span>
            <button
              type="button"
              onClick={() => navigate('/mine-map')}
              className="text-xs text-status-attention hover:underline flex items-center gap-1 font-medium"
            >
              Full Interactive Map <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <MineMap compact height={420} />
        </div>

        {/* Right Col: AI Stability Risk Card */}
        <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border flex flex-col justify-between">
          <div className="border-b border-mine-border pb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary">
              Strata Subsidence Risk Assessment
            </h2>
            <StatusBadge status={riskLevel} />
          </div>

          <div className="py-2 space-y-3">
            <RiskGauge value={overallRisk} />
            <p className="text-xs text-mine-text-secondary leading-relaxed">
              {aiPrediction?.riskDescription}
            </p>
          </div>

          <div className="space-y-2 pt-2 border-t border-mine-border text-xs">
            <div className="flex justify-between">
              <span className="text-mine-text-secondary">Peak Displacement:</span>
              <strong className="font-mono text-mine-text-primary">
                {aiPrediction?.peakReadings?.displacement?.toFixed(2) || '0.80'} mm
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-text-secondary">Max Tilt Clinometer:</span>
              <strong className="font-mono text-mine-text-primary">
                {aiPrediction?.peakReadings?.tilt?.toFixed(2) || '1.10'}°
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-mine-text-secondary">Micro-Seismic Peak:</span>
              <strong className="font-mono text-mine-text-primary">
                {aiPrediction?.peakReadings?.vibration?.toFixed(3) || '0.080'} g
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/ai-prediction')}
            className="w-full py-2 rounded text-xs font-semibold bg-mine-surface-alt border border-mine-border text-mine-text-primary hover:bg-mine-surface transition flex items-center justify-center gap-1.5"
          >
            <TrendingUp className="h-3.5 w-3.5 text-status-attention" />
            View 30-Min AI Forecast Trajectory
          </button>
        </div>
      </div>

      {/* Live Strata Waveforms Grid (4 parameters) */}
      <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border">
        <div className="flex items-center justify-between border-b border-mine-border pb-3">
          <div>
            <h2 className="text-sm font-semibold text-mine-text-primary">
              Live Subsurface Strata Telemetry Waveforms
            </h2>
            <p className="text-xs text-mine-text-secondary">
              Continuous 100Hz IoT sensor streams across roof extensometers, clinometers, and geophones
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/sensor-network')}
            className="text-xs text-status-attention hover:underline flex items-center gap-1 font-medium"
          >
            All 24 Nodes <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SensorChart
            label="LVDT Displacement (mm)"
            data={dispSensor.history?.displacement || []}
            dataKey="value"
            color="#C4820E"
            height={150}
          />
          <SensorChart
            label="Clinometer Tilt (°)"
            data={tiltSensor.history?.tilt || []}
            dataKey="value"
            color="#D97706"
            height={150}
          />
          <SensorChart
            label="Geophone Vibration (g)"
            data={vibSensor.history?.vibration || []}
            dataKey="value"
            color="#C4362E"
            height={150}
          />
          <SensorChart
            label="Pillar Stress (MPa)"
            data={stressSensor.history?.stress || []}
            dataKey="value"
            color="#2D8A4E"
            height={150}
          />
        </div>
      </div>

      {/* Active DGMS Compliance Alerts Table */}
      <div className="card bg-mine-surface border border-mine-border overflow-hidden">
        <div className="p-4 border-b border-mine-border bg-mine-surface-alt flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-attention" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-mine-text-primary">
              Active Control Room Alerts & Safety Events
            </h2>
          </div>
          <span className="text-xs font-mono text-mine-text-secondary">
            {alerts.length} Active Records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-mine-border bg-mine-surface text-mine-text-secondary uppercase tracking-wider font-semibold">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Location</th>
                <th className="p-3">Alert Title</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Protocol Response</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length > 0 ? (
                alerts.map((alt) => (
                  <tr key={alt.id} className="border-b border-mine-border last:border-b-0 hover:bg-mine-surface-alt/50 transition">
                    <td className="p-3 font-mono text-mine-text-secondary whitespace-nowrap">
                      {new Date(alt.timestamp).toLocaleTimeString('en-IN')}
                    </td>
                    <td className="p-3 font-semibold text-mine-text-primary">{alt.location}</td>
                    <td className="p-3 text-mine-text-primary">{alt.title}</td>
                    <td className="p-3">
                      <StatusBadge status={alt.severity} />
                    </td>
                    <td className="p-3 text-mine-text-secondary font-mono text-[11px]">
                      {alt.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-mine-text-secondary text-xs">
                    No active threshold alerts. Mine operating under nominal conditions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
