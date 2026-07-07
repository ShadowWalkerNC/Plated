/**
 * usePreview — React hook for the Electron desktop preview window.
 *
 * Wraps the preview:open / preview:reload / preview:close IPC calls
 * and exposes a clean API to EditorShell (and any other component).
 *
 * Auto-reload behaviour:
 *   When the preview window is open, saving the project (or any other
 *   schema change) should call reloadPreview(schema) so the window
 *   stays in sync. EditorShell handles this via a useEffect on schema.
 */
import { useState, useCallback } from 'react';
import type { ProjectSchema }    from '@plated/types';

const API = (window as any).plated as Record<string, (...a: any[]) => Promise<any>> | undefined;

export interface PreviewState {
  /** True while a generate+open or reload is in-flight. */
  loading:    boolean;
  /** True when the preview window is currently open. */
  isOpen:     boolean;
  /** Last error message, if any. */
  error:      string | null;
}

export interface UsePreviewReturn extends PreviewState {
  /** Generate the site and open/focus the preview window. */
  openPreview:   (schema: ProjectSchema) => Promise<void>;
  /** Regenerate into the same temp dir and reload the window. */
  reloadPreview: (schema: ProjectSchema) => Promise<void>;
  /** Close the preview window and stop the file server. */
  closePreview:  () => Promise<void>;
}

export function usePreview(): UsePreviewReturn {
  const [loading, setLoading] = useState(false);
  const [isOpen,  setIsOpen]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const openPreview = useCallback(async (schema: ProjectSchema) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API?.previewOpen?.(schema) as { ok: boolean; error?: string };
      if (res?.ok) {
        setIsOpen(true);
      } else {
        setError(res?.error ?? 'Preview failed to open');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadPreview = useCallback(async (schema: ProjectSchema) => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    try {
      const res = await API?.previewReload?.(schema) as { ok: boolean; error?: string };
      if (!res?.ok) setError(res?.error ?? 'Preview reload failed');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [isOpen]);

  const closePreview = useCallback(async () => {
    try {
      await API?.previewClose?.();
      setIsOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  return { loading, isOpen, error, openPreview, reloadPreview, closePreview };
}
