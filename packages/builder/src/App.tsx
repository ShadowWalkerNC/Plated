// Top-level screen router
import { useWizardStore } from './store/useWizardStore.js';
import { Welcome } from './screens/Welcome.js';
import { WizardShell } from './wizard/WizardShell.js';
import { ExportScreen } from './screens/ExportScreen.js';

export type Screen = 'welcome' | 'wizard' | 'export';

export function App() {
  const screen = useWizardStore((s) => s.screen);

  switch (screen) {
    case 'welcome':
      return <Welcome />;
    case 'wizard':
      return <WizardShell />;
    case 'export':
      return <ExportScreen />;
    default:
      return <Welcome />;
  }
}
