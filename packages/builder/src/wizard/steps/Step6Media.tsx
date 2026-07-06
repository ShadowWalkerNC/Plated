import { usePlated } from '../../hooks/usePlated.js';
import { useWizardStore } from '../../store/useWizardStore.js';
import { ColorPicker } from '../components/ColorPicker.js';
import { ImageUpload } from '../components/ImageUpload.js';
import styles from './Step.module.css';

export function Step6Media() {
  const plated = usePlated();
  const branding = useWizardStore((s) => s.schema.branding);
  const updateSchema = useWizardStore((s) => s.updateSchema);

  async function pickImage(field: 'logoUrl' | 'heroImageUrl' | 'faviconSourceUrl') {
    const filePath = await plated.pickFile({
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg'] }],
    });
    if (!filePath) return;
    updateSchema({ branding: { [field]: filePath } });
  }

  return (
    <section className={styles.step}>
      <header className={styles.header}>
        <h1 className={styles.title}>Media & Brand</h1>
        <p className={styles.subtitle}>Set logo, hero image, favicon, and the brand palette used across the site.</p>
      </header>

      <div className={styles.grid2}>
        <ImageUpload label="Logo" value={branding.logoUrl}
          onChange={(v) => updateSchema({ branding: { logoUrl: v } })}
          onPick={() => pickImage('logoUrl')} />
        <ImageUpload label="Hero image" value={branding.heroImageUrl}
          onChange={(v) => updateSchema({ branding: { heroImageUrl: v } })}
          onPick={() => pickImage('heroImageUrl')} />
      </div>

      <ImageUpload label="Favicon" value={branding.faviconSourceUrl}
        onChange={(v) => updateSchema({ branding: { faviconSourceUrl: v } })}
        onPick={() => pickImage('faviconSourceUrl')} />

      <div className={styles.grid3}>
        <ColorPicker label="Primary" value={branding.primaryColor}
          onChange={(v) => updateSchema({ branding: { primaryColor: v } })} />
        <ColorPicker label="Secondary" value={branding.secondaryColor}
          onChange={(v) => updateSchema({ branding: { secondaryColor: v } })} />
        <ColorPicker label="Accent" value={branding.accentColor}
          onChange={(v) => updateSchema({ branding: { accentColor: v } })} />
      </div>
    </section>
  );
}
