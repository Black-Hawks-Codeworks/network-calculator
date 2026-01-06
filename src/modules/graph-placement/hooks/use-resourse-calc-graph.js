import { useState } from 'react';

const PROVIDER_CAPACITY = {
  K: { cpu: 20, memory: 32 },
  L: { cpu: 20, memory: 32 },
  M: { cpu: 6, memory: 32 },
  N: { cpu: 20, memory: 32 },
  O: { cpu: 8, memory: 32 },
  P: { cpu: 4, memory: 32 },
};

// Provider Edge Bandwidth Limits
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

// Helper: Calculate Cosine Similarity
// Used to generate the "Sim" score for the visual graph
const calculateCosineSimilarity = (usedCpu, usedMem, totalCpu, totalMem) => {
  const dotProduct = usedCpu * totalCpu + usedMem * totalMem;
  const magUsed = Math.sqrt(usedCpu ** 2 + usedMem ** 2);
  const magTotal = Math.sqrt(totalCpu ** 2 + totalMem ** 2);

  // Prevent division by zero
  if (magUsed === 0 || magTotal === 0) return 0;

  return dotProduct / (magUsed * magTotal);
};

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

  // Helper to check Bandwidth connectivity
  const checkBwPath = (sourceLetter, destLetter, requiredBw) => {
    if (sourceLetter === destLetter) return true;
    const edgeKey = `${sourceLetter}-${destLetter}`;
    const limit = PROVIDER_BW[edgeKey];
    if (limit === undefined) return false;
    return requiredBw <= limit;
  };

  const handleCalculate = () => {
    // 1. Prepare Data
    const fe = { cpu: Number(values.frontendCpu) || 0, mem: Number(values.frontendMemory) || 0, id: 'frontend-vm-1' };
    const be = { cpu: Number(values.backendCpu) || 0, mem: Number(values.backendMemory) || 0, id: 'backend-vm-1' };
    const db = { cpu: Number(values.dbCpu) || 0, mem: Number(values.dbMemory) || 0, id: 'database-vm-1' };
    const bwFeBe = Number(values.bwFeBe) || 0;
    const bwBeDb = Number(values.bwBeDb) || 0;

    // --- 🚨 VALIDATION CHECK 🚨 ---
    const totalCpuRequested = fe.cpu + be.cpu + db.cpu;
    const totalMemRequested = fe.mem + be.mem + db.mem;

    // If no resources have been entered, show alert and stop.
    if (totalCpuRequested === 0 && totalMemRequested === 0) {
      window.alert('Please enter CPU and RAM values for the services before calculating.');
      return;
    }
    // -----------------------------

    const letters = Object.keys(PROVIDER_CAPACITY);
    let finalAssignment = null;

    // 2. Brute-force placement algorithm
    for (let i of letters) {
      for (let j of letters) {
        for (let k of letters) {
          const currentUsage = {};
          letters.forEach((l) => (currentUsage[l] = { cpu: 0, mem: 0 }));

          currentUsage[i].cpu += fe.cpu;
          currentUsage[i].mem += fe.mem;
          currentUsage[j].cpu += be.cpu;
          currentUsage[j].mem += be.mem;
          currentUsage[k].cpu += db.cpu;
          currentUsage[k].mem += db.mem;

          // Check Resources (CPU & RAM limits)
          const resourceOk = letters.every(
            (l) => currentUsage[l].cpu <= PROVIDER_CAPACITY[l].cpu && currentUsage[l].mem <= PROVIDER_CAPACITY[l].memory
          );
          if (!resourceOk) continue;

          // Check Bandwidth
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

    // 3. Build Graph Data for Visualization
    const allVms = [
      { ...fe, role: 'frontend' },
      { ...be, role: 'backend' },
      { ...db, role: 'database' },
    ];

    const nodes = letters.map((letter) => {
      const vmsHere = allVms.filter((vm) => finalAssignment[vm.id] === letter);

      const usedCpu = vmsHere.reduce((sum, v) => sum + v.cpu, 0);
      const usedMem = vmsHere.reduce((sum, v) => sum + v.mem, 0);

      const totalCpu = PROVIDER_CAPACITY[letter].cpu;
      const totalMem = PROVIDER_CAPACITY[letter].memory;

      // Calculate the Cosine Similarity for the visual badge
      const sim = calculateCosineSimilarity(usedCpu, usedMem, totalCpu, totalMem);

      return {
        nodeId: LETTER_TO_NODE_ID[letter],
        vms: vmsHere,
        totalCpu: totalCpu,
        availableCpu: totalCpu - usedCpu,
        availableMemory: totalMem - usedMem,
        cosineSimilarity: sim, // Passed to the Visual component
      };
    });

    setPlacement({ nodes, edges: { feToBe: bwFeBe, beToDb: bwBeDb } });
  };

  return { values, handleChange, handleCalculate, placement };
}
