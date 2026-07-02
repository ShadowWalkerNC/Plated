import type { Config } from 'tailwindcss';

/**
 * Hearth Tailwind config.
 * Maps CSS variables → Tailwind utility classes.
 * Import this config in any package that uses the Hearth style.
 */
const config: Config = {
  content: [],
  theme: {
    extend: {
      colors: {
        bg: {
          base:     'var(--color-bg-base)',
          surface:  'var(--color-bg-surface)',
          elevated: 'var(--color-bg-elevated)',
        },
        text: {
          primary:   'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted:     'var(--color-text-muted)',
          inverse:   'var(--color-text-inverse)',
        },
        accent: {
          primary:   'var(--color-accent-primary)',
          secondary: 'var(--color-accent-secondary)',
          pale:      'var(--color-accent-pale)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          subtle:  'var(--color-border-subtle)',
        },
      },
      fontFamily: {
        sans:    ['var(--font-sans)'],
        display: ['var(--font-display)'],
        mono:    ['var(--font-mono)'],
      },
      borderRadius: {
        sm:   'var(--radius-sm)',
        md:   'var(--radius-md)',
        lg:   'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      spacing: {
        '1':  'var(--space-1)',
        '2':  'var(--space-2)',
        '3':  'var(--space-3)',
        '4':  'var(--space-4)',
        '6':  'var(--space-6)',
        '8':  'var(--space-8)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
      },
    },
  },
  plugins: [],
};

export default config;
