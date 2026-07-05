import styles from './ImageUpload.module.css';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPick: () => Promise<void>;
}

export function ImageUpload({ label, value, onChange, onPick }: ImageUploadProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <button className={styles.pickBtn} onClick={() => void onPick()} type="button">
          Choose File
        </button>
      </div>
      <input
        className={styles.input}
        type="text"
        placeholder="/absolute/path/or/https://..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className={styles.preview}>
        {value ? <img className={styles.image} src={value} alt={label} /> : <span>No image selected</span>}
      </div>
    </div>
  );
}
