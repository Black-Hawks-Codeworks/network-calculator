import GraphInput from './components/graph-input';
import useResourceCalcGraph from './hooks/use-resourse-calc-graph';
import styles from './graph-placement-page.module.css';

export default function GraphPlacementPage() {
  // gia na min skaei 
  const hook = useResourceCalcGraph();
  const values = hook?.values ?? {};
  const handleChange = hook?.handleChange ?? (() => {});
  const handleCalculate = hook?.handleCalculate ?? (() => {});
  const placement = hook?.placement ?? { nodes: [] };

  return (
    <div className={styles.page}>
      {/* DESCRIPTION */}
      <section className={styles.descriptionBox}>
        <h2 className={styles.title}>Graph-Based Network Calculator</h2>
        <p className={styles.text}>
          This page allows users to define the CPU,RAM and bandwidth requirements of a multi-tier application consisting of
          frontend, backend, and database services. For each tier, the user specifies the required CPU resources, as
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
              <GraphInput id='frontendCpu' label='CPU' value={values.frontendCpu} onChange={handleChange} />
              <GraphInput id='frontendMemory' label='RAM' value={values.frontendMemory} onChange={handleChange} />
            </div>

            {/* Backend */}
            <div className={styles.tierCard}>
              <h3>Backend</h3>
              <GraphInput id='backendCpu' label='CPU' value={values.backendCpu} onChange={handleChange} />
              <GraphInput id='backendMemory' label='RAM' value={values.backendMemory} onChange={handleChange} />
            </div>

            {/* Database */}
            <div className={styles.tierCard}>
              <h3>Database</h3>
              <GraphInput id='dbCpu' label='CPU' value={values.dbCpu} onChange={handleChange} />
              <GraphInput id='dbMemory' label='RAM' value={values.dbMemory} onChange={handleChange} />
            </div>

            {/* Bandwidths */}
            <div className={styles.tierCard}>
              <h3>Bandwidth (Edges)</h3>
              <GraphInput id='bwFeBe' label='FE → BE' value={values.bwFeBe} onChange={handleChange} />
              <GraphInput id='bwBeDb' label='BE → DB' value={values.bwBeDb} onChange={handleChange} />
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
            {/* prosorino output gia na vlapw oti doulevei*/}
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(placement, null, 2)}</pre>
          </div>
        </section>
      </div>
    </div>
  );
}
