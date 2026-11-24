import { Crown } from 'lucide-react';
import { resolvePaywallLevel } from '../lib/paywall';

export default function PaywallIcon({ level }: { level: unknown }) {
  if (resolvePaywallLevel(level) === 'FREE') return null;
  return (
    <span className="v2-paywall-icon" role="img" aria-label="Restricted content" title="Restricted content">
      <Crown size={14} aria-hidden="true" />
    </span>
  );
}
