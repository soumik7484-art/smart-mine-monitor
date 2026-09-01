export default function TunnelPath({ tunnel, isBlocked, isHighlighted }) {
  const pointsStr = tunnel.points.map(p => p.join(',')).join(' ');

  return (
    <g>
      <polyline
        points={pointsStr}
        fill="none"
        stroke={isBlocked ? '#C4362E' : isHighlighted ? '#C4820E' : '#8C8578'}
        strokeWidth={isBlocked ? 4 : 6}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={isBlocked ? 0.5 : 0.8}
      />
      {/* Tunnel fill — lighter inner line */}
      <polyline
        points={pointsStr}
        fill="none"
        stroke={isBlocked ? '#FDECEB' : '#EEEBE4'}
        strokeWidth={isBlocked ? 2 : 4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {isBlocked && (
        <>
          {/* X marks for blocked tunnel */}
          {tunnel.points.length >= 2 && (() => {
            const midIdx = Math.floor(tunnel.points.length / 2);
            const mx = tunnel.points[midIdx][0];
            const my = tunnel.points[midIdx][1];
            return (
              <g transform={`translate(${mx}, ${my})`}>
                <line x1="-6" y1="-6" x2="6" y2="6" stroke="#C4362E" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="6" y1="-6" x2="-6" y2="6" stroke="#C4362E" strokeWidth="2.5" strokeLinecap="round" />
              </g>
            );
          })()}
        </>
      )}
    </g>
  );
}
