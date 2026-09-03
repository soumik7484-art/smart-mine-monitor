// MINEGUARD AI — Mine Graph Data
// Complete underground coal mine graph: junctions, exits, tunnels, sensors, workers

// ─── Junction Nodes (underground intersections) ─────────────────────────
export const MINE_NODES = [
  // Main haulage tunnel junctions
  { id: 'J1', x: 100, y: 90, zone: 'MAIN', label: 'J1 — Main Incline Head' },
  { id: 'J2', x: 230, y: 90, zone: 'MAIN', label: 'J2 — Zone A Junction' },
  { id: 'J3', x: 400, y: 90, zone: 'MAIN', label: 'J3 — Zone B Junction' },
  { id: 'J4', x: 570, y: 90, zone: 'MAIN', label: 'J4 — Zone C Junction' },
  { id: 'J5', x: 740, y: 90, zone: 'MAIN', label: 'J5 — Zone D Junction' },
  { id: 'J6', x: 880, y: 90, zone: 'MAIN', label: 'J6 — Secondary Exit Head' },
  // Zone A branch junctions
  { id: 'J7', x: 230, y: 220, zone: 'A', label: 'J7 — Zone A Level 1' },
  { id: 'J8', x: 230, y: 370, zone: 'A', label: 'J8 — Zone A Level 2' },
  // Zone B branch junctions
  { id: 'J9', x: 400, y: 220, zone: 'B', label: 'J9 — Zone B Level 1' },
  { id: 'J10', x: 400, y: 370, zone: 'B', label: 'J10 — Zone B Level 2' },
  // Zone C branch junctions
  { id: 'J11', x: 570, y: 220, zone: 'C', label: 'J11 — Zone C Level 1' },
  { id: 'J12', x: 570, y: 370, zone: 'C', label: 'J12 — Zone C Level 2' },
  // Zone D branch junctions
  { id: 'J13', x: 740, y: 220, zone: 'D', label: 'J13 — Zone D Level 1' },
  { id: 'J14', x: 740, y: 370, zone: 'D', label: 'J14 — Zone D Level 2' },
];

// ─── Surface Exits & Refuge ─────────────────────────────────────────────
export const MINE_EXITS = [
  { id: 'E1', x: 40, y: 90, label: 'E1 — Main Incline', type: 'surface' },
  { id: 'E2', x: 940, y: 90, label: 'E2 — Secondary Exit', type: 'surface' },
  { id: 'E3', x: 230, y: 490, label: 'E3 — Emergency Shaft A', type: 'emergency' },
  { id: 'E4', x: 740, y: 490, label: 'E4 — Emergency Shaft D', type: 'emergency' },
  { id: 'REF-1', x: 485, y: 300, label: 'REF-1 — Refuge Chamber', type: 'refuge' },
];

// ─── Tunnel Segments ────────────────────────────────────────────────────
export const MINE_TUNNELS = [
  // Main haulage tunnel
  { id: 'T-01', from: 'E1', to: 'J1', zone: 'MAIN', length: 60, label: 'Main Entry' },
  { id: 'T-02', from: 'J1', to: 'J2', zone: 'MAIN', length: 130, label: 'Haulage 1-2' },
  { id: 'T-03', from: 'J2', to: 'J3', zone: 'MAIN', length: 170, label: 'Haulage 2-3' },
  { id: 'T-04', from: 'J3', to: 'J4', zone: 'MAIN', length: 170, label: 'Haulage 3-4' },
  { id: 'T-05', from: 'J4', to: 'J5', zone: 'MAIN', length: 170, label: 'Haulage 4-5' },
  { id: 'T-06', from: 'J5', to: 'J6', zone: 'MAIN', length: 140, label: 'Haulage 5-6' },
  { id: 'T-07', from: 'J6', to: 'E2', zone: 'MAIN', length: 60, label: 'Secondary Exit' },
  // Zone A dip galleries
  { id: 'T-08', from: 'J2', to: 'J7', zone: 'A', length: 130, label: 'Zone A Dip 1' },
  { id: 'T-09', from: 'J7', to: 'J8', zone: 'A', length: 150, label: 'Zone A Dip 2' },
  { id: 'T-10', from: 'J8', to: 'E3', zone: 'A', length: 120, label: 'Zone A Emergency' },
  // Zone B dip galleries
  { id: 'T-11', from: 'J3', to: 'J9', zone: 'B', length: 130, label: 'Zone B Dip 1' },
  { id: 'T-12', from: 'J9', to: 'J10', zone: 'B', length: 150, label: 'Zone B Dip 2' },
  // Cross-cut connecting A-B at Level 1
  { id: 'T-13', from: 'J7', to: 'J9', zone: 'AB', length: 170, label: 'Cross-cut A-B L1' },
  // Zone C dip galleries
  { id: 'T-14', from: 'J4', to: 'J11', zone: 'C', length: 130, label: 'Zone C Dip 1' },
  { id: 'T-15', from: 'J11', to: 'J12', zone: 'C', length: 150, label: 'Zone C Dip 2' },
  // Cross-cut connecting B-C at Level 1
  { id: 'T-16', from: 'J9', to: 'J11', zone: 'BC', length: 170, label: 'Cross-cut B-C L1' },
  // Zone D dip galleries
  { id: 'T-17', from: 'J5', to: 'J13', zone: 'D', length: 130, label: 'Zone D Dip 1' },
  { id: 'T-18', from: 'J13', to: 'J14', zone: 'D', length: 150, label: 'Zone D Dip 2' },
  { id: 'T-19', from: 'J14', to: 'E4', zone: 'D', length: 120, label: 'Zone D Emergency' },
  // Cross-cut connecting C-D at Level 1
  { id: 'T-20', from: 'J11', to: 'J13', zone: 'CD', length: 170, label: 'Cross-cut C-D L1' },
  // Cross-cut connecting B-C at Level 2 (deep)
  { id: 'T-21', from: 'J10', to: 'J12', zone: 'BC', length: 170, label: 'Cross-cut B-C L2' },
  // Refuge chamber access
  { id: 'T-22', from: 'J9', to: 'REF-1', zone: 'B', length: 100, label: 'Refuge Access B' },
  { id: 'T-23', from: 'J11', to: 'REF-1', zone: 'C', length: 100, label: 'Refuge Access C' },
];

// ─── UWB Anchors (at key junctions for underground positioning) ─────────
export const UWB_ANCHORS = [
  { id: 'UWB-1', nodeId: 'J1', label: 'Anchor 1' },
  { id: 'UWB-2', nodeId: 'J2', label: 'Anchor 2' },
  { id: 'UWB-3', nodeId: 'J3', label: 'Anchor 3' },
  { id: 'UWB-4', nodeId: 'J4', label: 'Anchor 4' },
  { id: 'UWB-5', nodeId: 'J5', label: 'Anchor 5' },
  { id: 'UWB-6', nodeId: 'J7', label: 'Anchor 6' },
  { id: 'UWB-7', nodeId: 'J9', label: 'Anchor 7' },
  { id: 'UWB-8', nodeId: 'J11', label: 'Anchor 8' },
  { id: 'UWB-9', nodeId: 'J13', label: 'Anchor 9' },
  { id: 'UWB-10', nodeId: 'REF-1', label: 'Anchor 10' },
];

// ─── Coal Pillars (rectangles between tunnels) ─────────────────────────
export const COAL_PILLARS = [
  { x: 260, y: 120, w: 110, h: 80, zone: 'AB' },
  { x: 430, y: 120, w: 110, h: 80, zone: 'BC' },
  { x: 600, y: 120, w: 110, h: 80, zone: 'CD' },
  { x: 260, y: 250, w: 110, h: 90, zone: 'AB' },
  { x: 430, y: 250, w: 110, h: 90, zone: 'BC' },
  { x: 600, y: 250, w: 110, h: 90, zone: 'CD' },
];

// ─── Goaf / Caved Zones ────────────────────────────────────────────────
export const GOAF_ZONES = [
  { x: 300, y: 400, w: 80, h: 70, label: 'Old Workings (Goaf)' },
];

// ─── Ventilation Airflow Paths ──────────────────────────────────────────
export const VENTILATION_PATHS = [
  { from: 'E1', to: 'J2', direction: 'intake' },
  { from: 'J2', to: 'J7', direction: 'intake' },
  { from: 'J7', to: 'J8', direction: 'intake' },
  { from: 'J3', to: 'J9', direction: 'intake' },
  { from: 'J4', to: 'J11', direction: 'return' },
  { from: 'J5', to: 'J13', direction: 'return' },
  { from: 'J13', to: 'J14', direction: 'return' },
  { from: 'J5', to: 'J6', direction: 'return' },
  { from: 'J6', to: 'E2', direction: 'return' },
];

// ─── Zone Definitions ───────────────────────────────────────────────────
export const ZONES = [
  { id: 'A', label: 'Zone A — Intake Panel', color: '#64748B', nodes: ['J2', 'J7', 'J8'], sensors: ['S-01', 'S-02', 'S-03', 'S-04', 'S-05', 'S-06'] },
  { id: 'B', label: 'Zone B — Active Face', color: '#D97706', nodes: ['J3', 'J9', 'J10'], sensors: ['S-07', 'S-08', 'S-09', 'S-10', 'S-11', 'S-12'] },
  { id: 'C', label: 'Zone C — Return Panel', color: '#0EA5E9', nodes: ['J4', 'J11', 'J12'], sensors: ['S-13', 'S-14', 'S-15', 'S-16', 'S-17', 'S-18'] },
  { id: 'D', label: 'Zone D — Development', color: '#10B981', nodes: ['J5', 'J13', 'J14'], sensors: ['S-19', 'S-20', 'S-21', 'S-22', 'S-23', 'S-24'] },
];

// ─── Initial Sensor Configuration ───────────────────────────────────────
function createSensors() {
  const sensors = [];
  const zones = ['A', 'A', 'A', 'A', 'A', 'A', 'B', 'B', 'B', 'B', 'B', 'B', 'C', 'C', 'C', 'C', 'C', 'C', 'D', 'D', 'D', 'D', 'D', 'D'];
  const nodeAssignments = [
    'J2', 'J2', 'J7', 'J7', 'J8', 'J8',
    'J3', 'J3', 'J9', 'J9', 'J10', 'J10',
    'J4', 'J4', 'J11', 'J11', 'J12', 'J12',
    'J5', 'J5', 'J13', 'J13', 'J14', 'J14',
  ];

  for (let i = 0; i < 24; i++) {
    const id = `S-${String(i + 1).padStart(2, '0')}`;
    sensors.push({
      id,
      zone: zones[i],
      nodeId: nodeAssignments[i],
      label: `Sensor ${id} (Zone ${zones[i]})`,
      type: i % 4 === 0 ? 'LVDT' : i % 4 === 1 ? 'Tiltmeter' : i % 4 === 2 ? 'Geophone' : 'PressureCell',
      displacement: 0.3 + Math.random() * 0.6,
      tilt: 0.5 + Math.random() * 1.2,
      vibration: 0.05 + Math.random() * 0.12,
      stress: 2.0 + Math.random() * 3.0,
      temperature: 27 + Math.random() * 2,
      methane: Math.random() * 0.3,
      humidity: 55 + Math.random() * 15,
      battery: 70 + Math.round(Math.random() * 30),
      signal: Math.random() > 0.15 ? 'Good' : 'Fair',
      status: 'SAFE',
      riskScore: 5 + Math.round(Math.random() * 15),
      history: {
        displacement: [],
        tilt: [],
        vibration: [],
        stress: [],
        temperature: [],
        humidity: [],
      },
    });
  }
  return sensors;
}

// ─── Initial Worker Configuration ───────────────────────────────────────
// heartRate: BPM from smart helmet biometric sensor (simulated)
// tagBattery: Smart Tag UWB node battery % 
// xCoord, yCoord: UWB anchor-triangulated underground position (m)
// seamDepth: depth below surface (negative = underground, m)
export const INITIAL_WORKERS = [
  { id: 'W-001', name: 'Rajesh Kumar',   zone: 'A', nodeId: 'J7',  role: 'Face Worker',      helmet: 'Connected',    status: 'SAFE', movement: 'Normal',      heartRate: 72,  tagBattery: 94, xCoord: 230, yCoord: 220, seamDepth: -120 },
  { id: 'W-002', name: 'Suresh Mahato',  zone: 'A', nodeId: 'J8',  role: 'Support Man',      helmet: 'Connected',    status: 'SAFE', movement: 'Normal',      heartRate: 68,  tagBattery: 88, xCoord: 230, yCoord: 370, seamDepth: -155 },
  { id: 'W-003', name: 'Amit Singh',     zone: 'B', nodeId: 'J9',  role: 'Overman',          helmet: 'Connected',    status: 'SAFE', movement: 'Normal',      heartRate: 75,  tagBattery: 91, xCoord: 400, yCoord: 220, seamDepth: -130 },
  { id: 'W-004', name: 'Pradeep Yadav',  zone: 'B', nodeId: 'J10', role: 'Face Worker',      helmet: 'Connected',    status: 'SAFE', movement: 'Normal',      heartRate: 80,  tagBattery: 96, xCoord: 400, yCoord: 370, seamDepth: -160 },
  { id: 'W-005', name: 'Vikram Das',     zone: 'C', nodeId: 'J11', role: 'Electrician',      helmet: 'Connected',    status: 'SAFE', movement: 'Stationary',  heartRate: 65,  tagBattery: 79, xCoord: 570, yCoord: 220, seamDepth: -125 },
  { id: 'W-006', name: 'Manoj Oraon',    zone: 'C', nodeId: 'J12', role: 'Face Worker',      helmet: 'Connected',    status: 'SAFE', movement: 'Normal',      heartRate: 78,  tagBattery: 83, xCoord: 570, yCoord: 370, seamDepth: -158 },
  { id: 'W-007', name: 'Dinesh Tudu',    zone: 'D', nodeId: 'J13', role: 'Shotfirer',        helmet: 'Connected',    status: 'SAFE', movement: 'Normal',      heartRate: 82,  tagBattery: 76, xCoord: 740, yCoord: 220, seamDepth: -135 },
  { id: 'W-008', name: 'Bablu Hansda',   zone: 'D', nodeId: 'J14', role: 'Support Man',      helmet: 'Disconnected', status: 'SAFE', movement: 'Stationary',  heartRate: 0,   tagBattery: 12, xCoord: 740, yCoord: 370, seamDepth: -162 },
];

export const INITIAL_SENSORS = createSensors();

// ─── Build adjacency graph from tunnels ─────────────────────────────────
export function buildAdjacencyGraph(tunnels) {
  const graph = {};
  tunnels.forEach(t => {
    if (!graph[t.from]) graph[t.from] = [];
    if (!graph[t.to]) graph[t.to] = [];
    graph[t.from].push({ node: t.to, tunnelId: t.id, length: t.length });
    graph[t.to].push({ node: t.from, tunnelId: t.id, length: t.length });
  });
  return graph;
}
