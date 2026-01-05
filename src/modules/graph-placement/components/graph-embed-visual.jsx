export default function GraphEmbedVisual({ serviceNodes, serviceEdges, providerNodes, infra, edgeBandwidth }) {
  // providerNodes = output of placeVMs:
  // [{ nodeId, vms:[{id, cpu, memory, placementSimilarity}], availableCpu, availableMemory, similarity }, ...]

  const R = 20;

  // Service node positions (κάθετα αριστερά)
  const servicePos = {};
  const sx = 150;
  const sy0 = 110;
  const gap = 95;

  serviceNodes.forEach((n, i) => {
    servicePos[n.id] = { x: sx, y: sy0 + i * gap };
  });

  // Provider node positions (κάθετα δεξιά)
  const providerPos = {};
  const px = 650;
  const py0 = 130;
  const pgap = 150;

  providerNodes.forEach((n, i) => {
    providerPos[n.nodeId] = { x: px, y: py0 + i * pgap };
  });

  function hasRunPlacement(pnodes) {
    return Array.isArray(pnodes) && pnodes.length > 0;
  }

  // Find where each VM placed + similarity
  function findPlacement(vmId) {
    for (const node of providerNodes) {
      const vm = (node.vms || []).find(v => v.id === vmId);
      if (vm) return { nodeId: node.nodeId, sim: vm.placementSimilarity };
    }
    return null;
  }

  // Bandwidth requirement για κάθε edge (με βάση τα ids που χρησιμοποιείς)
  function getBwReq(u, v) {
    if (u === 'frontend-vm-1' && v === 'backend-vm-1') return edgeBandwidth?.feBe ?? 0;
    if (u === 'backend-vm-1' && v === 'database-vm-1') return edgeBandwidth?.beDb ?? 0;
    return 0;
  }

  // Έλεγχος BW: ίδιο node => OK, διαφορετικά nodes => πρέπει infra.linkBw >= bwReq
  function isBwOk(u, v, bwReq) {
    if (!bwReq || bwReq <= 0) return true;
    const p1 = findPlacement(u);
    const p2 = findPlacement(v);
    if (!p1 || !p2) return false;
    if (p1.nodeId === p2.nodeId) return true;
    const cap = infra?.linkBw ?? 0;
    return cap >= bwReq;
  }

  return (
    <svg width="900" height="480" viewBox="0 0 900 480">
      {/* Titles */}
      <text x="40" y="45" fontSize="18" fontWeight="700">Service Graph (VMs)</text>
      <text x="560" y="45" fontSize="18" fontWeight="700">Provider Nodes (Output of placeVMs)</text>

      <text x="560" y="70" fontSize="12" fill="#111">
        node cap: CPU {infra?.nodeCpu ?? '-'}, RAM {infra?.nodeMemory ?? '-'} | link BW: {infra?.linkBw ?? '-'}
      </text>

      {/* Arrow */}
      <line x1="320" y1="220" x2="520" y2="220" stroke="gray" strokeWidth="3" />
      <polygon points="520,220 508,214 508,226" fill="gray" />
      <text x="360" y="200" fontSize="12" fill="gray">
        mapping from placement
      </text>

      {/* Service edges (with bandwidth labels) */}
      {serviceEdges.map(([u, v]) => {
        const x1 = servicePos[u]?.x;
        const y1 = servicePos[u]?.y;
        const x2 = servicePos[v]?.x;
        const y2 = servicePos[v]?.y;

        const bwReq = getBwReq(u, v);
        const ok = hasRunPlacement(providerNodes) ? isBwOk(u, v, bwReq) : true;

        return (
          <g key={`${u}-${v}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#111" strokeWidth="2" />
            {bwReq > 0 && (
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 10}
                fontSize="12"
                fill={ok ? "green" : "red"}
              >
                BW {bwReq} ({ok ? "OK" : "FAIL"})
              </text>
            )}
          </g>
        );
      })}

      {/* Service nodes */}
      {serviceNodes.map((n) => (
        <g key={n.id}>
          <circle cx={servicePos[n.id].x} cy={servicePos[n.id].y} r={R} fill="#1e40af" />
          <text x={servicePos[n.id].x} y={servicePos[n.id].y + 5} textAnchor="middle" fill="white" fontWeight="700">
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

      {/* Provider nodes */}
      {providerNodes.map((pn) => (
        <g key={pn.nodeId}>
          <circle
            cx={providerPos[pn.nodeId].x}
            cy={providerPos[pn.nodeId].y}
            r={R + 10}
            fill="#bbf7d0"
            stroke="#16a34a"
            strokeWidth="2"
          />
          <text x={providerPos[pn.nodeId].x} y={providerPos[pn.nodeId].y + 5} textAnchor="middle" fill="#111" fontWeight="700">
            Node {pn.nodeId}
          </text>

          <text x={providerPos[pn.nodeId].x - 110} y={providerPos[pn.nodeId].y + 40} fontSize="12" fill="#111">
            avail: {pn.availableCpu} CPU, {pn.availableMemory} RAM
          </text>

          <text x={providerPos[pn.nodeId].x - 110} y={providerPos[pn.nodeId].y + 58} fontSize="12" fill="#111">
            avg cosine: {Number(pn.similarity).toFixed(2)}
          </text>
        </g>
      ))}

      {/* Mapping lines based on VM placement */}
      {serviceNodes.map((sn) => {
        const info = findPlacement(sn.id);
        if (!info || !providerPos[info.nodeId]) return null;

        const x1 = servicePos[sn.id].x + R;
        const y1 = servicePos[sn.id].y;
        const x2 = providerPos[info.nodeId].x - (R + 10);
        const y2 = providerPos[info.nodeId].y;

        return (
          <g key={`map-${sn.id}-${info.nodeId}`}>
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
