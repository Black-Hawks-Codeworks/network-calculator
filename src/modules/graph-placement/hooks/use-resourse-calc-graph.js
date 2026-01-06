import { useState } from 'react';
import { placeVMs } from '@/shared/utils/vm-placement';

// ✅ ΣΤΑΘΕΡΑ: capacities για κάθε provider node (K..P)
const PROVIDER_CAPACITY = {
  K: { cpu: 20, memory: 32 },
  L: { cpu: 20, memory: 32 },
  M: { cpu: 6, memory: 32 },
  N: { cpu: 20, memory: 32 },
  O: { cpu: 8, memory: 32 },
  P: { cpu: 4, memory: 32 },
};

// mapping placeVMs nodeId (1..6) -> letter (K..P)
const NODE_ID_TO_LETTER = { 1: 'K', 2: 'L', 3: 'M', 4: 'N', 5: 'O', 6: 'P' };
const LETTER_TO_NODE_ID = { K: 1, L: 2, M: 3, N: 4, O: 5, P: 6 };

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

  // placement κρατάει nodes + edges
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
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  // ✅ helper: επιστρέφει το γράμμα (K..P) όπου μπήκε ένα VM, από τα nodes (nodeId 1..6)
  function findPlacedLetter(nodes, vmId) {
    for (const node of nodes) {
      const hit = (node.vms || []).find((v) => v.id === vmId);
      if (hit) return NODE_ID_TO_LETTER[node.nodeId];
    }
    return null;
  }

  // ✅ helper: υπολογίζει usage CPU/RAM ανά γράμμα
  function calcUsageByLetter(assignment, allVms) {
    const usage = {};
    Object.keys(PROVIDER_CAPACITY).forEach((l) => (usage[l] = { cpu: 0, memory: 0 }));

    for (const vm of allVms) {
      const letter = assignment[vm.id];
      if (!letter) continue;
      usage[letter].cpu += vm.cpu;
      usage[letter].memory += vm.memory;
    }
    return usage;
  }

  // ✅ helper: ελέγχει αν χωράνε σε κάθε provider node (με τα δικά του capacities)
  function isFeasible(assignment, allVms) {
    const usage = calcUsageByLetter(assignment, allVms);

    for (const letter of Object.keys(PROVIDER_CAPACITY)) {
      if (usage[letter].cpu > PROVIDER_CAPACITY[letter].cpu) return false;
      if (usage[letter].memory > PROVIDER_CAPACITY[letter].memory) return false;
    }
    return true;
  }

  // ✅ helper: μετατρέπει assignment K..P -> placementNodes format (nodeId 1..6) για GraphEmbedVisual
  function buildPlacementNodesFromAssignment(assignment, allVms) {
    const usage = calcUsageByLetter(assignment, allVms);

    // φτιάχνουμε nodes 1..6 με βάση γράμματα K..P
    const letters = ['K', 'L', 'M', 'N', 'O', 'P'];

    return letters.map((letter) => {
      const nodeId = LETTER_TO_NODE_ID[letter];
      const cap = PROVIDER_CAPACITY[letter];

      const vmsHere = allVms
        .filter((vm) => assignment[vm.id] === letter)
        .map((vm) => ({
          ...vm,
          placementSimilarity: vm.placementSimilarity ?? 0, // αν δεν υπάρχει, 0
        }));

      return {
        nodeId,
        vms: vmsHere,
        similarity: 0,
        availableCpu: cap.cpu - usage[letter].cpu,
        availableMemory: cap.memory - usage[letter].memory,
      };
    });
  }

  const handleCalculate = () => {
    // strings -> numbers (κενό => 0)
    const frontendCpu = values.frontendCpu === '' ? 0 : Number(values.frontendCpu);
    const frontendMemory = values.frontendMemory === '' ? 0 : Number(values.frontendMemory);
    const backendCpu = values.backendCpu === '' ? 0 : Number(values.backendCpu);
    const backendMemory = values.backendMemory === '' ? 0 : Number(values.backendMemory);
    const dbCpu = values.dbCpu === '' ? 0 : Number(values.dbCpu);
    const dbMemory = values.dbMemory === '' ? 0 : Number(values.dbMemory);

    const bwFeBe = values.bwFeBe === '' ? 0 : Number(values.bwFeBe);
    const bwBeDb = values.bwBeDb === '' ? 0 : Number(values.bwBeDb);

    const allNums = [frontendCpu, frontendMemory, backendCpu, backendMemory, dbCpu, dbMemory, bwFeBe, bwBeDb];

    // NaN
    if (allNums.some((v) => Number.isNaN(v))) {
      window.alert('Please enter valid numbers only.');
      resetInputs();
      setPlacement({ nodes: [], edges: { feToBe: 0, beToDb: 0 } });
      return;
    }

    // αρνητικά
    if (allNums.some((v) => v < 0)) {
      window.alert('Please enter non-negative values only.');
      resetInputs();
      setPlacement({ nodes: [], edges: { feToBe: 0, beToDb: 0 } });
      return;
    }

    // max check (για να μη βάλει VM μεγαλύτερο από ΟΠΟΙΟΔΗΠΟΤΕ κόμβο)
    const maxCpu = Math.max(...Object.values(PROVIDER_CAPACITY).map((c) => c.cpu));
    const maxMem = Math.max(...Object.values(PROVIDER_CAPACITY).map((c) => c.memory));

    if ([frontendCpu, backendCpu, dbCpu].some((v) => v > maxCpu)) {
      window.alert(`CPU value is too large (max ${maxCpu}).`);
      resetInputs();
      setPlacement({ nodes: [], edges: { feToBe: 0, beToDb: 0 } });
      return;
    }

    if ([frontendMemory, backendMemory, dbMemory].some((v) => v > maxMem)) {
      window.alert(`RAM value is too large (max ${maxMem}).`);
      resetInputs();
      setPlacement({ nodes: [], edges: { feToBe: 0, beToDb: 0 } });
      return;
    }

    // VMs
    const allVms = [
      { id: 'frontend-vm-1', role: 'frontend', cpu: frontendCpu, memory: frontendMemory },
      { id: 'backend-vm-1', role: 'backend', cpu: backendCpu, memory: backendMemory },
      { id: 'database-vm-1', role: 'database', cpu: dbCpu, memory: dbMemory },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);

    if (allVms.length === 0) {
      setPlacement({ nodes: [], edges: { feToBe: bwFeBe, beToDb: bwBeDb } });
      return;
    }

    // ✅ Trick: χρησιμοποιούμε placeVMs με capacity = MAX (ώστε να βγάλει assignment),
    // και μετά εφαρμόζουμε το “true capacity” ανά γράμμα με feasibility.
    const maxCapacityForAlgorithm = { cpu: maxCpu, memory: maxMem };

    const resultNodes = placeVMs(allVms, maxCapacityForAlgorithm);

    // φτιάχνουμε assignment VM -> γράμμα (K..P)
    const assignment = {};
    for (const vm of allVms) {
      const letter = findPlacedLetter(resultNodes, vm.id);
      if (letter) assignment[vm.id] = letter;
    }

    // ✅ αν δεν είναι feasible με τα πραγματικά capacities, κάνε fallback απλό:
    // βάζουμε κάθε VM στον "πρώτο" κόμβο που χωράει.
    if (!isFeasible(assignment, allVms)) {
      const letters = ['K', 'L', 'M', 'N', 'O', 'P'];
      const fallback = {};
      const used = {};
      letters.forEach((l) => (used[l] = { cpu: 0, memory: 0 }));

      for (const vm of allVms) {
        let placed = false;
        for (const l of letters) {
          const cap = PROVIDER_CAPACITY[l];
          if (used[l].cpu + vm.cpu <= cap.cpu && used[l].memory + vm.memory <= cap.memory) {
            used[l].cpu += vm.cpu;
            used[l].memory += vm.memory;
            fallback[vm.id] = l;
            placed = true;
            break;
          }
        }
        if (!placed) {
          window.alert('No feasible placement with the given per-node capacities.');
          setPlacement({ nodes: [], edges: { feToBe: bwFeBe, beToDb: bwBeDb } });
          return;
        }
      }

      const nodes = buildPlacementNodesFromAssignment(fallback, allVms);
      setPlacement({ nodes, edges: { feToBe: bwFeBe, beToDb: bwBeDb } });
      return;
    }

    // ✅ normal case
    const nodes = buildPlacementNodesFromAssignment(assignment, allVms);

    setPlacement({
      nodes,
      edges: { feToBe: bwFeBe, beToDb: bwBeDb },
    });
  };

  return {
    values,
    handleChange,
    handleCalculate,
    placement,
  };
}
