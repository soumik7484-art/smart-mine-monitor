import React, { useState } from 'react';
import { useMine } from '../../context/MineContext';
import { UserPlus, X, HardHat, Radio, ShieldCheck, MapPin, Activity, Check } from 'lucide-react';
import { MINE_NODES } from '../../data/mineData.js';

const ROLE_OPTIONS = [
  'Continuous Miner Operator',
  'Face Worker',
  'Roof Bolting Specialist',
  'Ventilation & Gas Safety Tech',
  'Overman / Shift Supervisor',
  'Underground Electrician',
  'Haulage & Conveyor Specialist',
  'Shotfirer / Blaster',
];

const ZONE_OPTIONS = [
  { id: 'A', label: 'Zone A — Intake Panel (-140m)', nodes: ['J2', 'J7', 'J8'] },
  { id: 'B', label: 'Zone B — Active Face (-260m)', nodes: ['J3', 'J9', 'J10'] },
  { id: 'C', label: 'Zone C — Return Panel (-180m)', nodes: ['J4', 'J11', 'J12'] },
  { id: 'D', label: 'Zone D — Development (-210m)', nodes: ['J5', 'J13', 'J14'] },
];

export const AddMinerModal = () => {
  const { isAddMinerModalOpen, setIsAddMinerModalOpen, addMiner, workers } = useMine();

  const nextWorkerNum = workers ? workers.length + 1 : 1;
  const suggestedId = `W-${String(nextWorkerNum).padStart(3, '0')}`;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [zone, setZone] = useState('B');
  const [nodeId, setNodeId] = useState('J9');
  const [helmet, setHelmet] = useState('Connected');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAddMinerModalOpen) return null;

  // Available nodes for chosen zone
  const currentZoneDef = ZONE_OPTIONS.find((z) => z.id === zone) || ZONE_OPTIONS[1];
  const availableNodes = currentZoneDef.nodes;

  const handleZoneChange = (newZone) => {
    setZone(newZone);
    const zDef = ZONE_OPTIONS.find((z) => z.id === newZone);
    if (zDef && zDef.nodes.length > 0) {
      setNodeId(zDef.nodes[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter miner full name.');
      return;
    }

    addMiner({
      name: name.trim(),
      phone: phone.trim() || '98' + Math.floor(10000000 + Math.random() * 90000000),
      role,
      zone,
      nodeId,
      helmet,
    });

    // Reset form & close
    setName('');
    setPhone('');
    setErrorMsg('');
    setIsAddMinerModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn select-none">
      <div className="card w-full max-w-lg bg-mine-surface border-2 border-mine-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-mine-surface-alt border-b border-mine-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-status-attention/15 border border-status-attention/40 flex items-center justify-center text-status-attention">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-mine-text-primary tracking-wide flex items-center gap-2">
                Deploy Miner Underground
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mine-surface border border-mine-border text-mine-text-secondary">
                  Target Tag: {suggestedId}
                </span>
              </h2>
              <p className="text-[11px] text-mine-text-secondary">
                Assign crew personnel directly to vector CAD junctions & activate UWB telemetry
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAddMinerModalOpen(false)}
            className="p-1 rounded text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 overflow-y-auto text-xs">
          {errorMsg && (
            <div className="p-2 rounded bg-status-critical/10 border border-status-critical/30 text-status-critical font-medium text-[11px]">
              ⚠ {errorMsg}
            </div>
          )}

          {/* Miner Name & Mobile Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-mine-text-primary flex items-center gap-1">
                Miner Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Soren"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                className="w-full px-2.5 py-1.5 rounded bg-mine-bg border border-mine-border text-mine-text-primary placeholder:text-mine-text-secondary/50 focus:outline-none focus:border-status-attention text-xs"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-mine-text-primary">
                Emergency Mobile Contact
              </label>
              <input
                type="tel"
                placeholder="e.g. 9832145678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded bg-mine-bg border border-mine-border text-mine-text-primary placeholder:text-mine-text-secondary/50 focus:outline-none focus:border-status-attention text-xs font-mono"
              />
            </div>
          </div>

          {/* Operational Role */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-mine-text-primary flex items-center gap-1">
              <HardHat className="h-3 w-3 text-status-attention" />
              Operational Trade & Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded bg-mine-bg border border-mine-border text-mine-text-primary focus:outline-none focus:border-status-attention text-xs cursor-pointer"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Deployment Sector / Zone */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-mine-text-primary flex items-center gap-1">
              <MapPin className="h-3 w-3 text-status-safe" />
              Deployment Sector
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {ZONE_OPTIONS.map((zDef) => (
                <button
                  type="button"
                  key={zDef.id}
                  onClick={() => handleZoneChange(zDef.id)}
                  className={`p-2 rounded text-left border transition text-xs flex items-center justify-between ${
                    zone === zDef.id
                      ? 'bg-mine-surface-alt border-status-attention text-mine-text-primary font-bold shadow-sm'
                      : 'bg-mine-bg border-mine-border text-mine-text-secondary hover:border-mine-border-strong'
                  }`}
                >
                  <span className="truncate">{zDef.label.split('—')[0]}</span>
                  {zone === zDef.id && <Check className="h-3.5 w-3.5 text-status-attention" />}
                </button>
              ))}
            </div>
          </div>

          {/* Junction Node Assignment */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-mine-text-primary flex items-center justify-between">
              <span>Underground Junction Node</span>
              <span className="text-[10px] text-mine-text-secondary font-mono">
                CAD Coordinate Link
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableNodes.map((nId) => {
                const nodeObj = MINE_NODES.find((mn) => mn.id === nId);
                return (
                  <button
                    type="button"
                    key={nId}
                    onClick={() => setNodeId(nId)}
                    className={`px-3 py-1.5 rounded border text-xs font-mono transition flex items-center gap-1.5 ${
                      nodeId === nId
                        ? 'bg-status-attention text-white border-status-attention font-bold shadow-sm'
                        : 'bg-mine-bg border-mine-border text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface-alt'
                    }`}
                  >
                    <span>{nId}</span>
                    {nodeObj && (
                      <span className="text-[9px] opacity-75">
                        ({nodeObj.x},{nodeObj.y})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Smart Helmet & UWB Status */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-mine-text-primary flex items-center gap-1">
              <Radio className="h-3 w-3 text-status-warning" />
              Smart Helmet IoT Gateway Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`p-2 rounded border cursor-pointer flex items-center gap-2 transition ${
                  helmet === 'Connected'
                    ? 'bg-status-safe/10 border-status-safe text-status-safe font-semibold'
                    : 'bg-mine-bg border-mine-border text-mine-text-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="helmetState"
                  checked={helmet === 'Connected'}
                  onChange={() => setHelmet('Connected')}
                  className="accent-emerald-600"
                />
                <span>Online (Active Biometrics)</span>
              </label>

              <label
                className={`p-2 rounded border cursor-pointer flex items-center gap-2 transition ${
                  helmet === 'Disconnected'
                    ? 'bg-status-warning/10 border-status-warning text-status-warning font-semibold'
                    : 'bg-mine-bg border-mine-border text-mine-text-secondary'
                }`}
              >
                <input
                  type="radio"
                  name="helmetState"
                  checked={helmet === 'Disconnected'}
                  onChange={() => setHelmet('Disconnected')}
                  className="accent-amber-600"
                />
                <span>Offline / Beacon Only</span>
              </label>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-2.5 rounded bg-mine-surface-alt border border-mine-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-status-safe/20 border border-status-safe/40 flex items-center justify-center text-[11px] font-bold text-status-safe font-mono">
                ⛏
              </div>
              <div>
                <span className="font-semibold text-mine-text-primary block leading-none">
                  {name.trim() || 'New Miner Preview'}
                </span>
                <span className="text-[10px] text-mine-text-secondary font-mono">
                  {suggestedId} • {role}
                </span>
              </div>
            </div>
            <div className="text-right font-mono text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-mine-surface border border-mine-border text-mine-text-primary font-bold block">
                Node {nodeId} (Zone {zone})
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-mine-border">
            <button
              type="button"
              onClick={() => setIsAddMinerModalOpen(false)}
              className="px-3.5 py-1.5 rounded text-xs font-semibold text-mine-text-secondary hover:text-mine-text-primary hover:bg-mine-surface-alt transition border border-transparent"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded text-xs font-bold bg-status-attention text-white hover:opacity-90 transition shadow-sm flex items-center gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              Deploy to Vector Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddMinerModal;
