/**
 * MINEGUARD AI — Mine Map Store & Persistence Engine
 * 
 * Manages active mine map definitions, custom uploaded blueprint vector maps,
 * default built-in CAD plans, and graph routing synchronization.
 */

import { MINE_NODES, MINE_EXITS, MINE_TUNNELS, COAL_PILLARS, GOAF_ZONES, VENTILATION_PATHS, INITIAL_SENSORS, INITIAL_WORKERS } from '../data/mineData.js';

const STORAGE_CUSTOM_MAP = 'mineguard_custom_map';
const STORAGE_SAVED_MINES = 'mineguard_saved_mines';

/**
 * Returns the built-in default CAD map for Raniganj Seam 3
 */
export function getDefaultMineMap() {
  return {
    mineId: 'DEFAULT-SEAM-3',
    mineName: 'Chandrapur Deep Mine — Seam 3',
    seam: 'Seam 3 (Raniganj Coalfield)',
    isDefault: true,
    map: {
      width: 1000,
      height: 580,
      scale: { detected: true, ratio: '1:500m', label: '100m' },
    },
    counts: {
      roadways: MINE_TUNNELS.length,
      junctions: MINE_NODES.length,
      pillars: COAL_PILLARS.length,
      panels: 4,
      shafts: MINE_EXITS.length,
      refugeChambers: 1,
      monitoringStations: 5,
      sensors: INITIAL_SENSORS.length,
      miners: INITIAL_WORKERS.length,
      airflowRoutes: VENTILATION_PATHS.length,
      unverifiedFeatures: 0,
    },
    junctions: MINE_NODES.map((n) => ({
      id: n.id,
      x: n.x,
      y: n.y,
      zone: n.zone,
      label: n.label,
    })),
    shafts: MINE_EXITS.map((e) => ({
      id: e.id,
      x: e.x,
      y: e.y,
      type: e.type,
      label: e.label,
    })),
    roadways: MINE_TUNNELS.map((t) => ({
      id: t.id,
      from: t.from,
      to: t.to,
      zone: t.zone,
      length: t.length,
      label: t.label,
      type: t.zone === 'MAIN' ? 'roadway_main' : t.zone.includes('-') ? 'crosscut' : 'roadway_secondary',
    })),
    pillars: COAL_PILLARS.map((p, idx) => ({
      id: `P-${idx + 1}`,
      x: p.x,
      y: p.y,
      w: p.w,
      h: p.h,
      zone: p.zone,
    })),
    panels: [
      { id: 'PANEL-01', name: 'Zone A • Intake (-140m)', zone: 'A', x: 80, y: 150, w: 150, h: 300, color: '#64748B' },
      { id: 'PANEL-02', name: 'Zone B • Active Face (-260m)', zone: 'B', x: 250, y: 150, w: 150, h: 300, color: '#D97706' },
      { id: 'PANEL-03', name: 'Zone C • Return Panel (-220m)', zone: 'C', x: 420, y: 150, w: 150, h: 300, color: '#0EA5E9' },
      { id: 'PANEL-04', name: 'Zone D • Development (-290m)', zone: 'D', x: 590, y: 150, w: 150, h: 300, color: '#10B981' },
    ],
    goaf: GOAF_ZONES.map((g, idx) => ({
      id: `GOAF-${idx + 1}`,
      label: g.label,
      x: g.x,
      y: g.y,
      w: g.w,
      h: g.h,
    })),
    refugeChambers: [
      { id: 'REF-1', label: 'REF-1 — Refuge Station', nodeId: 'REF-1', x: 485, y: 300 },
    ],
    monitoringStations: [
      { id: 'MS-01', name: 'Station MS-01', nodeId: 'J2', zone: 'A', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-01', 'S-02', 'S-03', 'S-04'] },
      { id: 'MS-02', name: 'Station MS-02', nodeId: 'J3', zone: 'B', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-07', 'S-08', 'S-09', 'S-10'] },
      { id: 'MS-03', name: 'Station MS-03', nodeId: 'J4', zone: 'C', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-13', 'S-14', 'S-15', 'S-16'] },
      { id: 'MS-04', name: 'Station MS-04', nodeId: 'J5', zone: 'D', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-19', 'S-20', 'S-21', 'S-22'] },
      { id: 'MS-05', name: 'Station MS-05', nodeId: 'REF-1', zone: 'B', risk: 'LOW', lastUpdate: 'Just now', sensors: ['S-05', 'S-06', 'S-11', 'S-12'] },
    ],
    sensors: INITIAL_SENSORS,
    miners: INITIAL_WORKERS,
    airflow: VENTILATION_PATHS.map((v, idx) => ({
      id: `AIR-${idx + 1}`,
      from: v.from,
      to: v.to,
      direction: v.direction,
      label: v.direction === 'intake' ? 'Fresh Airflow' : 'Return Airflow',
    })),
    unverifiedFeatures: [],
  };
}

/**
 * Load saved custom map from localStorage if available
 */
export function loadSavedCustomMap() {
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_CUSTOM_MAP);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.roadways && parsed.junctions) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Error loading custom map:', err);
  }
  return null;
}

/**
 * Save custom vector map to localStorage
 */
export function saveCustomMap(mapData) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_CUSTOM_MAP, JSON.stringify(mapData));

      // Also append to saved mines list
      const savedMines = getSavedMinesList();
      const existingIdx = savedMines.findIndex((m) => m.mineId === mapData.mineId);
      const mineEntry = {
        mineId: mapData.mineId,
        mineName: mapData.mineName,
        seam: mapData.seam,
        savedAt: new Date().toISOString(),
        roadwaysCount: mapData.roadways?.length || 0,
        sensorsCount: mapData.sensors?.length || 0,
        minersCount: mapData.miners?.length || 0,
      };

      if (existingIdx >= 0) {
        savedMines[existingIdx] = mineEntry;
      } else {
        savedMines.unshift(mineEntry);
      }
      localStorage.setItem(STORAGE_SAVED_MINES, JSON.stringify(savedMines));
    }
    return true;
  } catch (err) {
    console.warn('Error saving custom map:', err);
    return false;
  }
}

const BACKEND_API_BASE = 'http://localhost:8000';

/**
 * Fetch list of all mine maps from backend (Mine Map Files section)
 */
export async function fetchMineMaps() {
  try {
    const res = await fetch(`${BACKEND_API_BASE}/api/mine-maps`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[MineMapStore] Backend unreachable for list maps:', err);
  }
  return { count: 0, activeMapId: null, maps: [] };
}

/**
 * Fetch active mine map from backend
 */
export async function fetchActiveMapBackend() {
  try {
    const res = await fetch(`${BACKEND_API_BASE}/api/mine-maps/active`);
    if (res.ok) {
      const data = await res.json();
      if (data.active && data.map) {
        // Cache to localStorage
        saveCustomMap(data.map);
        return data.map;
      }
    }
  } catch (err) {
    console.warn('[MineMapStore] Backend unreachable for active map:', err);
  }
  return loadSavedCustomMap() || getDefaultMineMap();
}

/**
 * Upload blueprint file to backend
 */
export async function uploadBlueprintBackend(file, mineName = '', seam = 'Seam 4', autoAnalyze = false) {
  const formData = new FormData();
  formData.append('file', file);
  if (mineName) formData.append('mine_name', mineName);
  if (seam) formData.append('seam', seam);
  formData.append('auto_analyze', autoAnalyze ? 'true' : 'false');

  const res = await fetch(`${BACKEND_API_BASE}/api/mine-maps/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to upload mine blueprint to backend.');
  }

  return await res.json();
}

/**
 * Trigger backend CV/ML analysis on an uploaded blueprint
 */
export async function analyzeBlueprintBackend(mapId, activate = false) {
  const res = await fetch(`${BACKEND_API_BASE}/api/mine-maps/${mapId}/analyze?activate=${activate ? 'true' : 'false'}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Backend CV/ML blueprint analysis failed.');
  }

  const data = await res.json();
  if (data.success && data.generatedMap) {
    if (activate) {
      saveCustomMap(data.generatedMap);
    }
  }
  return data;
}

/**
 * Activate a generated map on the backend
 */
export async function activateMapBackend(mapId) {
  const res = await fetch(`${BACKEND_API_BASE}/api/mine-maps/${mapId}/activate`, {
    method: 'POST',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to activate mine map.');
  }

  const data = await res.json();
  if (data.success && data.activeMap) {
    saveCustomMap(data.activeMap);
  }
  return data;
}

/**
 * Delete a mine map from backend
 */
export async function deleteMineMapBackend(mapId) {
  const res = await fetch(`${BACKEND_API_BASE}/api/mine-maps/${mapId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to delete mine map.');
  }

  return await res.json();
}

/**
 * Clear custom map and revert to default CAD Seam 3
 */
export function clearCustomMap() {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_CUSTOM_MAP);
    }
  } catch (err) {}
}

/**
 * Get list of all saved mines
 */
export function getSavedMinesList() {
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_SAVED_MINES);
      if (raw) return JSON.parse(raw);
    }
  } catch (e) {}
  return [];
}

