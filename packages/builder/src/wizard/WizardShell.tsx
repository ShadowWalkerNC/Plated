import { useMemo } from 'react';
import { useWizardStore } from '../store/useWizardStore.js';
import { Step1Business } from './steps/Step1Business.js';
import { Step2Website } from './steps/Step2Website.js';
import { Step3Social } from './steps/Step3Social.js';
import { Step4Location } from './steps/Step4Location.js';
import { Step5Menu } from './steps/Step5Menu.js';
import { Step6Media } from './steps/Step6Media.js';
import { Step7Template } from './steps/Step7Template.js';
import { Step8Extensions } from './steps/Step8Extensions.js';
import styles from './WizardShell.module.css';

const STEP_META = [
  { id: 1, title: 'Business',   description: 'Name, story, contact' },
  { id: 2, title: 'Website',    description: 'Existing site and migration' },
  { id: 3, title: 'Social',     description: 'Profiles, reviews, delivery' },
  { id: 4, title: 'Location',   description: 'Address and hours' },
  { id: 5, title: 'Menu',       description: 'Categories and items' },
  { id: 6, title: 'Media',      description: 'Logo, hero, brand colors' },
  { id: 7, title: 'Template',   description: 'Business type and style' },
  { id: 8, title: 'Extensions', description: 'Analytics and add-ons' },
] as const;

export function WizardShell() {
  const currentStep  = useWizardStore((s) => s.currentStep);
  const prevStep     = useWizardStore((s) => s.prevStep);
  const nextStep     = useWizardStore((s) => s.nextStep);
  const goToStep     = useWizardStore((s) => s.goToStep);
  const schema       = useWizardStore((s) => s.schema);
  const progress     = useMemo(() => (currentStep / STEP_META.length) * 100, [currentStep]);

  const stepView = (() => {
    switch (currentStep) {
      case 1: return <Step1Business />;
      case 2: return <Step2Website />;
      case 3: return <Step3Social />;
      case 4: return <Step4Location />;
      case 5: return <Step5Menu />;
      case 6: return <Step6Media />;
      case 7: return <Step7Template />;
      case 8: return <Step8Extensions />;
      default: return null;
    }
  })();

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandBlock}>
          <div className={styles.brand}>NexCMS</div>
          <div className={styles.projectName}>{schema.business.name || 'Untitled project'}</div>
        </div>

        <div className={styles.progressWrap}>
          <div className={styles.progressLabelRow}>
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <ol className={styles.stepList}>
          {STEP_META.map((step) => {
            const active   = step.id === currentStep;
            const complete = step.id < currentStep;
            return (
              <li key={step.id}>
                <button
                  className={[
                    styles.stepButton,
                    active   ? styles.stepButtonActive   : '',
                    complete ? styles.stepButtonComplete : '',
                  ].join(' ')}
                  onClick={() => goToStep(step.id)}
                >
                  <span className={styles.stepIndex}>
                    {complete ? '✓' : step.id}
                  </span>
                  <span className={styles.stepText}>
                    <span className={styles.stepTitle}>{step.title}</span>
                    <span className={styles.stepDescription}>{step.description}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </aside>

      <main className={styles.main}>
        <div className={styles.card}>{stepView}</div>
        <div className={styles.footerNav}>
          <button className={styles.backBtn} onClick={prevStep}>Back</button>
          <button className={styles.nextBtn} onClick={nextStep}>
            {currentStep === STEP_META.length ? 'Export →' : 'Continue'}
          </button>
        </div>
      </main>
    </div>
  );
}
