import { useMemo } from 'react';
import styles from './ColorPicker.module.css';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const safeValue = useMemo(() => value || '#000000', [value]);

  return (
    <label className={styles.picker}>
      <span className={styles.label}>{label}</span>
      <div className={styles.row}>
        <input
          className={styles.swatch}
          type="color"
          value={safeValue}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className={styles.input}
          type="text"
          value={value}
          placeholder="#8a4b2f"
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </label>
  );
}
