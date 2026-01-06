export default function GraphEmbedVisual({ serviceNodes = [], serviceEdges = [], placementNodes = [] }) {
  // fixed θέσεις για να είναι απλό
  const pos = {
    'frontend-vm-1': { x: 120, y: 120 },
    'backend-vm-1': { x: 120, y: 220 },
    'database-vm-1': { x: 120, y: 320 },
  };

  const providerLetters = ['K', 'L', 'M', 'N', 'O', 'P'];
  // provider nodes (6 κύκλοι δεξιά)
  const providerPos = {
    K: { x: 360, y: 130 },
    L: { x: 420, y: 90 },
    M: { x: 470, y: 140 },
    N: { x: 360, y: 260 },
    O: { x: 420, y: 240 },
    P: { x: 470, y: 290 },
  };

  // γραμμές μεταξύ provider nodes (σταθερές)
  const providerEdges = [
    ['K', 'L'],
    ['L', 'M'],
    ['K', 'N'],
    ['N', 'O'],
    ['O', 'L'],
    ['O', 'M'],
    ['O', 'P'],
    ['M', 'P'],
  ];

  const labelOf = (id) => {
    if (id.includes('frontend')) return 'FE';
    if (id.includes('backend')) return 'BE';
    if (id.includes('database')) return 'DB';
    return 'VM';
  };

  const nodeIdToLetter = { 1: 'K', 2: 'L', 3: 'M', 4: 'N', 5: 'O', 6: 'P' };

  // letter -> Set(roles) πχ { K: Set(['frontend','backend']) }
  const placedRolesByProvider = {};

  for (const node of placementNodes || []) {
    const letter = nodeIdToLetter[node.nodeId];
    if (!letter) continue;

    for (const vm of node.vms || []) {
      if (!placedRolesByProvider[letter]) placedRolesByProvider[letter] = new Set();
      placedRolesByProvider[letter].add(vm.role); // 'frontend' | 'backend' | 'database'
    }
  }

  return (
    <svg width='900' height='420' viewBox='0 0 900 420'>
      <text x='20' y='30' fontSize='16' fontWeight='700'>
        Service Graph (VMs)
      </text>

      {/* provider edges */}
      {providerEdges.map(([from, to]) => {
        const p1 = providerPos[from];
        const p2 = providerPos[to];
        if (!p1 || !p2) return null;

        return <line key={`${from}-${to}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke='#111' strokeWidth='2' />;
      })}

      {/* edges */}
      {serviceEdges.map((e) => {
        const p1 = pos[e.from];
        const p2 = pos[e.to];
        if (!p1 || !p2) return null;

        return (
          <g key={`${e.from}-${e.to}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke='#111' strokeWidth='2' />
            <text x={(p1.x + p2.x) / 2 + 10} y={(p1.y + p2.y) / 2 - 10} fontSize='12'>
              BW {e.bw}
            </text>
          </g>
        );
      })}

      {/* nodes */}
      {serviceNodes.map((n) => {
        const p = pos[n.id];
        if (!p) return null;

        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r='20' fill='#1e40af' />
            <text x={p.x} y={p.y + 5} textAnchor='middle' fill='white' fontWeight='700'>
              {n.label || labelOf(n.id)}
            </text>

            <text x={p.x + 35} y={p.y - 6} fontSize='12'>
              CPU {n.cpu}
            </text>
            <text x={p.x + 35} y={p.y + 12} fontSize='12'>
              RAM {n.memory}
            </text>
          </g>
        );
      })}

      {/* debug: δείξε πόσα placement nodes υπάρχουν */}
      <text x='20' y='400' fontSize='12' fill='gray'>
        placementNodes: {Array.isArray(placementNodes) ? placementNodes.length : 0}
      </text>

      {/* provider nodes (6 κύκλοι) */}
      {providerLetters.map((id) => {
        const p = providerPos[id];

        const roles = placedRolesByProvider[id] ? Array.from(placedRolesByProvider[id]) : [];
        const fill = roles.includes('frontend')
          ? '#93c5fd'
          : roles.includes('backend')
            ? '#86efac'
            : roles.includes('database')
              ? '#fca5a5'
              : '#e5e7eb';

        return (
          <g key={id}>
            <circle cx={p.x} cy={p.y} r='26' fill={fill} stroke='#111' strokeWidth='2' />
            <text x={p.x} y={p.y + 5} textAnchor='middle' fontWeight='700'>
              {id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
