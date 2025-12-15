import { useState } from 'react';
import CalculatorInput from './components/calculator-input';
import styles from './page.module.css';

export default function HomePage() {
  const [frontendCpu, setFrontendCpu] = useState(0);
  const [frontendMemory, setFrontendMemory] = useState(0);
  const [backendCpu, setBackendCpu] = useState(0);
  const [backendMemory, setBackendMemory] = useState(0);
  const [dbCpu, setDbCpu] = useState(0);
  const [dbMemory, setDbMemory] = useState(0);

  const handleFrontendCpuChange = (event) => {
    setFrontendCpu(event.target.value);
  };

  const handleFrontendMemoryChange = (event) => {
    setFrontendMemory(event.target.value);
  };

  const handleBackendCpuChange = (event) => {
    setBackendCpu(event.target.value);
  };

  const handleBackendMemoryChange = (event) => {
    setBackendMemory(event.target.value);
  };

  const handleDbCpuChange = (event) => {
    setDbCpu(event.target.value);
  };

  const handleDbMemoryChange = (event) => {
    setDbMemory(event.target.value);
  };

  const handleCalculate = () => {
    console.log('Calculate');
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
                value={frontendCpu}
                onChange={handleFrontendCpuChange}
              />
              <CalculatorInput
                id='frontendMemory'
                label='Frontend Memory'
                value={frontendMemory}
                onChange={handleFrontendMemoryChange}
              />
            </div>

            {/* BACKEND */}
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>Backend</h3>

              <CalculatorInput
                id='backendCpu'
                label='Backend CPU'
                value={backendCpu}
                onChange={handleBackendCpuChange}
              />
              <CalculatorInput
                id='backendMemory'
                label='Backend Memory'
                value={backendMemory}
                onChange={handleBackendMemoryChange}
              />
            </div>

            {/* DATABASE */}
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>Database</h3>

              <CalculatorInput id='dbCpu' label='Database CPU' value={dbCpu} onChange={handleDbCpuChange} />
              <CalculatorInput id='dbMemory' label='Database Memory' value={dbMemory} onChange={handleDbMemoryChange} />
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
