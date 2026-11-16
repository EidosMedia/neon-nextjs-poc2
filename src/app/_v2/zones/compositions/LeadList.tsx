import type { Cell } from './types';

export default function LeadList({ cells }: { cells: Cell[] }) {
  const [lead, ...rest] = cells;
  return (
    <div className="v2-comp v2-comp--leadList">
      <div className="v2-comp__lead">{lead?.el}</div>
      {rest.length > 0 && <div className="v2-comp__stack">{rest.map((c) => <div key={c.key} className="v2-comp__cell">{c.el}</div>)}</div>}
    </div>
  );
}
