import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* ΠΛΑΙΣΙΟ ΠΕΡΙΓΡΑΦΗΣ */}
      <section className={styles.descriptionBox}>
        <h1 className={styles.title}>Network Calculator</h1>
        <p className={styles.text}>
          The Network Calculator is a simple tool that helps you estimate how many system resources you need based on
          user input. It takes values related to frontend, backend, and database load (such as requests, throughput, or
          queries), and calculates how many instances (nodes) are required for each part of the system. After you press
          Calculate, the tool visually displays the required nodes as green circles on the right side of the page. Each
          node represents one instance needed for the workload you entered. This tool is designed to give a quick,
          visual understanding of how much capacity your system needs under different conditions.
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

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Frontend Input 1</span>
                <input className={styles.fieldInput} type='number' placeholder='Enter value' />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Frontend Input 2</span>
                <input className={styles.fieldInput} type='number' placeholder='Enter value' />
              </label>
            </div>

            {/* BACKEND */}
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>Backend</h3>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Backend Input 1</span>
                <input className={styles.fieldInput} type='number' placeholder='Enter value' />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Backend Input 2</span>
                <input className={styles.fieldInput} type='number' placeholder='Enter value' />
              </label>
            </div>

            {/* DATABASE */}
            <div className={styles.group}>
              <h3 className={styles.groupTitle}>Database</h3>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Database Input 1</span>
                <input className={styles.fieldInput} type='number' placeholder='Enter value' />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Database Input 2</span>
                <input className={styles.fieldInput} type='number' placeholder='Enter value' />
              </label>
            </div>
          </div>

          <button className={styles.calculateButton}>CALCULATE</button>
        </section>

        <section className={styles.outputBox}>
          {/*εδώ θα εμφανίζονται οι κόμβοι μετά τον υπολογισμό*/}
        </section>
      </div>
    </div>
  );
}
