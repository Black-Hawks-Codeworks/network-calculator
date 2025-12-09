import { Outlet } from 'react-router-dom';
import styles from './layout.module.css';

export default function Layout() {
  return (
    <main className={styles.mainContainer}>
      <Outlet />
    </main>
  );
}
