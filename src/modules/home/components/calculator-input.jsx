import styles from './calculator-input.module.css';

export default function CalculatorInput({ id, label }) {
  return (
    <div className={styles.fieldRow}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>

      <input
        id={id}
        className={styles.fieldInput}
        type="number"
        placeholder="Enter value"
      />
    </div>
  );
}