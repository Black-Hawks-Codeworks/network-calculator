export default function GraphEmbedVisual({
  serviceNodes,      // [{id,label,cpu,memory}]
  serviceEdges,      // [{from,to,bw}]
  providerNodes,     // ΣΤΑΘΕΡΑ: [{id:'K', cpuShown:4, cpu:20, memory:32}, ...]
  providerGraph,     // Graph με adjacencyList[node] = [{to,bw}, ...]
  placementNodes,    // output του placeVMs: [{nodeId, vms:[{id, placementSimilarity,...}], ...}]
}) {
  const R = 20;

  // --------- Αριστερά: Service VMs (κάθετα) ----------
  const servicePos = {};
  const sx = 150;
  const sy0 = 130;
  const gap = 95;

  serviceNodes.forEach((n, i) => {
    servicePos[n.id] = { x: sx, y: sy0 + i * gap };
  });

  // --------- Δεξιά: Provider nodes KLMNOP (σταθερά κοντά, σαν "εξάγωνο") ----------
  // Θέσεις που μοιάζουν με το σχέδιο του καθηγητή (μπορείς να τις πειράξεις λίγο)
  const providerPos = {
    K: { x: 650, y: 150 },
    L: { x: 740, y: 110 },
    M: { x: 820, y: 170 },
    N: { x: 650, y: 260 },
    O: { x: 740, y: 250 },
    P: { x: 820, y: 290 },
  };

  // mapping: placeVMs nodeId (1..6) -> provider letter (K..P)
  const nodeIdToLetter = { 1: 'K', 2: 'L', 3: 'M', 4: 'N', 5: 'O', 6: 'P' };

  // Βρες σε ποιο numeric nodeId (1..N) τοποθετήθηκε ένα VM από το placeVMs output
  function findPlacement(vmId) {
    for (const node of placementNodes || []) {
      const vm = (node.vms || []).find((v) => v.id === vmId);
      if (vm) return { nodeId: node.nodeId, sim: vm.placementSimilarity };
    }
    return null;
  }

  // Helper: παίρνουμε μοναδικές ακμές provider graph (για να μην τις ζωγραφίσουμε 2 φορές)
  function getProviderEdgesUnique() {
    const edges = [];
    const seen = new Set();

    if (!providerGraph?.adjacencyList) return edges;

    for (const from of Object.keys(providerGraph.adjacencyList)) {
      const arr = providerGraph.adjacencyList[from] || [];
      for (const e of arr) {
        const to = e.to;
        const key = [from, to].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        edges.push({ from, to, bw: e.bw });
      }
    }
    return edges;
  }

  const providerEdges = getProviderEdgesUnique();

  return (
    <svg width="900" height="480" viewBox="0 0 900 480">
      {/* Titles */}
      <text x="40" y="45" fontSize="18" fontWeight="700">
        Service Graph (VMs)
      </text>
      <text x="560" y="45" fontSize="18" fontWeight="700">
        Provider Network (K L M N O P)
      </text>

      {/* Arrow */}
      <line x1="320" y1="220" x2="520" y2="220" stroke="gray" strokeWidth="3" />
      <polygon points="520,220 508,214 508,226" fill="gray" />
      <text x="360" y="200" fontSize="12" fill="gray">
        mapping (cosine best-fit)
      </text>

      {/* --------- Service edges (αριστερά) με BW requirement (προαιρετικά label) ---------- */}
      {serviceEdges.map((e) => {
        const u = e.from;
        const v = e.to;

        const x1 = servicePos[u]?.x;
        const y1 = servicePos[u]?.y;
        const x2 = servicePos[v]?.x;
        const y2 = servicePos[v]?.y;

        if (x1 == null || x2 == null) return null;

        return (
          <g key={`${u}-${v}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111" strokeWidth="2" />
            {/* BW requirement label πάνω στην ακμή (προαιρετικά) */}
            {typeof e.bw === 'number' && e.bw > 0 && (
              <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 10} fontSize="12" fill="#111">
                BW {e.bw}
              </text>
            )}
          </g>
        );
      })}

      {/* --------- Service nodes (VMs) ---------- */}
      {serviceNodes.map((n) => (
        <g key={n.id}>
          <circle cx={servicePos[n.id].x} cy={servicePos[n.id].y} r={R} fill="#1e40af" />
          <text
            x={servicePos[n.id].x}
            y={servicePos[n.id].y + 5}
            textAnchor="middle"
            fill="white"
            fontWeight="700"
          >
            {n.label}
          </text>

          <text x={servicePos[n.id].x - 110} y={servicePos[n.id].y - 6} fontSize="12">
            {n.id}
          </text>
          <text x={servicePos[n.id].x - 110} y={servicePos[n.id].y + 12} fontSize="12">
            CPU {n.cpu}, RAM {n.memory}
          </text>
        </g>
      ))}

      {/* --------- Provider edges (δεξιά) με BW capacity κόκκινο ---------- */}
      {providerEdges.map((e) => {
        const p1 = providerPos[e.from];
        const p2 = providerPos[e.to];
        if (!p1 || !p2) return null;

     // midpoint
const mx = (p1.x + p2.x) / 2;
const my = (p1.y + p2.y) / 2;

// perpendicular offset (για να φύγει το label από τη γραμμή)
const dx = p2.x - p1.x;
const dy = p2.y - p1.y;
const len = Math.sqrt(dx * dx + dy * dy) || 1;

// μοναδιαίο κάθετο διάνυσμα
const nx = -dy / len;
const ny = dx / len;

// πόσο να μετακινηθεί το label έξω από τη γραμμή
const offset = 14;

const lx = mx + nx * offset;
const ly = my + ny * offset;

return (
  <g key={`prov-${e.from}-${e.to}`}>
    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#111" strokeWidth="2" />

    {/* white background για να μη "μπλέκει" με γραμμές */}
    <rect
      x={lx - 10}
      y={ly - 9}
      width="20"
      height="16"
      rx="4"
      fill="white"
      opacity="0.9"
    />

    {/* bandwidth label (κόκκινο) - πλέον offset από τη γραμμή */}
    <text
      x={lx}
      y={ly}
      fontSize="12"
      fill="red"
      fontWeight="700"
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {e.bw}
    </text>
  </g>
);

      })}

      {/* --------- Provider nodes (δεξιά): K L M N O P, με CPU MONO (μαύρο) ---------- */}
      {providerNodes.map((pn) => {
        const pos = providerPos[pn.id];
        if (!pos) return null;

        return (
          <g key={pn.id}>
            <circle cx={pos.x} cy={pos.y} r={R + 10} fill="#e5e7eb" stroke="#111" strokeWidth="2" />
            <text x={pos.x} y={pos.y + 5} textAnchor="middle" fill="#111" fontWeight="700">
              {pn.id}
            </text>

            {/* CPU MONO (μαύρο) */}
            <text x={pos.x} y={pos.y + 55} textAnchor="middle" fontSize="12" fill="#111">
              CPU {pn.cpuShown}
            </text>
          </g>
        );
      })}

      {/* --------- Mapping lines (VM -> Provider node letter) ---------- */}
      {serviceNodes.map((sn) => {
        const info = findPlacement(sn.id);
        if (!info) return null;

        const letter = nodeIdToLetter[info.nodeId];
        if (!letter) return null;

        const p = providerPos[letter];
        if (!p) return null;

        const x1 = servicePos[sn.id].x + R;
        const y1 = servicePos[sn.id].y;
        const x2 = p.x - (R + 10);
        const y2 = p.y;

        return (
          <g key={`map-${sn.id}-${letter}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="red"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.9"
            />
            <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} fontSize="12" fill="red">
              s={Number(info.sim).toFixed(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
