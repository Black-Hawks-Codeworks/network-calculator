import { Outlet, Link, useMatch } from 'react-router-dom';
import styles from './layout.module.css';

export default function Layout() {
  const resourceCalcMatch = useMatch('/resource-calc');
  const graphPlacementMatch = useMatch('/graph-placement');
  return (
    <main className={styles.mainContainer}>
      <nav className={styles.nav}>
        <p>Navigation:</p>
        <Link to='/resource-calc' className={resourceCalcMatch ? styles.navLinkSelected : styles.navLink}>
          <p className={styles.navLink}>Resource Calc</p>
        </Link>
        <Link to='/graph-placement' className={graphPlacementMatch ? styles.navLinkSelected : styles.navLink}>
          <p className={styles.navLink}>Graph Placement</p>
        </Link>
      </nav>
      <Outlet />
    </main>
  );
}
