import React, { useState } from 'react';
import { useMine } from '../context/MineContext';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import {
  HardHat,
  Radio,
  DoorOpen,
  Info,
  Activity,
  Heart,
  Compass,
  AlertTriangle,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';

export default function WorkerSafety() {
  const {
    workers = [],
    workerRoutes = {},
    selectedWorker,
    setSelectedWorker,
    emergencyModeActive,
    setIsAddMinerModalOpen,
  } = useMine();

  const [activeWorker, setActiveWorker] = useState(selectedWorker || workers[0]);

  const assignedRoute = activeWorker ? workerRoutes[activeWorker.id] : null;

  const columns = [
    {
      key: 'id',
      label: 'Miner Tag ID',
      render: (val) => <span className="font-mono font-bold text-mine-text-primary">{val}</span>,
    },
    {
      key: 'name',
      label: 'Miner Name',
      render: (val) => <span className="font-semibold text-mine-text-primary">{val}</span>,
    },
    {
      key: 'zone',
      label: 'Subsurface Sector',
      render: (val) => <span>Zone {val}</span>,
    },
    { key: 'role', label: 'Assigned Role' },
    {
      key: 'nodeId',
      label: 'UPS Junction Node',
      render: (val) => <span className="font-mono font-semibold text-mine-text-primary">{val}</span>,
    },
    {
      key: 'helmet',
      label: 'Smart Helmet Mesh',
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${val === 'Connected' ? 'text-status-safe' : 'text-status-warning'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${val === 'Connected' ? 'bg-status-safe' : 'bg-status-warning'}`} />
          {val}
        </span>
      ),
    },
    {
      key: 'movement',
      label: 'Activity',
      render: (val) => <span className="font-mono text-xs">{val}</span>,
    },
    {
      key: 'status',
      label: 'Evacuation State',
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
              Underground Positioning System (UPS) & Worker Safety
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary">
              UWB / BLE MESH / IMU DEAD-RECKONING
            </span>
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Subsurface Localization: Time-of-Flight Distance to Tunnel Anchors & Helmet Inertial Sensors
          </p>
        </div>
      </div>

      {/* Why UPS instead of GPS Educational Callout */}
      <div className="card p-4 bg-mine-surface border border-mine-border space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-mine-text-primary">
          <Info className="h-4 w-4 text-status-attention" />
          <span>Why Underground Positioning System (UPS) Instead of Conventional Satellite GPS?</span>
        </div>
        <p className="text-xs text-mine-text-secondary leading-relaxed">
          Standard satellite GPS signals cannot penetrate hundreds of meters of dense rock overburden. MINEGUARD AI replaces GPS with an <strong>Underground Positioning System (UPS)</strong> using 10 Decawave DWM1000 UWB (Ultra-Wideband) Time-of-Flight anchors installed at tunnel junctions (&plusmn;0.5m accuracy), Bluetooth Low Energy (BLE) mesh triangulation along crosscuts, and smart helmet triaxial IMUs calculating dead-reckoning step count if anchor line-of-sight is interrupted.
        </p>
      </div>

      {/* Workers Roster Table */}
      <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border">
        <div className="border-b border-mine-border pb-3 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-mine-text-primary">
              Subsurface Mining Personnel Roster ({workers.length} Active Tags)
            </h2>
            <button
              type="button"
              onClick={() => setIsAddMinerModalOpen(true)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-status-attention/15 border border-status-attention/40 text-status-attention hover:bg-status-attention hover:text-white transition font-semibold shadow-sm"
              title="Deploy new miner underground"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ Add Miner</span>
            </button>
          </div>
          <span className="text-xs font-mono text-mine-text-secondary">
            Click row to inspect miner telemetry
          </span>
        </div>

        <DataTable
          columns={columns}
          data={workers}
          onRowClick={(row) => {
            setActiveWorker(row);
            setSelectedWorker(row);
          }}
        />
      </div>

      {/* Selected Worker Detailed Card */}
      {activeWorker && (
        <div className="card p-5 space-y-4 bg-mine-surface border border-mine-border animate-fadeIn">
          <div className="border-b border-mine-border pb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded bg-mine-surface-alt border border-mine-border">
                <HardHat className="h-5 w-5 text-status-attention" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-mine-text-primary">
                  {activeWorker.name} ({activeWorker.id}) — {activeWorker.role}
                </h3>
                <p className="text-xs text-mine-text-secondary">
                  Subsurface Location: Sector {activeWorker.zone} • At Junction {activeWorker.nodeId}
                </p>
              </div>
            </div>
            <StatusBadge status={activeWorker.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded bg-mine-surface-alt border border-mine-border space-y-1">
              <span className="text-mine-text-secondary">Assigned Surface Exit:</span>
              <p className="font-semibold text-status-safe flex items-center gap-1 text-sm font-mono">
                <DoorOpen className="h-4 w-4" />
                {assignedRoute?.exitLabel || 'Exit E1'}
              </p>
            </div>

            <div className="p-3 rounded bg-mine-surface-alt border border-mine-border space-y-1">
              <span className="text-mine-text-secondary">Estimated Escape Distance:</span>
              <p className="font-semibold text-mine-text-primary text-sm font-mono">
                {assignedRoute?.totalDistance || 280} meters (~{assignedRoute?.estimatedTime || '3 min 53 sec'})
              </p>
            </div>

            <div className="p-3 rounded bg-mine-surface-alt border border-mine-border space-y-1">
              <span className="text-mine-text-secondary">Helmet Sensor Stream:</span>
              <p className="font-semibold text-mine-text-primary font-mono">
                IMU Active • LoRaWAN 868MHz RSSI -74dBm
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
