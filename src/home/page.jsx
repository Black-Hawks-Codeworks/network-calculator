import styles from './page.module.css';

export default function HomePage() {
  // This is how to put a variable in a jsx element
  const myString = 'Welcome to Omakase Frontend';

  return (
    <div className={styles.testClass}>
      <h1>{myString}</h1>
      <p>This is the main content of the home page.</p>
    </div>
  );
}
