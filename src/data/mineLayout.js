const generateMineLayout = () => {
  const nodes = [];
  const tunnels = [];
  const adjacency = {};
  let nodeIdx = 1;

  // Main tunnel nodes
  for (let i = 0; i < 7; i++) {
    const x = 150 + i * 100;
    nodes.push({ id: `M-${i+1}`, x, y: 100, section: 'Main', label: `Main-${i+1}` });
    adjacency[`M-${i+1}`] = [];
    if (i > 0) {
      tunnels.push({ id: `T-M${i}`, from: `M-${i}`, to: `M-${i+1}`, points: [[150 + (i-1)*100, 100], [x, 100]], section: 'Main', label: `T-M${i}` });
      adjacency[`M-${i+1}`].push(`M-${i}`);
      adjacency[`M-${i}`].push(`M-${i+1}`);
    }
  }

  // Sections A, B, C, D
  const sections = ['A', 'B', 'C', 'D'];
  for (let s = 0; s < sections.length; s++) {
    const sec = sections[s];
    const basex = 200 + s * 150;
    
    // Connect to main
    adjacency[`M-${s*2+1}`].push(`N-${String(nodeIdx).padStart(2, '0')}`);

    for (let i = 1; i <= 7; i++) {
      const id = `N-${String(nodeIdx).padStart(2, '0')}`;
      const y = 100 + i * 60;
      let x = basex;
      if (i > 3) x += (i % 2 === 0) ? 40 : -40; // Branches

      nodes.push({ id, x, y, section: sec, label: `${sec}-${String(i).padStart(2, '0')}` });
      adjacency[id] = [];
      
      if (i === 1) {
        tunnels.push({ id: `T-${sec}${i}`, from: `M-${s*2+1}`, to: id, points: [[nodes.find(n => n.id === `M-${s*2+1}`).x, 100], [x, y]], section: sec, label: `T-${sec}${i}` });
        adjacency[id].push(`M-${s*2+1}`);
      } else {
        const prevId = `N-${String(nodeIdx-1).padStart(2, '0')}`;
        tunnels.push({ id: `T-${sec}${i}`, from: prevId, to: id, points: [[nodes.find(n => n.id === prevId).x, nodes.find(n => n.id === prevId).y], [x, y]], section: sec, label: `T-${sec}${i}` });
        adjacency[id].push(prevId);
        adjacency[prevId].push(id);
      }
      
      nodeIdx++;
    }
  }

  const entrances = [
    { id: 'EXIT-1', x: 50, y: 100, label: 'Main Entrance' },
    { id: 'EXIT-2', x: 850, y: 100, label: 'Secondary Exit' }
  ];
  
  adjacency['EXIT-1'] = ['M-1'];
  adjacency['M-1'].push('EXIT-1');
  adjacency['EXIT-2'] = ['M-7'];
  adjacency['M-7'].push('EXIT-2');
  
  tunnels.push({ id: 'T-E1', from: 'EXIT-1', to: 'M-1', points: [[50, 100], [150, 100]], section: 'Main', label: 'T-E1' });
  tunnels.push({ id: 'T-E2', from: 'M-7', to: 'EXIT-2', points: [[750, 100], [850, 100]], section: 'Main', label: 'T-E2' });

  const emergencyExits = [
    { id: 'E-EXIT-1', x: 200, y: 550, label: 'Emergency Exit A' },
    { id: 'E-EXIT-2', x: 650, y: 550, label: 'Emergency Exit C' }
  ];

  return { nodes, tunnels, entrances, emergencyExits, adjacency };
};

export const mineLayout = generateMineLayout();

export function calculateEvacuationRoute(fromNodeLabel, toExitId, blockedTunnelIds = []) {
  // Find node by label
  const startNode = mineLayout.nodes.find(n => n.label === fromNodeLabel) || mineLayout.nodes.find(n => n.id === fromNodeLabel);
  if (!startNode) return null;

  const startId = startNode.id;
  const queue = [[startId]];
  const visited = new Set([startId]);

  // Blocked edges helper
  const isBlocked = (from, to) => {
    const tunnel = mineLayout.tunnels.find(t => 
      (t.from === from && t.to === to) || (t.from === to && t.to === from)
    );
    return tunnel && blockedTunnelIds.includes(tunnel.id);
  };

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current === toExitId) {
      const dist = path.length * 45; // arbitrary scaling for m
      return {
        path,
        distance: `${dist}m`,
        estimatedTime: `${Math.floor(dist/80)} min ${dist%80} sec`,
        calculatedAt: new Date()
      };
    }

    const neighbors = mineLayout.adjacency[current] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor) && !isBlocked(current, neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  return null;
}
