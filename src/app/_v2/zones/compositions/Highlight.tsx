import type { Cell } from './types';

/** A featured first item across the full width, with the following items in a row underneath. */
export default function Highlight({ cells }: { cells: Cell[] }) {
  const [lead, ...rest] = cells;
  return (
    <div className="v2-comp v2-comp--highlight">
      <div className="v2-comp__lead">{lead?.el}</div>
      {rest.length > 0 && (
        <div className="v2-comp__row">
          {rest.map((c) => <div key={c.key} className="v2-comp__cell">{c.el}</div>)}
        </div>
      )}
    </div>
  );
}
