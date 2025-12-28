import { useState } from 'react';
import CalculatorInput from './components/calculator-input';
import styles from './page.module.css';

export default function HomePage() {
  const [requiredResources, setRequiredResources] = useState({
    //arhikes times gia kathe input
    frontendCpu: 0,
    frontendMemory: 0,
    backendCpu: 0,
    backendMemory: 0,
    dbCpu: 0,
    dbMemory: 0,
  });

  //otan i timi sto input allazei, diladi onChange...
  //vale sto analogo id to value apo to input
  //metetrpse to se arithmo giati to value ton input einai PANTA string
  const handleChange = (event) => {
    const { id, value } = event.target;
    setRequiredResources((prevState) => ({
      ...prevState,
      [id]: Number(value),
    }));
  };

  //grapse mesa sta inputs merika numera kai pata to calculate
  //des ti vgazei stin consola
  const handleCalculate = () => {
    // edo mesa tha boun ta calculations apo tis diafaneies to Papadimitriou
    console.log('Calculate, for now it just logs the state', requiredResources);
  };
  return (
    <div className={styles.page}>
      {/* ΠΛΑΙΣΙΟ ΠΕΡΙΓΡΑΦΗΣ */}
      <section className={styles.descriptionBox}>
        <h2 className={styles.title}>Network Calculator</h2>
        <p className={styles.text}>
          The Network Calculator helps you optimize VM placement across physical nodes using a greedy algorithm with
          cosine similarity. Add VMs for each tier (frontend, backend, database) by specifying their CPU and memory
          requirements. The tool automatically assigns VMs to nodes, minimizing waste and maximizing resource
          utilization. The cosine similarity metric ensures that VMs are placed on nodes where their resource
          requirements best match the available capacity, preventing scenarios where CPU is wasted due to memory
          constraints. Green circles represent nodes, and each shows which VMs are assigned to it along
          with the similarity score.
        </p>
      </section>

      <div className={styles.contentRow}>
        {/* ΦΟΡΜΑ */}
        <section className={styles.formCard}>
          <h2 className={styles.formTitle}>Form</h2>

          <div className={styles.formInner}>
            {/* FRONTEND */}
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
        </section>

        <section className={styles.outputBox}>{/*εδώ θα εμφανίζονται οι κόμβοι μετά τον υπολογισμό*/}</section>
      </div>
    </div>
  );
}
