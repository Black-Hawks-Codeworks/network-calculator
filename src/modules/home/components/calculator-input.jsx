import styles from './calculator-input.module.css';

export default function CalculatorInput(props) {
  const { id, label, value, onChange } = props;
  return (
    <div className={styles.fieldRow}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
      </label>

      <input
        id={id}
        className={styles.fieldInput}
        type='number'
        placeholder='Enter value'
        value={value === 0 ? '' : value}
        onChange={onChange}
      />
    </div>
  );
}
