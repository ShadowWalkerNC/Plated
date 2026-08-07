// Top-level screen router
import type { ReactNode } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/builder';
import { useWizardStore } from './store/useWizardStore.js';
import { Welcome } from './screens/Welcome.js';
import { WizardShell } from './wizard/WizardShell.js';
import { ExportScreen } from './screens/ExportScreen.js';
import { EditorShell } from './editor/EditorShell.js';

export type Screen = 'welcome' | 'wizard' | 'export' | 'editor';

export function App() {
  const screen = useWizardStore((s) => s.screen);

  let content: ReactNode;
  switch (screen) {
    case 'welcome':
      content = <Welcome />;
      break;
    case 'wizard':
      content = <WizardShell />;
      break;
    case 'export':
      content = <ExportScreen />;
      break;
    case 'editor':
      content = <EditorShell />;
      break;
    default:
      content = <Welcome />;
  }

  return (
    <ThemeProvider>
      <TooltipProvider>
        {content}
        <Toaster position="bottom-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}
