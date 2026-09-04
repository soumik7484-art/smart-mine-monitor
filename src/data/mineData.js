// MINEGUARD AI — Mine Graph Data
// Complete underground coal mine blueprint vector graph: junctions, exits, single-line roadways, sensors, workers
// Automatically aligned to authentic blueprint: Raniganj Deep Colliery (Seam 4)

// ─── Junction Nodes (underground intersections detected from blueprint) ──
export const MINE_NODES = [
  {
    "id": "J-01",
    "x": 918,
    "y": 132,
    "orig_x": 1132,
    "orig_y": 48,
    "zone": "D",
    "label": "J-01 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-02",
    "x": 930,
    "y": 183,
    "orig_x": 1146,
    "orig_y": 112,
    "zone": "D",
    "label": "J-02 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-03",
    "x": 708,
    "y": 160,
    "orig_x": 869,
    "orig_y": 84,
    "zone": "C",
    "label": "J-03 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-04",
    "x": 747,
    "y": 176,
    "orig_x": 918,
    "orig_y": 104,
    "zone": "C",
    "label": "J-04 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-05",
    "x": 521,
    "y": 169,
    "orig_x": 636,
    "orig_y": 95,
    "zone": "B",
    "label": "J-05 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-06",
    "x": 508,
    "y": 235,
    "orig_x": 620,
    "orig_y": 177,
    "zone": "B",
    "label": "J-06 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-07",
    "x": 781,
    "y": 248,
    "orig_x": 961,
    "orig_y": 194,
    "zone": "D",
    "label": "J-07 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-08",
    "x": 484,
    "y": 263,
    "orig_x": 590,
    "orig_y": 212,
    "zone": "B",
    "label": "J-08 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-09",
    "x": 569,
    "y": 270,
    "orig_x": 696,
    "orig_y": 221,
    "zone": "C",
    "label": "J-09 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-10",
    "x": 894,
    "y": 252,
    "orig_x": 1102,
    "orig_y": 199,
    "zone": "D",
    "label": "J-10 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-11",
    "x": 926,
    "y": 251,
    "orig_x": 1142,
    "orig_y": 197,
    "zone": "D",
    "label": "J-11 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-12",
    "x": 70,
    "y": 255,
    "orig_x": 72,
    "orig_y": 202,
    "zone": "A",
    "label": "J-12 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-13",
    "x": 114,
    "y": 256,
    "orig_x": 127,
    "orig_y": 204,
    "zone": "A",
    "label": "J-13 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-14",
    "x": 249,
    "y": 256,
    "orig_x": 296,
    "orig_y": 204,
    "zone": "A",
    "label": "J-14 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-15",
    "x": 351,
    "y": 271,
    "orig_x": 424,
    "orig_y": 222,
    "zone": "B",
    "label": "J-15 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-16",
    "x": 351,
    "y": 438,
    "orig_x": 424,
    "orig_y": 431,
    "zone": "B",
    "label": "J-16 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-17",
    "x": 282,
    "y": 437,
    "orig_x": 337,
    "orig_y": 430,
    "zone": "A",
    "label": "J-17 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-18",
    "x": 483,
    "y": 428,
    "orig_x": 588,
    "orig_y": 418,
    "zone": "B",
    "label": "J-18 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-19",
    "x": 593,
    "y": 434,
    "orig_x": 726,
    "orig_y": 426,
    "zone": "C",
    "label": "J-19 Junction",
    "type": "junction",
    "confidence": 0.96
  },
  {
    "id": "J-20",
    "x": 712,
    "y": 567,
    "orig_x": 875,
    "orig_y": 592,
    "zone": "C",
    "label": "J-20 Junction",
    "type": "junction",
    "confidence": 0.96
  }
];

// ─── Surface Exits & Refuge Stations ─────────────────────────────────────
export const MINE_EXITS = [
  {
    "id": "SHAFT-01",
    "x": 40,
    "y": 230,
    "type": "surface",
    "label": "Main Incline Shaft (E1)",
    "confidence": 0.98
  },
  {
    "id": "SHAFT-02",
    "x": 953,
    "y": 112,
    "type": "surface",
    "label": "Return Air Shaft (E2)",
    "confidence": 0.95
  },
  {
    "id": "SHAFT-03",
    "x": 712,
    "y": 602,
    "type": "emergency",
    "label": "Emergency Shaft (E3)",
    "confidence": 0.93
  },
  {
    "id": "REF-1",
    "x": 508,
    "y": 235,
    "label": "REF-1 \u2014 Main Refuge Chamber",
    "type": "refuge"
  }
];

// ─── Roadway Centerline Segments (Single-Line Routes, Zero Overwriting) ──
export const MINE_TUNNELS = [
  {
    "id": "R-01",
    "from": "J-10",
    "to": "J-11",
    "length": 26,
    "zone": "D",
    "type": "roadway_main",
    "label": "Gallery J-10\u00e2\u20ac\u201dJ-11",
    "confidence": 0.99
  },
  {
    "id": "R-02",
    "from": "J-06",
    "to": "J-08",
    "length": 30,
    "zone": "B",
    "type": "roadway_main",
    "label": "Gallery J-06\u00e2\u20ac\u201dJ-08",
    "confidence": 0.99
  },
  {
    "id": "R-03",
    "from": "J-12",
    "to": "J-13",
    "length": 35,
    "zone": "A",
    "type": "roadway_main",
    "label": "Gallery J-12\u00e2\u20ac\u201dJ-13",
    "confidence": 0.99
  },
  {
    "id": "R-04",
    "from": "J-05",
    "to": "J-06",
    "length": 54,
    "zone": "B",
    "type": "roadway_main",
    "label": "Gallery J-05\u00e2\u20ac\u201dJ-06",
    "confidence": 0.99
  },
  {
    "id": "R-05",
    "from": "J-16",
    "to": "J-17",
    "length": 55,
    "zone": "BA",
    "type": "roadway_main",
    "label": "Gallery J-16\u00e2\u20ac\u201dJ-17",
    "confidence": 0.99
  },
  {
    "id": "R-06",
    "from": "J-08",
    "to": "J-09",
    "length": 68,
    "zone": "BC",
    "type": "roadway_main",
    "label": "Gallery J-08\u00e2\u20ac\u201dJ-09",
    "confidence": 0.99
  },
  {
    "id": "R-07",
    "from": "J-18",
    "to": "J-19",
    "length": 88,
    "zone": "BC",
    "type": "roadway_main",
    "label": "Gallery J-18\u00e2\u20ac\u201dJ-19",
    "confidence": 0.99
  },
  {
    "id": "R-08",
    "from": "J-13",
    "to": "J-14",
    "length": 108,
    "zone": "A",
    "type": "roadway_main",
    "label": "Gallery J-13\u00e2\u20ac\u201dJ-14",
    "confidence": 0.99
  },
  {
    "id": "R-09",
    "from": "J-15",
    "to": "J-16",
    "length": 134,
    "zone": "B",
    "type": "roadway_secondary",
    "label": "Gallery J-15\u00e2\u20ac\u201dJ-16",
    "confidence": 0.99
  },
  {
    "id": "R-10",
    "from": "J-04",
    "to": "J-20",
    "length": 314,
    "zone": "C",
    "type": "roadway_secondary",
    "label": "Gallery J-04\u00e2\u20ac\u201dJ-20",
    "confidence": 0.97
  },
  {
    "id": "R-11",
    "from": "J-16",
    "to": "J-18",
    "length": 106,
    "zone": "B",
    "type": "roadway_main",
    "label": "Gallery J-16\u00e2\u20ac\u201dJ-18",
    "confidence": 0.9
  },
  {
    "id": "R-12",
    "from": "J-03",
    "to": "J-09",
    "length": 142,
    "zone": "C",
    "type": "roadway_main",
    "label": "Gallery J-03\u00e2\u20ac\u201dJ-09",
    "confidence": 0.9
  },
  {
    "id": "R-13",
    "from": "J-05",
    "to": "J-09",
    "length": 89,
    "zone": "BC",
    "type": "roadway_main",
    "label": "Gallery J-05\u00e2\u20ac\u201dJ-09",
    "confidence": 0.9
  },
  {
    "id": "R-14",
    "from": "J-01",
    "to": "J-02",
    "length": 42,
    "zone": "D",
    "type": "roadway_main",
    "label": "Gallery J-01\u00e2\u20ac\u201dJ-02",
    "confidence": 0.9
  },
  {
    "id": "R-15",
    "from": "J-01",
    "to": "J-07",
    "length": 144,
    "zone": "D",
    "type": "roadway_main",
    "label": "Gallery J-01\u00e2\u20ac\u201dJ-07",
    "confidence": 0.9
  },
  {
    "id": "R-16",
    "from": "J-07",
    "to": "J-20",
    "length": 261,
    "zone": "DC",
    "type": "roadway_secondary",
    "label": "Gallery J-07\u00e2\u20ac\u201dJ-20",
    "confidence": 0.9
  },
  {
    "id": "R-17",
    "from": "J-08",
    "to": "J-15",
    "length": 107,
    "zone": "B",
    "type": "roadway_main",
    "label": "Gallery J-08\u00e2\u20ac\u201dJ-15",
    "confidence": 0.9
  },
  {
    "id": "R-18",
    "from": "J-09",
    "to": "J-19",
    "length": 133,
    "zone": "C",
    "type": "roadway_secondary",
    "label": "Gallery J-09\u00e2\u20ac\u201dJ-19",
    "confidence": 0.9
  },
  {
    "id": "R-19",
    "from": "J-04",
    "to": "J-09",
    "length": 161,
    "zone": "C",
    "type": "roadway_main",
    "label": "Gallery J-04\u00e2\u20ac\u201dJ-09",
    "confidence": 0.9
  },
  {
    "id": "R-20",
    "from": "SHAFT-01",
    "to": "J-12",
    "length": 31,
    "zone": "A",
    "type": "roadway_main",
    "label": "Entry Drift SHAFT-01\u00e2\u20ac\u201dJ-12",
    "confidence": 0.98
  },
  {
    "id": "R-21",
    "from": "SHAFT-02",
    "to": "J-01",
    "length": 32,
    "zone": "D",
    "type": "roadway_main",
    "label": "Entry Drift SHAFT-02\u00e2\u20ac\u201dJ-01",
    "confidence": 0.98
  },
  {
    "id": "R-22",
    "from": "SHAFT-03",
    "to": "J-20",
    "length": 28,
    "zone": "C",
    "type": "roadway_main",
    "label": "Entry Drift SHAFT-03\u00e2\u20ac\u201dJ-20",
    "confidence": 0.98
  },
  {
    "id": "R-23",
    "from": "J-11",
    "to": "J-02",
    "length": 54,
    "zone": "D",
    "type": "crosscut",
    "label": "Connecting Drift J-11\u00e2\u20ac\u201dJ-02",
    "confidence": 0.92
  },
  {
    "id": "R-24",
    "from": "J-14",
    "to": "J-15",
    "length": 82,
    "zone": "A",
    "type": "crosscut",
    "label": "Connecting Drift J-14\u00e2\u20ac\u201dJ-15",
    "confidence": 0.92
  }
];

// ─── UWB Anchors (at key junctions for underground positioning) ─────────
export const UWB_ANCHORS = [
  {
    "id": "UWB-1",
    "nodeId": "J-01",
    "label": "Anchor 1 (J-01)"
  },
  {
    "id": "UWB-2",
    "nodeId": "J-02",
    "label": "Anchor 2 (J-02)"
  },
  {
    "id": "UWB-3",
    "nodeId": "J-03",
    "label": "Anchor 3 (J-03)"
  },
  {
    "id": "UWB-4",
    "nodeId": "J-04",
    "label": "Anchor 4 (J-04)"
  },
  {
    "id": "UWB-5",
    "nodeId": "J-05",
    "label": "Anchor 5 (J-05)"
  },
  {
    "id": "UWB-6",
    "nodeId": "J-06",
    "label": "Anchor 6 (J-06)"
  },
  {
    "id": "UWB-7",
    "nodeId": "J-07",
    "label": "Anchor 7 (J-07)"
  },
  {
    "id": "UWB-8",
    "nodeId": "J-08",
    "label": "Anchor 8 (J-08)"
  },
  {
    "id": "UWB-9",
    "nodeId": "J-09",
    "label": "Anchor 9 (J-09)"
  },
  {
    "id": "UWB-10",
    "nodeId": "J-10",
    "label": "Anchor 10 (J-10)"
  },
  {
    "id": "UWB-11",
    "nodeId": "J-11",
    "label": "Anchor 11 (J-11)"
  },
  {
    "id": "UWB-12",
    "nodeId": "J-12",
    "label": "Anchor 12 (J-12)"
  }
];

// ─── Coal Pillars (detected from blueprint) ─────────────────────────────
export const COAL_PILLARS = [
  {
    "id": "P-01",
    "x": 619,
    "y": 642,
    "w": 24,
    "h": 20,
    "zone": "C"
  },
  {
    "id": "P-02",
    "x": 600,
    "y": 642,
    "w": 24,
    "h": 20,
    "zone": "C"
  },
  {
    "id": "P-03",
    "x": 527,
    "y": 642,
    "w": 24,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-04",
    "x": 490,
    "y": 642,
    "w": 24,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-05",
    "x": 471,
    "y": 642,
    "w": 24,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-06",
    "x": 435,
    "y": 642,
    "w": 24,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-07",
    "x": 398,
    "y": 642,
    "w": 36,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-08",
    "x": 325,
    "y": 642,
    "w": 24,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-09",
    "x": 619,
    "y": 624,
    "w": 24,
    "h": 20,
    "zone": "C"
  },
  {
    "id": "P-10",
    "x": 582,
    "y": 624,
    "w": 36,
    "h": 20,
    "zone": "C"
  },
  {
    "id": "P-11",
    "x": 564,
    "y": 624,
    "w": 24,
    "h": 20,
    "zone": "C"
  },
  {
    "id": "P-12",
    "x": 527,
    "y": 624,
    "w": 24,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-13",
    "x": 490,
    "y": 624,
    "w": 24,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-14",
    "x": 471,
    "y": 624,
    "w": 24,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-15",
    "x": 453,
    "y": 624,
    "w": 24,
    "h": 20,
    "zone": "B"
  },
  {
    "id": "P-16",
    "x": 435,
    "y": 624,
    "w": 24,
    "h": 20,
    "zone": "B"
  }
];

// ─── Goaf / Caved Zones ────────────────────────────────────────────────
export const GOAF_ZONES = [
  {
    "x": 600,
    "y": 620,
    "w": 70,
    "h": 60,
    "label": "Old Workings (Goaf Zone)"
  }
];

// ─── Ventilation Airflow Paths ──────────────────────────────────────────
export const VENTILATION_PATHS = [
  {
    "id": "AIR-1",
    "from": "J-01",
    "to": "J-02",
    "direction": "intake",
    "label": "Fresh Airflow"
  },
  {
    "id": "AIR-2",
    "from": "J-02",
    "to": "J-03",
    "direction": "intake",
    "label": "Fresh Airflow"
  },
  {
    "id": "AIR-3",
    "from": "J-03",
    "to": "J-04",
    "direction": "intake",
    "label": "Fresh Airflow"
  },
  {
    "id": "AIR-4",
    "from": "J-04",
    "to": "J-05",
    "direction": "return",
    "label": "Return Airflow"
  },
  {
    "id": "AIR-5",
    "from": "J-05",
    "to": "J-06",
    "direction": "return",
    "label": "Return Airflow"
  }
];

// ─── Zone Definitions ───────────────────────────────────────────────────
export const ZONES = [
  {
    "id": "A",
    "label": "Zone A \u2014 Intake Panel",
    "color": "#64748B",
    "nodes": [
      "J-12",
      "J-13",
      "J-14"
    ],
    "sensors": [
      "S-12",
      "S-13",
      "S-14",
      "S-15"
    ]
  },
  {
    "id": "B",
    "label": "Zone B \u2014 Active Extraction",
    "color": "#D97706",
    "nodes": [
      "J-05",
      "J-06",
      "J-08",
      "J-15"
    ],
    "sensors": [
      "S-05",
      "S-06",
      "S-08",
      "S-15"
    ]
  },
  {
    "id": "C",
    "label": "Zone C \u2014 Return Panel",
    "color": "#0EA5E9",
    "nodes": [
      "J-03",
      "J-04",
      "J-09"
    ],
    "sensors": [
      "S-03",
      "S-04",
      "S-09"
    ]
  },
  {
    "id": "D",
    "label": "Zone D \u2014 Development Face",
    "color": "#10B981",
    "nodes": [
      "J-01",
      "J-02",
      "J-07",
      "J-10",
      "J-11"
    ],
    "sensors": [
      "S-01",
      "S-02",
      "S-07",
      "S-10",
      "S-11"
    ]
  }
];

// ─── Initial Sensor Configuration ───────────────────────────────────────
function createSensors() {
  const blueprintSensors = [
  {
    "id": "S-01",
    "zone": "D",
    "nodeId": "J-01",
    "label": "Sensor S-01 (D)",
    "type": "LVDT",
    "displacement": 0.3,
    "tilt": 0.4,
    "vibration": 0.04,
    "stress": 2.0,
    "temperature": 27,
    "methane": 0.05,
    "humidity": 60,
    "battery": 80,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 8
  },
  {
    "id": "S-02",
    "zone": "D",
    "nodeId": "J-02",
    "label": "Sensor S-02 (D)",
    "type": "Tiltmeter",
    "displacement": 0.45,
    "tilt": 0.6,
    "vibration": 0.06,
    "stress": 2.6,
    "temperature": 28,
    "methane": 0.09,
    "humidity": 61,
    "battery": 81,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 9
  },
  {
    "id": "S-03",
    "zone": "C",
    "nodeId": "J-03",
    "label": "Sensor S-03 (C)",
    "type": "Geophone",
    "displacement": 0.6,
    "tilt": 0.8,
    "vibration": 0.08,
    "stress": 3.2,
    "temperature": 29,
    "methane": 0.13,
    "humidity": 62,
    "battery": 82,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 10
  },
  {
    "id": "S-04",
    "zone": "C",
    "nodeId": "J-04",
    "label": "Sensor S-04 (C)",
    "type": "PressureCell",
    "displacement": 0.75,
    "tilt": 1.0,
    "vibration": 0.1,
    "stress": 3.8,
    "temperature": 27,
    "methane": 0.17,
    "humidity": 63,
    "battery": 83,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 11
  },
  {
    "id": "S-05",
    "zone": "B",
    "nodeId": "J-05",
    "label": "Sensor S-05 (B)",
    "type": "LVDT",
    "displacement": 0.9,
    "tilt": 1.2,
    "vibration": 0.04,
    "stress": 4.4,
    "temperature": 28,
    "methane": 0.05,
    "humidity": 64,
    "battery": 84,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 12
  },
  {
    "id": "S-06",
    "zone": "B",
    "nodeId": "J-06",
    "label": "Sensor S-06 (B)",
    "type": "Tiltmeter",
    "displacement": 0.3,
    "tilt": 1.4,
    "vibration": 0.06,
    "stress": 2.0,
    "temperature": 29,
    "methane": 0.09,
    "humidity": 65,
    "battery": 85,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 13
  },
  {
    "id": "S-07",
    "zone": "D",
    "nodeId": "J-07",
    "label": "Sensor S-07 (D)",
    "type": "Geophone",
    "displacement": 0.45,
    "tilt": 0.4,
    "vibration": 0.08,
    "stress": 2.6,
    "temperature": 27,
    "methane": 0.13,
    "humidity": 66,
    "battery": 86,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 14
  },
  {
    "id": "S-08",
    "zone": "B",
    "nodeId": "J-08",
    "label": "Sensor S-08 (B)",
    "type": "PressureCell",
    "displacement": 0.6,
    "tilt": 0.6,
    "vibration": 0.1,
    "stress": 3.2,
    "temperature": 28,
    "methane": 0.17,
    "humidity": 67,
    "battery": 87,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 15
  },
  {
    "id": "S-09",
    "zone": "C",
    "nodeId": "J-09",
    "label": "Sensor S-09 (C)",
    "type": "LVDT",
    "displacement": 0.75,
    "tilt": 0.8,
    "vibration": 0.04,
    "stress": 3.8,
    "temperature": 29,
    "methane": 0.05,
    "humidity": 68,
    "battery": 88,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 16
  },
  {
    "id": "S-10",
    "zone": "D",
    "nodeId": "J-10",
    "label": "Sensor S-10 (D)",
    "type": "Tiltmeter",
    "displacement": 0.9,
    "tilt": 1.0,
    "vibration": 0.06,
    "stress": 4.4,
    "temperature": 27,
    "methane": 0.09,
    "humidity": 69,
    "battery": 89,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 17
  },
  {
    "id": "S-11",
    "zone": "D",
    "nodeId": "J-11",
    "label": "Sensor S-11 (D)",
    "type": "Geophone",
    "displacement": 0.3,
    "tilt": 1.2,
    "vibration": 0.08,
    "stress": 2.0,
    "temperature": 28,
    "methane": 0.13,
    "humidity": 60,
    "battery": 90,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 18
  },
  {
    "id": "S-12",
    "zone": "A",
    "nodeId": "J-12",
    "label": "Sensor S-12 (A)",
    "type": "PressureCell",
    "displacement": 0.45,
    "tilt": 1.4,
    "vibration": 0.1,
    "stress": 2.6,
    "temperature": 29,
    "methane": 0.17,
    "humidity": 61,
    "battery": 91,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 19
  },
  {
    "id": "S-13",
    "zone": "A",
    "nodeId": "J-13",
    "label": "Sensor S-13 (A)",
    "type": "LVDT",
    "displacement": 0.6,
    "tilt": 0.4,
    "vibration": 0.04,
    "stress": 3.2,
    "temperature": 27,
    "methane": 0.05,
    "humidity": 62,
    "battery": 92,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 8
  },
  {
    "id": "S-14",
    "zone": "A",
    "nodeId": "J-14",
    "label": "Sensor S-14 (A)",
    "type": "Tiltmeter",
    "displacement": 0.75,
    "tilt": 0.6,
    "vibration": 0.06,
    "stress": 3.8,
    "temperature": 28,
    "methane": 0.09,
    "humidity": 63,
    "battery": 93,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 9
  },
  {
    "id": "S-15",
    "zone": "B",
    "nodeId": "J-15",
    "label": "Sensor S-15 (B)",
    "type": "Geophone",
    "displacement": 0.9,
    "tilt": 0.8,
    "vibration": 0.08,
    "stress": 4.4,
    "temperature": 29,
    "methane": 0.13,
    "humidity": 64,
    "battery": 94,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 10
  },
  {
    "id": "S-16",
    "zone": "B",
    "nodeId": "J-16",
    "label": "Sensor S-16 (B)",
    "type": "PressureCell",
    "displacement": 0.3,
    "tilt": 1.0,
    "vibration": 0.1,
    "stress": 2.0,
    "temperature": 27,
    "methane": 0.17,
    "humidity": 65,
    "battery": 95,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 11
  },
  {
    "id": "S-17",
    "zone": "A",
    "nodeId": "J-17",
    "label": "Sensor S-17 (A)",
    "type": "LVDT",
    "displacement": 0.45,
    "tilt": 1.2,
    "vibration": 0.04,
    "stress": 2.6,
    "temperature": 28,
    "methane": 0.05,
    "humidity": 66,
    "battery": 96,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 12
  },
  {
    "id": "S-18",
    "zone": "B",
    "nodeId": "J-18",
    "label": "Sensor S-18 (B)",
    "type": "Tiltmeter",
    "displacement": 0.6,
    "tilt": 1.4,
    "vibration": 0.06,
    "stress": 3.2,
    "temperature": 29,
    "methane": 0.09,
    "humidity": 67,
    "battery": 97,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 13
  },
  {
    "id": "S-19",
    "zone": "C",
    "nodeId": "J-19",
    "label": "Sensor S-19 (C)",
    "type": "Geophone",
    "displacement": 0.75,
    "tilt": 0.4,
    "vibration": 0.08,
    "stress": 3.8,
    "temperature": 27,
    "methane": 0.13,
    "humidity": 68,
    "battery": 98,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 14
  },
  {
    "id": "S-20",
    "zone": "C",
    "nodeId": "J-20",
    "label": "Sensor S-20 (C)",
    "type": "PressureCell",
    "displacement": 0.9,
    "tilt": 0.6,
    "vibration": 0.1,
    "stress": 4.4,
    "temperature": 28,
    "methane": 0.17,
    "humidity": 69,
    "battery": 99,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 15
  },
  {
    "id": "S-21",
    "zone": "D",
    "nodeId": "J-01",
    "label": "Sensor S-21 (D)",
    "type": "LVDT",
    "displacement": 0.3,
    "tilt": 0.8,
    "vibration": 0.04,
    "stress": 2.0,
    "temperature": 29,
    "methane": 0.05,
    "humidity": 60,
    "battery": 80,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 16
  },
  {
    "id": "S-22",
    "zone": "D",
    "nodeId": "J-02",
    "label": "Sensor S-22 (D)",
    "type": "Tiltmeter",
    "displacement": 0.45,
    "tilt": 1.0,
    "vibration": 0.06,
    "stress": 2.6,
    "temperature": 27,
    "methane": 0.09,
    "humidity": 61,
    "battery": 81,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 17
  },
  {
    "id": "S-23",
    "zone": "C",
    "nodeId": "J-03",
    "label": "Sensor S-23 (C)",
    "type": "Geophone",
    "displacement": 0.6,
    "tilt": 1.2,
    "vibration": 0.08,
    "stress": 3.2,
    "temperature": 28,
    "methane": 0.13,
    "humidity": 62,
    "battery": 82,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 18
  },
  {
    "id": "S-24",
    "zone": "C",
    "nodeId": "J-04",
    "label": "Sensor S-24 (C)",
    "type": "PressureCell",
    "displacement": 0.75,
    "tilt": 1.4,
    "vibration": 0.1,
    "stress": 3.8,
    "temperature": 29,
    "methane": 0.17,
    "humidity": 63,
    "battery": 83,
    "signal": "Good",
    "status": "SAFE",
    "riskScore": 19
  }
];
  return blueprintSensors.map((s) => ({
    ...s,
    history: {
      displacement: [],
      tilt: [],
      vibration: [],
      stress: [],
      temperature: [],
      humidity: [],
    },
  }));
}

// ─── Initial Worker Configuration ───────────────────────────────────────
export const INITIAL_WORKERS = [
  {
    "id": "W-001",
    "name": "Rajesh Kumar",
    "role": "Face Worker",
    "zone": "D",
    "nodeId": "J-01",
    "helmet": "Connected",
    "status": "SAFE",
    "movement": "Normal",
    "heartRate": 68,
    "tagBattery": 85,
    "xCoord": 918,
    "yCoord": 132,
    "seamDepth": -120
  },
  {
    "id": "W-002",
    "name": "Suresh Mahato",
    "role": "Support Specialist",
    "zone": "D",
    "nodeId": "J-02",
    "helmet": "Connected",
    "status": "SAFE",
    "movement": "Normal",
    "heartRate": 71,
    "tagBattery": 87,
    "xCoord": 930,
    "yCoord": 183,
    "seamDepth": -138
  },
  {
    "id": "W-003",
    "name": "Amit Singh",
    "role": "Overman",
    "zone": "C",
    "nodeId": "J-03",
    "helmet": "Connected",
    "status": "SAFE",
    "movement": "Normal",
    "heartRate": 74,
    "tagBattery": 89,
    "xCoord": 708,
    "yCoord": 160,
    "seamDepth": -156
  },
  {
    "id": "W-004",
    "name": "Pradeep Yadav",
    "role": "Continuous Miner Op",
    "zone": "C",
    "nodeId": "J-04",
    "helmet": "Connected",
    "status": "SAFE",
    "movement": "Normal",
    "heartRate": 77,
    "tagBattery": 91,
    "xCoord": 747,
    "yCoord": 176,
    "seamDepth": -174
  },
  {
    "id": "W-005",
    "name": "Vikram Das",
    "role": "Mine Electrician",
    "zone": "B",
    "nodeId": "J-05",
    "helmet": "Connected",
    "status": "SAFE",
    "movement": "Normal",
    "heartRate": 80,
    "tagBattery": 93,
    "xCoord": 521,
    "yCoord": 169,
    "seamDepth": -192
  },
  {
    "id": "W-006",
    "name": "Manoj Oraon",
    "role": "Ventilation Tech",
    "zone": "B",
    "nodeId": "J-06",
    "helmet": "Connected",
    "status": "SAFE",
    "movement": "Normal",
    "heartRate": 68,
    "tagBattery": 95,
    "xCoord": 508,
    "yCoord": 235,
    "seamDepth": -210
  },
  {
    "id": "W-007",
    "name": "Dinesh Tudu",
    "role": "Shotfirer",
    "zone": "D",
    "nodeId": "J-07",
    "helmet": "Connected",
    "status": "SAFE",
    "movement": "Normal",
    "heartRate": 71,
    "tagBattery": 97,
    "xCoord": 781,
    "yCoord": 248,
    "seamDepth": -228
  },
  {
    "id": "W-008",
    "name": "Bablu Hansda",
    "role": "Safety Inspector",
    "zone": "B",
    "nodeId": "J-08",
    "helmet": "Connected",
    "status": "SAFE",
    "movement": "Normal",
    "heartRate": 74,
    "tagBattery": 99,
    "xCoord": 484,
    "yCoord": 263,
    "seamDepth": -246
  }
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
