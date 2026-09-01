import TunnelPath from './TunnelPath';
import SensorNode from './SensorNode';
import WorkerMarker from './WorkerMarker';
import EvacuationRoute from './EvacuationRoute';
import { useMemo } from 'react';

export default function MineMap({
  mineLayout,
  sensorData,
  workers,
  selectedNode,
  onSelectNode,
  emergencyState,
}) {
  const { tunnels, nodes: layoutNodes, entrances, emergencyExits } = mineLayout;

  // Merge layout positions with sensor data
  const mergedNodes = useMemo(() => {
    return layoutNodes.map(ln => {
      const sensor = sensorData?.nodes?.find(n => n.id === ln.id) || {};
      return { ...ln, ...sensor, x: ln.x, y: ln.y, label: ln.label };
    });
  }, [layoutNodes, sensorData]);

  // Place workers near their zone nodes
  const workerPositions = useMemo(() => {
    return workers.map((worker, i) => {
      // Find a node in the worker's zone
      const zoneNodes = mergedNodes.filter(n =>
        n.location?.includes(worker.zone?.replace('Section ', '')) ||
        n.section === worker.zone?.replace('Section ', '')
      );
      if (zoneNodes.length === 0) return null;
      const baseNode = zoneNodes[i % zoneNodes.length];
      // Offset workers slightly so they don't overlap nodes
      const angle = ((i * 137.5) % 360) * (Math.PI / 180);
      const offsetR = 14 + (i % 3) * 6;
      return {
        worker,
        x: baseNode.x + Math.cos(angle) * offsetR,
        y: baseNode.y + Math.sin(angle) * offsetR,
      };
    }).filter(Boolean);
  }, [workers, mergedNodes]);

  // All node positions for evacuation route rendering
  const allMapNodes = useMemo(() => {
    const nodes = [...mergedNodes];
    entrances.forEach(e => nodes.push({ id: e.id, x: e.x, y: e.y }));
    emergencyExits?.forEach(e => nodes.push({ id: e.id, x: e.x, y: e.y }));
    return nodes;
  }, [mergedNodes, entrances, emergencyExits]);

  return (
    <div className="relative w-full">
      <svg
        viewBox="0 0 900 600"
        className="w-full h-auto"
        style={{ maxHeight: '560px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="900" height="600" fill="#F5F2EC" rx="4" />

        {/* Grid lines for engineering feel */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#E8E4DC" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="900" height="600" fill="url(#grid)" />

        {/* Section labels */}
        <text x="160" y="130" fontSize="11" fontWeight="600" fill="#6F6A61" fontFamily="Inter, sans-serif" letterSpacing="1">SECTION A</text>
        <text x="360" y="130" fontSize="11" fontWeight="600" fill="#6F6A61" fontFamily="Inter, sans-serif" letterSpacing="1">SECTION B</text>
        <text x="560" y="130" fontSize="11" fontWeight="600" fill="#6F6A61" fontFamily="Inter, sans-serif" letterSpacing="1">SECTION C</text>
        <text x="740" y="130" fontSize="11" fontWeight="600" fill="#6F6A61" fontFamily="Inter, sans-serif" letterSpacing="1">SECTION D</text>

        {/* Hazard zone overlay */}
        {emergencyState?.active && emergencyState.section && (
          <g>
            {/* Find nodes in affected section and draw hazard zone */}
            {(() => {
              const sectionLetter = emergencyState.section.replace('Section ', '');
              const affectedNodes = mergedNodes.filter(n => n.section === sectionLetter);
              if (affectedNodes.length === 0) return null;
              const minX = Math.min(...affectedNodes.map(n => n.x)) - 30;
              const minY = Math.min(...affectedNodes.map(n => n.y)) - 30;
              const maxX = Math.max(...affectedNodes.map(n => n.x)) + 30;
              const maxY = Math.max(...affectedNodes.map(n => n.y)) + 30;
              return (
                <rect
                  x={minX}
                  y={minY}
                  width={maxX - minX}
                  height={maxY - minY}
                  rx="4"
                  fill="#C4362E"
                  opacity="0.08"
                  stroke="#C4362E"
                  strokeWidth="1"
                  strokeDasharray="6 3"
                  strokeOpacity="0.3"
                />
              );
            })()}
          </g>
        )}

        {/* Tunnels */}
        {tunnels.map(tunnel => (
          <TunnelPath
            key={tunnel.id}
            tunnel={tunnel}
            isBlocked={emergencyState?.blockedTunnels?.includes(tunnel.id)}
            isHighlighted={false}
          />
        ))}

        {/* Evacuation route */}
        {emergencyState?.active && emergencyState.evacuationRoute && (
          <EvacuationRoute
            route={emergencyState.evacuationRoute}
            mineNodes={allMapNodes}
          />
        )}

        {/* Worker markers */}
        {workerPositions.map(({ worker, x, y }) => (
          <WorkerMarker key={worker.id} worker={worker} x={x} y={y} />
        ))}

        {/* Sensor nodes */}
        {mergedNodes.map(node => (
          <SensorNode
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onClick={onSelectNode}
          />
        ))}

        {/* Entrances */}
        {entrances.map(entrance => (
          <g key={entrance.id} transform={`translate(${entrance.x}, ${entrance.y})`}>
            <rect x="-20" y="-10" width="40" height="20" rx="3" fill="#2D8A4E" opacity="0.9" />
            <text
              textAnchor="middle"
              y="4"
              fontSize="8"
              fontWeight="700"
              fill="#FFFFFF"
              fontFamily="Inter, sans-serif"
            >
              {entrance.label}
            </text>
          </g>
        ))}

        {/* Emergency exits */}
        {emergencyExits?.map(exit => (
          <g key={exit.id} transform={`translate(${exit.x}, ${exit.y})`}>
            <rect x="-24" y="-10" width="48" height="20" rx="3" fill="#C4820E" opacity="0.9" />
            <text
              textAnchor="middle"
              y="4"
              fontSize="7"
              fontWeight="700"
              fill="#FFFFFF"
              fontFamily="Inter, sans-serif"
            >
              {exit.label}
            </text>
          </g>
        ))}

        {/* Scale indicator */}
        <g transform="translate(30, 570)">
          <line x1="0" y1="0" x2="80" y2="0" stroke="#8C8578" strokeWidth="1.5" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="#8C8578" strokeWidth="1.5" />
          <line x1="80" y1="-4" x2="80" y2="4" stroke="#8C8578" strokeWidth="1.5" />
          <text x="40" y="12" textAnchor="middle" fontSize="8" fill="#6F6A61" fontFamily="Inter, sans-serif">100m</text>
        </g>

        {/* North indicator */}
        <g transform="translate(860, 30)">
          <circle r="12" fill="none" stroke="#8C8578" strokeWidth="1" />
          <text textAnchor="middle" y="4" fontSize="10" fontWeight="700" fill="#6F6A61" fontFamily="Inter, sans-serif">N</text>
        </g>
      </svg>

      {/* Route info overlay */}
      {emergencyState?.active && emergencyState.evacuationRoute && (
        <div className="absolute bottom-3 right-3 bg-mine-surface border border-mine-border rounded shadow-card px-3 py-2">
          <p className="text-xs font-medium text-mine-text-secondary">
            Route calculated{' '}
            <span className="tabular-nums">
              {emergencyState.evacuationRoute.calculatedAt
                ? new Date(emergencyState.evacuationRoute.calculatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                : '—'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
