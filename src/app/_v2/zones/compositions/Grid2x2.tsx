import type { Cell } from './types';

export default function Grid2x2({ cells }: { cells: Cell[] }) {
  return (
    <div className="v2-comp v2-comp--grid2x2">
      {cells.map((c) => <div key={c.key} className="v2-comp__cell">{c.el}</div>)}
    </div>
  );
}
