export default function WorkerMarker({ worker, x, y }) {
  const isEvacuating = worker.status === 'EVACUATING';
  const color = isEvacuating ? '#C4362E' : '#292722';

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Worker dot */}
      <circle r="3.5" fill={color} stroke="#FFFFFF" strokeWidth="1.5" />

      {/* Evacuation indicator */}
      {isEvacuating && (
        <>
          <circle r="7" fill="none" stroke="#C4362E" strokeWidth="1" opacity="0.5">
            <animate
              attributeName="r"
              values="7;11;7"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.1;0.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </>
      )}

      {/* Worker ID label */}
      <text
        y="12"
        textAnchor="middle"
        fontSize="7"
        fill={color}
        fontFamily="Inter, sans-serif"
        fontWeight="500"
      >
        {worker.id}
      </text>
    </g>
  );
}
