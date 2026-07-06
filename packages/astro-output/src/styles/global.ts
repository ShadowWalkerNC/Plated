import type { ProjectSchema } from '@nexcms/types';
import type { AstroFile } from '../types.js';

export function buildGlobalCss(schema: ProjectSchema): AstroFile {
  return {
    path: 'src/styles/global.css',
    content: `/* NexCMS — global reset & layout */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: var(--font-body);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

img { display: block; max-width: 100%; }
a   { color: inherit; text-decoration: none; }

.container {
  width: min(100%, 1200px);
  margin-inline: auto;
  padding-inline: 1.5rem;
}

.section { padding-block: 5rem; }

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-btn, 0.5rem);
  font-weight: 700;
  cursor: pointer;
  border: none;
  background: var(--color-primary);
  color: var(--color-primary-fg);
  transition: opacity 150ms;
}
.btn:hover  { opacity: 0.85; text-decoration: none; }
.btn-sm     { min-height: 38px; padding: 0.5rem 1rem; font-size: 0.9rem; }
.btn-ghost  { background: transparent; border: 2px solid var(--color-primary); color: var(--color-primary); }

.prose p + p  { margin-top: 1rem; }
.prose h2     { font-size: 1.5rem; margin: 2rem 0 0.75rem; }
.prose ul     { padding-left: 1.5rem; }
.prose li     { margin-bottom: 0.35rem; }
`,
  };
}
