import { WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNetwork } from '../hooks/useNetwork';

export function OfflineBadge() {
  const { online } = useNetwork();
  if (online) return null;

  return (
    <Badge
      variant="secondary"
      role="status"
      aria-live="polite"
      className="fixed top-3 left-1/2 z-[9998] -translate-x-1/2 gap-1.5 border border-border/40 bg-[rgba(30,20,10,0.88)] px-4 py-1.5 text-[0.8rem] font-bold tracking-wide text-[rgba(244,237,228,0.9)] shadow-md backdrop-blur-sm"
    >
      <WifiOff className="size-3.5 text-[var(--app-gold)]" aria-hidden />
      Offline — changes save locally
    </Badge>
  );
}
