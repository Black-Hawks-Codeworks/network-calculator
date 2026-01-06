import styles from './graph-input.module.css';

export default function GraphInput({ id, label, value, onChange }) {
  return (
    <div className={styles.row}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>

      <input
        id={id}
        type="number"
        className={styles.input}
        placeholder='Enter value'
        value={value === 0 ? '' : value}     
        onChange={onChange}
      />
    </div>
  );
}
