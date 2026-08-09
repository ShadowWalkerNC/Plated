/**
 * Level 2 — Plated field components on shadcn primitives.
 * Pattern borrowed from Open SaaS Stack `@opensaas/stack-ui/fields`.
 */
import type { BuilderFieldProps } from '@plated/types';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function FieldShell({
  name,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  name: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={name} className="text-xs font-semibold text-muted-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {hint ? <p className="text-[0.7rem] text-muted-foreground/80">{hint}</p> : null}
      {children}
      {error ? <p className="text-[0.7rem] text-destructive">{error}</p> : null}
    </div>
  );
}

export function TextField({
  name,
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
  required,
  mode = 'edit',
  className,
  type = 'text',
  placeholder,
}: BuilderFieldProps<string> & { type?: string; placeholder?: string }) {
  if (mode === 'read') {
    return (
      <FieldShell name={name} label={label} hint={hint} className={className}>
        <p className="text-sm text-foreground">{value || '—'}</p>
      </FieldShell>
    );
  }
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required} className={className}>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  name,
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
  required,
  mode = 'edit',
  className,
  rows = 3,
}: BuilderFieldProps<string> & { rows?: number }) {
  if (mode === 'read') {
    return (
      <FieldShell name={name} label={label} hint={hint} className={className}>
        <p className="whitespace-pre-wrap text-sm text-foreground">{value || '—'}</p>
      </FieldShell>
    );
  }
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required} className={className}>
      <Textarea
        id={name}
        name={name}
        value={value}
        disabled={disabled}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function NumberField({
  name,
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
  required,
  mode = 'edit',
  className,
  min,
  max,
  step,
}: BuilderFieldProps<number> & { min?: number; max?: number; step?: number }) {
  if (mode === 'read') {
    return (
      <FieldShell name={name} label={label} hint={hint} className={className}>
        <p className="text-sm text-foreground">{value}</p>
      </FieldShell>
    );
  }
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required} className={className}>
      <Input
        id={name}
        name={name}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </FieldShell>
  );
}

export function SwitchField({
  name,
  label,
  value,
  onChange,
  hint,
  disabled,
  mode = 'edit',
  className,
}: BuilderFieldProps<boolean>) {
  if (mode === 'read') {
    return (
      <FieldShell name={name} label={label} hint={hint} className={className}>
        <p className="text-sm text-foreground">{value ? 'On' : 'Off'}</p>
      </FieldShell>
    );
  }
  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <div className="min-w-0">
        <Label htmlFor={name} className="text-xs font-semibold text-muted-foreground">
          {label}
        </Label>
        {hint ? <p className="text-[0.7rem] text-muted-foreground/80">{hint}</p> : null}
      </div>
      <Switch
        id={name}
        checked={value}
        disabled={disabled}
        onCheckedChange={onChange}
      />
    </div>
  );
}

export function ColorField({
  name,
  label,
  value,
  onChange,
  hint,
  error,
  disabled,
  required,
  mode = 'edit',
  className,
}: BuilderFieldProps<string>) {
  if (mode === 'read') {
    return (
      <FieldShell name={name} label={label} hint={hint} className={className}>
        <div className="flex items-center gap-2">
          <span
            className="size-5 rounded border border-border"
            style={{ background: value }}
            aria-hidden
          />
          <span className="font-mono text-xs">{value}</span>
        </div>
      </FieldShell>
    );
  }
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required} className={className}>
      <div className="flex items-center gap-2">
        <input
          id={`${name}-swatch`}
          type="color"
          value={value.startsWith('#') ? value : '#000000'}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="size-8 cursor-pointer rounded border border-border bg-transparent p-0"
        />
        <Input
          id={name}
          name={name}
          value={value}
          disabled={disabled}
          placeholder="#000000"
          onChange={(e) => onChange(e.target.value)}
          className="font-mono"
        />
      </div>
    </FieldShell>
  );
}

export function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  hint,
  error,
  disabled,
  required,
  mode = 'edit',
  className,
  placeholder = 'Select…',
}: BuilderFieldProps<string> & {
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
}) {
  if (mode === 'read') {
    const selected = options.find((o) => o.value === value);
    return (
      <FieldShell name={name} label={label} hint={hint} className={className}>
        <p className="text-sm text-foreground">{selected?.label ?? value ?? '—'}</p>
      </FieldShell>
    );
  }
  return (
    <FieldShell name={name} label={label} hint={hint} error={error} required={required} className={className}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  );
}

export function SliderField({
  name,
  label,
  value,
  onChange,
  hint,
  disabled,
  mode = 'edit',
  className,
  min = 0,
  max = 100,
  step = 1,
}: BuilderFieldProps<number> & { min?: number; max?: number; step?: number }) {
  if (mode === 'read') {
    return (
      <FieldShell name={name} label={label} hint={hint} className={className}>
        <p className="text-sm text-foreground">{value}</p>
      </FieldShell>
    );
  }
  return (
    <FieldShell name={name} label={label} hint={hint} className={className}>
      <div className="flex items-center gap-3">
        <Slider
          id={name}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          value={[value]}
          onValueChange={(vals) => onChange(vals[0] ?? min)}
          className="flex-1"
        />
        <span className="w-8 text-right font-mono text-xs text-muted-foreground">{value}</span>
      </div>
    </FieldShell>
  );
}
