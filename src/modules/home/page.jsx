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
          The Network Calculator is a simple tool that helps you estimate how many system resources you need based on
          user input. It takes values related to frontend, backend, and database load, and calculates how many instances
          (nodes) are required for each part of the system. After you press Calculate, the tool visually displays the
          required nodes as green circles on the right side of the page. Each node represents one instance needed for
          the workload you entered. This tool is designed to give a quick, visual understanding of how much capacity
          your system needs under different conditions.
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
