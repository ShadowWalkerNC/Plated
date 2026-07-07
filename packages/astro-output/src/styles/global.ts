import type { ProjectSchema } from '@plated/types';
import type { AstroFile }    from '../types.js';

/**
 * buildGlobalCss — structural reset + layout utilities.
 *
 * All colours reference CSS custom properties from the theme layer
 * (src/styles/theme.css). Dual-token references (new-name, old-name)
 * provide backwards compatibility during the theme registry migration.
 */
export function buildGlobalCss(_schema: ProjectSchema): AstroFile {
  return {
    path: 'src/styles/global.css',
    content: `/* Plated — global reset & layout utilities */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family:            var(--font-sans, var(--font-body, system-ui, sans-serif));
  background:             var(--color-bg-base,    var(--color-bg,      #fafafa));
  color:                  var(--color-text-primary,var(--color-text,   #111));
  line-height:            1.65;
  -webkit-font-smoothing: antialiased;
}

img { display: block; max-width: 100%; }
a   { color: inherit; text-decoration: none; }

/* ── Layout ─────────────────────────────────────────────────────────── */

.container {
  width: min(100%, 1200px);
  margin-inline: auto;
  padding-inline: 1.5rem;
}

.section { padding-block: 5rem; }

.section-title {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  font-weight: 700;
  line-height: 1.15;
  margin-bottom: var(--space-8, 2rem);
}

/* ── Buttons ─────────────────────────────────────────────────────────── */

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md, var(--radius-btn, 0.5rem));
  font-weight: 700;
  cursor: pointer;
  border: none;
  background: var(--color-accent-primary, var(--color-primary, #111));
  color:      var(--color-text-inverse,   var(--color-primary-fg, #fff));
  transition: opacity 150ms, transform 100ms;
}
.btn:hover  { opacity: 0.85; text-decoration: none; transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn-sm     { min-height: 38px; padding: 0.5rem 1rem; font-size: 0.9rem; }
.btn-ghost  {
  background: transparent;
  border: 2px solid var(--color-accent-primary, var(--color-primary, #111));
  color:        var(--color-accent-primary, var(--color-primary, #111));
}

/* ── Typography ────────────────────────────────────────────────────────── */

.prose p + p  { margin-top: 1rem; }
.prose h2     { font-size: 1.5rem; margin: 2rem 0 0.75rem; font-family: var(--font-display); }
.prose h3     { font-size: 1.2rem; margin: 1.5rem 0 0.5rem; font-family: var(--font-display); }
.prose ul     { padding-left: 1.5rem; }
.prose li     { margin-bottom: 0.35rem; }
.prose a      { color: var(--color-accent-primary, var(--color-primary)); text-decoration: underline; }

/* ── Cards ─────────────────────────────────────────────────────────────── */

.card {
  background:    var(--color-bg-surface,  var(--color-surface));
  border:        1px solid var(--color-border);
  border-radius: var(--radius-lg,  var(--radius-card, 0.75rem));
  box-shadow:    var(--shadow-sm);
  overflow: hidden;
}

/* ── Divider & Spacer ──────────────────────────────────────────────────── */

.block-divider {
  border: none;
  border-top: 1px solid var(--color-border-subtle, var(--color-border));
  margin-block: var(--space-8, 2rem);
}

/* ── Hero ────────────────────────────────────────────────────────────── */

.block-hero {
  position: relative;
  min-height: 88vh;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 7rem 1.5rem;
  background-image: var(--hero-img, none);
  background-size: cover;
  background-position: center;
  overflow: hidden;
}
.block-hero::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.55));
  pointer-events: none;
}
.block-hero__inner {
  position: relative; z-index: 1;
  display: grid; gap: 1.5rem; place-items: center;
}
.block-hero__title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 8vw, 7rem);
  font-weight: 700; line-height: 1.05;
  color: #fff;
  text-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
.block-hero__tagline {
  font-size: clamp(1rem, 2.5vw, 1.4rem);
  color: rgba(255,255,255,0.88);
  max-width: 52ch;
}
.block-hero__actions { display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center; }

/* ── Video embed ─────────────────────────────────────────────────────── */

.video-embed {
  position: relative; padding-top: 56.25%; /* 16:9 */
  border-radius: var(--radius-lg, 0.75rem);
  overflow: hidden;
}
.video-embed iframe,
.video-embed video {
  position: absolute; inset: 0;
  width: 100%; height: 100%; border: none;
}
`,
  };
}
