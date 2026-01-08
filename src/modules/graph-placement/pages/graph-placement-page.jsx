import useGraphPlacement from '../hooks/useGraphPlacement';
import styles from './graph-placement-page.module.css';

import GraphEmbedVisual from '../components/graph-embed-visual';

import CalculatorInput from '../../resource-calc/components/calculator-input';

// metatrepei ta string se number (an dn ginetai, 0)
function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export default function GraphPlacementPage() {
  // 1) pairnw state/handlers apo to neo hook
  const hook = useGraphPlacement();

  const values = hook.values;
  const handleChange = hook.handleChange;
  const handleCalculate = hook.handleCalculate;

  const placement = hook.placement;
  const providerBw = hook.providerBw;
  const handleProviderBwChange = hook.handleProviderBwChange;

  const error = hook.error;

  // 2) Service nodes emfanizontai mono an CPU & RAM > 0
  const serviceNodes = [
    {
      id: 'frontend-vm-1',
      label: 'FE',
      cpu: toNumber(values.frontendCpu),
      memory: toNumber(values.frontendMemory),
    },
    {
      id: 'backend-vm-1',
      label: 'BE',
      cpu: toNumber(values.backendCpu),
      memory: toNumber(values.backendMemory),
    },
    {
      id: 'database-vm-1',
      label: 'DB',
      cpu: toNumber(values.dbCpu),
      memory: toNumber(values.dbMemory),
    },
  ].filter((n) => n.cpu > 0 && n.memory > 0);

  // 3) Service edges (apaitoumeno BW)
  const serviceEdges = [
    { from: 'frontend-vm-1', to: 'backend-vm-1', bw: toNumber(values.bwFeBe) },
    { from: 'backend-vm-1', to: 'database-vm-1', bw: toNumber(values.bwBeDb) },
  ];

  // 4) elegxw-yparxei estw ena input? 
  const hasAnyInput =
    toNumber(values.frontendCpu) > 0 ||
    toNumber(values.frontendMemory) > 0 ||
    toNumber(values.backendCpu) > 0 ||
    toNumber(values.backendMemory) > 0 ||
    toNumber(values.dbCpu) > 0 ||
    toNumber(values.dbMemory) > 0;

  return (
    <div className={styles.page}>
      
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

      {/* forma k grafos */}
      <div className={styles.contentRow}>
        {/* forma */}
        <section className={styles.formCard}>
          <h2 className={styles.formTitle}>Available Resources : CPU = 20, RAM = 32</h2>

          {/* Error minima */}
          {error && (
            <div
              style={{
                marginTop: 10,
                marginBottom: 10,
                padding: 10,
                borderRadius: 8,
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontWeight: 600,
              }}>
              {error}
            </div>
          )}

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

            {/* Bandwidth */}
            <div className={styles.tierCard}>
              <h3>Bandwidth (Edges)</h3>
              <CalculatorInput id='bwFeBe' label='FE → BE' value={values.bwFeBe} onChange={handleChange} />
              <CalculatorInput id='bwBeDb' label='BE → DB' value={values.bwBeDb} onChange={handleChange} />
            </div>
          </div>

          <button
            className={styles.calculateButton}
            onClick={handleCalculate}
            disabled={!hasAnyInput}
            style={!hasAnyInput ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}>
            CALCULATE
          </button>
        </section>

        {/* grafos*/}
        <section className={styles.graphCard}>
          <h2 className={styles.graphTitle}>Graph Visualization</h2>

          <div className={styles.graphContainer}>
            <GraphEmbedVisual
              serviceNodes={serviceNodes}
              serviceEdges={serviceEdges}
              placementNodes={placement.nodes}
              providerBw={providerBw}
              onProviderBwChange={handleProviderBwChange}
              providerEdgesRemaining={placement.providerEdgesRemaining}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
