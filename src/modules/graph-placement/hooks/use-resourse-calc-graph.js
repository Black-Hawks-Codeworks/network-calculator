import { useState } from 'react';
import { Graph } from '@/shared/utils/graphs'; // ✅ βάλε το σωστό path (π.χ. '@/shared/utils/graphs')

function cosineSimilarity(a, b) {
  // a,b: {cpu, memory}
  const dot = a.cpu * b.cpu + a.memory * b.memory;
  const magA = Math.sqrt(a.cpu * a.cpu + a.memory * a.memory);
  const magB = Math.sqrt(b.cpu * b.cpu + b.memory * b.memory);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

// BFS που βρίσκει αν υπάρχει path από start -> goal
// χρησιμοποιώντας ΜΟΝΟ ακμές με bw >= requiredBw
function hasPathWithMinBw(providerGraph, start, goal, requiredBw) {
  if (!start || !goal) return false;
  if (start === goal) return true;

  const adj = providerGraph?.adjacencyList || {};
  const visited = new Set([start]);
  const q = [start];

  while (q.length) {
    const cur = q.shift();
    const neighbors = adj[cur] || [];

    for (const e of neighbors) {
      if (typeof e?.bw === 'number' && e.bw < requiredBw) continue;

      const nxt = e.to;
      if (!nxt || visited.has(nxt)) continue;
      if (nxt === goal) return true;

      visited.add(nxt);
      q.push(nxt);
    }
  }

  return false;
}

export default function useResourceCalcGraph() {
  const [values, setValues] = useState({
    frontendCpu: '',
    frontendMemory: '',
    backendCpu: '',
    backendMemory: '',
    dbCpu: '',
    dbMemory: '',
    bwFeBe: '',
    bwBeDb: '',
  });

  // placement: κρατάει nodes σε μορφή παρόμοια με placeVMs
  const [placement, setPlacement] = useState({ nodes: [], edges: { feToBe: 0, beToDb: 0 } });

  const resetInputs = () => {
    setValues({
      frontendCpu: '',
      frontendMemory: '',
      backendCpu: '',
      backendMemory: '',
      dbCpu: '',
      dbMemory: '',
      bwFeBe: '',
      bwBeDb: '',
    });
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCalculate = () => {
    const nodeCapacity = { cpu: 20, memory: 32 }; // provider node capacity
    const providerLetters = ['K', 'L', 'M', 'N', 'O', 'P'];
    const letterToNodeId = { K: 1, L: 2, M: 3, N: 4, O: 5, P: 6 };

    // --- Parse inputs (strings -> numbers)
    const feCpu = values.frontendCpu === '' ? 0 : Number(values.frontendCpu);
    const feMem = values.frontendMemory === '' ? 0 : Number(values.frontendMemory);
    const beCpu = values.backendCpu === '' ? 0 : Number(values.backendCpu);
    const beMem = values.backendMemory === '' ? 0 : Number(values.backendMemory);
    const dbCpu = values.dbCpu === '' ? 0 : Number(values.dbCpu);
    const dbMem = values.dbMemory === '' ? 0 : Number(values.dbMemory);

    const bwFeBe = values.bwFeBe === '' ? 0 : Number(values.bwFeBe);
    const bwBeDb = values.bwBeDb === '' ? 0 : Number(values.bwBeDb);

    const allNums = [feCpu, feMem, beCpu, beMem, dbCpu, dbMem, bwFeBe, bwBeDb];

    // --- Basic validation
    if (allNums.some((v) => Number.isNaN(v))) {
      window.alert('Please enter valid numbers only.');
      resetInputs();
      setPlacement({ nodes: [], edges: { feToBe: 0, beToDb: 0 } });
      return;
    }

    if (allNums.some((v) => v < 0)) {
      window.alert('Please enter non-negative values only.');
      resetInputs();
      setPlacement({ nodes: [], edges: { feToBe: 0, beToDb: 0 } });
      return;
    }

    // per-VM must fit in one node
    if ([feCpu, beCpu, dbCpu].some((v) => v > nodeCapacity.cpu)) {
      window.alert(`CPU value is too large (max ${nodeCapacity.cpu}).`);
      setPlacement({ nodes: [], edges: { feToBe: bwFeBe, beToDb: bwBeDb } });
      return;
    }

    if ([feMem, beMem, dbMem].some((v) => v > nodeCapacity.memory)) {
      window.alert(`RAM value is too large (max ${nodeCapacity.memory}).`);
      setPlacement({ nodes: [], edges: { feToBe: bwFeBe, beToDb: bwBeDb } });
      return;
    }

    // --- Build VMs (μόνο όσα έχουν cpu & ram > 0)
    const vms = [
      { id: 'frontend-vm-1', role: 'frontend', cpu: feCpu, memory: feMem },
      { id: 'backend-vm-1', role: 'backend', cpu: beCpu, memory: beMem },
      { id: 'database-vm-1', role: 'database', cpu: dbCpu, memory: dbMem },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);

    if (vms.length === 0) {
      setPlacement({ nodes: [], edges: { feToBe: bwFeBe, beToDb: bwBeDb } });
      return;
    }

    // --- Provider Graph (σταθερό) με bw capacities (αυτό που δείχνεις στο σχήμα)
    const providerGraph = new Graph();
    providerLetters.forEach((l) => providerGraph.addVertex(l));

    providerGraph.addEdge('K', 'L', 6);
    providerGraph.addEdge('L', 'M', 7);
    providerGraph.addEdge('K', 'N', 5);
    providerGraph.addEdge('N', 'O', 6);
    providerGraph.addEdge('O', 'L', 8);
    providerGraph.addEdge('O', 'M', 8);
    providerGraph.addEdge('O', 'P', 6);
    providerGraph.addEdge('M', 'P', 5);

    // --- Helper: check CPU/RAM feasibility of an assignment
    function isFeasibleCapacity(assign) {
      // assign: { 'frontend-vm-1': 'K', ... }
      const load = {};
      for (const l of providerLetters) load[l] = { cpu: 0, memory: 0 };

      for (const vm of vms) {
        const l = assign[vm.id];
        if (!l) return false;
        load[l].cpu += vm.cpu;
        load[l].memory += vm.memory;
        if (load[l].cpu > nodeCapacity.cpu) return false;
        if (load[l].memory > nodeCapacity.memory) return false;
      }
      return true;
    }

    // --- Helper: check bandwidth feasibility (paths on providerGraph)
    function isFeasibleBandwidth(assign) {
      // FE -> BE
      if (bwFeBe > 0) {
        const a = assign['frontend-vm-1'];
        const b = assign['backend-vm-1'];
        // αν λείπει VM (π.χ. user δεν έβαλε backend), τότε αγνόησέ το
        if (a && b) {
          if (!hasPathWithMinBw(providerGraph, a, b, bwFeBe)) return false;
        }
      }

      // BE -> DB
      if (bwBeDb > 0) {
        const a = assign['backend-vm-1'];
        const b = assign['database-vm-1'];
        if (a && b) {
          if (!hasPathWithMinBw(providerGraph, a, b, bwBeDb)) return false;
        }
      }

      return true;
    }

    // --- Score: θέλουμε "καλό packing" (λιγότερο waste) και καλό similarity
    function scoreAssignment(assign) {
      const load = {};
      for (const l of providerLetters) load[l] = { cpu: 0, memory: 0 };

      for (const vm of vms) {
        const l = assign[vm.id];
        load[l].cpu += vm.cpu;
        load[l].memory += vm.memory;
      }

      let waste = 0;
      let simSum = 0;
      let usedNodes = 0;

      for (const l of providerLetters) {
        const used = load[l];
        if (used.cpu > 0 || used.memory > 0) usedNodes += 1;

        const rem = {
          cpu: nodeCapacity.cpu - used.cpu,
          memory: nodeCapacity.memory - used.memory,
        };

        // waste: όσο μένει αχρησιμοποίητο
        waste += rem.cpu * rem.cpu + rem.memory * rem.memory;

        // similarity: πόσο “γεμίζει” ο κόμβος με balanced τρόπο
        simSum += cosineSimilarity(used, nodeCapacity);
      }

      // Θέλουμε: μικρό waste, μεγάλο sim, λιγότερους used nodes
      // (βάζουμε μικρή ποινή για πολλά nodes)
      return simSum * 1000 - waste - usedNodes * 50;
    }

    // --- Brute force search (216 combos max για 3 VMs)
    let best = null;
    let bestScore = -Infinity;

    // Αν λείπει κάποιο VM (π.χ. user δεν έβαλε DB), μειώνεται ο χώρος αναζήτησης αυτόματα
    const vmIds = vms.map((v) => v.id);

    function dfs(i, assign) {
      if (i === vmIds.length) {
        if (!isFeasibleCapacity(assign)) return;
        if (!isFeasibleBandwidth(assign)) return;

        const s = scoreAssignment(assign);
        if (s > bestScore) {
          bestScore = s;
          best = { ...assign };
        }
        return;
      }

      const vmId = vmIds[i];
      for (const l of providerLetters) {
        assign[vmId] = l;
        // μικρό pruning: capacity partial check
        // (για απλότητα το αφήνουμε, ή μπορείς να το βάλεις πιο μετά)
        dfs(i + 1, assign);
      }
      delete assign[vmId];
    }

    dfs(0, {});

    if (!best) {
      window.alert('No feasible placement found that satisfies CPU/RAM + bandwidth constraints.');
      setPlacement({ nodes: [], edges: { feToBe: bwFeBe, beToDb: bwBeDb } });
      return;
    }

    // --- Build placementNodes output (σαν placeVMs style)
    const load = {};
    for (const l of providerLetters) load[l] = { cpu: 0, memory: 0 };

    for (const vm of vms) {
      const l = best[vm.id];
      load[l].cpu += vm.cpu;
      load[l].memory += vm.memory;
    }

    const nodes = providerLetters.map((letter) => {
      const used = load[letter];
      const availableCpu = nodeCapacity.cpu - used.cpu;
      const availableMemory = nodeCapacity.memory - used.memory;

      const vmsHere = vms
        .filter((vm) => best[vm.id] === letter)
        .map((vm) => ({
          id: vm.id,
          role: vm.role,
          cpu: vm.cpu,
          memory: vm.memory,
          // “placementSimilarity”: εδώ το βάζουμε ως similarity του VM προς το capacity
          placementSimilarity: cosineSimilarity(vm, nodeCapacity),
        }));

      return {
        nodeId: letterToNodeId[letter],
        vms: vmsHere,
        availableCpu,
        availableMemory,
        // avg similarity (optional)
        similarity:
          vmsHere.length === 0
            ? 0
            : vmsHere.reduce((acc, x) => acc + (x.placementSimilarity || 0), 0) / vmsHere.length,
      };
    });

    // Μπορείς να κρατήσεις και edges μέσα στο placement (για το GraphEmbedVisual labels)
    setPlacement({
      nodes,
      edges: { feToBe: bwFeBe, beToDb: bwBeDb },
      assignment: best, // optional debug (ποιο VM πήγε πού)
    });
  };

  return {
    values,
    handleChange,
    handleCalculate,
    placement,
  };
}
