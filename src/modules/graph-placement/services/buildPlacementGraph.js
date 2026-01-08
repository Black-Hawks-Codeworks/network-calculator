// - Placement gia FE/BE/DB stous providers K/L/M/N/O/P
// - Constraints: CPU/RAM + cumulative BW (bidirected)
// - Rule: 1 VM ana provider (na min mpainoun panw apo ena VM se idio provider)



import { Graph } from '@/shared/utils/graphs';
import { cosineSimilarity } from '@/shared/utils/cos-similarity';

const PROVIDERS = ['K', 'L', 'M', 'N', 'O', 'P'];

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

const PROVIDER_CAPACITY = {
  K: { cpu: 20, memory: 32 },
  L: { cpu: 20, memory: 32 },
  M: { cpu: 20, memory: 32 },
  N: { cpu: 20, memory: 32 },
  O: { cpu: 20, memory: 32 },
  P: { cpu: 20, memory: 32 },
};

const LETTER_TO_NODE_ID = { K: 1, L: 2, M: 3, N: 4, O: 5, P: 6 };

// Graph helpers
function buildProviderGraph(providerBw) {
  const bw = providerBw || {};
  const g = new Graph();

  PROVIDERS.forEach((p) => g.addVertex(p));

  PROVIDER_EDGES.forEach(([a, b]) => {
    const val = Number(bw[`${a}-${b}`]) || 0;
    g.addEdge(a, b, val); // undirected (kai tis 2 kateythinseis)
  });

  return g;
}

function getDirectEdgeBw(graph, from, to) {
  const list = graph.adjacencyList[from] || [];
  const edge = list.find((e) => e.to === to);
  return edge ? Number(edge.bw) : undefined;
}

function getMaxLinkBw(graph) {
  let max = 0;
  Object.keys(graph.adjacencyList).forEach((v) => {
    graph.adjacencyList[v].forEach((e) => {
      const val = Number(e.bw);
      if (Number.isFinite(val) && val > max) max = val;
    });
  });
  return max;
}

// Services helpers

function pickServices(services) {
  const list = Array.isArray(services) ? services : [];
  return {
    list,
    fe: list.find((s) => s && s.id === 'frontend-vm-1') || null,
    be: list.find((s) => s && s.id === 'backend-vm-1') || null,
    db: list.find((s) => s && s.id === 'database-vm-1') || null,
  };
}

function normalizeBw(val) {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

// Constraint: 1 VM ana provider
// (mono gia services pou yparxoun)
function isOneVmPerProviderOk({ fe, be, db }, i, j, k) {
  // mazevw mono ta grammata pou antistoixoun se yparxonta services
  const chosen = [];
  if (fe) chosen.push(i);
  if (be) chosen.push(j);
  if (db) chosen.push(k);

  // an 2 grammata einai idia => 2 services ston idio provider => oxi
  return new Set(chosen).size === chosen.length;
}

// CPU/RAM usage kai check

function buildUsageMap() {
  const usage = {};
  PROVIDERS.forEach((p) => {
    usage[p] = { cpu: 0, mem: 0 };
  });
  return usage;
}

function addServiceUsage(usage, letter, svc) {
  if (!svc) return;
  usage[letter].cpu += Number(svc.cpu) || 0;
  usage[letter].mem += Number(svc.mem) || 0;
}

function isResourceOk(usage) {
  let ok = true;
  PROVIDERS.forEach((p) => {
    if (!ok) return;
    if (usage[p].cpu > PROVIDER_CAPACITY[p].cpu) ok = false;
    if (usage[p].mem > PROVIDER_CAPACITY[p].memory) ok = false;
  });
  return ok;
}

// BW athroistiko check
function initDirectedUsage() {
  const usage = {};
  PROVIDER_EDGES.forEach(([a, b]) => {
    usage[`${a}-${b}`] = 0;
    usage[`${b}-${a}`] = 0;
  });
  return usage;
}

function addBw(usage, from, to, bw) {
  if (!from || !to) return;
  if (from === to) return;
  if (bw <= 0) return;

  usage[`${from}-${to}`] += bw;
  usage[`${to}-${from}`] += bw;
}

function isBwFeasibleCumulative(graph, assignment, bwFeBe, bwBeDb) {
  const usage = initDirectedUsage();

  addBw(usage, assignment['frontend-vm-1'], assignment['backend-vm-1'], bwFeBe);
  addBw(usage, assignment['backend-vm-1'], assignment['database-vm-1'], bwBeDb);

  let ok = true;

  Object.keys(usage).forEach((key) => {
    if (!ok) return;
    const used = usage[key];
    if (used <= 0) return;

    const [from, to] = key.split('-');
    const cap = getDirectEdgeBw(graph, from, to);

    if (!Number.isFinite(cap)) ok = false;
    else if (used > cap) ok = false;
  });

  return ok;
}

function calcRemainingBw(graph, assignment, bwFeBe, bwBeDb) {
  const used = initDirectedUsage();

  addBw(used, assignment['frontend-vm-1'], assignment['backend-vm-1'], bwFeBe);
  addBw(used, assignment['backend-vm-1'], assignment['database-vm-1'], bwBeDb);

  const remaining = {};
  Object.keys(used).forEach((key) => {
    const [from, to] = key.split('-');
    const cap = getDirectEdgeBw(graph, from, to) || 0;
    remaining[key] = cap - used[key];
  });

  return remaining;
}

// Assignment helper
function buildAssignment({ fe, be, db }, i, j, k) {
  const a = {};
  if (fe) a[fe.id] = i;
  if (be) a[be.id] = j;
  if (db) a[db.id] = k;
  return a;
}

// Output nodes 
function buildOutputNodes(servicesList, assignment) {
  return PROVIDERS.map((letter) => {
    const nodeId = LETTER_TO_NODE_ID[letter];
    const vmsHere = servicesList.filter((vm) => assignment[vm.id] === letter);

    let usedCpu = 0;
    let usedMem = 0;
    vmsHere.forEach((vm) => {
      usedCpu += Number(vm.cpu) || 0;
      usedMem += Number(vm.mem) || 0;
    });

    const totalCpu = PROVIDER_CAPACITY[letter].cpu;
    const totalMem = PROVIDER_CAPACITY[letter].memory;

    return {
      nodeId,
      vms: vmsHere,
      totalCpu,
      availableCpu: totalCpu - usedCpu,
      availableMemory: totalMem - usedMem,
      cosineSimilarity: cosineSimilarity([usedCpu, usedMem], [totalCpu, totalMem]),
    };
  });
}

// MAIN
export function buildPlacementGraph({ services, bwFeBe, bwBeDb, providerBw }) {
  const { list, fe, be, db } = pickServices(services);

  const reqFeBe = normalizeBw(bwFeBe);
  const reqBeDb = normalizeBw(bwBeDb);

  const g = buildProviderGraph(providerBw);
  const maxLink = getMaxLinkBw(g);

  // check gia BW
  if (reqFeBe > 0 && reqFeBe > maxLink) {
    return { ok: false, error: `Το BW FE→BE (${reqFeBe}) είναι > από max link (${maxLink}).` };
  }
  if (reqBeDb > 0 && reqBeDb > maxLink) {
    return { ok: false, error: `Το BW BE→DB (${reqBeDb}) είναι > από max link (${maxLink}).` };
  }

  let finalAssignment = null;

  // Brute force search
  for (const i of PROVIDERS) {
    for (const j of PROVIDERS) {
      for (const k of PROVIDERS) {
        // 1) 1 VM ana provider
        if (!isOneVmPerProviderOk({ fe, be, db }, i, j, k)) continue;

        // 2) assignment
        const assignment = buildAssignment({ fe, be, db }, i, j, k);

        // 3) CPU/RAM check
        const usage = buildUsageMap();
        addServiceUsage(usage, i, fe);
        addServiceUsage(usage, j, be);
        addServiceUsage(usage, k, db);
        if (!isResourceOk(usage)) continue;

        // 4) BW athroistiko check
        if (!isBwFeasibleCumulative(g, assignment, reqFeBe, reqBeDb)) continue;

        finalAssignment = assignment;
        break;
      }
      if (finalAssignment) break;
    }
    if (finalAssignment) break;
  }

  if (!finalAssignment) {
    return {
      ok: false,
      error: `Δεν βρέθηκε placement (CPU/RAM ή BW ή κανόνας "1 VM ανά node"). maxLink=${maxLink}`,
    };
  }

  const providerEdgesRemaining = calcRemainingBw(g, finalAssignment, reqFeBe, reqBeDb);
  const nodes = buildOutputNodes(list, finalAssignment);

  return {
    ok: true,
    placement: {
      nodes,
      edges: { feToBe: reqFeBe, beToDb: reqBeDb },
      providerEdgesRemaining,
    },
  };
}
