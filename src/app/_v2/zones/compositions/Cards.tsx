import type { Cell } from './types';

/** Serves both threeUp and fourUp. */
export default function Cards({ cells, columns }: { cells: Cell[]; columns: 3 | 4 }) {
  return (
    <div className={`v2-comp v2-comp--cards v2-comp--cols-${columns}`}>
      {cells.map((c) => <div key={c.key} className="v2-comp__cell">{c.el}</div>)}
    </div>
  );
}
