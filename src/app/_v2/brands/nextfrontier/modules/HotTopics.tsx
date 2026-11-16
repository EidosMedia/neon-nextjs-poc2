import Link from 'next/link';
import { blockItems, blockTitle, type BrandModuleProps } from '../../moduleData';

/** Yellow "Hot topics" band: `title` (default "Hot topics") and linked `main` items as pills. */
export default async function HotTopics({ block }: BrandModuleProps) {
  const items = await blockItems(block, 10);
  if (items.length === 0) return null;
  const title = blockTitle(block) ?? 'Hot topics';
  return (
    <section className="v2-mod-hot" aria-label={title}>
      <div className="v2-container v2-mod-hot__inner">
        <h2 className="v2-mod-hot__title">{title}</h2>
        <ul className="v2-mod-hot__list">
          {items.map((i) => (
            <li key={i.id}>{i.href ? <Link href={i.href}>{i.title}</Link> : <span>{i.title}</span>}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
