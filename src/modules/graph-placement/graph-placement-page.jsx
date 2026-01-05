import { useState } from 'react';
import styles from './graph-placement-page.module.css';

import CalculatorInput from '@/modules/resource-calc/components/calculator-input';
import { placeVMs } from '@/shared/utils/vm-placement';

import GraphEmbedVisual from './components/graph-embed-visual';

export default function GraphPlacementPage() {
  const [requiredResources, setRequiredResources] = useState({
    frontendCpu: 0,
    frontendMemory: 0,
    backendCpu: 0,
    backendMemory: 0,
    dbCpu: 0,
    dbMemory: 0,
    bwFeBe: 0,
    bwBeDb: 0,
  });

  const [infra, setInfra] = useState({
  nodeCpu: 20,
  nodeMemory: 32,
  maxNodes: 4,       // πόσους physical nodes επιτρέπεις να ανοίξει
  linkBw: 10,        // bandwidth capacity μεταξύ διαφορετικών nodes (απλοποιημένο)
});


  const [nodes, setNodes] = useState([]); // <-- nodes from placeVMs
  const [hasRun, setHasRun] = useState(false);

  const handleChange = (event) => {
    const { id, value } = event.target;
    setRequiredResources((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const handleInfraChange = (event) => {
  const { id, value } = event.target;
  setInfra((prev) => ({
    ...prev,
    [id]: Number(value),
  }));
};


  const handleCalculate = () => {
    const nodeCapacity = { cpu: infra.nodeCpu, memory: infra.nodeMemory };

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

const resultNodes = placeVMs(allVms, nodeCapacity);

if (resultNodes.length > infra.maxNodes) {
  // δεν "κόβουμε" το placement (για να μη σκάσει), απλά προειδοποίηση
  console.warn(`Placement uses ${resultNodes.length} nodes, exceeds maxNodes=${infra.maxNodes}`);
}

setNodes(resultNodes);
setHasRun(true);

  };

  // Service graph: FE -> BE -> DB
  const serviceNodes = [
    { id: 'frontend-vm-1', label: 'FE', cpu: requiredResources.frontendCpu, memory: requiredResources.frontendMemory },
    { id: 'backend-vm-1', label: 'BE', cpu: requiredResources.backendCpu, memory: requiredResources.backendMemory },
    { id: 'database-vm-1', label: 'DB', cpu: requiredResources.dbCpu, memory: requiredResources.dbMemory },
  ].filter(n => n.cpu > 0 && n.memory > 0);

  const serviceEdges = [
    ['frontend-vm-1', 'backend-vm-1'],
    ['backend-vm-1', 'database-vm-1'],
  ].filter(([a, b]) => serviceNodes.some(n => n.id === a) && serviceNodes.some(n => n.id === b));

  return (
    <div className={styles.page}>
      <section className={styles.descriptionBox}>
        <h2 className={styles.title}>Graph Placement (based on placeVMs)</h2>
        <p className={styles.text}>
          Η σελίδα αυτή οπτικοποιεί τον γράφο υπηρεσίας (Frontend → Backend → Database) και την αντιστοίχισή του
          σε φυσικούς κόμβους. Η αντιστοίχιση προκύπτει από τον ίδιο greedy best-fit αλγόριθμο με cosine similarity
          που χρησιμοποιείται στο Resource Calc ({`placeVMs`}).
        </p>
      </section>

      <div className={styles.contentRow}>
        {/* Inputs */}
        <section className={styles.formCard}>
          <h2 className={styles.formTitle}>Available Resources : CPU = 20, MEMORY = 32</h2>

          <div className={styles.formInner}>
            <div className={styles.groupContainer}>
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Frontend</h3>
                <CalculatorInput id="frontendCpu" label="Frontend CPU" value={requiredResources.frontendCpu} onChange={handleChange} />
                <CalculatorInput id="frontendMemory" label="Frontend Memory" value={requiredResources.frontendMemory} onChange={handleChange} />
              </div>

              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Backend</h3>
                <CalculatorInput id="backendCpu" label="Backend CPU" value={requiredResources.backendCpu} onChange={handleChange} />
                <CalculatorInput id="backendMemory" label="Backend Memory" value={requiredResources.backendMemory} onChange={handleChange} />
              </div>

              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Database</h3>
                <CalculatorInput id="dbCpu" label="Database CPU" value={requiredResources.dbCpu} onChange={handleChange} />
                <CalculatorInput id="dbMemory" label="Database Memory" value={requiredResources.dbMemory} onChange={handleChange} />
              </div>
<div className={styles.group}>
  <h3 className={styles.groupTitle}>System Requirements</h3>

  <CalculatorInput
    id="nodeCpu"
    label="Node CPU Capacity"
    value={infra.nodeCpu}
    onChange={handleInfraChange}
  />

  <CalculatorInput
    id="nodeMemory"
    label="Node RAM Capacity"
    value={infra.nodeMemory}
    onChange={handleInfraChange}
  />

  <CalculatorInput
    id="maxNodes"
    label="Max # of Nodes"
    value={infra.maxNodes}
    onChange={handleInfraChange}
  />

  <CalculatorInput
    id="linkBw"
    label="Inter-node Link BW"
    value={infra.linkBw}
    onChange={handleInfraChange}
  />
</div>

<div className={styles.group}>
  <h3 className={styles.groupTitle}>Bandwidth Requirements</h3>

  <CalculatorInput
    id="bwFeBe"
    label="FE → BE Bandwidth"
    value={requiredResources.bwFeBe}
    onChange={handleChange}
  />

  <CalculatorInput
    id="bwBeDb"
    label="BE → DB Bandwidth"
    value={requiredResources.bwBeDb}
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
              providerNodes={hasRun ? nodes : []}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
