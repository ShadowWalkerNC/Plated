/**
 * EditorShell — root layout for the block DnD editor.
 *
 * Layout: 3-column grid
 *   [SectionPanel] | [BlockEditor] | [BlockToolbar]
 *
 * Chrome uses Level-3 shadcn builder components (Open SaaS / OpenShip inspired).
 */
import { useEffect, useCallback } from 'react';
import { useWizardStore } from '../store/useWizardStore.js';
import { useEditorStore } from './useEditorStore.js';
import { SectionPanel } from './SectionPanel.js';
import { BlockEditor } from './BlockEditor.js';
import { BlockToolbar } from './BlockToolbar.js';
import { EditorHeader } from '@/components/builder';

export function EditorShell() {
  const schema = useWizardStore((s) => s.schema);
  const projectFilePath = useWizardStore((s) => s.projectFilePath);
  const wizardIsDirty = useWizardStore((s) => s.isDirty);
  const setScreen = useWizardStore((s) => s.setScreen);
  const markClean = useWizardStore((s) => s.markClean);
  const initFromSchema = useEditorStore((s) => s.initFromSchema);
  const editorIsDirty = useEditorStore((s) => s.isDirty);

  const businessName = (schema as { business?: { name?: string } })?.business?.name || 'Untitled project';
  const isDirty = wizardIsDirty || editorIsDirty;

  useEffect(() => {
    initFromSchema();
  }, [initFromSchema]);

  const handleSave = useCallback(async () => {
    let filePath = projectFilePath;
    if (!filePath) {
      const result = await (window as unknown as {
        plated: {
          saveFile: (opts: unknown) => Promise<string | null>;
        };
      }).plated.saveFile({
        title: 'Save project',
        defaultPath: `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.plated.json`,
        filters: [{ name: 'Plated Project', extensions: ['plated.json', 'json'] }],
      });
      if (!result) return;
      filePath = result;
    }
    await (window as unknown as {
      plated: { saveProject: (schema: unknown, path: string) => Promise<void> };
    }).plated.saveProject(schema, filePath);
    useWizardStore.getState().setProjectFilePath(filePath);
    markClean();
  }, [schema, projectFilePath, businessName, markClean]);

  const handlePreview = useCallback(async () => {
    await (window as unknown as {
      plated: { previewOpen: (schema: unknown) => Promise<void> };
    }).plated.previewOpen(schema);
  }, [schema]);

  const handleExport = useCallback(() => {
    setScreen('export');
  }, [setScreen]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <EditorHeader
        title={businessName}
        dirty={isDirty}
        onBack={() => setScreen('wizard')}
        onPreview={handlePreview}
        onSave={handleSave}
        onExport={handleExport}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[240px_1fr_300px] overflow-hidden">
        <aside className="min-h-0 overflow-y-auto border-r border-border bg-card">
          <SectionPanel />
        </aside>

        <main className="min-h-0 overflow-y-auto bg-background p-6">
          <BlockEditor />
        </main>

        <aside className="min-h-0 overflow-hidden border-l border-border">
          <BlockToolbar />
        </aside>
      </div>
    </div>
  );
}
