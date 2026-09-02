import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import SensorChart from '../components/ui/SensorChart';
import {
  Radio,
  Sliders,
  Filter,
  Activity,
  Battery,
  Wifi,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export default function SensorNetwork() {
  const {
    sensors = [],
    selectedSensor,
    setSelectedSensor,
    setIsSensorSimulatorOpen,
    triggerSubsidence,
    resetToNormal,
  } = useMine();

  const [zoneFilter, setZoneFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredSensors = sensors.filter((s) => {
    const matchesZone = zoneFilter === 'ALL' || s.zone === zoneFilter;
    const matchesType = typeFilter === 'ALL' || s.type === typeFilter;
    return matchesZone && matchesType;
  });

  const dispSensor = sensors.find((s) => s.type === 'LVDT') || sensors[0];
  const tiltSensor = sensors.find((s) => s.type === 'Tiltmeter') || sensors[1];
  const vibSensor = sensors.find((s) => s.type === 'Geophone') || sensors[2];
  const stressSensor = sensors.find((s) => s.type === 'PressureCell') || sensors[3];

  const columns = [
    {
      key: 'id',
      label: 'Node ID',
      render: (val, row) => <span className="font-mono font-bold text-mine-text-primary">{val}</span>,
    },
    {
      key: 'zone',
      label: 'Sector',
      render: (val) => <span className="font-semibold text-mine-text-primary">Zone {val}</span>,
    },
    { key: 'type', label: 'Sensor Type' },
    {
      key: 'displacement',
      label: 'LVDT Disp (mm)',
      render: (val) => (
        <span className={`font-mono tabular-nums font-semibold ${val > 5 ? 'text-status-critical' : val > 2 ? 'text-status-warning' : 'text-mine-text-primary'}`}>
          {val.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'tilt',
      label: 'Tilt (°)',
      render: (val) => (
        <span className={`font-mono tabular-nums ${val > 3 ? 'text-status-critical' : val > 1.5 ? 'text-status-warning' : 'text-mine-text-primary'}`}>
          {val.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'vibration',
      label: 'Vibration (g)',
      render: (val) => (
        <span className={`font-mono tabular-nums ${val > 0.4 ? 'text-status-critical' : 'text-mine-text-primary'}`}>
          {val.toFixed(3)}
        </span>
      ),
    },
    {
      key: 'stress',
      label: 'Stress (MPa)',
      render: (val) => (
        <span className={`font-mono tabular-nums ${val > 15 ? 'text-status-critical' : 'text-mine-text-primary'}`}>
          {val.toFixed(1)}
        </span>
      ),
    },
    {
      key: 'battery',
      label: 'Battery',
      render: (val) => <span className="font-mono text-xs tabular-nums">{val}%</span>,
    },
    {
      key: 'status',
      label: 'Condition',
      render: (val) => <StatusBadge status={val} />,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary">
              Strata Sensor Grid Telemetry
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary">
              24 IOT NODES ONLINE
            </span>
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Real-Time Multi-Parameter Strata Monitoring: LVDT Extensometers, Tilt Clinometers, 14Hz Geophones & Stress Cells
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetToNormal}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold bg-mine-surface border border-mine-border text-mine-text-primary hover:bg-mine-surface-alt transition shadow-card"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Baseline
          </button>
          <button
            type="button"
            onClick={() => setIsSensorSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-status-attention text-white hover:opacity-90 transition shadow-sm"
          >
            <Sliders className="h-3.5 w-3.5" />
            Telemetry Sliders
          </button>
        </div>
      </div>

      {/* 4 Representative Real-Time Waveforms */}
      <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border">
        <div className="border-b border-mine-border pb-3 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-mine-text-primary">
              Primary Strata Telemetry Time-Series Waveforms
            </h2>
            <p className="text-xs text-mine-text-secondary">Rolling 30-data-point continuous sampling</p>
          </div>
          <span className="text-xs font-mono text-mine-text-secondary">Sampling: 100 Hz</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SensorChart
            label={`LVDT Displacement (${dispSensor.id})`}
            data={dispSensor.history?.displacement || []}
            dataKey="value"
            color="#C4820E"
            height={150}
          />
          <SensorChart
            label={`Clinometer Tilt (${tiltSensor.id})`}
            data={tiltSensor.history?.tilt || []}
            dataKey="value"
            color="#D97706"
            height={150}
          />
          <SensorChart
            label={`Geophone Vibration (${vibSensor.id})`}
            data={vibSensor.history?.vibration || []}
            dataKey="value"
            color="#C4362E"
            height={150}
          />
          <SensorChart
            label={`Pillar Stress (${stressSensor.id})`}
            data={stressSensor.history?.stress || []}
            dataKey="value"
            color="#2D8A4E"
            height={150}
          />
        </div>
      </div>

      {/* Filter Bar & Sensor Table */}
      <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mine-border pb-3">
          {/* Zone Filters */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-mine-text-secondary font-semibold uppercase tracking-wider mr-1">Sector:</span>
            {['ALL', 'A', 'B', 'C', 'D'].map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZoneFilter(z)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition ${
                  zoneFilter === z
                    ? 'bg-mine-text-primary text-white border-mine-text-primary'
                    : 'bg-mine-surface border-mine-border text-mine-text-secondary hover:bg-mine-surface-alt'
                }`}
              >
                {z === 'ALL' ? 'All Zones' : `Zone ${z}`}
              </button>
            ))}
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-mine-text-secondary font-semibold uppercase tracking-wider mr-1">Sensor:</span>
            {['ALL', 'LVDT', 'Tiltmeter', 'Geophone', 'PressureCell'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-2 py-1 rounded text-xs font-medium border transition ${
                  typeFilter === t
                    ? 'bg-mine-surface-alt font-bold text-mine-text-primary border-mine-border'
                    : 'bg-mine-surface border-mine-border text-mine-text-secondary hover:bg-mine-surface-alt'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 24-Node Telemetry Table */}
        <DataTable
          columns={columns}
          data={filteredSensors}
          onRowClick={(row) => setSelectedSensor(row)}
          emptyMessage="No sensor nodes match the selected sector or type filter."
        />
      </div>

      {/* Selected Node Expanded Drawer */}
      {selectedSensor && (
        <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border animate-fadeIn">
          <div className="flex items-center justify-between border-b border-mine-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-mine-text-primary">
                Sensor Inspector: {selectedSensor.label} ({selectedSensor.id})
              </h3>
              <p className="text-xs text-mine-text-secondary">
                Sector {selectedSensor.zone} • Mounted at Junction {selectedSensor.nodeId}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSensor(null)}
              className="text-xs text-mine-text-secondary hover:text-mine-text-primary font-medium"
            >
              Close Inspector
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SensorChart
              label="Displacement History (mm)"
              data={selectedSensor.history?.displacement || []}
              dataKey="value"
              color="#C4820E"
              height={140}
            />
            <SensorChart
              label="Tilt Angle History (°)"
              data={selectedSensor.history?.tilt || []}
              dataKey="value"
              color="#D97706"
              height={140}
            />
            <SensorChart
              label="Vibration Waveform (g)"
              data={selectedSensor.history?.vibration || []}
              dataKey="value"
              color="#C4362E"
              height={140}
            />
          </div>
        </div>
      )}
    </div>
  );
}
