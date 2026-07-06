import { Field } from '../components/Field.js';
import { HoursBuilder, createDefaultHours } from '../components/HoursBuilder.js';
import { useWizardStore } from '../../store/useWizardStore.js';
import type { LocationRecord } from '@plated/types';
import styles from './Step.module.css';

const DEFAULT_LOCATION: LocationRecord = {
  id: crypto.randomUUID(),
  name: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  zip: '',
  country: 'US',
  phone: '',
  email: '',
  googleMapsUrl: '',
  hours: {
    schedule: createDefaultHours(),
    holidayNote: '',
    additionalNotes: '',
  },
};

export function Step4Location() {
  const locations = useWizardStore((s) => s.schema.locations);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  const location = locations[0] ?? DEFAULT_LOCATION;

  function patchLocation(patch: Partial<LocationRecord>) {
    updateSchema({
      locations: [{ ...location, ...patch }],
      primaryLocationIndex: 0,
    });
  }

  function patchHours(patch: Partial<LocationRecord['hours']>) {
    patchLocation({ hours: { ...location.hours, ...patch } });
  }

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Location & Hours</h1>
        <p className={styles.subtitle}>Add your address, contact info, map link, and weekly schedule.</p>
      </header>

      <div className={styles.grid2}>
        <Field label="Location name" hint="Optional if you only have one location.">
          <input
            value={location.name}
            onChange={(e) => patchLocation({ name: e.target.value })}
            placeholder="Downtown"
          />
        </Field>

        <Field label="Phone" hint="Overrides the business phone for this location.">
          <input
            value={location.phone ?? ''}
            onChange={(e) => patchLocation({ phone: e.target.value })}
            placeholder="(555) 123-4567"
          />
        </Field>
      </div>

      <div className={styles.grid2}>
        <Field label="Address line 1">
          <input
            value={location.address1 ?? ''}
            onChange={(e) => patchLocation({ address1: e.target.value })}
            placeholder="123 Main Street"
          />
        </Field>

        <Field label="Address line 2">
          <input
            value={location.address2 ?? ''}
            onChange={(e) => patchLocation({ address2: e.target.value })}
            placeholder="Suite B"
          />
        </Field>
      </div>

      <div className={styles.grid3}>
        <Field label="City">
          <input value={location.city ?? ''} onChange={(e) => patchLocation({ city: e.target.value })} placeholder="Charleston" />
        </Field>

        <Field label="State">
          <input value={location.state ?? ''} onChange={(e) => patchLocation({ state: e.target.value })} placeholder="SC" />
        </Field>

        <Field label="ZIP">
          <input value={location.zip ?? ''} onChange={(e) => patchLocation({ zip: e.target.value })} placeholder="29401" />
        </Field>
      </div>

      <Field label="Google Maps URL">
        <input
          value={location.googleMapsUrl ?? ''}
          onChange={(e) => patchLocation({ googleMapsUrl: e.target.value })}
          placeholder="https://maps.google.com/..."
        />
      </Field>

      <Field label="Holiday note" hint="Optional note shown beneath regular hours.">
        <input
          value={location.hours.holidayNote ?? ''}
          onChange={(e) => patchHours({ holidayNote: e.target.value })}
          placeholder="Closed Thanksgiving and Christmas Day"
        />
      </Field>

      <div className={styles.hoursSection}>
        <div className={styles.sectionLabel}>Weekly Hours</div>
        <HoursBuilder
          value={location.hours.schedule}
          onChange={(schedule) => patchHours({ schedule })}
        />
      </div>
    </section>
  );
}
