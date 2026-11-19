import clsx from 'clsx';
import type { Cell } from './types';

export type DatedGroup = { key: string; label: string; cells: Cell[] };

export default function DatedListing({ groups }: { groups: DatedGroup[] }) {
  return (
    <div className="v2-comp v2-comp--datedListing">
      {groups.map((g) => (
        <section key={g.key} className="v2-dated__group">
          <h3 className="v2-dated__date">{g.label}</h3>
          <div className="v2-dated__grid">
            {g.cells.map((c) => (
              <div key={c.key} className={clsx('v2-comp__cell', c.highlight && 'v2-comp__cell--highlight')}>{c.el}</div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
