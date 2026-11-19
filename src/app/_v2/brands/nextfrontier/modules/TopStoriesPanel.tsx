import Link from 'next/link';
import { blockItems, blockTitle, type BrandModuleProps } from '../../moduleData';

/** Violet "Top stories" panel: `title` (default "Top stories") and numbered linked `main` items. */
export default async function TopStoriesPanel({ block }: BrandModuleProps) {
  const items = await blockItems(block, 5);
  if (items.length === 0) return null;
  const title = blockTitle(block) ?? 'Top stories';
  return (
    <section className="v2-mod-topstories" aria-label={title}>
      <h2 className="v2-mod-topstories__title">{title}</h2>
      <ol className="v2-mod-topstories__list">
        {items.map((i) => (
          <li key={i.id} className="v2-mod-topstories__item">
            {i.href ? <Link href={i.href}>{i.title}</Link> : <span>{i.title}</span>}
          </li>
        ))}
      </ol>
    </section>
  );
}
