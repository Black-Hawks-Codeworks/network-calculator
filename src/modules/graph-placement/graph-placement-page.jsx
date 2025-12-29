import styles from './graph-placement-page.module.css';

export default function GraphPlacementPage() {
  return (
    <div className={styles.page}>
      <h1>Graph Layout</h1>
      <div className={styles.graphContainer}></div>
    </div>
  );
}
