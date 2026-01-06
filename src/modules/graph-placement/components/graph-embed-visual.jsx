import React from 'react';

export default function GraphEmbedVisual({
  serviceNodes = [],
  serviceEdges = [],
  placementNodes = [],
  providerBw = {},
  onProviderBwChange,
  // New prop to receive remaining BW data (passed via placement object usually,
  // but here we can read it from the parent's placement object passed down or add a specific prop)
  // Since we pass 'placement.nodes', let's stick to the convention used in the page component.
  // Actually, we need to pass the remaining data explicitly in the Page component.
  // But for now, let's assume 'remainingBwMap' is passed or attached to placementNodes.
  // Correction: It's cleaner to pass it as a prop. I will update the Page component to pass 'providerEdgesRemaining'.
  providerEdgesRemaining = null,
}) {
  const pos = {
    'frontend-vm-1': { x: 100, y: 100 },
    'backend-vm-1': { x: 100, y: 210 },
    'database-vm-1': { x: 100, y: 320 },
  };

  const providerPos = {
    K: { x: 400, y: 130 },
    L: { x: 500, y: 80 },
    M: { x: 600, y: 130 },
    N: { x: 380, y: 350 },
    O: { x: 500, y: 350 },
    P: { x: 625, y: 350 },
  };

  const providerConnections = [
    ['K', 'L'],
    ['L', 'M'],
    ['K', 'N'],
    ['N', 'O'],
    ['O', 'L'],
    ['O', 'M'],
    ['O', 'P'],
    ['M', 'P'],
  ];

  const COLORS = {
    fe: '#60a5fa',
    be: '#34d399',
    db: '#f87171',
    neutral: '#cbd5e1',
    line: '#94a3b8',
    text: '#334155',
  };

  const nodeIdToLetter = { 1: 'K', 2: 'L', 3: 'M', 4: 'N', 5: 'O', 6: 'P' };
  const letterToNodeId = { K: 1, L: 2, M: 3, N: 4, O: 5, P: 6 };

  const labelOf = (id) => {
    if (id.includes('frontend')) return 'FE';
    if (id.includes('backend')) return 'BE';
    if (id.includes('database')) return 'DB';
    return 'VM';
  };

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

  const getCpuData = (letter) => {
    if (!placementNodes || placementNodes.length === 0) return null;
    const nodeId = letterToNodeId[letter];
    const node = placementNodes.find((n) => n.nodeId === nodeId);
    if (!node) return null;
    const total = node.totalCpu !== undefined ? node.totalCpu : 20;
    return { available: node.availableCpu, total: total };
  };

  const getCosineSim = (letter) => {
    if (!placementNodes || placementNodes.length === 0) return null;
    const nodeId = letterToNodeId[letter];
    const node = placementNodes.find((n) => n.nodeId === nodeId);
    if (!node || node.cosineSimilarity === undefined || node.cosineSimilarity === null) return null;
    return node.cosineSimilarity;
  };

  return (
    <svg width='100%' height='100%' viewBox='0 0 750 420' style={{ overflow: 'visible' }}>
      {/* 1. CSS to remove spinners */}
      <style>
        {`
          .no-spinners::-webkit-outer-spin-button,
          .no-spinners::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .no-spinners {
            -moz-appearance: textfield;
          }
        `}
      </style>

      <defs>
        <filter id='shadow' x='-20%' y='-20%' width='140%' height='140%'>
          <feDropShadow dx='2' dy='2' stdDeviation='2' floodOpacity='0.2' />
        </filter>
        <marker id='arrow' markerWidth='10' markerHeight='7' refX='28' refY='3.5' orient='auto'>
          <polygon points='0 0, 10 3.5, 0 7' fill={COLORS.line} />
        </marker>
      </defs>

      <text x='100' y='10' textAnchor='middle' fontWeight='700' fill={COLORS.text}>
        Service Graph
      </text>
      <text x='500' y='10' textAnchor='middle' fontWeight='700' fill={COLORS.text}>
        Provider Network
      </text>

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

      {serviceNodes.map((n) => {
        const p = pos[n.id];
        if (!p) return null;
        return (
          <g key={n.id} filter='url(#shadow)'>
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

      {/* --- Provider Edges (Editable + Remaining) --- */}
      {providerConnections.map(([from, to]) => {
        const p1 = providerPos[from];
        const p2 = providerPos[to];
        if (!p1 || !p2) return null;

        const val = providerBw ? providerBw[`${from}-${to}`] : 0;

        // Check for remaining bandwidth data
        const remVal = providerEdgesRemaining ? providerEdgesRemaining[`${from}-${to}`] : null;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return (
          <g key={`${from}-${to}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke='#cbd5e1' strokeWidth='4' />

            {/* White pill background */}
            <rect x={mx - 12} y={my - 9} width='24' height='18' rx='4' fill='white' />

            {/* Clickable Input */}
            <foreignObject x={mx - 15} y={my - 12} width='30' height='24'>
              <input
                type='number'
                value={val}
                className='no-spinners' // Uses the style tag above
                onChange={(e) => onProviderBwChange && onProviderBwChange(from, to, e.target.value)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'center',
                  color: '#ef4444',
                  fontWeight: '700',
                  fontSize: '11px',
                  outline: 'none',
                  padding: 0,
                  margin: 0,
                  cursor: 'pointer',
                }}
              />
            </foreignObject>

            {/* Remaining Bandwidth Label (Underneath) */}
            {remVal !== null && remVal !== undefined && (
              <text
                x={mx}
                y={my + 20}
                textAnchor='middle'
                fontSize='9'
                fontWeight='600'
                fill='#059669' // Green color for remaining
              >
                Rem: {remVal}
              </text>
            )}
          </g>
        );
      })}

      {Object.keys(providerPos).map((id) => {
        const p = providerPos[id];
        const fill = getFillColor(id);
        const cpuData = getCpuData(id);
        const sim = getCosineSim(id);

        return (
          <g key={id} filter='url(#shadow)'>
            {cpuData && (
              <g>
                <rect x={p.x - 40} y={p.y - 68} width='80' height='18' rx='9' fill='#f8fafc' stroke='#e2e8f0' />
                <text x={p.x} y={p.y - 56} textAnchor='middle' fontSize='10' fontWeight='600' fill='#64748b'>
                  CPU: {cpuData.available} / {cpuData.total}
                </text>
              </g>
            )}
            {sim !== null && (
              <g>
                <rect x={p.x - 30} y={p.y - 46} width='60' height='16' rx='8' fill='#f3e8ff' stroke='#d8b4fe' />
                <text x={p.x} y={p.y - 34} textAnchor='middle' fontSize='10' fontWeight='600' fill='#7e22ce'>
                  Sim: {Number(sim).toFixed(3)}
                </text>
              </g>
            )}
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
