import React, { useMemo } from 'react';
import styles from './graph-embed-visual.module.css';
import { cosineSimilarity } from '@/shared/utils/cos-similarity';

// Θέσεις service nodes (αριστερά)
const SERVICE_POS = {
  'frontend-vm-1': { x: 120, y: 120 },
  'backend-vm-1': { x: 120, y: 230 },
  'database-vm-1': { x: 120, y: 340 },
};

// Θέσεις provider nodes (δεξιά)
const PROVIDER_POS = {
  K: { x: 380, y: 140 },
  L: { x: 500, y: 90 },
  M: { x: 620, y: 140 },
  N: { x: 380, y: 320 },
  O: { x: 500, y: 320 },
  P: { x: 620, y: 320 },
};

const PROVIDER_EDGES = [
  ['K', 'L'],
  ['L', 'M'],
  ['K', 'N'],
  ['N', 'O'],
  ['O', 'L'],
  ['O', 'M'],
  ['O', 'P'],
  ['M', 'P'],
];

const LETTER_TO_NODE_ID = { K: 1, L: 2, M: 3, N: 4, O: 5, P: 6 };

// Για cosine similarity: capacity ανά provider (RAM=32 παντού)
const PROVIDER_CAPACITY = {
  K: { cpu: 20, mem: 32 },
  L: { cpu: 20, mem: 32 },
  M: { cpu: 6, mem: 32 },
  N: { cpu: 20, mem: 32 },
  O: { cpu: 8, mem: 32 },
  P: { cpu: 4, mem: 32 },
};

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function nonNegative(value) {
  return Math.max(0, toNumber(value));
}
function vmLabel(id) {
  if (id.includes('frontend')) return 'FE';
  if (id.includes('backend')) return 'BE';
  if (id.includes('database')) return 'DB';
  return 'VM';
}

export default function GraphEmbedVisual({
  serviceNodes = [],
  serviceEdges = [],
  placementNodes = [],
  providerBw = {},
  onProviderBwChange,
  providerEdgesRemaining = null,
}) {
  // Map: K/L/M... -> placement node
  const placementByLetter = useMemo(() => {
    const map = {};
    Object.keys(PROVIDER_POS).forEach((letter) => {
      const nodeId = LETTER_TO_NODE_ID[letter];
      map[letter] = (placementNodes || []).find((n) => n.nodeId === nodeId) || null;
    });
    return map;
  }, [placementNodes]);

  // Χρώμα provider node ανάλογα με roles
  function providerFill(letter) {
    const node = placementByLetter[letter];
    const roles = (node?.vms || []).map((v) => v.role);

    if (roles.includes('frontend')) return '#60a5fa';
    if (roles.includes('backend')) return '#34d399';
    if (roles.includes('database')) return '#f87171';
    return '#e2e8f0';
  }

  // Cosine similarity (με βάση USED vs CAPACITY)
  function getCosSim(letter) {
    const node = placementByLetter[letter];
    if (!node) return null;

    const cap = PROVIDER_CAPACITY[letter];
    if (!cap) return null;

    const usedCpu = cap.cpu - (node.availableCpu ?? cap.cpu);
    const usedMem = cap.mem - (node.availableMemory ?? cap.mem);

    // Αν δεν έχει τίποτα το node, δείξε null (να μη γεμίζει το UI)
    if (usedCpu <= 0 && usedMem <= 0) return null;

    const sim = cosineSimilarity([usedCpu, usedMem], [cap.cpu, cap.mem]);
    return Number.isFinite(sim) ? sim : null;
  }

  // -----------------------------------------------------------------------
  // Remaining CPU (available) for a provider node.
  // If the placement node exists we show its `availableCpu`,
  // otherwise we fall back to the full capacity (i.e. the node is completely free).
  // -----------------------------------------------------------------------
  function remainingCpu(letter) {
    const node = placementByLetter[letter];
    const cap = PROVIDER_CAPACITY[letter];
    if (!cap) return null;
    // `availableCpu` may be undefined → treat as full capacity
    const avail = node?.availableCpu ?? cap.cpu;
    // Show only when the node is actually placed (otherwise the UI already looks empty)
    return node ? Math.max(0, Math.round(avail)) : null;
  }

  return (
    <svg className={styles.svg} viewBox='0 0 750 420'>
      {/* Titles */}
      <text x='120' y='22' className={styles.title}>
        Service Graph
      </text>
      <text x='500' y='22' className={styles.title}>
        Provider Network
      </text>

      {/* ===== Service edges ===== */}
      {serviceEdges.map((e) => {
        const p1 = SERVICE_POS[e.from];
        const p2 = SERVICE_POS[e.to];
        if (!p1 || !p2) return null;

        const bw = nonNegative(e.bw);
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return (
          <g key={`${e.from}-${e.to}`}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={styles.serviceLine} />
            {bw > 0 && (
              <g>
                <rect x={mx - 16} y={my - 20} width='32' height='18' rx='4' className={styles.edgeBadge} />
                <text x={mx} y={my - 7} textAnchor='middle' className={styles.edgeBadgeText}>
                  {bw}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* ===== Service nodes ===== */}
      {serviceNodes.map((n) => {
        const p = SERVICE_POS[n.id];
        if (!p) return null;

        const cpu = nonNegative(n.cpu);
        const mem = nonNegative(n.memory);

        function serviceFill(id) {
          if (id.includes('frontend')) return '#60a5fa';
          if (id.includes('backend')) return '#34d399';
          if (id.includes('database')) return '#f87171';
          return '#94a3b8';
        }

        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r='22' fill={serviceFill(n.id)} className={styles.serviceNode} />

            <text x={p.x} y={p.y + 5} textAnchor='middle' className={styles.nodeTextWhite}>
              {n.label || vmLabel(n.id)}
            </text>

            <rect x={p.x + 28} y={p.y - 10} width='78' height='20' rx='6' className={styles.infoBox} />
            <text x={p.x + 67} y={p.y + 4} textAnchor='middle' className={styles.infoText}>
              CPU:{cpu} RAM:{mem}
            </text>
          </g>
        );
      })}

      {/* ===== Provider edges ===== */}
      {PROVIDER_EDGES.map(([from, to]) => {
        const p1 = PROVIDER_POS[from];
        const p2 = PROVIDER_POS[to];
        if (!p1 || !p2) return null;

        const key = `${from}-${to}`;
        const bw = nonNegative(providerBw?.[key]);
        const rem = providerEdgesRemaining ? providerEdgesRemaining[key] : null;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        return (
          <g key={key}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className={styles.providerLine} />

            <foreignObject x={mx - 16} y={my - 12} width='32' height='24'>
              <input
                className={styles.bwInput}
                type='number'
                min='0'
                value={bw}
                onChange={(e) => {
                  const next = nonNegative(e.target.value);
                  onProviderBwChange?.(from, to, next);
                }}
              />
            </foreignObject>

            {rem !== null && rem !== undefined && (
              <text x={mx} y={my + 26} textAnchor='middle' className={styles.remText}>
                Rem: {rem}
              </text>
            )}
          </g>
        );
      })}

      {/* ===== Provider nodes (με cosine similarity) ===== */}
      {Object.keys(PROVIDER_POS).map((letter) => {
        const p = PROVIDER_POS[letter];
        const fill = providerFill(letter);
        const sim = getCosSim(letter);
        const remCpu = remainingCpu(letter);

        return (
          <g key={letter}>
            {/* Draw the circle first so later text appears on top */}
            <circle cx={p.x} cy={p.y} r='26' fill={fill} className={styles.providerNode} />

            {/* similarity label – stays just above the circle */}
            {sim !== null && (
              <text x={p.x} y={p.y - 34} textAnchor='middle' className={styles.simText}>
                Sim: {sim.toFixed(3)}
              </text>
            )}

            {/* remaining CPU label – placed a bit higher so it isn’t hidden */}
            {remCpu !== null && (
              <text x={p.x} y={p.y - 44} textAnchor='middle' className={styles.remCpuText}>
                CPU: {remCpu}
              </text>
            )}

            {/* Letter inside the node */}
            <text x={p.x} y={p.y + 6} textAnchor='middle' className={styles.nodeTextDark}>
              {letter}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
