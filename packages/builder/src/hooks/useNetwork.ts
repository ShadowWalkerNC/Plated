import { useEffect, useState, useCallback } from 'react';

const API = (window as any).plated as Record<string, (...a: any[]) => Promise<any>> | undefined;

export function useNetwork() {
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    // Browser events (fast)
    const up   = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online',  up);
    window.addEventListener('offline', down);

    // Electron net.isOnline (authoritative)
    if (API?.networkIsOnline) {
      API.networkIsOnline().then((v: boolean) => setOnline(v));
    }

    // Listen for main-process network changes
    if (API?.onNetworkChange) {
      const unsub = API.onNetworkChange((e: { online: boolean }) => setOnline(e.online));
      return () => {
        window.removeEventListener('online',  up);
        window.removeEventListener('offline', down);
        unsub?.();
      };
    }

    return () => {
      window.removeEventListener('online',  up);
      window.removeEventListener('offline', down);
    };
  }, []);

  const probe = useCallback(async (url: string): Promise<boolean> => {
    if (!online) return false;
    if (API?.networkProbe) {
      const r = await API.networkProbe(url) as { ok: boolean };
      return r.ok;
    }
    try {
      const r = await fetch(url, { method: 'HEAD', cache: 'no-store' });
      return r.ok;
    } catch { return false; }
  }, [online]);

  return { online, probe };
}
