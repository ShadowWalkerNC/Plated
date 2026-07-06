// Top-level screen router
import { useWizardStore } from './store/useWizardStore.js';
import { Welcome }        from './screens/Welcome.js';
import { WizardShell }    from './wizard/WizardShell.js';
import { ExportScreen }   from './screens/ExportScreen.js';
import { EditorShell }    from './editor/EditorShell.js';

export type Screen = 'welcome' | 'wizard' | 'export' | 'editor';

export function App() {
  const screen = useWizardStore((s) => s.screen);

  switch (screen) {
    case 'welcome': return <Welcome />;
    case 'wizard':  return <WizardShell />;
    case 'export':  return <ExportScreen />;
    case 'editor':  return <EditorShell />;
    default:        return <Welcome />;
  }
}
