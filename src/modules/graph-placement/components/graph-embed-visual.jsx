export default function GraphEmbedVisual({
  serviceNodes = [],
  serviceEdges = [],
  placementNodes = [], // <-- περίμενε array [{nodeId, availableCpu,...}]
}) {
  // fixed θέσεις για service VMs (αριστερά)
  const pos = {
    'frontend-vm-1': { x: 120, y: 120 },
    'backend-vm-1': { x: 120, y: 220 },
    'database-vm-1': { x: 120, y: 320 },
  };

  // provider nodes (δεξιά)
  const providerLetters = ['K', 'L', 'M', 'N', 'O', 'P'];
  const providerPos = {
    K: { x: 360, y: 130 },
    L: { x: 420, y: 90 },
    M: { x: 470, y: 140 },
    N: { x: 360, y: 260 },
    O: { x: 420, y: 240 },
    P: { x: 470, y: 290 },
  };

  // σταθερές ακμές provider graph
  const providerEdges = [
    ['K', 'L', 6],
    ['L', 'M', 7],
    ['K', 'N', 5],
    ['N', 'O', 6],
    ['O', 'L', 8],
    ['O', 'M', 8],
    ['O', 'P', 6],
    ['M', 'P', 5],
  ];

  const nodeIdToLetter = { 1: 'K', 2: 'L', 3: 'M', 4: 'N', 5: 'O', 6: 'P' };
  const letterToNodeId = { K: 1, L: 2, M: 3, N: 4, O: 5, P: 6 };

  const labelOf = (id) => {
    if (id.includes('frontend')) return 'FE';
    if (id.includes('backend')) return 'BE';
    if (id.includes('database')) return 'DB';
    return 'VM';
  };

  // provider letter -> roles set (για χρωματισμό)
  const placedRolesByProvider = {};
  for (const node of placementNodes || []) {
    const letter = nodeIdToLetter[node.nodeId];
    if (!letter) continue;

    for (const vm of node.vms || []) {
      if (!placedRolesByProvider[letter]) placedRolesByProvider[letter] = new Set();
      placedRolesByProvider[letter].add(vm.role);
    }
  }

  // helper: πάρε availableCpu από placement
  const getAvailableCpu = (letter) => {
    const nodeId = letterToNodeId[letter];
    const node = (placementNodes || []).find((n) => n.nodeId === nodeId);
    if (!node) return null;
    return node.availableCpu;
  };

  return (
    <svg width="900" height="420" viewBox="0 0 900 420">
      {/* Titles */}
      <text x="40" y="45" fontSize="18" fontWeight="700">
        Service Graph (VMs)
      </text>
      <text x="560" y="45" fontSize="18" fontWeight="700">
        Provider Network (K L M N O P)
      </text>

      {/* Service edges (αριστερά) */}
      {serviceEdges.map((e) => {
        const p1 = pos[e.from];
        const p2 = pos[e.to];
        if (!p1 || !p2) return null;

        return (
          <g key={`${e.from}-${e.to}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#111" strokeWidth="2" />
            {typeof e.bw === 'number' && e.bw > 0 && (
              <text x={(p1.x + p2.x) / 2 + 10} y={(p1.y + p2.y) / 2 - 10} fontSize="12">
                BW {e.bw}
              </text>
            )}
          </g>
        );
      })}

      {/* Service nodes (VMs) */}
      {serviceNodes.map((n) => {
        const p = pos[n.id];
        if (!p) return null;

        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r="20" fill="#1e40af" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fill="white" fontWeight="700">
              {n.label || labelOf(n.id)}
            </text>

            <text x={p.x + 35} y={p.y - 6} fontSize="12">
              CPU {n.cpu}
            </text>
            <text x={p.x + 35} y={p.y + 12} fontSize="12">
              RAM {n.memory}
            </text>
          </g>
        );
      })}

      {/* Provider edges (δεξιά) + BW (κόκκινο) */}
      {providerEdges.map(([from, to, bw]) => {
        const p1 = providerPos[from];
        const p2 = providerPos[to];
        if (!p1 || !p2) return null;

        // midpoint + μικρό offset για label
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return (
          <g key={`${from}-${to}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#111" strokeWidth="2" />
            <text x={mx} y={my - 10} fontSize="12" fill="red" fontWeight="700" textAnchor="middle">
              {bw}
            </text>
          </g>
        );
      })}

      {/* Provider nodes (δεξιά) + CPU available πάνω από τον κύκλο */}
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

        const availCpu = getAvailableCpu(id);

        return (
          <g key={id}>
            {/* CPU available label */}
            {availCpu !== null && (
              <text x={p.x} y={p.y - 38} textAnchor="middle" fontSize="14" fontWeight="700">
                remaing CPU {availCpu}
              </text>
            )}

            <circle cx={p.x} cy={p.y} r="26" fill={fill} stroke="#111" strokeWidth="2" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fontWeight="700">
              {id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
