import type { ReactNode } from 'react';

/**
 * Wraps a legacy component rendered inside a v2 root so the guarded legacy globals still apply to it.
 * Outside a v2 engine it renders its children untouched, so legacy DOM does not change.
 */
export default function LegacyIsland({ enabled = true, children }: { enabled?: boolean; children: ReactNode }) {
  if (!enabled) return <>{children}</>;
  return <div className="v2-legacy">{children}</div>;
}
