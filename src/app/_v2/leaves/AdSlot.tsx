import type { AdPlacement } from '../lib/leafView';

/** Dashed placeholder box; sizes per placement live in leaves.css. */
export default function AdSlot({ placement }: { placement: AdPlacement }) {
  return (
    <div className={`v2-ad v2-ad--${placement}`} role="complementary" aria-label="Advertisement">
      <span className="v2-ad__label">Advertisement</span>
    </div>
  );
}
