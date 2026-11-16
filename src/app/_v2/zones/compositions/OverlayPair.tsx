import type { Cell } from './types';

export default function OverlayPair({ cells }: { cells: Cell[] }) {
  return (
    <div className="v2-comp v2-comp--overlayPair">
      {cells.map((c) => <div key={c.key} className="v2-comp__cell">{c.el}</div>)}
    </div>
  );
}
