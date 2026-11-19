import type { Cell } from './types';

export default function Split({ cells }: { cells: Cell[] }) {
  const [lead, ...rest] = cells;
  return (
    <div className="v2-comp v2-comp--split">
      <div className="v2-comp__lead">{lead?.el}</div>
      {rest.length > 0 && <div className="v2-comp__stack">{rest.map((c) => <div key={c.key} className="v2-comp__cell">{c.el}</div>)}</div>}
    </div>
  );
}
