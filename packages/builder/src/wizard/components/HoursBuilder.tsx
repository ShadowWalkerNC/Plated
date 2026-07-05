import styles from './HoursBuilder.module.css';

export interface DayHours {
  day: number;
  open: boolean;
  openTime: string;
  closeTime: string;
}

interface HoursBuilderProps {
  value: DayHours[];
  onChange: (value: DayHours[]) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function HoursBuilder({ value, onChange }: HoursBuilderProps) {
  function updateDay(index: number, patch: Partial<DayHours>) {
    const next = value.map((day, i) => (i === index ? { ...day, ...patch } : day));
    onChange(next);
  }

  return (
    <div className={styles.wrap}>
      {value.map((day, index) => (
        <div className={styles.row} key={day.day}>
          <div className={styles.day}>{DAYS[day.day]}</div>

          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={day.open}
              onChange={(e) => updateDay(index, { open: e.target.checked })}
            />
            <span>{day.open ? 'Open' : 'Closed'}</span>
          </label>

          <input
            className={styles.time}
            type="time"
            value={day.openTime}
            disabled={!day.open}
            onChange={(e) => updateDay(index, { openTime: e.target.value })}
          />
          <input
            className={styles.time}
            type="time"
            value={day.closeTime}
            disabled={!day.open}
            onChange={(e) => updateDay(index, { closeTime: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

export function createDefaultHours(): DayHours[] {
  return Array.from({ length: 7 }, (_, day) => ({
    day,
    open: day !== 0,
    openTime: '11:00',
    closeTime: '21:00',
  }));
}
