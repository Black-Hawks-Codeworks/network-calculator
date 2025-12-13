import styles from './page.module.css';

export default function HomePage() {
  return (
    <main className={styles.page}>
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
    </main>
  );
}
