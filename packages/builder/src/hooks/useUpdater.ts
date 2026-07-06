import { useEffect, useState } from 'react';

export type UpdaterStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdaterState {
  status:   UpdaterStatus;
  version:  string | null;
  progress: number | null;   // 0–100
  error:    string | null;
}

const API = (window as any).plated as Record<string, (...a: any[]) => Promise<any>>;

export function useUpdater() {
  const [state, setState] = useState<UpdaterState>({
    status: 'idle', version: null, progress: null, error: null,
  });

  useEffect(() => {
    if (!API?.onUpdaterEvent) return;
    const unsub = API.onUpdaterEvent((event: { type: string; payload?: any }) => {
      switch (event.type) {
        case 'checking':      setState((s) => ({ ...s, status: 'checking' })); break;
        case 'available':     setState((s) => ({ ...s, status: 'available',   version: event.payload?.version ?? null })); break;
        case 'not-available': setState((s) => ({ ...s, status: 'not-available' })); break;
        case 'progress':      setState((s) => ({ ...s, status: 'downloading', progress: Math.round(event.payload?.percent ?? 0) })); break;
        case 'downloaded':    setState((s) => ({ ...s, status: 'downloaded',  version: event.payload?.version ?? null })); break;
        case 'error':         setState((s) => ({ ...s, status: 'error', error: event.payload?.message ?? 'Unknown updater error' })); break;
      }
    });
    return () => unsub?.();
  }, []);

  async function checkNow() {
    setState((s) => ({ ...s, status: 'checking' }));
    await API?.updaterCheck?.();
  }

  async function installNow() {
    await API?.updaterInstall?.();
  }

  return { state, checkNow, installNow };
}
