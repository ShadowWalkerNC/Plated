import type { ProjectSchema } from '@plated/types';
import type { AstroFile } from '../types.js';

const THEME_TOKENS: Record<string, string> = {
  hearth: `
  --color-bg:           #fdf8f2;
  --color-surface:      #fff9f2;
  --color-border:       rgba(74,47,35,0.12);
  --color-text:         #1e1612;
  --color-text-muted:   #7a6254;
  --color-primary:      #8a4b2f;
  --color-primary-fg:   #fff8f2;
  --color-accent:       #c98f4a;
  --font-display:       'Cormorant Garamond', Georgia, serif;
  --font-body:          'Inter', system-ui, sans-serif;
  --radius-btn:         0.5rem;
  --radius-card:        1.25rem;`,

  spark: `
  --color-bg:           #ffffff;
  --color-surface:      #f8f8f8;
  --color-border:       #e5e5e5;
  --color-text:         #1a1a1a;
  --color-text-muted:   #666666;
  --color-primary:      #1a1a1a;
  --color-primary-fg:   #ffffff;
  --color-accent:       #555555;
  --font-display:       'Inter', system-ui, sans-serif;
  --font-body:          'Inter', system-ui, sans-serif;
  --radius-btn:         0.375rem;
  --radius-card:        0.75rem;`,

  steel: `
  --color-bg:           #0e0e0e;
  --color-surface:      #181818;
  --color-border:       rgba(255,255,255,0.08);
  --color-text:         #f0ebe6;
  --color-text-muted:   rgba(240,235,230,0.55);
  --color-primary:      #c8856e;
  --color-primary-fg:   #0e0e0e;
  --color-accent:       #e8a87c;
  --font-display:       'Cormorant Garamond', Georgia, serif;
  --font-body:          'Inter', system-ui, sans-serif;
  --radius-btn:         999px;
  --radius-card:        1rem;`,

  bloom: `
  --color-bg:           #fdfaf4;
  --color-surface:      #fff9ee;
  --color-border:       #ddd5c4;
  --color-text:         #1e1a14;
  --color-text-muted:   #7a6e5a;
  --color-primary:      #3d7a4f;
  --color-primary-fg:   #ffffff;
  --color-accent:       #e07b39;
  --font-display:       'Playfair Display', Georgia, serif;
  --font-body:          'Source Sans 3', system-ui, sans-serif;
  --radius-btn:         0.5rem;
  --radius-card:        1.25rem;`,

  obsidian: `
  --color-bg:           #120a07;
  --color-surface:      #1e1108;
  --color-border:       rgba(255,120,40,0.12);
  --color-text:         #fdf0e8;
  --color-text-muted:   rgba(253,240,232,0.6);
  --color-primary:      #e85d20;
  --color-primary-fg:   #fdf0e8;
  --color-accent:       #f5a623;
  --font-display:       'Oswald', Impact, sans-serif;
  --font-body:          'Inter', system-ui, sans-serif;
  --radius-btn:         0.375rem;
  --radius-card:        0.75rem;`,

  ghost: `
  --color-bg:           #f7fbfe;
  --color-surface:      #ffffff;
  --color-border:       #cde4f0;
  --color-text:         #162433;
  --color-text-muted:   #5a7a8e;
  --color-primary:      #1b6fa8;
  --color-primary-fg:   #ffffff;
  --color-accent:       #f0a855;
  --font-display:       'Lora', Georgia, serif;
  --font-body:          'Inter', system-ui, sans-serif;
  --radius-btn:         999px;
  --radius-card:        1.25rem;`,
};

export function buildThemeCss(schema: ProjectSchema): AstroFile {
  const themeId  = schema.styleTemplate ?? 'hearth';
  const tokens   = THEME_TOKENS[themeId] ?? THEME_TOKENS['hearth']!;
  const primary   = schema.branding.primaryColor;
  const secondary = schema.branding.secondaryColor;
  const accent    = schema.branding.accentColor;

  const overrides = [
    primary   ? `  --color-primary:   ${primary};`   : '',
    secondary ? `  --color-bg:        ${secondary};` : '',
    accent    ? `  --color-accent:    ${accent};`    : '',
  ].filter(Boolean).join('\n');

  return {
    path: 'src/styles/theme.css',
    content: `:root {${tokens}\n${overrides ? overrides + '\n' : ''}}\n`,
  };
}
