export default function EvacuationRoute({ route, mineNodes }) {
  if (!route || !route.path || route.path.length < 2) return null;

  // Build polyline from route path node IDs
  const points = route.path
    .map(nodeId => {
      const node = mineNodes.find(n => n.id === nodeId);
      return node ? [node.x, node.y] : null;
    })
    .filter(Boolean);

  if (points.length < 2) return null;

  const pointsStr = points.map(p => p.join(',')).join(' ');

  return (
    <g>
      {/* Route background — wider, semi-transparent */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke="#2D8A4E"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.15"
      />

      {/* Route line — dashed */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke="#2D8A4E"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8 4"
      >
        <animate
          attributeName="stroke-dashoffset"
          values="0;-12"
          dur="1s"
          repeatCount="indefinite"
        />
      </polyline>

      {/* Arrow markers along the route */}
      {points.slice(0, -1).map((point, i) => {
        if (i % 2 !== 0) return null; // Show arrows every other segment
        const next = points[i + 1];
        const mx = (point[0] + next[0]) / 2;
        const my = (point[1] + next[1]) / 2;
        const angle = Math.atan2(next[1] - point[1], next[0] - point[0]) * (180 / Math.PI);

        return (
          <g key={i} transform={`translate(${mx}, ${my}) rotate(${angle})`}>
            <polygon
              points="0,-4 8,0 0,4"
              fill="#2D8A4E"
              opacity="0.7"
            />
          </g>
        );
      })}

      {/* Route label */}
      <g transform={`translate(${points[0][0] + 15}, ${points[0][1] - 15})`}>
        <rect x="-4" y="-10" width="80" height="14" rx="2" fill="#2D8A4E" opacity="0.9" />
        <text
          fontSize="8"
          fontWeight="600"
          fill="#FFFFFF"
          fontFamily="Inter, sans-serif"
        >
          EVACUATION ROUTE
        </text>
      </g>
    </g>
  );
}
