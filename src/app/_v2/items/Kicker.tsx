import PaywallIcon from './PaywallIcon';
import { resolvePaywallLevel } from '../lib/paywall';

export default function Kicker({ text, paywallLevel }: { text?: string; paywallLevel?: unknown }) {
  const level = resolvePaywallLevel(paywallLevel);
  if (!text && level === 'FREE') return null;
  return (
    <span className="v2-item__kicker">
      <PaywallIcon level={level} />
      {text && <span data-type="section">{text}</span>}
    </span>
  );
}
