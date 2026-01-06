import { useState } from 'react';
import { placeVMs } from '@/shared/utils/vm-placement';

const PROVIDER_CAPACITY = {
  K: { cpu: 20, memory: 32 },
  L: { cpu: 20, memory: 32 },
  M: { cpu: 6, memory: 32 },
  N: { cpu: 20, memory: 32 },
  O: { cpu: 8, memory: 32 },
  P: { cpu: 4, memory: 32 },
};

// Τα BW όρια των ακμών του Provider
const PROVIDER_BW = {
  'K-L': 6,
  'L-K': 6,
  'L-M': 7,
  'M-L': 7,
  'K-N': 5,
  'N-K': 5,
  'N-O': 6,
  'O-N': 6,
  'O-L': 8,
  'L-O': 8,
  'O-M': 8,
  'M-O': 8,
  'O-P': 6,
  'P-O': 6,
  'M-P': 5,
  'P-M': 5,
};

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

  const [placement, setPlacement] = useState({ nodes: [], edges: { feToBe: 0, beToDb: 0 } });

  const handleChange = (e) => setValues((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  // Helper για να ελέγχουμε αν υπάρχει σύνδεση και αν το BW επαρκεί
  const checkBwPath = (sourceLetter, destLetter, requiredBw) => {
    if (sourceLetter === destLetter) return true; // Ίδιος κόμβος, απεριόριστο BW
    const edgeKey = `${sourceLetter}-${destLetter}`;
    const limit = PROVIDER_BW[edgeKey];
    if (limit === undefined) return false; // Δεν υπάρχει απευθείας ακμή
    return requiredBw <= limit;
  };

  const handleCalculate = () => {
    const fe = { cpu: Number(values.frontendCpu), mem: Number(values.frontendMemory), id: 'frontend-vm-1' };
    const be = { cpu: Number(values.backendCpu), mem: Number(values.backendMemory), id: 'backend-vm-1' };
    const db = { cpu: Number(values.dbCpu), mem: Number(values.dbMemory), id: 'database-vm-1' };
    const bwFeBe = Number(values.bwFeBe) || 0;
    const bwBeDb = Number(values.bwBeDb) || 0;

    const letters = Object.keys(PROVIDER_CAPACITY);
    let finalAssignment = null;

    // Brute-force αναζήτηση για έγκυρο placement (CPU + RAM + BW)
    // Ψάχνουμε συνδυασμό κόμβων (i, j, k) για τα FE, BE, DB
    for (let i of letters) {
      for (let j of letters) {
        for (let k of letters) {
          const usage = {
            [i]: { cpu: fe.cpu, mem: fe.mem },
            [j]: { cpu: (j === i ? 0 : 0) + be.cpu, mem: (j === i ? 0 : 0) + be.mem },
            [k]: { cpu: 0, mem: 0 },
          };

          // Σωστός υπολογισμός αθροιστικού usage αν μπαίνουν στον ίδιο κόμβο
          const currentUsage = {};
          letters.forEach((l) => (currentUsage[l] = { cpu: 0, mem: 0 }));

          currentUsage[i].cpu += fe.cpu;
          currentUsage[i].mem += fe.mem;
          currentUsage[j].cpu += be.cpu;
          currentUsage[j].mem += be.mem;
          currentUsage[k].cpu += db.cpu;
          currentUsage[k].mem += db.mem;

          // 1. Έλεγχος CPU/RAM
          const resourceOk = letters.every(
            (l) => currentUsage[l].cpu <= PROVIDER_CAPACITY[l].cpu && currentUsage[l].mem <= PROVIDER_CAPACITY[l].memory
          );

          if (!resourceOk) continue;

          // 2. Έλεγχος Bandwidth Constraints
          const bwOk = checkBwPath(i, j, bwFeBe) && checkBwPath(j, k, bwBeDb);

          if (bwOk) {
            finalAssignment = { [fe.id]: i, [be.id]: j, [db.id]: k };
            break;
          }
        }
        if (finalAssignment) break;
      }
      if (finalAssignment) break;
    }

    if (!finalAssignment) {
      window.alert('No feasible placement found (Check Resources or BW limits).');
      return;
    }

    // Build placement nodes for Graph
    const allVms = [
      { ...fe, role: 'frontend' },
      { ...be, role: 'backend' },
      { ...db, role: 'database' },
    ];

    const nodes = letters.map((letter) => {
      const vmsHere = allVms.filter((vm) => finalAssignment[vm.id] === letter);
      const usedCpu = vmsHere.reduce((sum, v) => sum + v.cpu, 0);
      const usedMem = vmsHere.reduce((sum, v) => sum + v.mem, 0);

      return {
        nodeId: LETTER_TO_NODE_ID[letter],
        vms: vmsHere,
        totalCpu: PROVIDER_CAPACITY[letter].cpu,
        availableCpu: PROVIDER_CAPACITY[letter].cpu - usedCpu,
        availableMemory: PROVIDER_CAPACITY[letter].memory - usedMem,
      };
    });

    setPlacement({ nodes, edges: { feToBe: bwFeBe, beToDb: bwBeDb } });
  };

  return { values, handleChange, handleCalculate, placement };
}
