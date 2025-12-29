import CalculatorInput from './components/calculator-input';
import styles from './resource-calc-page.module.css';
import PlacementOutput from './components/placement-output';
import useResourceCalc from './hooks/use-resource-calc';

export default function ResourceCalcPage() {
  //metefera tin 'logiki' se ena custom hook gia na einai pio euanagnosto
  //to component. to kano destructure gia na paro ta aparaitita...
  const { requiredResources, handleChange, handleCalculate, placement } = useResourceCalc();

  return (
    <div className={styles.page}>
      {/* ΠΕΡΙΓΡΑΦΗΣ */}
      <section className={styles.descriptionBox}>
        <h2 className={styles.title}>Network Calculator</h2>
        <p className={styles.text}>
          The Network Calculator helps you optimize VM placement across physical nodes using a greedy algorithm guided
          by cosine similarity. Enter the CPU and memory requirements for VMs in each tier (frontend, backend,
          database), and the tool automatically assigns them to nodes to reduce resource waste and improve overall
          utilization. Cosine similarity is used to match each VM’s resource profile with the node’s currently available
          CPU and memory, avoiding cases where one resource (for example, CPU) remains unused because the other resource
          (memory) becomes the bottleneck. The results are shown visually: each green circle represents a node, and the
          list inside each node shows the VMs assigned to it along with their similarity score.
        </p>
      </section>

      <div className={styles.contentRow}>
        {/* ΦΟΡΜΑ */}
        <section className={styles.formCard}>
          <h2 className={styles.formTitle}> Available Resources : CPU = 20, MEMORY = 32</h2>

          <div className={styles.formInner}>
            {/* FRONTEND */}
            <div className={styles.groupContainer}>
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Frontend</h3>
                <CalculatorInput
                  id='frontendCpu'
                  label='Frontend CPU'
                  value={requiredResources.frontendCpu}
                  onChange={handleChange}
                />
                <CalculatorInput
                  id='frontendMemory'
                  label='Frontend Memory'
                  value={requiredResources.frontendMemory}
                  onChange={handleChange}
                />
              </div>

              {/* BACKEND */}
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Backend</h3>

                <CalculatorInput
                  id='backendCpu'
                  label='Backend CPU'
                  value={requiredResources.backendCpu}
                  onChange={handleChange}
                />
                <CalculatorInput
                  id='backendMemory'
                  label='Backend Memory'
                  value={requiredResources.backendMemory}
                  onChange={handleChange}
                />
              </div>

              {/* DATABASE */}
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Database</h3>

                <CalculatorInput
                  id='dbCpu'
                  label='Database CPU'
                  value={requiredResources.dbCpu}
                  onChange={handleChange}
                />
                <CalculatorInput
                  id='dbMemory'
                  label='Database Memory'
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

        <section className={styles.outputBox}>
          <PlacementOutput placement={placement} />
        </section>
      </div>
    </div>
  );
}
