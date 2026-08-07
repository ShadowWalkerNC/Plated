/**
 * Level 3 — reusable builder chrome.
 * Open SaaS "standalone" / OpenShip dashboard patterns, Plated-shaped.
 */
import type { ReactNode } from 'react';
import { ArrowLeft, Eye, Save, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { SelectField } from '@/components/fields';
import { useBuilderTheme } from './ThemeProvider';
import type { BuilderAccentPreset } from '@plated/types';

export function EditorHeader({
  title,
  dirty,
  onBack,
  onPreview,
  onSave,
  onExport,
  trailing,
}: {
  title: string;
  dirty?: boolean;
  onBack?: () => void;
  onPreview?: () => void;
  onSave?: () => void;
  onExport?: () => void;
  trailing?: ReactNode;
}) {
  return (
    <header className="electron-drag flex h-12 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
      <div className="electron-no-drag flex min-w-0 flex-1 items-center gap-2">
        {onBack ? (
          <Button variant="ghost" size="icon-sm" onClick={onBack} aria-label="Back">
            <ArrowLeft />
          </Button>
        ) : null}
        <h1 className="truncate text-sm font-semibold text-foreground">{title}</h1>
        {dirty ? (
          <Badge variant="outline" className="border-amber-700/40 text-amber-800 dark:text-amber-300">
            Unsaved
          </Badge>
        ) : null}
      </div>
      <div className="electron-no-drag flex items-center gap-1.5">
        {trailing}
        {onPreview ? (
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye />
            Preview
          </Button>
        ) : null}
        {onSave ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            className={dirty ? 'border-amber-700/50 text-amber-800' : undefined}
          >
            <Save />
            {dirty ? 'Save*' : 'Saved'}
          </Button>
        ) : null}
        {onExport ? (
          <Button size="sm" onClick={onExport}>
            <Download />
            Export site
          </Button>
        ) : null}
      </div>
    </header>
  );
}

export function BuilderPanel({
  title,
  children,
  className,
  empty,
}: {
  title?: string;
  children?: ReactNode;
  className?: string;
  empty?: string;
}) {
  return (
    <aside className={cn('flex h-full min-h-0 flex-col bg-card', className)}>
      {title ? (
        <>
          <div className="px-3 py-2">
            <p className="text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
              {title}
            </p>
          </div>
          <Separator />
        </>
      ) : null}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-4 p-3">
          {empty ? (
            <p className="py-6 text-center text-xs text-muted-foreground">{empty}</p>
          ) : null}
          {children}
        </div>
      </ScrollArea>
    </aside>
  );
}

const ACCENT_OPTIONS: Array<{ label: string; value: BuilderAccentPreset }> = [
  { label: 'Ember (brand)', value: 'ember' },
  { label: 'Ink', value: 'ink' },
  { label: 'Gold', value: 'gold' },
  { label: 'Custom', value: 'custom' },
];

/**
 * Live customizer for Local Builder chrome.
 * Does not change customer site style templates (hearth/canvas/…).
 */
export function ThemePanel({ className }: { className?: string }) {
  const { theme, setTheme, resetTheme } = useBuilderTheme();

  return (
    <div className={cn('space-y-3', className)}>
      <Accordion type="single" collapsible defaultValue="theme">
        <AccordionItem value="theme">
          <AccordionTrigger className="text-xs font-semibold">Builder theme</AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <SelectField
              name="accent"
              label="Accent"
              value={theme.accent}
              options={ACCENT_OPTIONS}
              onChange={(v) => setTheme({ accent: v as BuilderAccentPreset })}
              hint="Local Builder chrome only — site styles stay in styles/"
            />
            {theme.accent === 'custom' ? (
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.primary ?? '#8a4b2f'}
                  onChange={(e) => setTheme({ primary: e.target.value })}
                  className="size-8 cursor-pointer rounded border border-border bg-transparent p-0"
                  aria-label="Custom accent color"
                />
                <span className="font-mono text-xs text-muted-foreground">
                  {theme.primary ?? '#8a4b2f'}
                </span>
              </div>
            ) : null}
            <SelectField
              name="density"
              label="Density"
              value={theme.density ?? 'comfortable'}
              options={[
                { label: 'Comfortable', value: 'comfortable' },
                { label: 'Compact', value: 'compact' },
              ]}
              onChange={(v) => setTheme({ density: v as 'comfortable' | 'compact' })}
            />
            <SelectField
              name="colorMode"
              label="Color mode"
              value={theme.colorMode ?? 'system'}
              options={[
                { label: 'System', value: 'system' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              onChange={(v) => setTheme({ colorMode: v as 'light' | 'dark' | 'system' })}
            />
            <Button variant="ghost" size="sm" className="w-full" onClick={resetTheme}>
              Reset theme
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export { ThemeProvider, useBuilderTheme } from './ThemeProvider';
