import Link from 'next/link';
import { blockItems, blockSummary, blockTitle, type BrandModuleProps } from './moduleData';

/**
 * Breaking news strip shared by Arena and Frontier. Reads `title` (falls back to the first
 * linked item's title), optional `summary`, and the first `main` link for the href.
 */
export default async function BreakingStrip({ block, brand }: BrandModuleProps & { brand: 'arena' | 'frontier' }) {
  const first = (await blockItems(block, 1))[0];
  const headline = blockTitle(block) ?? first?.title;
  if (!headline) return null;
  const summary = blockSummary(block);
  return (
    <aside className={`v2-mod-breaking v2-mod-breaking--${brand}`} aria-label="Breaking news">
      <div className="v2-container v2-mod-breaking__inner">
        <strong className="v2-mod-breaking__label">{brand === 'arena' ? 'BREAKING' : 'BREAKING NEWS'}</strong>
        {first?.href ? (
          <Link href={first.href} className="v2-mod-breaking__headline">{headline}</Link>
        ) : (
          <span className="v2-mod-breaking__headline">{headline}</span>
        )}
        {summary && <span className="v2-mod-breaking__summary">{summary}</span>}
      </div>
    </aside>
  );
}
