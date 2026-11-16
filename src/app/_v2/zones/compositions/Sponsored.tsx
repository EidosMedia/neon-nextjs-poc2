import type { Cell } from './types';

export default function Sponsored({ cells, sponsorName }: { cells: Cell[]; sponsorName?: string }) {
  return (
    <div className="v2-comp v2-comp--sponsored">
      <div className="v2-sponsored__rail">
        <span className="v2-sponsored__label">Paid content</span>
        {sponsorName && <span className="v2-sponsored__name">{sponsorName}</span>}
      </div>
      <div className="v2-sponsored__cards">
        {cells.map((c) => <div key={c.key} className="v2-comp__cell">{c.el}</div>)}
      </div>
      {sponsorName && <p className="v2-sponsored__foot">Paid for by {sponsorName}</p>}
    </div>
  );
}
