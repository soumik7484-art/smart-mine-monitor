// MINEGUARD AI — Dijkstra Shortest SAFE Route Engine
// Dynamic penalty cost function: SAFE=1x, CAUTION=2.5x, WARNING=7x, CRITICAL/COLLAPSED=∞

import { buildAdjacencyGraph, MINE_TUNNELS, MINE_EXITS } from '../data/mineData.js';

const RISK_MULTIPLIERS = {
  SAFE: 1.0,
  CAUTION: 2.5,
  WARNING: 7.0,
  CRITICAL: Infinity,
  COLLAPSED: Infinity,
};

/**
 * Compute shortest safe evacuation route using Dijkstra's algorithm.
 * @param {string} startNodeId - Worker's current junction node ID
 * @param {string|null} targetExitId - Specific exit to route to (null = nearest safe exit)
 * @param {Object} tunnelStates - Map of tunnelId → { riskLevel, status }
 * @returns {{ routeNodes: string[], tunnelIds: string[], totalDistance: number, estimatedTime: string, exitId: string, exitLabel: string } | null}
 */
export function computeSafeRoute(startNodeId, targetExitId, tunnelStates = {}) {
  const tunnelsWithState = MINE_TUNNELS.map(t => {
    const state = tunnelStates[t.id] || { riskLevel: 'SAFE', status: 'OPEN' };
    return { ...t, riskLevel: state.riskLevel || 'SAFE', status: state.status || 'OPEN' };
  });

  const graph = {};
  tunnelsWithState.forEach(t => {
    if (!graph[t.from]) graph[t.from] = [];
    if (!graph[t.to]) graph[t.to] = [];

    const multiplier = t.status === 'COLLAPSED' ? Infinity : (RISK_MULTIPLIERS[t.riskLevel] || 1.0);
    const cost = t.length * multiplier;

    graph[t.from].push({ node: t.to, tunnelId: t.id, cost, length: t.length });
    graph[t.to].push({ node: t.from, tunnelId: t.id, cost, length: t.length });
  });

  const exitIds = targetExitId
    ? [targetExitId]
    : MINE_EXITS.filter(e => e.type === 'surface' || e.type === 'emergency').map(e => e.id);

  let bestRoute = null;
  let bestCost = Infinity;

  for (const exitId of exitIds) {
    const result = dijkstra(graph, startNodeId, exitId);
    if (result && result.cost < bestCost) {
      bestCost = result.cost;
      bestRoute = result;
    }
  }

  if (!bestRoute) return null;

  const exit = MINE_EXITS.find(e => e.id === bestRoute.path[bestRoute.path.length - 1]);

  // Compute actual distance (sum of tunnel lengths, not penalized costs)
  let totalDistance = 0;
  const tunnelIds = [];
  for (let i = 0; i < bestRoute.path.length - 1; i++) {
    const from = bestRoute.path[i];
    const to = bestRoute.path[i + 1];
    const tunnel = tunnelsWithState.find(t =>
      (t.from === from && t.to === to) || (t.to === from && t.from === to)
    );
    if (tunnel) {
      totalDistance += tunnel.length;
      tunnelIds.push(tunnel.id);
    }
  }

  // Estimate time at 1.2 m/s walking speed
  const timeSeconds = Math.round(totalDistance / 1.2);
  const minutes = Math.floor(timeSeconds / 60);
  const seconds = timeSeconds % 60;

  return {
    routeNodes: bestRoute.path,
    tunnelIds,
    totalDistance,
    estimatedTime: `${minutes} min ${seconds} sec`,
    exitId: exit?.id || 'UNKNOWN',
    exitLabel: exit?.label || 'Unknown Exit',
    penaltyCost: Math.round(bestCost),
  };
}

/**
 * Standard Dijkstra's shortest path algorithm
 */
function dijkstra(graph, start, end) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const queue = [];

  // Initialize
  for (const node in graph) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  // Ensure start and end are in graph
  if (!graph[start] && !graph[end]) return null;
  if (!graph[start]) graph[start] = [];
  if (!graph[end]) graph[end] = [];

  dist[start] = 0;
  queue.push({ node: start, cost: 0 });

  while (queue.length > 0) {
    // Find minimum cost node (simple priority queue)
    queue.sort((a, b) => a.cost - b.cost);
    const { node: current } = queue.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    if (current === end) break;

    const neighbors = graph[current] || [];
    for (const edge of neighbors) {
      if (visited.has(edge.node)) continue;
      if (edge.cost === Infinity) continue; // Skip collapsed/critical tunnels

      const newDist = dist[current] + edge.cost;
      if (newDist < dist[edge.node]) {
        dist[edge.node] = newDist;
        prev[edge.node] = current;
        queue.push({ node: edge.node, cost: newDist });
      }
    }
  }

  if (dist[end] === Infinity) return null;

  // Reconstruct path
  const path = [];
  let node = end;
  while (node) {
    path.unshift(node);
    node = prev[node];
  }

  return { path, cost: dist[end] };
}

/**
 * Compute routes for all workers to their nearest safe exit
 */
export function computeAllWorkerRoutes(workers, tunnelStates) {
  const routes = {};
  for (const worker of workers) {
    const route = computeSafeRoute(worker.nodeId, null, tunnelStates);
    if (route) {
      routes[worker.id] = route;
    }
  }
  return routes;
}
