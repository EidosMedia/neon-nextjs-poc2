import Link from 'next/link';
import { blockItems, blockTitle, type BrandModuleProps } from '../../moduleData';

const fmt = (iso?: string) => {
  const d = iso ? new Date(iso) : undefined;
  return d && !Number.isNaN(d.getTime()) ? { text: d.toISOString().slice(11, 16), iso: d.toISOString() } : undefined;
};

/** Live ticker: linked `main` items as an ordered list (title, link, publication time). No marquee. */
export default async function LiveTicker({ block }: BrandModuleProps) {
  const items = await blockItems(block, 6);
  if (items.length === 0) return null;
  const title = blockTitle(block) ?? 'Live updates';
  return (
    <section className="v2-mod-ticker" aria-label={title}>
      <div className="v2-container v2-mod-ticker__inner">
        <h2 className="v2-mod-ticker__label"><span className="v2-mod-ticker__dot" aria-hidden="true" />LIVE</h2>
        <ol className="v2-mod-ticker__list">
          {items.map((i) => {
            const t = fmt(i.time);
            return (
              <li key={i.id} className="v2-mod-ticker__item">
                {t && <time className="v2-mod-ticker__time" dateTime={t.iso}>{t.text}</time>}
                {i.href ? <Link href={i.href}>{i.title}</Link> : <span>{i.title}</span>}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
