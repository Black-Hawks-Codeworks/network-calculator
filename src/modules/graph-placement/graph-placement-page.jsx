import { useMemo, useState } from 'react';
import styles from './graph-placement-page.module.css';

import CalculatorInput from '@/modules/resource-calc/components/calculator-input';
import { placeVMs } from '@/shared/utils/vm-placement';

import GraphEmbedVisual from './components/graph-embed-visual';

// Θα χρησιμοποιήσουμε τον Graph από το graphs.js (βάλε export class Graph όπως σου έδωσα πριν)
import { Graph } from '@/shared/utils/graphs';

export default function GraphPlacementPage() {
  // ✅ ΜΟΝΟ τα VM requirements (inputs)
  const [requiredResources, setRequiredResources] = useState({
    frontendCpu: 0,
    frontendMemory: 0,
    backendCpu: 0,
    backendMemory: 0,
    dbCpu: 0,
    dbMemory: 0,
  });

  // ✅ output του placeVMs
  const [placementNodes, setPlacementNodes] = useState([]);
  const [hasRun, setHasRun] = useState(false);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setRequiredResources((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  // ✅ ΣΤΑΘΕΡΟ: capacity ανά provider node (κρατάμε RAM internal, αλλά στο σχέδιο θα δείχνεις μόνο CPU)
  const NODE_CAPACITY = useMemo(() => ({ cpu: 20, memory: 32 }), []);

  // ✅ ΣΤΑΘΕΡΟ: 6 provider nodes με ονόματα K L M N O P
  // (cpuShown: είναι αυτό που θα γράφεις με μαύρο πάνω στο node)
  const providerNodesStatic = useMemo(
    () => [
      { id: 'K', cpuShown: 4, cpu: NODE_CAPACITY.cpu, memory: NODE_CAPACITY.memory },
      { id: 'L', cpuShown: 7, cpu: NODE_CAPACITY.cpu, memory: NODE_CAPACITY.memory },
      { id: 'M', cpuShown: 6, cpu: NODE_CAPACITY.cpu, memory: NODE_CAPACITY.memory },
      { id: 'N', cpuShown: 10, cpu: NODE_CAPACITY.cpu, memory: NODE_CAPACITY.memory },
      { id: 'O', cpuShown: 8, cpu: NODE_CAPACITY.cpu, memory: NODE_CAPACITY.memory },
      { id: 'P', cpuShown: 4, cpu: NODE_CAPACITY.cpu, memory: NODE_CAPACITY.memory },
    ],
    [NODE_CAPACITY]
  );

  // ✅ ΣΤΑΘΕΡΟ: provider graph + bandwidth πάνω στις ακμές (κόκκινα νούμερα)
  const providerGraph = useMemo(() => {
    const g = new Graph();

    // add vertices
    providerNodesStatic.forEach((n) => g.addVertex(n.id));

    // connections + BW (άλλαξε τα bw για να ταιριάζουν με του καθηγητή)
    g.addEdge('K', 'L', 6);
    g.addEdge('L', 'M', 7);
    g.addEdge('K', 'N', 5);
    g.addEdge('N', 'O', 6);
    g.addEdge('O', 'L', 8);
    g.addEdge('O', 'M', 8);
    g.addEdge('O', 'P', 6);
    g.addEdge('M', 'P', 5);

    return g;
  }, [providerNodesStatic]);

  // ✅ ΣΤΑΘΕΡΟ: bandwidth requirements στο service graph (FE->BE, BE->DB)
  const serviceEdges = useMemo(
    () => [
      { from: 'frontend-vm-1', to: 'backend-vm-1', bw: 4 },
      { from: 'backend-vm-1', to: 'database-vm-1', bw: 3 },
    ],
    []
  );

  // Service nodes (VMs) από inputs
  const serviceNodes = useMemo(
    () =>
      [
        {
          id: 'frontend-vm-1',
          label: 'FE',
          cpu: requiredResources.frontendCpu,
          memory: requiredResources.frontendMemory,
        },
        {
          id: 'backend-vm-1',
          label: 'BE',
          cpu: requiredResources.backendCpu,
          memory: requiredResources.backendMemory,
        },
        {
          id: 'database-vm-1',
          label: 'DB',
          cpu: requiredResources.dbCpu,
          memory: requiredResources.dbMemory,
        },
      ].filter((n) => n.cpu > 0 && n.memory > 0),
    [requiredResources]
  );

  const handleCalculate = () => {
    // φτιάχνουμε VMs
    const allVms = [
      {
        id: 'frontend-vm-1',
        role: 'frontend',
        cpu: requiredResources.frontendCpu,
        memory: requiredResources.frontendMemory,
      },
      {
        id: 'backend-vm-1',
        role: 'backend',
        cpu: requiredResources.backendCpu,
        memory: requiredResources.backendMemory,
      },
      {
        id: 'database-vm-1',
        role: 'database',
        cpu: requiredResources.dbCpu,
        memory: requiredResources.dbMemory,
      },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);

    // placement με cosine similarity όπως πριν
    const resultNodes = placeVMs(allVms, NODE_CAPACITY);

    setPlacementNodes(resultNodes);
    setHasRun(true);
  };

  return (
    <div className={styles.page}>
      <section className={styles.descriptionBox}>
        <h2 className={styles.title}>Graph Placement</h2>
        <p className={styles.text}>
          Αριστερά: VMs (Frontend/Backend/Database) με απαιτήσεις CPU/RAM από τα inputs.
          Δεξιά: σταθερό provider network με 6 κόμβους (K,L,M,N,O,P) και bandwidth πάνω στις ακμές.
          Η τοποθέτηση γίνεται με greedy best-fit & cosine similarity.
        </p>
      </section>

      <div className={styles.contentRow}>
        {/* Inputs ΜΟΝΟ για VMs */}
        <section className={styles.formCard}>
          <h2 className={styles.formTitle}>VM Requirements</h2>

          <div className={styles.formInner}>
            <div className={styles.groupContainer}>
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Frontend</h3>
                <CalculatorInput id="frontendCpu" label="Frontend CPU" value={requiredResources.frontendCpu} onChange={handleChange} />
                <CalculatorInput
                  id="frontendMemory"
                  label="Frontend Memory"
                  value={requiredResources.frontendMemory}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Backend</h3>
                <CalculatorInput id="backendCpu" label="Backend CPU" value={requiredResources.backendCpu} onChange={handleChange} />
                <CalculatorInput
                  id="backendMemory"
                  label="Backend Memory"
                  value={requiredResources.backendMemory}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Database</h3>
                <CalculatorInput id="dbCpu" label="Database CPU" value={requiredResources.dbCpu} onChange={handleChange} />
                <CalculatorInput
                  id="dbMemory"
                  label="Database Memory"
                  value={requiredResources.dbMemory}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className={styles.calculateButton} onClick={handleCalculate}>
              CALCULATE
            </button>
          </div>
        </section>

        {/* Visualization */}
        <section className={styles.outputBox}>
          <h2 className={styles.bigTitle}>Graph Visualization</h2>

          <div className={styles.graphContainer}>
            <GraphEmbedVisual
              serviceNodes={serviceNodes}
              serviceEdges={serviceEdges}
              providerNodes={providerNodesStatic}
              providerGraph={providerGraph}
              placementNodes={hasRun ? placementNodes : []}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
