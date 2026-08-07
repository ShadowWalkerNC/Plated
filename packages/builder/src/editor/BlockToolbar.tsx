/**
 * BlockToolbar — right inspector for the selected block.
 * Level-2 fields (Open SaaS-inspired) on shadcn primitives.
 */
import { useCallback } from 'react';
import type { BlockSchema } from '@plated/types';
import { useEditorStore } from './useEditorStore.js';
import { BuilderPanel } from '@/components/builder';
import { ThemePanel } from '@/components/builder';
import {
  TextField,
  TextAreaField,
  NumberField,
  SwitchField,
  ColorField,
  SliderField,
} from '@/components/fields';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

function humanize(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}

function renderField(
  key: string,
  value: unknown,
  onChange: (v: unknown) => void,
): React.ReactNode {
  const label = humanize(key);

  if (typeof value === 'boolean') {
    return (
      <SwitchField
        key={key}
        name={key}
        label={label}
        value={value}
        onChange={(v) => onChange(v)}
      />
    );
  }

  if (typeof value === 'number') {
    const isOpacity =
      key.toLowerCase().includes('opacity') ||
      key.toLowerCase().includes('percent');
    if (isOpacity) {
      return (
        <SliderField
          key={key}
          name={key}
          label={label}
          value={value}
          min={0}
          max={key.toLowerCase().includes('opacity') && value <= 1 ? 1 : 100}
          step={key.toLowerCase().includes('opacity') && value <= 1 ? 0.05 : 1}
          onChange={(v) => onChange(v)}
        />
      );
    }
    return (
      <NumberField
        key={key}
        name={key}
        label={label}
        value={value}
        onChange={(v) => onChange(v)}
      />
    );
  }

  if (typeof value === 'string') {
    if (
      value.startsWith('#') ||
      key.toLowerCase().includes('color') ||
      key.toLowerCase().includes('colour')
    ) {
      return (
        <ColorField
          key={key}
          name={key}
          label={label}
          value={value}
          onChange={(v) => onChange(v)}
        />
      );
    }
    if (
      key.toLowerCase().includes('url') ||
      key.toLowerCase().includes('src') ||
      key.toLowerCase().includes('href')
    ) {
      return (
        <TextField
          key={key}
          name={key}
          label={label}
          value={value}
          type="url"
          onChange={(v) => onChange(v)}
        />
      );
    }
    if (
      value.length > 80 ||
      key.toLowerCase().includes('text') ||
      key.toLowerCase().includes('description')
    ) {
      return (
        <TextAreaField
          key={key}
          name={key}
          label={label}
          value={value}
          onChange={(v) => onChange(v)}
        />
      );
    }
    return (
      <TextField
        key={key}
        name={key}
        label={label}
        value={value}
        onChange={(v) => onChange(v)}
      />
    );
  }

  return (
    <div key={key} className="flex flex-col gap-1">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <pre className="overflow-x-auto rounded-md border border-border bg-muted/40 p-2 font-mono text-[0.6875rem] text-muted-foreground whitespace-pre-wrap break-all">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function BlockToolbar() {
  const activeBlockId = useEditorStore((s) => s.activeBlockId);
  const sections = useEditorStore((s) => s.sections);
  const updateBlockConfig = useEditorStore((s) => s.updateBlockConfig);

  const activeBlock: BlockSchema | undefined = sections
    .flatMap((s) => s.blocks)
    .find((b) => b.id === activeBlockId);

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      if (!activeBlockId) return;
      updateBlockConfig(activeBlockId, { [key]: value });
    },
    [activeBlockId, updateBlockConfig],
  );

  if (!activeBlock) {
    return (
      <BuilderPanel title="Inspector" empty="Select a block to edit its settings.">
        <ThemePanel />
      </BuilderPanel>
    );
  }

  const configEntries = Object.entries(activeBlock.config);

  return (
    <BuilderPanel title="Inspector">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <Badge variant="secondary" className="font-mono text-[0.7rem]">
          {activeBlock.type}
        </Badge>
        <span className="font-mono text-[0.6875rem] text-muted-foreground">
          #{activeBlock.id.slice(0, 6)}
        </span>
      </div>

      <div className="flex flex-col gap-3.5">
        <SwitchField
          name="visible"
          label="Visible"
          value={activeBlock.visible}
          onChange={() => {
            const sectionId = sections.find((s) =>
              s.blocks.some((b) => b.id === activeBlock.id),
            )?.id;
            if (sectionId) {
              useEditorStore.getState().toggleBlock(sectionId, activeBlock.id);
            }
          }}
        />

        {configEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No configurable fields for this block.
          </p>
        ) : null}

        {configEntries.map(([key, val]) =>
          renderField(key, val, (newVal) => handleChange(key, newVal)),
        )}
      </div>

      <Separator className="my-4" />
      <ThemePanel />
    </BuilderPanel>
  );
}
