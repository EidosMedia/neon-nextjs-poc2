import { attr, blockAttrs, blockSummary, blockTitle, parseList, type BrandModuleProps } from '../../moduleData';

/**
 * Verdict box. Reads `title`, `summary` (the verdict text), `attributes.rating` (e.g. "8.5"),
 * `attributes.pros` and `attributes.cons` ("a|b|c"). Hidden when none of them exist.
 */
export default function VerdictBox({ block }: BrandModuleProps) {
  const a = blockAttrs(block);
  const title = blockTitle(block);
  const summary = blockSummary(block);
  const rating = attr(a, 'rating');
  const pros = parseList(a.pros);
  const cons = parseList(a.cons);
  if (!summary && !rating && pros.length === 0 && cons.length === 0) return null;
  return (
    <section className="v2-mod-verdict" aria-label={title ?? 'Verdict'}>
      <h2 className="v2-mod-verdict__title">{title ?? 'Verdict'}</h2>
      {rating && <p className="v2-mod-verdict__rating" aria-label={`Rating ${rating}`}>{rating}</p>}
      {summary && <p className="v2-mod-verdict__summary">{summary}</p>}
      {pros.length > 0 && (
        <div className="v2-mod-verdict__group">
          <h3 className="v2-mod-verdict__sub">Pros</h3>
          <ul>{pros.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
      )}
      {cons.length > 0 && (
        <div className="v2-mod-verdict__group">
          <h3 className="v2-mod-verdict__sub">Cons</h3>
          <ul>{cons.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
      )}
    </section>
  );
}
