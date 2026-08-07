/**
 * ThemeProvider — applies BuilderThemeConfig to shadcn CSS variables.
 * Inspired by Open SaaS / OpenShip CSS-variable theming (not next-themes).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { BuilderThemeConfig } from '@plated/types';
import { BUILDER_ACCENT_HEX, DEFAULT_BUILDER_THEME } from './theme-presets';

interface ThemeContextValue {
  theme: BuilderThemeConfig;
  setTheme: (patch: Partial<BuilderThemeConfig>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolvePrimary(theme: BuilderThemeConfig): string {
  if (theme.accent === 'custom' && theme.primary) return theme.primary;
  if (theme.accent === 'custom') return BUILDER_ACCENT_HEX.ember;
  return BUILDER_ACCENT_HEX[theme.accent];
}

function applyThemeToDocument(theme: BuilderThemeConfig): void {
  const root = document.documentElement;
  const primary = resolvePrimary(theme);

  root.style.setProperty('--primary', primary);
  root.style.setProperty('--ring', primary);
  root.style.setProperty('--sidebar-primary', primary);
  root.style.setProperty('--sidebar-ring', primary);
  root.style.setProperty('--app-accent', primary);

  if (theme.radius != null) {
    root.style.setProperty('--radius', `${theme.radius}rem`);
  }

  root.dataset.density = theme.density ?? 'comfortable';

  if (theme.colorMode === 'light') {
    root.classList.remove('dark');
  } else if (theme.colorMode === 'dark') {
    root.classList.add('dark');
  } else {
    // system — let prefers-color-scheme media query in globals.css handle surfaces;
    // only clear forced class.
    root.classList.remove('dark');
  }
}

export function ThemeProvider({
  children,
  initial = DEFAULT_BUILDER_THEME,
}: {
  children: ReactNode;
  initial?: BuilderThemeConfig;
}) {
  const [theme, setThemeState] = useState<BuilderThemeConfig>(initial);

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((patch: Partial<BuilderThemeConfig>) => {
    setThemeState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetTheme = useCallback(() => {
    setThemeState(DEFAULT_BUILDER_THEME);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, resetTheme }),
    [theme, setTheme, resetTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useBuilderTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useBuilderTheme must be used within ThemeProvider');
  }
  return ctx;
}
