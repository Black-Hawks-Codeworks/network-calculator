import { cosineSimilarity } from './cos-similarity';

/**
 * VM Placement Algorithm (Greedy Algorithm - aplistos algorthi8mos)
 * Topothethei ta vms se nodes wste na xrhsimopoihthoun oso to dunaton ligotera nodes efficiently
 *
 * @param {Array} vms - Lista VMs [{id, cpu, memory}]
 * @param {Object} nodeCapacity - {cpu: number, memory: number}
 * @returns {Array} Nodes me assigned VMs
 */

export function placeVMs(vms, nodeCapacity) {
  if (!vms || vms.length === 0) return [];

  // ta megalutera vms prwta / size = memory + cpu
  const sortedVms = [...vms].sort((a, b) => {
    const sizeA = a.cpu + a.memory;
    const sizeB = b.cpu + b.memory;
    return sizeB - sizeA;
  });

  const nodes = [];

  for (const vm of sortedVms) {
    // edge case: an ena VM den xwraei oute se adeio node, den ginetai placement
    // giati: an cpu > capacity.cpu h memory > capacity.memory, tote tha vgoun arnhtika remaining
    if (vm.cpu > nodeCapacity.cpu || vm.memory > nodeCapacity.memory) {
      throw new Error(
        `VM ${vm.id} does not fit in an empty node (VM: ${vm.cpu}/${vm.memory}, node: ${nodeCapacity.cpu}/${nodeCapacity.memory})`
      );
    }
    // track variables initialization

    let bestNode = null;
    let bestSimilarity = -1;

    // check se kathe node gia to an xwrane ta req's sta prosferomena apo to vm resources.

    for (const node of nodes) {
      const canFit = node.availableCpu >= vm.cpu && node.availableMemory >= vm.memory;

      if (!canFit) continue; // an den xwraei skipparw kai sunexizw search

      // vars gia upologismo efficiency fit, poso kala xwraei

      const vmVector = [vm.cpu, vm.memory];
      const availableVector = [node.availableCpu, node.availableMemory];
      const similarity = cosineSimilarity(vmVector, availableVector);

      // update track metablites an brhkame kalutero
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestNode = node;
      }
    }
    // placement

    if (bestNode) {
      // placement Similarity = s_u^i opws sto slide (requested vs available)
      const placedVm = { ...vm, placementSimilarity: bestSimilarity };

      bestNode.vms.push(placedVm);
      bestNode.availableCpu -= vm.cpu;
      bestNode.availableMemory -= vm.memory;

      bestNode.totalSimilarity += bestSimilarity;
      // average similarity gia oloklhro node (summary metric)
      bestNode.similarity = bestNode.totalSimilarity / bestNode.vms.length;
    } else {
      // den xwraei poythena / dhmiourgei neo node
      const vmVector = [vm.cpu, vm.memory];
      const capacityVector = [nodeCapacity.cpu, nodeCapacity.memory];
      // s_u^i gia neo node = similarity(requested, available=capacity)
      const firstSimilarity = cosineSimilarity(vmVector, capacityVector);

      // apothikeuw to per-VM similarity mesa sto VM
      const placedVm = { ...vm, placementSimilarity: firstSimilarity };

      nodes.push({
        nodeId: nodes.length + 1,
        vms: [placedVm],
        availableCpu: nodeCapacity.cpu - vm.cpu,
        availableMemory: nodeCapacity.memory - vm.memory,
        totalSimilarity: firstSimilarity,
        similarity: firstSimilarity,
      });
    }
  }
  return nodes;
}

/* VMs (sorted): [VM1(8,16), VM2(4,8), VM3(2,4)]
Node capacity: 10 CPU, 20 GB

Step 1: VM1(8,16)
  - Κανένα node δεν υπάρχει
  - Δημιούργησε Node 1
  - Node 1: [VM1], available: 2 CPU, 4 GB

Step 2: VM2(4,8)
  - Check Node 1: 2 CPU < 4 CPU needed  (δεν χωράει)
  - Δημιούργησε Node 2
  - Node 2: [VM2], available: 6 CPU, 12 GB

Step 3: VM3(2,4)
  - Check Node 1: 2 CPU >= 2 , 4 GB >= 4  (χωράει)
  - Similarity([2,4], [2,4]) = 1.0 (perfect)
  - Check Node 2: 6 CPU >= 2 , 12 GB >= 4  (χωράει)
  - Similarity([2,4], [6,12]) = 1.0 (ίδιες αναλογίες)
  - Και τα δύο ίδια -> πάρε το πρώτο (Node 1)
  - Node 1: [VM1, VM3]

Result: 2 nodes
*/
