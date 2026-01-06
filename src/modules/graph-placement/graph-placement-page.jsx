//import GraphInput from './components/graph-input';
import useResourceCalcGraph from './hooks/use-resourse-calc-graph';
import styles from './graph-placement-page.module.css';
import GraphEmbedVisual from './components/graph-embed-visual';
import CalculatorInput from '../resource-calc/components/calculator-input';

export default function GraphPlacementPage() {
  // gia na min skaei
  const hook = useResourceCalcGraph();
  const values = hook?.values ?? {};
  const handleChange = hook?.handleChange ?? (() => {});
  const handleCalculate = hook?.handleCalculate ?? (() => {});
  const placement = hook?.placement ?? { nodes: [] };

  const serviceNodes = [
    {
      id: 'frontend-vm-1',
      label: 'FE',
      cpu: Number(values.frontendCpu || 0),
      memory: Number(values.frontendMemory || 0),
    },
    {
      id: 'backend-vm-1',
      label: 'BE',
      cpu: Number(values.backendCpu || 0),
      memory: Number(values.backendMemory || 0),
    },
    {
      id: 'database-vm-1',
      label: 'DB',
      cpu: Number(values.dbCpu || 0),
      memory: Number(values.dbMemory || 0),
    },
  ].filter((n) => n.cpu > 0 && n.memory > 0);

  const serviceEdges = [
    { from: 'frontend-vm-1', to: 'backend-vm-1', bw: Number(values.bwFeBe || 0) },
    { from: 'backend-vm-1', to: 'database-vm-1', bw: Number(values.bwBeDb || 0) },
  ];

  return (
    <div className={styles.page}>
      {/* DESCRIPTION */}
      <section className={styles.descriptionBox}>
        <h2 className={styles.title}>Graph-Based Network Calculator</h2>
        <p className={styles.text}>
          This page allows users to define the CPU,RAM and bandwidth requirements of a multi-tier application consisting
          of frontend, backend, and database services. For each tier, the user specifies the required CPU resources, as
          well as the bandwidth demands between interconnected services. Using these inputs, the system computes a
          resource-aware placement of virtual machines onto physical nodes and presents the result alongside a graphical
          representation of the service graph. This visualization helps illustrate both the allocation of computing
          resources and the network relationships between application components.
        </p>
      </section>

      {/* FORM kai GRAPH  */}
      <div className={styles.contentRow}>
        <section className={styles.formCard}>
          <h2 className={styles.formTitle}>Available Resources : CPU = 20, RAM=32, BANDWIDTH = 150</h2>

          <div className={styles.tiersRow}>
            {/* Frontend */}
            <div className={styles.tierCard}>
              <h3>Frontend</h3>
              <CalculatorInput id='frontendCpu' label='CPU' value={values.frontendCpu} onChange={handleChange} />
              <CalculatorInput id='frontendMemory' label='RAM' value={values.frontendMemory} onChange={handleChange} />
            </div>

            {/* Backend */}
            <div className={styles.tierCard}>
              <h3>Backend</h3>
              <CalculatorInput id='backendCpu' label='CPU' value={values.backendCpu} onChange={handleChange} />
              <CalculatorInput id='backendMemory' label='RAM' value={values.backendMemory} onChange={handleChange} />
            </div>

            {/* Database */}
            <div className={styles.tierCard}>
              <h3>Database</h3>
              <CalculatorInput id='dbCpu' label='CPU' value={values.dbCpu} onChange={handleChange} />
              <CalculatorInput id='dbMemory' label='RAM' value={values.dbMemory} onChange={handleChange} />
            </div>

            {/* Bandwidths */}
            <div className={styles.tierCard}>
              <h3>Bandwidth (Edges)</h3>
              <CalculatorInput id='bwFeBe' label='FE → BE' value={values.bwFeBe} onChange={handleChange} />
              <CalculatorInput id='bwBeDb' label='BE → DB' value={values.bwBeDb} onChange={handleChange} />
            </div>
          </div>

          <button className={styles.calculateButton} onClick={handleCalculate}>
            CALCULATE
          </button>
        </section>

        {/* GRAPH / OUTPUT */}
        <section className={styles.graphCard}>
          <h2 className={styles.graphTitle}>Graph Visualization</h2>

          <div className={styles.graphContainer}>
            {/* prosorino output gia na vlapw*/}
            <GraphEmbedVisual
              serviceNodes={serviceNodes}
              serviceEdges={serviceEdges}
              placementNodes={placement.nodes}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
