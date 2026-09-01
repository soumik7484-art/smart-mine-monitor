const statusColors = {
  SAFE: '#2D8A4E',
  WARNING: '#C4820E',
  HIGH: '#D97706',
  CRITICAL: '#C4362E',
  OFFLINE: '#9CA3AF',
};

const statusPulseColors = {
  CRITICAL: '#C4362E',
  HIGH: '#D97706',
};

export default function SensorNode({ node, isSelected, onClick }) {
  const color = statusColors[node.status] || statusColors.SAFE;
  const hasPulse = node.status === 'CRITICAL' || node.status === 'HIGH';

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      onClick={() => onClick?.(node)}
      style={{ cursor: 'pointer' }}
      role="button"
      aria-label={`Sensor node ${node.id} - ${node.status}`}
    >
      {/* Selection ring */}
      {isSelected && (
        <circle
          r="12"
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray="3 2"
          opacity="0.6"
        />
      )}

      {/* Pulse animation for critical/high nodes */}
      {hasPulse && (
        <circle r="8" fill={statusPulseColors[node.status]} opacity="0.15">
          <animate
            attributeName="r"
            values="8;14;8"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.15;0.05;0.15"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Node circle */}
      <circle
        r="6"
        fill={color}
        stroke="#FFFFFF"
        strokeWidth="2"
      />

      {/* Node label */}
      <text
        y="-11"
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        fill="#292722"
        fontFamily="Inter, sans-serif"
      >
        {node.label || node.id}
      </text>
    </g>
  );
}
