import styles from './StylePicker.module.css';

interface StyleOption {
  id: string;
  name: string;
  description: string;
}

interface StylePickerProps {
  value: string;
  options: readonly StyleOption[];
  onChange: (value: string) => void;
}

export function StylePicker({ value, options, onChange }: StylePickerProps) {
  return (
    <div className={styles.grid}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={[styles.card, opt.id === value ? styles.active : ''].join(' ')}
          onClick={() => onChange(opt.id)}
        >
          <div className={styles.preview} data-theme={opt.id} />
          <div className={styles.body}>
            <div className={styles.name}>{opt.name}</div>
            <div className={styles.description}>{opt.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
