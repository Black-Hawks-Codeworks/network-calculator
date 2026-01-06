import { Graph } from '@/shared/utils/graphs'; // ⚠️ άλλαξε path αν διαφέρει

export default function GraphEmbedVisual({
  serviceNodes = [],
  serviceEdges = [],
  placementNodes = [],
}) {
  const pos = {
    'frontend-vm-1': { x: 120, y: 120 },
    'backend-vm-1': { x: 120, y: 220 },
    'database-vm-1': { x: 120, y: 320 },
  };

  const providerPos = {
    K: { x: 650, y: 150 },
    L: { x: 740, y: 110 },
    M: { x: 820, y: 170 },
    N: { x: 650, y: 260 },
    O: { x: 740, y: 250 },
    P: { x: 820, y: 290 },
  };

  const providerLetters = Object.keys(providerPos);

  // --- Helpers
  const labelOf = (id) => {
    if (id.includes('frontend')) return 'FE';
    if (id.includes('backend')) return 'BE';
    if (id.includes('database')) return 'DB';
    return 'VM';
  };

  const roleFromId = (id) => {
    if (id.includes('frontend')) return 'frontend';
    if (id.includes('backend')) return 'backend';
    if (id.includes('database')) return 'database';
    return 'unknown';
  };

  const nodeIdToLetter = { 1: 'K', 2: 'L', 3: 'M', 4: 'N', 5: 'O', 6: 'P' };

  // --- 1) Provider graph (σταθερό) από Graph.js
  const providerGraph = new Graph();
  providerLetters.forEach((v) => providerGraph.addVertex(v));

  // Βάλε εδώ τις ακμές + bandwidth (bw)
  providerGraph.addEdge('K', 'L', 6);
  providerGraph.addEdge('L', 'M', 7);
  providerGraph.addEdge('K', 'N', 5);
  providerGraph.addEdge('N', 'O', 6);
  providerGraph.addEdge('O', 'L', 8);
  providerGraph.addEdge('O', 'M', 8);
  providerGraph.addEdge('O', 'P', 6);
  providerGraph.addEdge('M', 'P', 5);

  // Unique provider edges για ζωγραφική (να μην διπλοζωγραφίζονται)
  const providerEdgesUnique = (() => {
    const edges = [];
    const seen = new Set();

    for (const from of Object.keys(providerGraph.adjacencyList)) {
      for (const e of providerGraph.adjacencyList[from]) {
        const to = e.to;
        const key = [from, to].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ from, to, bw: e.bw });
      }
    }
    return edges;
  })();

  // --- 2) Placement -> VMs ανά provider κόμβο (για να “κάτσουν” πάνω δεξιά)
  // placedByProvider: { K: [{label:'FE', role:'frontend', sim:0.87}], ... }
  const placedByProvider = {};
  for (const node of placementNodes || []) {
    const letter = nodeIdToLetter[node.nodeId];
    if (!letter) continue;

    for (const vm of node.vms || []) {
      if (!placedByProvider[letter]) placedByProvider[letter] = [];
      placedByProvider[letter].push({
        label: labelOf(vm.id),
        role: vm.role || roleFromId(vm.id),
        sim: vm.placementSimilarity,
      });
    }
  }

  // --- 3) Χρώμα provider node ανάλογα με τι VM έχει
  const providerFill = (letter) => {
    const vms = placedByProvider[letter] || [];
    const roles = new Set(vms.map((x) => x.role));

    if (roles.has('frontend')) return '#93c5fd'; // blue
    if (roles.has('backend')) return '#86efac'; // green
    if (roles.has('database')) return '#fca5a5'; // red
    return '#e5e7eb'; // gray
  };

  return (
    <svg width="900" height="480" viewBox="0 0 900 480">
      <text x="40" y="45" fontSize="18" fontWeight="700">
        Service Graph (VMs)
      </text>
      <text x="560" y="45" fontSize="18" fontWeight="700">
        Provider Network (K L M N O P)
      </text>

      {/* provider edges (από Graph) + bw label */}
      {providerEdgesUnique.map((e) => {
        const p1 = providerPos[e.from];
        const p2 = providerPos[e.to];
        if (!p1 || !p2) return null;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return (
          <g key={`prov-${e.from}-${e.to}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#111" strokeWidth="2" />
            <text x={mx} y={my - 10} fontSize="12" fill="red" textAnchor="middle" fontWeight="700">
              {e.bw}
            </text>
          </g>
        );
      })}

      {/* service edges */}
      {serviceEdges.map((e) => {
        const p1 = pos[e.from];
        const p2 = pos[e.to];
        if (!p1 || !p2) return null;
        return (
          <g key={`${e.from}-${e.to}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#111" strokeWidth="2" />
            <text x={(p1.x + p2.x) / 2 + 10} y={(p1.y + p2.y) / 2 - 10} fontSize="12">
              BW {e.bw}
            </text>
          </g>
        );
      })}

      {/* service nodes */}
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

      {/* provider nodes + VMs “πάνω” */}
      {providerLetters.map((id) => {
        const p = providerPos[id];
        const fill = providerFill(id);
        const vmsHere = placedByProvider[id] || [];

        return (
          <g key={id}>
            <circle cx={p.x} cy={p.y} r="28" fill={fill} stroke="#111" strokeWidth="2" />
            <text x={p.x} y={p.y + 5} textAnchor="middle" fontWeight="700">
              {id}
            </text>

            {/* VMs μέσα στο node (κάτω από τον κύκλο) */}
            {vmsHere.slice(0, 4).map((vm, idx) => (
              <text
                key={`${id}-${idx}`}
                x={p.x}
                y={p.y + 48 + idx * 14}
                textAnchor="middle"
                fontSize="12"
                fill="#111"
              >
                {vm.label}
                {typeof vm.sim === 'number' ? ` (s=${vm.sim.toFixed(2)})` : ''}
              </text>
            ))}
          </g>
        );
      })}
    </svg>
  );
}
