import React, { useState, useMemo } from 'react';
import { useMine } from '../../context/MineContext';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  HardHat,
  Radio,
  Wind,
  Navigation,
  DoorOpen,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  MINE_NODES,
  MINE_EXITS,
  MINE_TUNNELS,
  COAL_PILLARS,
  GOAF_ZONES,
  VENTILATION_PATHS,
  UWB_ANCHORS,
  ZONES,
} from '../../data/mineData';

export default function MineMap({ compact = false, height = 580, onSelectNode, onSelectTunnel }) {
  const {
    sensors = [],
    workers = [],
    tunnelStates = {},
    workerRoutes = {},
    activeRouteWorkerId,
    collapsedTunnelIds = [],
    advanceEvacuation,
    toggleTunnelBlock,
    relocateWorker,
    selectedSensor,
    setSelectedSensor,
  } = useMine();

  const [zoom, setZoom] = useState(1);
  const [showPillars, setShowPillars] = useState(true);
  const [showVentilation, setShowVentilation] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showUWB, setShowUWB] = useState(true);

  // Inspector state
  const [inspectedTunnel, setInspectedTunnel] = useState(null);
  const [inspectedNode, setInspectedNode] = useState(null);

  const nodeMap = useMemo(() => {
    const map = new Map();
    MINE_NODES.forEach((n) => map.set(n.id, n));
    MINE_EXITS.forEach((e) => map.set(e.id, e));
    return map;
  }, []);

  const evacuatingWorkers = workers.filter((w) => w.status === 'EVACUATING');

  // Active route to highlight (default to first evacuating worker or active worker)
  const targetWorker = workers.find((w) => w.id === activeRouteWorkerId) || evacuatingWorkers[0] || workers[0];
  const activeRoute = targetWorker ? workerRoutes[targetWorker.id] : null;

  const routePoints = useMemo(() => {
    if (!activeRoute || !activeRoute.routeNodes || activeRoute.routeNodes.length < 2) return '';
    return activeRoute.routeNodes
      .map((id) => {
        const n = nodeMap.get(id);
        return n ? `${n.x},${n.y}` : '';
      })
      .filter(Boolean)
      .join(' ');
  }, [activeRoute, nodeMap]);

  const getRiskColor = (riskLevel, status) => {
    if (status === 'COLLAPSED') return '#C4362E';
    switch (riskLevel) {
      case 'CRITICAL':
        return '#C4362E';
      case 'WARNING':
        return '#C4820E';
      case 'CAUTION':
        return '#D97706';
      case 'SAFE':
      default:
        return '#2D8A4E';
    }
  };

  const handleTunnelClick = (t) => {
    const currentStatus = tunnelStates[t.id]?.status || 'OPEN';
    setInspectedTunnel({ ...t, status: currentStatus, riskLevel: tunnelStates[t.id]?.riskLevel || 'SAFE' });
    setInspectedNode(null);
    onSelectTunnel?.(t);
  };

  const handleNodeClick = (n) => {
    setInspectedNode(n);
    setInspectedTunnel(null);
    onSelectNode?.(n);
  };

  return (
    <div className="card overflow-hidden flex flex-col w-full bg-mine-surface border border-mine-border shadow-card relative">
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mine-border bg-mine-surface-alt px-4 py-2 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-status-safe" />
          <span className="font-semibold uppercase tracking-wider text-mine-text-primary">
            Raniganj Coalfield • Seam 3 Underground Vector Network
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-mine-surface text-mine-text-secondary border border-mine-border font-mono text-[10px]">
            CAD Plan 1:500m • DGMS Ref #44A
          </span>
        </div>

        <div className="flex items-center gap-2">
          {evacuatingWorkers.length > 0 && (
            <button
              type="button"
              onClick={advanceEvacuation}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-status-critical text-white font-semibold shadow-sm hover:opacity-90 transition animate-pulse"
              title="Advance evacuating miners one junction forward along computed route"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Step Evacuation ({evacuatingWorkers.length})</span>
            </button>
          )}

          {!compact && (
            <div className="hidden lg:flex items-center gap-1 border-r border-mine-border pr-2 mr-1">
              <button
                type="button"
                onClick={() => setShowPillars(!showPillars)}
                className={`px-2 py-1 rounded transition border ${
                  showPillars ? 'bg-mine-surface text-mine-text-primary border-mine-border font-medium' : 'text-mine-text-secondary border-transparent'
                }`}
              >
                Pillars
              </button>
              <button
                type="button"
                onClick={() => setShowVentilation(!showVentilation)}
                className={`px-2 py-1 rounded transition border flex items-center gap-1 ${
                  showVentilation ? 'bg-mine-surface text-mine-text-primary border-mine-border font-medium' : 'text-mine-text-secondary border-transparent'
                }`}
              >
                <Wind className="h-3 w-3 text-status-safe" />
                Airflow
              </button>
              <button
                type="button"
                onClick={() => setShowSensors(!showSensors)}
                className={`px-2 py-1 rounded transition border flex items-center gap-1 ${
                  showSensors ? 'bg-mine-surface text-mine-text-primary border-mine-border font-medium' : 'text-mine-text-secondary border-transparent'
                }`}
              >
                <Radio className="h-3 w-3 text-status-warning" />
                Sensors
              </button>
              <button
                type="button"
                onClick={() => setShowWorkers(!showWorkers)}
                className={`px-2 py-1 rounded transition border flex items-center gap-1 ${
                  showWorkers ? 'bg-mine-surface text-mine-text-primary border-mine-border font-medium' : 'text-mine-text-secondary border-transparent'
                }`}
              >
                <HardHat className="h-3 w-3 text-status-attention" />
                Miners
              </button>
            </div>
          )}

          {/* Zoom Controls */}
          <div className="flex items-center bg-mine-surface rounded border border-mine-border p-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
              className="p-1 hover:bg-mine-surface-alt rounded text-mine-text-secondary"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.15).toFixed(2))))}
              className="p-1 hover:bg-mine-surface-alt rounded text-mine-text-secondary"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1 hover:bg-mine-surface-alt rounded text-mine-text-secondary text-[10px] font-mono"
              title="Reset View"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div
        className="relative w-full overflow-auto bg-[#F5F2EC] flex items-center justify-center p-2"
        style={{ height }}
      >
        <svg
          viewBox="0 0 1000 580"
          className="w-full h-full max-w-full transition-transform duration-200 select-none"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <defs>
            {/* Survey Grid Pattern */}
            <pattern id="surveyGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E3DED5" strokeWidth="0.75" />
              <circle cx="0" cy="0" r="1.2" fill="#D0C9BE" />
            </pattern>

            {/* Coal Pillar Hatching Pattern */}
            <pattern id="coalPillarHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="8" fill="#EEEBE4" />
              <line x1="0" y1="0" x2="0" y2="8" stroke="#D8D3CA" strokeWidth="1.8" />
            </pattern>

            {/* Caved Goaf Pattern */}
            <pattern id="goafTexture" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill="#E8E4DC" />
              <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke="#C4BDB0" strokeWidth="1" />
            </pattern>

            {/* Collapsed Hazard Stripe Pattern */}
            <pattern id="collapseHazard" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="14" fill="#C4362E" />
              <rect x="7" width="7" height="14" fill="#8E1F1A" />
            </pattern>

            {/* Glow Filter for Evacuation Path */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="580" fill="url(#surveyGrid)" />

          {/* Geological Zone Boundaries */}
          {showZones && (
            <g className="zones-layer" opacity="0.85">
              {/* Zone A */}
              <rect
                x="80"
                y="150"
                width="150"
                height="300"
                rx="8"
                fill="#E2E8F0"
                fillOpacity="0.2"
                stroke="#94A3B8"
                strokeDasharray="4 3"
                strokeWidth="1"
              />
              <text x="90" y="170" fill="#64748B" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
                ZONE A • INTAKE (-140m)
              </text>

              {/* Zone B */}
              <rect
                x="250"
                y="150"
                width="150"
                height="300"
                rx="8"
                fill="#FEF3C7"
                fillOpacity="0.25"
                stroke="#D97706"
                strokeDasharray="4 3"
                strokeWidth="1"
              />
              <text x="260" y="170" fill="#D97706" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
                ZONE B • ACTIVE FACE (-260m)
              </text>

              {/* Zone C */}
              <rect
                x="420"
                y="150"
                width="150"
                height="300"
                rx="8"
                fill="#E0F2FE"
                fillOpacity="0.25"
                stroke="#0EA5E9"
                strokeDasharray="4 3"
                strokeWidth="1"
              />
              <text x="430" y="170" fill="#0EA5E9" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
                ZONE C • RETURN PANEL (-220m)
              </text>

              {/* Zone D */}
              <rect
                x="590"
                y="150"
                width="150"
                height="300"
                rx="8"
                fill="#D1FAE5"
                fillOpacity="0.25"
                stroke="#10B981"
                strokeDasharray="4 3"
                strokeWidth="1"
              />
              <text x="600" y="170" fill="#10B981" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
                ZONE D • DEVELOPMENT (-290m)
              </text>
            </g>
          )}

          {/* Solid Coal Pillars */}
          {showPillars && (
            <g className="coal-pillars-layer">
              {COAL_PILLARS.map((p, i) => (
                <rect
                  key={i}
                  x={p.x}
                  y={p.y}
                  width={p.w}
                  height={p.h}
                  rx="3"
                  fill="url(#coalPillarHatch)"
                  stroke="#D8D3CA"
                  strokeWidth="1"
                />
              ))}

              {/* Goaf Zones */}
              {GOAF_ZONES.map((g, i) => (
                <g key={i}>
                  <rect
                    x={g.x}
                    y={g.y}
                    width={g.w}
                    height={g.h}
                    rx="4"
                    fill="url(#goafTexture)"
                    stroke="#C4BDB0"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <text
                    x={g.x + g.w / 2}
                    y={g.y + g.h / 2 + 3}
                    textAnchor="middle"
                    fill="#8C8578"
                    fontSize="8"
                    fontWeight="600"
                    fontFamily="Inter, sans-serif"
                  >
                    {g.label}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Ventilation Airflow Vectors */}
          {showVentilation && (
            <g className="ventilation-layer" opacity="0.6">
              {VENTILATION_PATHS.map((v, i) => {
                const fromN = nodeMap.get(v.from);
                const toN = nodeMap.get(v.to);
                if (!fromN || !toN) return null;
                const isIntake = v.direction === 'intake';
                return (
                  <line
                    key={i}
                    x1={fromN.x + (isIntake ? 6 : -6)}
                    y1={fromN.y + (isIntake ? 6 : -6)}
                    x2={toN.x + (isIntake ? 6 : -6)}
                    y2={toN.y + (isIntake ? 6 : -6)}
                    stroke={isIntake ? '#2563EB' : '#D97706'}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                );
              })}
            </g>
          )}

          {/* Tunnels Layer */}
          <g className="tunnels-layer">
            {MINE_TUNNELS.map((tunnel) => {
              const fromN = nodeMap.get(tunnel.from);
              const toN = nodeMap.get(tunnel.to);
              if (!fromN || !toN) return null;

              const state = tunnelStates[tunnel.id] || { riskLevel: 'SAFE', status: 'OPEN' };
              const isCollapsed = state.status === 'COLLAPSED' || collapsedTunnelIds.includes(tunnel.id);
              const color = getRiskColor(state.riskLevel, state.status);
              const isInspected = inspectedTunnel?.id === tunnel.id;

              return (
                <g
                  key={tunnel.id}
                  onClick={() => handleTunnelClick(tunnel)}
                  className="cursor-pointer"
                >
                  {/* Outer tunnel rock casing */}
                  <line
                    x1={fromN.x}
                    y1={fromN.y}
                    x2={toN.x}
                    y2={toN.y}
                    stroke="#4A4742"
                    strokeWidth={isInspected ? '18' : '14'}
                    strokeLinecap="round"
                  />

                  {/* Inner gallery */}
                  <line
                    x1={fromN.x}
                    y1={fromN.y}
                    x2={toN.x}
                    y2={toN.y}
                    stroke={isCollapsed ? 'url(#collapseHazard)' : color}
                    strokeWidth={isInspected ? '10' : '7'}
                    strokeLinecap="round"
                    strokeOpacity={isCollapsed ? 0.95 : 0.85}
                  />

                  {/* Cross marks for collapsed tunnels */}
                  {isCollapsed && (
                    <g transform={`translate(${(fromN.x + toN.x) / 2}, ${(fromN.y + toN.y) / 2})`}>
                      <line x1="-5" y1="-5" x2="5" y2="5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                      <line x1="5" y1="-5" x2="-5" y2="5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                    </g>
                  )}

                  {/* Tunnel ID Badge */}
                  <g transform={`translate(${(fromN.x + toN.x) / 2}, ${(fromN.y + toN.y) / 2 - 8})`}>
                    <rect
                      x="-14"
                      y="-6"
                      width="28"
                      height="12"
                      rx="2"
                      fill="#FFFFFF"
                      stroke={isInspected ? '#292722' : '#D8D3CA'}
                      strokeWidth="1"
                    />
                    <text
                      textAnchor="middle"
                      y="3"
                      fontSize="7"
                      fontWeight="600"
                      fill="#292722"
                      fontFamily="Inter, sans-serif"
                    >
                      {tunnel.id}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Dynamic Evacuation Route Polyline */}
          {routePoints && (
            <g className="evacuation-route-layer">
              {/* Broad glow path */}
              <polyline
                points={routePoints}
                fill="none"
                stroke="#2D8A4E"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.25"
                filter="url(#routeGlow)"
              />
              {/* Animated dash line */}
              <polyline
                points={routePoints}
                fill="none"
                stroke="#2D8A4E"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 6"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  values="0;-28"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </polyline>
            </g>
          )}

          {/* Junction Nodes Layer */}
          <g className="nodes-layer">
            {MINE_NODES.map((n) => (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                onClick={() => handleNodeClick(n)}
                className="cursor-pointer"
              >
                <circle r="6" fill="#FFFFFF" stroke="#292722" strokeWidth="2" />
                <text
                  textAnchor="middle"
                  y="-10"
                  fontSize="8"
                  fontWeight="600"
                  fill="#292722"
                  fontFamily="Inter, sans-serif"
                >
                  {n.id}
                </text>
              </g>
            ))}
          </g>

          {/* Surface Exits & Refuge Station */}
          <g className="exits-layer">
            {MINE_EXITS.map((e) => {
              const isRefuge = e.type === 'refuge';
              return (
                <g key={e.id} transform={`translate(${e.x}, ${e.y})`}>
                  <rect
                    x={isRefuge ? '-30' : '-22'}
                    y="-12"
                    width={isRefuge ? '60' : '44'}
                    height="24"
                    rx="4"
                    fill={isRefuge ? '#D97706' : '#2D8A4E'}
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                  <text
                    textAnchor="middle"
                    y="4"
                    fontSize="8"
                    fontWeight="700"
                    fill="#FFFFFF"
                    fontFamily="Inter, sans-serif"
                  >
                    {e.id}
                  </text>
                </g>
              );
            })}
          </g>

          {/* UWB Anchors */}
          {showUWB && (
            <g className="uwb-anchors-layer">
              {UWB_ANCHORS.map((a) => {
                const target = nodeMap.get(a.nodeId);
                if (!target) return null;
                return (
                  <g key={a.id} transform={`translate(${target.x + 10}, ${target.y + 10})`}>
                    <polygon points="0,-4 4,0 0,4 -4,0" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1" />
                  </g>
                );
              })}
            </g>
          )}

          {/* Sensors Layer */}
          {showSensors && (
            <g className="sensors-layer">
              {sensors.map((s) => {
                const parentNode = nodeMap.get(s.nodeId);
                if (!parentNode) return null;
                const color = getRiskColor(s.status, 'OPEN');
                // Offset sensors based on sensor ID number
                const num = parseInt(s.id.replace('S-', ''));
                const offsetX = (num % 2 === 0 ? 14 : -14);
                const offsetY = (num % 3 === 0 ? 14 : -14);

                return (
                  <g
                    key={s.id}
                    transform={`translate(${parentNode.x + offsetX}, ${parentNode.y + offsetY})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSensor(s);
                    }}
                    className="cursor-pointer"
                  >
                    <circle r="4.5" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />
                    {s.status === 'CRITICAL' && (
                      <circle r="8" fill="none" stroke="#C4362E" strokeWidth="1.5" opacity="0.6">
                        <animate attributeName="r" values="6;12;6" dur="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="1.5s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </g>
          )}

          {/* Workers Underground (UPS Tracked) */}
          {showWorkers && (
            <g className="workers-layer">
              {workers.map((w, idx) => {
                const parentNode = nodeMap.get(w.nodeId);
                if (!parentNode) return null;
                const isEvac = w.status === 'EVACUATING';
                const angle = ((idx * 45) * Math.PI) / 180;
                const wx = parentNode.x + Math.cos(angle) * 16;
                const wy = parentNode.y + Math.sin(angle) * 16;

                return (
                  <g key={w.id} transform={`translate(${wx}, ${wy})`}>
                    {isEvac && (
                      <circle r="9" fill="none" stroke="#C4362E" strokeWidth="1.5">
                        <animate attributeName="r" values="7;14;7" dur="1.2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                    )}
                    <circle
                      r="5"
                      fill={isEvac ? '#C4362E' : '#292722'}
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                    <text
                      textAnchor="middle"
                      y="14"
                      fontSize="7"
                      fontWeight="600"
                      fill={isEvac ? '#C4362E' : '#292722'}
                      fontFamily="Inter, sans-serif"
                    >
                      {w.id}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Scale & North Arrow */}
          <g transform="translate(40, 550)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#6F6A61" strokeWidth="1.5" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#6F6A61" strokeWidth="1.5" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="#6F6A61" strokeWidth="1.5" />
            <text x="30" y="10" textAnchor="middle" fontSize="8" fill="#6F6A61" fontFamily="Inter, sans-serif">
              100m
            </text>
          </g>

          <g transform="translate(940, 40)">
            <circle r="12" fill="#FFFFFF" stroke="#D8D3CA" strokeWidth="1" />
            <polygon points="0,-9 3,0 -3,0" fill="#C4362E" />
            <polygon points="0,9 3,0 -3,0" fill="#6F6A61" />
            <text x="0" y="-12" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#292722">
              N
            </text>
          </g>
        </svg>

        {/* On-Map Interactive Inspector Popover */}
        {inspectedTunnel && (
          <div className="absolute top-14 left-4 w-72 card p-3.5 bg-mine-surface border border-mine-border shadow-dropdown z-20 space-y-2 text-xs">
            <div className="flex justify-between items-center border-b border-mine-border pb-1.5">
              <span className="font-bold text-mine-text-primary uppercase tracking-wider">
                {inspectedTunnel.id} — {inspectedTunnel.label}
              </span>
              <button onClick={() => setInspectedTunnel(null)} className="text-mine-text-secondary hover:text-mine-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1 text-mine-text-secondary">
              <div className="flex justify-between">
                <span>Sector:</span>
                <strong className="text-mine-text-primary font-semibold">Zone {inspectedTunnel.zone}</strong>
              </div>
              <div className="flex justify-between">
                <span>Length:</span>
                <strong className="text-mine-text-primary font-mono">{inspectedTunnel.length} meters</strong>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <strong className={inspectedTunnel.status === 'COLLAPSED' ? 'text-status-critical font-bold' : 'text-status-safe font-semibold'}>
                  {inspectedTunnel.status}
                </strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                toggleTunnelBlock(inspectedTunnel.id);
                setInspectedTunnel((prev) => ({
                  ...prev,
                  status: prev.status === 'COLLAPSED' ? 'OPEN' : 'COLLAPSED',
                }));
              }}
              className={`w-full py-1.5 px-3 rounded text-xs font-semibold transition ${
                inspectedTunnel.status === 'COLLAPSED'
                  ? 'bg-status-safe text-white hover:opacity-90'
                  : 'bg-status-critical text-white hover:opacity-90'
              }`}
            >
              {inspectedTunnel.status === 'COLLAPSED' ? 'Reopen Tunnel' : 'Simulate Tunnel Blockage'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
