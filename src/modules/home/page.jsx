import CalculatorInput from './components/calculator-input';
import styles from './page.module.css';

export default function HomePage() {
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
              <CalculatorInput id='frontendInput1' label='Frontend Input 1' />
              <CalculatorInput id='frontendInput2' label='Frontend Input 2' />
            </div>

            {/* BACKEND */}
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>Backend</h3>

              <CalculatorInput id='backendInput1' label='Backend Input 1' />
              <CalculatorInput id='backendInput2' label='Backend Input 2' />
            </div>

            {/* DATABASE */}
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>Database</h3>

              <CalculatorInput id='dbInput1' label='Database Input 1' />
              <CalculatorInput id='dbInput2' label='Database Input 2' />
            </div>
          </div>

          <button className={styles.calculateButton}>CALCULATE</button>
        </section>

        <section className={styles.outputBox}>{/*εδώ θα εμφανίζονται οι κόμβοι μετά τον υπολογισμό*/}</section>
      </div>
    </div>
  );
}
