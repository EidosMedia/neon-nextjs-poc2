import type { Cell } from './types';

/** One full-width item: the first linked item of the zone, with its image and summary on the link settings. */
export default function Banner({ cells }: { cells: Cell[] }) {
  const [lead] = cells;
  return (
    <div className="v2-comp v2-comp--banner">
      <div className="v2-comp__lead">{lead?.el}</div>
    </div>
  );
}
