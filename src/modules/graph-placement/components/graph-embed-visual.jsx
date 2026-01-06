import React from 'react';

export default function GraphEmbedVisual({ serviceNodes = [], serviceEdges = [], placementNodes = [] }) {
  // --- Configuration ---
  const pos = {
    'frontend-vm-1': { x: 100, y: 100 },
    'backend-vm-1': { x: 100, y: 210 },
    'database-vm-1': { x: 100, y: 320 },
  };

  const providerPos = {
    K: { x: 400, y: 130 },
    L: { x: 500, y: 80 },
    M: { x: 600, y: 130 },
    N: { x: 400, y: 280 },
    O: { x: 500, y: 250 },
    P: { x: 600, y: 300 },
  };

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

  // Colors Palette
  const COLORS = {
    fe: '#60a5fa', // Blue
    be: '#34d399', // Green
    db: '#f87171', // Red
    neutral: '#cbd5e1',
    line: '#94a3b8',
    text: '#334155',
  };

  // --- Logic Helpers ---
  const nodeIdToLetter = { 1: 'K', 2: 'L', 3: 'M', 4: 'N', 5: 'O', 6: 'P' };
  const letterToNodeId = { K: 1, L: 2, M: 3, N: 4, O: 5, P: 6 };

  const labelOf = (id) => {
    if (id.includes('frontend')) return 'FE';
    if (id.includes('backend')) return 'BE';
    if (id.includes('database')) return 'DB';
    return 'VM';
  };

  // Determine Node Color (Gray if empty, Colored if role placed)
  const getFillColor = (letter) => {
    if (!placementNodes || placementNodes.length === 0) return '#f1f5f9';

    const nodeId = letterToNodeId[letter];
    const node = placementNodes.find((n) => n.nodeId === nodeId);

    if (!node || !node.vms || node.vms.length === 0) return '#f1f5f9';

    const roles = node.vms.map((v) => v.role);
    if (roles.includes('frontend')) return COLORS.fe;
    if (roles.includes('backend')) return COLORS.be;
    if (roles.includes('database')) return COLORS.db;
    return '#e2e8f0';
  };

  // Get CPU Stats (Returns null if no data)
  const getCpuData = (letter) => {
    if (!placementNodes || placementNodes.length === 0) return null;

    const nodeId = letterToNodeId[letter];
    const node = placementNodes.find((n) => n.nodeId === nodeId);

    if (!node) return null;

    // Default total to 20 if missing, strictly for display safety
    const total = node.totalCpu !== undefined ? node.totalCpu : 20;

    return {
      available: node.availableCpu,
      total: total,
    };
  };

  // Get Cosine Similarity (Returns null if no data)
  const getCosineSim = (letter) => {
    if (!placementNodes || placementNodes.length === 0) return null;

    const nodeId = letterToNodeId[letter];
    const node = placementNodes.find((n) => n.nodeId === nodeId);

    // Only return if valid number exists
    if (!node || node.cosineSimilarity === undefined || node.cosineSimilarity === null) {
      return null;
    }
    return node.cosineSimilarity;
  };

  return (
    <svg width='100%' height='100%' viewBox='0 0 750 420' style={{ overflow: 'visible' }}>
      <defs>
        {/* Shadow Filter */}
        <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow dx='2' dy='2' stdDeviation='2' floodOpacity='0.2' />
        </filter>
        {/* Arrow Marker */}
        <marker id='arrow' markerWidth='10' markerHeight='7' refX='28' refY='3.5' orient='auto'>
          <polygon points='0 0, 10 3.5, 0 7' fill={COLORS.line} />
        </marker>
      </defs>

      {/* --- Titles --- */}
      <text x='100' y='10' textAnchor='middle' fontWeight='700' fill={COLORS.text}>
        Service Graph
      </text>
      <text x='500' y='10' textAnchor='middle' fontWeight='700' fill={COLORS.text}>
        Provider Network
      </text>

      {/* --- Service Edges (Left) --- */}
      {serviceEdges.map((e) => {
        const p1 = pos[e.from];
        const p2 = pos[e.to];
        if (!p1 || !p2) return null;

        return (
          <g key={`${e.from}-${e.to}`}>
            <line
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={COLORS.line}
              strokeWidth='2'
              strokeDasharray='5,5'
              markerEnd='url(#arrow)'
            />
            {e.bw > 0 && (
              <g>
                <rect
                  x={(p1.x + p2.x) / 2 - 20}
                  y={(p1.y + p2.y) / 2 - 10}
                  width='40'
                  height='20'
                  rx='4'
                  fill='white'
                  stroke='#e2e8f0'
                />
                <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 + 4} fontSize='11' textAnchor='middle' fill='#64748b'>
                  {e.bw}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* --- Service Nodes (Left) --- */}
      {serviceNodes.map((n) => {
        const p = pos[n.id];
        if (!p) return null;
        return (
          <g key={n.id} filter='url(#shadow)'>
            {/* Info Box */}
            <rect x={p.x - 95} y={p.y - 20} width='65' height='40' rx='4' fill='white' stroke='#e2e8f0' />
            <text x={p.x - 62} y={p.y - 5} fontSize='10' textAnchor='middle' fill='#64748b'>
              CPU: {n.cpu}
            </text>
            <text x={p.x - 62} y={p.y + 10} fontSize='10' textAnchor='middle' fill='#64748b'>
              RAM: {n.memory}
            </text>

            <circle cx={p.x} cy={p.y} r='22' fill='#2563eb' stroke='white' strokeWidth='2' />
            <text x={p.x} y={p.y + 5} textAnchor='middle' fill='white' fontWeight='700'>
              {n.label || labelOf(n.id)}
            </text>
          </g>
        );
      })}

      {/* --- Provider Edges (Right) --- */}
      {providerEdges.map(([from, to, bw]) => {
        const p1 = providerPos[from];
        const p2 = providerPos[to];
        if (!p1 || !p2) return null;
        return (
          <g key={`${from}-${to}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke='#cbd5e1' strokeWidth='4' />
            <rect x={(p1.x + p2.x) / 2 - 12} y={(p1.y + p2.y) / 2 - 9} width='24' height='18' rx='4' fill='white' />
            <text
              x={(p1.x + p2.x) / 2}
              y={(p1.y + p2.y) / 2 + 4}
              fontSize='11'
              fontWeight='700'
              fill='#ef4444'
              textAnchor='middle'>
              {bw}
            </text>
          </g>
        );
      })}

      {/* --- Provider Nodes (Right) --- */}
      {Object.keys(providerPos).map((id) => {
        const p = providerPos[id];
        const fill = getFillColor(id);
        const cpuData = getCpuData(id);
        const sim = getCosineSim(id);

        return (
          <g key={id} filter='url(#shadow)'>
            {/* 1. CPU Label (Topmost) */}
            {cpuData && (
              <g>
                {/* Positioned at y - 68 */}
                <rect x={p.x - 40} y={p.y - 68} width='80' height='18' rx='9' fill='#f8fafc' stroke='#e2e8f0' />
                <text x={p.x} y={p.y - 56} textAnchor='middle' fontSize='10' fontWeight='600' fill='#64748b'>
                  CPU: {cpuData.available} / {cpuData.total}
                </text>
              </g>
            )}

            {/* 2. Cosine Similarity Label (Middle) */}
            {sim !== null && (
              <g>
                {/* Positioned at y - 46 (Under CPU) */}
                <rect x={p.x - 30} y={p.y - 46} width='60' height='16' rx='8' fill='#f3e8ff' stroke='#d8b4fe' />
                <text x={p.x} y={p.y - 34} textAnchor='middle' fontSize='10' fontWeight='600' fill='#7e22ce'>
                  Sim: {Number(sim).toFixed(3)}
                </text>
              </g>
            )}

            {/* 3. The Node Circle (Bottom) */}
            <circle cx={p.x} cy={p.y} r='26' fill={fill} stroke='white' strokeWidth='3' />
            <text x={p.x} y={p.y + 6} textAnchor='middle' fontWeight='700' fill='#1e293b'>
              {id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
