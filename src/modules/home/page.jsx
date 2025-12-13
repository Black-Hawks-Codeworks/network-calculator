import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      <footer className={styles.paragraph}>
        <p>sdfsdfljlfsldkjflslksdfjlsdjfl</p>
      </footer>
      <section className={styles.content}>
        <nav className={styles.form}>
          <form>
            <input type='text' placeholder='Enter your name' />
            <input type='email' placeholder='Enter your email' />
            <input type='password' placeholder='Enter your password' />
            <button type='submit'>Submit</button>
          </form>
        </nav>
        <div className={styles.networkCalculator}>
          <div>network calculator</div>
        </div>
      </section>
    </div>
  );
}
