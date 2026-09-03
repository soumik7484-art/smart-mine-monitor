import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useMine } from '../../context/MineContext';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  HardHat,
  Radio,
  Wind,
  Navigation,
  DoorOpen,
  AlertTriangle,
  X,
  UserPlus,
  Search,
  Activity,
  Layers,
  Flame,
  Shield,
  Compass,
  CheckCircle2,
  Sliders,
  RotateCcw,
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
import { computeSafeRoute } from '../../services/graphRouting';
import MinerDetailPopup from './MinerDetailPopup';

export default function MineMap({ compact = false, height = 620, onSelectNode, onSelectTunnel }) {
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
    isDarkMode,
    setIsAddMinerModalOpen,
    activeMap,
    isCustomMapActive,
    triggerSubsidence,
    triggerCollapse,
    resetToNormal,
    emergencyModeActive,
  } = useMine();

  // Viewport transformation (Zoom & Pan)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef(null);

  // Layer Toggles (All 9 requested layers)
  const [showPillars, setShowPillars] = useState(true);
  const [showRoadways, setShowRoadways] = useState(true);
  const [showAirflow, setShowAirflow] = useState(true);
  const [showSensors, setShowSensors] = useState(true);
  const [showWorkers, setShowWorkers] = useState(true);
  const [showMonitoringStations, setShowMonitoringStations] = useState(true);
  const [showPanels, setShowPanels] = useState(true);
  const [showGoaf, setShowGoaf] = useState(true);
  const [showEmergencyRoutes, setShowEmergencyRoutes] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Map Search
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedId, setHighlightedId] = useState(null);

  // Inspectors & Popovers
  const [inspectedTunnel, setInspectedTunnel] = useState(null);
  const [inspectedNode, setInspectedNode] = useState(null);
  const [inspectedWorker, setInspectedWorker] = useState(null);
  const [inspectedStation, setInspectedStation] = useState(null);
  const [selectedRouteWorkerId, setSelectedRouteWorkerId] = useState(null);

  // Derive active map geometry (custom blueprint map OR default CAD)
  const currentJunctions = activeMap?.junctions || MINE_NODES;
  const currentShafts = activeMap?.shafts || MINE_EXITS;
  const currentRoadways = activeMap?.roadways || MINE_TUNNELS;
  const currentPillars = activeMap?.pillars || COAL_PILLARS;
  const currentPanels = activeMap?.panels || [
    { id: 'PANEL-01', name: 'ZONE A • INTAKE (-140m)', zone: 'A', x: 80, y: 150, w: 150, h: 300, color: '#64748B' },
    { id: 'PANEL-02', name: 'ZONE B • ACTIVE FACE (-260m)', zone: 'B', x: 250, y: 150, w: 150, h: 300, color: '#D97706' },
    { id: 'PANEL-03', name: 'ZONE C • RETURN PANEL (-220m)', zone: 'C', x: 420, y: 150, w: 150, h: 300, color: '#0EA5E9' },
    { id: 'PANEL-04', name: 'ZONE D • DEVELOPMENT (-290m)', zone: 'D', x: 590, y: 150, w: 150, h: 300, color: '#10B981' },
  ];
  const currentGoaf = activeMap?.goaf || GOAF_ZONES;
  const currentAirflow = activeMap?.airflow || VENTILATION_PATHS;
  const currentMonitoringStations = activeMap?.monitoringStations || [
    { id: 'MS-01', name: 'Station MS-01 (Intake Main)', nodeId: 'J2', zone: 'A', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-01', 'S-02', 'S-03', 'S-04'] },
    { id: 'MS-02', name: 'Station MS-02 (Active Face)', nodeId: 'J3', zone: 'B', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-07', 'S-08', 'S-09', 'S-10'] },
    { id: 'MS-03', name: 'Station MS-03 (Return Gallery)', nodeId: 'J4', zone: 'C', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-13', 'S-14', 'S-15', 'S-16'] },
    { id: 'MS-04', name: 'Station MS-04 (Development Face)', nodeId: 'J5', zone: 'D', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-19', 'S-20', 'S-21', 'S-22'] },
    { id: 'MS-05', name: 'Station MS-05 (Life Refuge Chamber)', nodeId: 'REF-1', zone: 'B', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-05', 'S-06', 'S-11', 'S-12'] },
  ];

  const mapWidth = activeMap?.map?.width || 1000;
  const mapHeight = activeMap?.map?.height || 580;

  // Build node lookup map for O(1) coordinate resolution
  const nodeMap = useMemo(() => {
    const map = new Map();
    currentJunctions.forEach((n) => map.set(n.id, n));
    currentShafts.forEach((e) => map.set(e.id, e));
    if (activeMap?.refugeChambers) {
      activeMap.refugeChambers.forEach((rc) => map.set(rc.id, rc));
    }
    return map;
  }, [currentJunctions, currentShafts, activeMap]);

  const evacuatingWorkers = workers.filter((w) => w.status === 'EVACUATING');

  // Active target worker for route highlight
  const targetWorker =
    (selectedRouteWorkerId && workers.find((w) => w.id === selectedRouteWorkerId)) ||
    workers.find((w) => w.id === activeRouteWorkerId) ||
    evacuatingWorkers[0] ||
    workers[0];

  // Dynamic route calculation
  const activeRoute = useMemo(() => {
    if (!targetWorker) return null;
    if (workerRoutes && workerRoutes[targetWorker.id]) {
      return workerRoutes[targetWorker.id];
    }
    // Calculate on-the-fly if needed using active map topology
    return computeSafeRoute(targetWorker.nodeId, null, tunnelStates, currentRoadways, currentShafts);
  }, [targetWorker, workerRoutes, tunnelStates, currentRoadways, currentShafts]);

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

  // Search handler
  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Search miners
    const foundMiner = workers.find(
      (w) => w.id.toLowerCase().includes(query) || w.name.toLowerCase().includes(query)
    );
    if (foundMiner) {
      const node = nodeMap.get(foundMiner.nodeId);
      if (node) {
        setHighlightedId(foundMiner.id);
        setInspectedWorker(foundMiner);
        setSelectedRouteWorkerId(foundMiner.id);
        setZoom(1.3);
        setPan({ x: 500 - node.x, y: 290 - node.y });
        return;
      }
    }

    // Search sensors
    const foundSensor = sensors.find(
      (s) => s.id.toLowerCase().includes(query) || s.type?.toLowerCase().includes(query)
    );
    if (foundSensor) {
      const node = nodeMap.get(foundSensor.nodeId);
      if (node) {
        setHighlightedId(foundSensor.id);
        setSelectedSensor(foundSensor);
        setZoom(1.3);
        setPan({ x: 500 - node.x, y: 290 - node.y });
        return;
      }
    }

    // Search monitoring stations
    const foundStation = currentMonitoringStations.find(
      (ms) => ms.id.toLowerCase().includes(query) || ms.name.toLowerCase().includes(query)
    );
    if (foundStation) {
      const node = nodeMap.get(foundStation.nodeId);
      if (node) {
        setHighlightedId(foundStation.id);
        setInspectedStation(foundStation);
        setZoom(1.3);
        setPan({ x: 500 - node.x, y: 290 - node.y });
        return;
      }
    }

    // Search junctions
    const foundJunction = currentJunctions.find((j) => j.id.toLowerCase().includes(query));
    if (foundJunction) {
      setHighlightedId(foundJunction.id);
      setInspectedNode(foundJunction);
      setZoom(1.3);
      setPan({ x: 500 - foundJunction.x, y: 290 - foundJunction.y });
      return;
    }

    // Search shafts
    const foundShaft = currentShafts.find((s) => s.id.toLowerCase().includes(query) || s.label?.toLowerCase().includes(query));
    if (foundShaft) {
      setHighlightedId(foundShaft.id);
      setZoom(1.3);
      setPan({ x: 500 - foundShaft.x, y: 290 - foundShaft.y });
      return;
    }
  };

  const handleTunnelClick = (t) => {
    const currentStatus = tunnelStates[t.id]?.status || 'OPEN';
    setInspectedTunnel({ ...t, status: currentStatus, riskLevel: tunnelStates[t.id]?.riskLevel || 'SAFE' });
    setInspectedNode(null);
    setInspectedStation(null);
    onSelectTunnel?.(t);
  };

  const handleNodeClick = (n) => {
    setInspectedNode(n);
    setInspectedTunnel(null);
    setInspectedStation(null);
    onSelectNode?.(n);
  };

  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!isFullscreen) {
      if (mapContainerRef.current.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setHighlightedId(null);
  };

  return (
    <div
      ref={mapContainerRef}
      className={`card overflow-hidden flex flex-col w-full bg-mine-surface border border-mine-border shadow-card relative select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : ''
      }`}
    >
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mine-border bg-mine-surface-alt px-3.5 py-2 text-xs">
        {/* Left: Map Title & Status */}
        <div className="flex items-center gap-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-status-safe animate-pulse" />
          <span className="font-bold uppercase tracking-wider text-mine-text-primary">
            {activeMap?.mineName || 'Raniganj Coalfield • Seam 3'}
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-mine-surface text-mine-text-secondary border border-mine-border font-mono text-[10px]">
            {activeMap?.map?.scale?.label || 'CAD SCHEMATIC • 1:500m'}
          </span>
          {isCustomMapActive && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              BLUEPRINT VECTOR ACTIVE
            </span>
          )}
        </div>

        {/* Center: Search input */}
        <form onSubmit={handleSearch} className="flex items-center relative min-w-[190px] max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Miner, Sensor, Station, Zone..."
            className="w-full bg-mine-surface border border-mine-border rounded-lg pl-7 pr-2.5 py-1 text-xs text-mine-text-primary placeholder:text-mine-text-secondary focus:outline-none focus:border-status-safe"
          />
          <Search className="h-3.5 w-3.5 text-mine-text-secondary absolute left-2 pointer-events-none" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setHighlightedId(null); }}
              className="absolute right-2 text-mine-text-secondary hover:text-mine-text-primary"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </form>

        {/* Right: Actions, Simulation & Layer Controls */}
        <div className="flex items-center gap-2">
          {/* Evacuation Step */}
          {evacuatingWorkers.length > 0 && (
            <button
              type="button"
              onClick={advanceEvacuation}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-status-critical text-white font-semibold shadow-sm hover:opacity-90 transition animate-pulse"
              title="Advance evacuating miners one junction forward"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>Step Evacuation ({evacuatingWorkers.length})</span>
            </button>
          )}

          {/* Simulate Subsidence quick trigger */}
          <button
            type="button"
            onClick={triggerSubsidence}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-white transition shadow-sm"
            title="Inject simulated ground subsidence in active zone"
          >
            <Activity className="h-3 w-3" />
            <span>Simulate Subsidence</span>
          </button>

          {/* Layer Menu Dropdown Toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLayerMenu(!showLayerMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-mine-surface text-mine-text-primary border border-mine-border hover:bg-mine-surface-alt font-medium transition shadow-sm"
              title="Toggle Map Layers"
            >
              <Layers className="h-3.5 w-3.5 text-status-safe" />
              <span>Layers</span>
            </button>

            {showLayerMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-52 card p-3 bg-mine-surface border border-mine-border shadow-dropdown z-30 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-mine-border pb-1.5 font-bold text-mine-text-primary">
                  <span>Display Layers</span>
                  <button onClick={() => setShowLayerMenu(false)} className="text-mine-text-secondary hover:text-mine-text-primary">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 text-mine-text-secondary">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-mine-text-primary">
                    <input type="checkbox" checked={showRoadways} onChange={() => setShowRoadways(!showRoadways)} className="rounded text-status-safe" />
                    <span>Roadways & Tunnels</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-mine-text-primary">
                    <input type="checkbox" checked={showPillars} onChange={() => setShowPillars(!showPillars)} className="rounded text-status-safe" />
                    <span>Coal Pillars</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-mine-text-primary">
                    <input type="checkbox" checked={showPanels} onChange={() => setShowPanels(!showPanels)} className="rounded text-status-safe" />
                    <span>Panels & Zones</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-mine-text-primary">
                    <input type="checkbox" checked={showGoaf} onChange={() => setShowGoaf(!showGoaf)} className="rounded text-status-safe" />
                    <span>Goaf / Old Workings</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-mine-text-primary">
                    <input type="checkbox" checked={showSensors} onChange={() => setShowSensors(!showSensors)} className="rounded text-status-safe" />
                    <span>Strata Sensors</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-mine-text-primary">
                    <input type="checkbox" checked={showWorkers} onChange={() => setShowWorkers(!showWorkers)} className="rounded text-status-safe" />
                    <span>Miners Underground</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-mine-text-primary">
                    <input type="checkbox" checked={showMonitoringStations} onChange={() => setShowMonitoringStations(!showMonitoringStations)} className="rounded text-status-safe" />
                    <span>Monitoring Stations</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-mine-text-primary">
                    <input type="checkbox" checked={showAirflow} onChange={() => setShowAirflow(!showAirflow)} className="rounded text-status-safe" />
                    <span>Ventilation Airflow</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-mine-text-primary">
                    <input type="checkbox" checked={showEmergencyRoutes} onChange={() => setShowEmergencyRoutes(!showEmergencyRoutes)} className="rounded text-status-safe" />
                    <span>Safe Evacuation Routes</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Airflow Quick Toggle */}
          <button
            type="button"
            onClick={() => setShowAirflow(!showAirflow)}
            className={`px-2 py-1 rounded transition border flex items-center gap-1 ${
              showAirflow
                ? 'bg-mine-surface text-mine-text-primary border-mine-border font-medium'
                : 'text-mine-text-secondary border-transparent'
            }`}
            title="Toggle Animated Ventilation Airflow"
          >
            <Wind className="h-3 w-3 text-status-safe" />
            <span className="hidden sm:inline">Airflow</span>
          </button>

          {/* Add Miner */}
          <button
            type="button"
            onClick={() => setIsAddMinerModalOpen(true)}
            className="px-2 py-1 rounded transition border border-status-attention/40 bg-status-attention/15 text-status-attention hover:bg-status-attention hover:text-white font-medium flex items-center gap-1 shadow-sm"
            title="Deploy new miner to map"
          >
            <UserPlus className="h-3 w-3" />
            <span className="hidden sm:inline">Add Miner</span>
          </button>

          {/* Zoom & Viewport Controls */}
          <div className="flex items-center bg-mine-surface rounded border border-mine-border p-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(2.2, Number((z + 0.15).toFixed(2))))}
              className="p-1 hover:bg-mine-surface-alt rounded text-mine-text-secondary"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.15).toFixed(2))))}
              className="p-1 hover:bg-mine-surface-alt rounded text-mine-text-secondary"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetView}
              className="p-1 hover:bg-mine-surface-alt rounded text-mine-text-secondary text-[10px] font-mono"
              title="Reset View"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 hover:bg-mine-surface-alt rounded text-mine-text-secondary"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map Container */}
      <div
        className="relative w-full overflow-hidden bg-mine-bg flex items-center justify-center p-2"
        style={{ height: isFullscreen ? 'calc(100vh - 42px)' : height }}
      >
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full max-w-full transition-transform duration-200 select-none"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Survey Grid Pattern */}
            <pattern id="surveyGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={isDarkMode ? '#242730' : '#E3DED5'} strokeWidth="0.75" />
              <circle cx="0" cy="0" r="1.2" fill={isDarkMode ? '#343844' : '#D0C9BE'} />
            </pattern>

            {/* Coal Pillar Hatching Pattern */}
            <pattern id="coalPillarHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="8" fill={isDarkMode ? '#1E2026' : '#EEEBE4'} />
              <line x1="0" y1="0" x2="0" y2="8" stroke={isDarkMode ? '#2D323E' : '#D8D3CA'} strokeWidth="1.8" />
            </pattern>

            {/* Caved Goaf Pattern */}
            <pattern id="goafTexture" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="12" height="12" fill={isDarkMode ? '#22242B' : '#E8E4DC'} />
              <path d="M 0 0 L 6 6 M 6 0 L 0 6" stroke={isDarkMode ? '#3E4350' : '#C4BDB0'} strokeWidth="1" />
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
          <rect width={mapWidth} height={mapHeight} fill="url(#surveyGrid)" />

          {/* Panels / Extraction Zones Layer */}
          {showPanels && (
            <g className="panels-layer" opacity="0.85">
              {currentPanels.map((p) => (
                <g key={p.id}>
                  <rect
                    x={p.x}
                    y={p.y}
                    width={p.w}
                    height={p.h}
                    rx="8"
                    fill={p.color || '#64748B'}
                    fillOpacity="0.08"
                    stroke={p.color || '#94A3B8'}
                    strokeDasharray="4 3"
                    strokeWidth="1.2"
                  />
                  <text
                    x={p.x + 10}
                    y={p.y + 18}
                    fill={p.color || '#64748B'}
                    fontSize="9"
                    fontWeight="700"
                    fontFamily="Inter, sans-serif"
                  >
                    {p.name || p.id}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Coal Pillars Layer */}
          {showPillars && (
            <g className="pillars-layer">
              {currentPillars.map((pill, idx) => (
                <rect
                  key={pill.id || idx}
                  x={pill.x}
                  y={pill.y}
                  width={pill.w}
                  height={pill.h}
                  rx="3"
                  fill="url(#coalPillarHatch)"
                  stroke={isDarkMode ? '#2D323E' : '#D8D3CA'}
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          {/* Goaf / Worked-out Areas */}
          {showGoaf && (
            <g className="goaf-layer">
              {currentGoaf.map((g, idx) => (
                <g key={g.id || idx}>
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
                    {g.label || 'GOAF'}
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* Ventilation Airflow Vectors (Animated Directional Arrows) */}
          {showAirflow && (
            <g className="airflow-layer" opacity="0.8">
              {currentAirflow.map((v, idx) => {
                const fromN = nodeMap.get(v.from);
                const toN = nodeMap.get(v.to);
                if (!fromN || !toN) return null;
                const isIntake = v.direction === 'intake';
                const strokeColor = isIntake ? '#2563EB' : '#D97706';

                return (
                  <g key={v.id || idx}>
                    <line
                      x1={fromN.x + (isIntake ? 5 : -5)}
                      y1={fromN.y + (isIntake ? 5 : -5)}
                      x2={toN.x + (isIntake ? 5 : -5)}
                      y2={toN.y + (isIntake ? 5 : -5)}
                      stroke={strokeColor}
                      strokeWidth="2"
                      strokeDasharray="6 4"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values={isIntake ? '0;-20' : '-20;0'}
                        dur="1.5s"
                        repeatCount="indefinite"
                      />
                    </line>
                  </g>
                );
              })}
            </g>
          )}

          {/* Roadways & Tunnels Layer */}
          {showRoadways && (
            <g className="roadways-layer">
              {currentRoadways.map((tunnel) => {
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

                    {/* Collapsed warning cross */}
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
                        fill={isDarkMode ? '#242730' : '#FFFFFF'}
                        stroke={isInspected ? '#06B6D4' : isDarkMode ? '#3E4350' : '#D8D3CA'}
                        strokeWidth="1"
                      />
                      <text
                        textAnchor="middle"
                        y="3"
                        fontSize="7"
                        fontWeight="600"
                        fill={isDarkMode ? '#EDEAE4' : '#292722'}
                        fontFamily="Inter, sans-serif"
                      >
                        {tunnel.id}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* Dynamic Evacuation Route Polyline (Dijkstra) */}
          {showEmergencyRoutes && routePoints && (
            <g className="evacuation-route-layer">
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
            {currentJunctions.map((n) => {
              const isHigh = highlightedId === n.id;
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onClick={() => handleNodeClick(n)}
                  className="cursor-pointer"
                >
                  {isHigh && (
                    <circle r="12" fill="none" stroke="#06B6D4" strokeWidth="2">
                      <animate attributeName="r" values="8;16;8" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle r="6" fill={isDarkMode ? '#242730' : '#FFFFFF'} stroke={isDarkMode ? '#EDEAE4' : '#292722'} strokeWidth="2" />
                  <text
                    textAnchor="middle"
                    y="-10"
                    fontSize="8"
                    fontWeight="600"
                    fill={isDarkMode ? '#EDEAE4' : '#292722'}
                    fontFamily="Inter, sans-serif"
                  >
                    {n.id}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Surface Exits, Shafts & Refuge Stations */}
          <g className="shafts-layer">
            {currentShafts.map((e) => {
              const isRefuge = e.type === 'refuge';
              return (
                <g key={e.id} transform={`translate(${e.x}, ${e.y})`}>
                  <rect
                    x={isRefuge ? '-28' : '-22'}
                    y="-12"
                    width={isRefuge ? '56' : '44'}
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

          {/* Monitoring Stations Layer */}
          {showMonitoringStations && (
            <g className="monitoring-stations-layer">
              {currentMonitoringStations.map((ms) => {
                const targetNode = nodeMap.get(ms.nodeId);
                if (!targetNode) return null;
                const isSelected = inspectedStation?.id === ms.id;

                return (
                  <g
                    key={ms.id}
                    transform={`translate(${targetNode.x - 18}, ${targetNode.y + 14})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectedStation(ms);
                      setInspectedWorker(null);
                      setInspectedTunnel(null);
                    }}
                    className="cursor-pointer"
                  >
                    <rect
                      x="-10"
                      y="-8"
                      width="20"
                      height="16"
                      rx="3"
                      fill={isSelected ? '#06B6D4' : '#1E293B'}
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                    />
                    <text
                      textAnchor="middle"
                      y="3"
                      fontSize="6"
                      fontWeight="bold"
                      fill="#FFFFFF"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      MS
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Sensors Layer (Tilt, Vibration, Displacement, Crack) */}
          {showSensors && (
            <g className="sensors-layer">
              {sensors.map((s) => {
                const parentNode = nodeMap.get(s.nodeId);
                if (!parentNode) return null;
                const color = getRiskColor(s.status, 'OPEN');
                const num = parseInt(s.id.replace(/[^0-9]/g, '')) || 1;
                const offsetX = (num % 2 === 0 ? 14 : -14);
                const offsetY = (num % 3 === 0 ? 14 : -14);
                const isSelected = selectedSensor?.id === s.id;

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
                    {isSelected && (
                      <circle r="9" fill="none" stroke="#06B6D4" strokeWidth="1.5" />
                    )}
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

          {/* Underground Miners (Personnel Positioning & Live Avatars) */}
          {showWorkers && (() => {
            const workersByNode = {};
            workers.forEach((w) => {
              if (!workersByNode[w.nodeId]) workersByNode[w.nodeId] = [];
              workersByNode[w.nodeId].push(w);
            });

            return (
              <g className="workers-layer">
                {workers.map((w) => {
                  const parentNode = nodeMap.get(w.nodeId);
                  if (!parentNode) return null;

                  const isEvac = w.status === 'EVACUATING';
                  const isSelected = inspectedWorker?.id === w.id;

                  const nodeGroup = workersByNode[w.nodeId] || [];
                  const posInGroup = nodeGroup.findIndex((nw) => nw.id === w.id);
                  const groupSize = nodeGroup.length;

                  const cols = Math.min(groupSize, 4);
                  const col = posInGroup % cols;
                  const row = Math.floor(posInGroup / cols);
                  const offsetX = (col - (Math.min(groupSize, cols) - 1) / 2) * 14;
                  const offsetY = row * 14;

                  const wx = parentNode.x + offsetX;
                  const wy = parentNode.y - 24 - offsetY;

                  return (
                    <g
                      key={w.id}
                      transform={`translate(${wx}, ${wy})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInspectedWorker(w);
                        setSelectedRouteWorkerId(w.id);
                        setInspectedTunnel(null);
                        setInspectedNode(null);
                        setInspectedStation(null);
                      }}
                      className="cursor-pointer"
                    >
                      {/* Selection ring */}
                      {isSelected && (
                        <circle r="9" fill="none" stroke="#06B6D4" strokeWidth="2" opacity="0.9" />
                      )}
                      {isEvac && (
                        <circle r="8" fill="none" stroke="#C4362E" strokeWidth="1.5">
                          <animate attributeName="r" values="6;12;6" dur="1.2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.2s" repeatCount="indefinite" />
                        </circle>
                      )}
                      <circle
                        r="5.5"
                        fill={isEvac ? '#C4362E' : isSelected ? '#06B6D4' : '#2D323E'}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        textAnchor="middle"
                        y="2.5"
                        fontSize="4.5"
                        fontWeight="bold"
                        fill="#FFFFFF"
                      >
                        ⛏
                      </text>
                      {(isSelected || groupSize <= 3) && (
                        <text
                          textAnchor="middle"
                          y="15"
                          fontSize="6"
                          fontWeight="700"
                          fill={isEvac ? '#C4362E' : isSelected ? '#06B6D4' : isDarkMode ? '#EDEAE4' : '#292722'}
                          fontFamily="Inter, sans-serif"
                        >
                          {w.id}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })()}

          {/* Scale & North Compass */}
          <g transform={`translate(40, ${mapHeight - 30})`}>
            <line x1="0" y1="0" x2="60" y2="0" stroke="#6F6A61" strokeWidth="1.5" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="#6F6A61" strokeWidth="1.5" />
            <line x1="60" y1="-3" x2="60" y2="3" stroke="#6F6A61" strokeWidth="1.5" />
            <text x="30" y="10" textAnchor="middle" fontSize="8" fill="#6F6A61" fontFamily="Inter, sans-serif">
              {activeMap?.map?.scale?.label || '100m'}
            </text>
          </g>

          <g transform={`translate(${mapWidth - 50}, 40)`}>
            <circle r="12" fill={isDarkMode ? '#242730' : '#FFFFFF'} stroke={isDarkMode ? '#3E4350' : '#D8D3CA'} strokeWidth="1" />
            <polygon points="0,-9 3,0 -3,0" fill="#C4362E" />
            <polygon points="0,9 3,0 -3,0" fill={isDarkMode ? '#9CA3AF' : '#6F6A61'} />
            <text x="0" y="-12" textAnchor="middle" fontSize="7" fontWeight="bold" fill={isDarkMode ? '#EDEAE4' : '#292722'}>
              N
            </text>
          </g>
        </svg>

        {/* Floating Tunnel Inspector */}
        {inspectedTunnel && (
          <div className="absolute top-12 left-4 w-72 card p-3.5 bg-mine-surface border border-mine-border shadow-dropdown z-20 space-y-2 text-xs">
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
                <strong className="text-mine-text-primary font-semibold">Zone {inspectedTunnel.zone || 'Main'}</strong>
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

        {/* Floating Monitoring Station Panel */}
        {inspectedStation && (
          <div className="absolute top-12 right-4 w-72 card p-4 bg-mine-surface border border-mine-border shadow-dropdown z-20 space-y-2.5 text-xs">
            <div className="flex justify-between items-center border-b border-mine-border pb-2">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-status-safe" />
                <span className="font-bold text-mine-text-primary uppercase tracking-wider">
                  {inspectedStation.name || inspectedStation.id}
                </span>
              </div>
              <button onClick={() => setInspectedStation(null)} className="text-mine-text-secondary hover:text-mine-text-primary">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1 text-mine-text-secondary">
              <div className="flex justify-between">
                <span>Connected Node:</span>
                <strong className="text-mine-text-primary font-semibold">{inspectedStation.nodeId}</strong>
              </div>
              <div className="flex justify-between">
                <span>Risk Level:</span>
                <strong className="text-status-safe font-semibold">{inspectedStation.risk || 'LOW'}</strong>
              </div>
              <div className="flex justify-between">
                <span>Last Update:</span>
                <span className="font-mono text-[11px] text-mine-text-secondary">{inspectedStation.lastUpdate || 'Just now'}</span>
              </div>
            </div>

            <div className="border-t border-mine-border pt-2 space-y-1">
              <span className="text-[10px] uppercase font-bold text-mine-text-secondary">Linked Sensors:</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                <span className="p-1 rounded bg-mine-surface-alt border border-mine-border text-mine-text-primary">Vibration: V-12</span>
                <span className="p-1 rounded bg-mine-surface-alt border border-mine-border text-mine-text-primary">Tilt: T-07</span>
                <span className="p-1 rounded bg-mine-surface-alt border border-mine-border text-mine-text-primary">Displacement: D-04</span>
                <span className="p-1 rounded bg-mine-surface-alt border border-mine-border text-mine-text-primary">Crack: C-02</span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Miner Detail Popup */}
        {inspectedWorker && (
          <MinerDetailPopup
            worker={workers.find((w) => w.id === inspectedWorker.id) || inspectedWorker}
            route={workerRoutes[inspectedWorker.id] || activeRoute}
            onClose={() => setInspectedWorker(null)}
            onHighlightRoute={(workerId) => setSelectedRouteWorkerId(workerId)}
          />
        )}
      </div>

      {/* Engineering Disclaimer Bar at bottom */}
      <div className="px-4 py-1.5 border-t border-mine-border bg-mine-surface-alt/70 text-[10px] text-mine-text-secondary flex flex-wrap items-center justify-between gap-2">
        <span>
          <strong className="text-mine-text-primary">Protocad GIS:</strong> Map geometry and automated feature extraction are for monitoring/prototype purposes and must be verified against approved mine plans before operational use.
        </span>
        <span className="font-mono text-[10px] text-mine-text-secondary">
          DGMS Ref #44A • {workers.length} Personnel Active • {sensors.length} Strata Nodes
        </span>
      </div>
    </div>
  );
}
