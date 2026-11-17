'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { fitCount, isActiveHref, type MenuLink } from '../lib/menu';
import MenuToggle from './MenuToggle';

/** Kept for existing imports; the link tree type now lives in `lib/menu`. */
export type ChromeLink = MenuLink;

/** Flyout content: children, with grandchildren as an indented sub-list (deeper levels live in the burger menu). */
function Flyout({ items, label }: { items: MenuLink[]; label: string }) {
  return (
    <div className={`v2-nav__flyout${items.length > 8 ? ' v2-nav__flyout--wide' : ''}`} role="group" aria-label={label}>
      <ul>
        {items.map((child, i) => (
          <li key={`${i}-${child.label}`}>
            <NavLabel link={child} className="v2-nav__flyout-link" />
            {child.items && child.items.length > 0 && (
              <ul className="v2-nav__flyout-sub">
                {child.items.map((leaf, j) => (
                  <li key={`${j}-${leaf.label}`}>
                    <NavLabel link={leaf} className="v2-nav__flyout-link" />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavLabel({ link, className, ...rest }: { link: MenuLink; className?: string } & Record<string, unknown>) {
  return link.href ? (
    <Link href={link.href} className={className} {...rest}>
      {link.label}
    </Link>
  ) : (
    <span className={`${className ?? ''} v2-nav__group`} {...rest}>
      {link.label}
    </span>
  );
}

/**
 * Top-level section links on one row. The row measures itself (ResizeObserver, plus once web fonts
 * load) and shows as many leading entries as fit; the rest are reachable through a "More" entry that
 * opens the burger drawer with `moreLinks`. Entries with children show them in a flyout on hover or
 * keyboard focus (CSS `:hover` / `:focus-within`).
 *
 * Overflowing entries stay in the DOM, absolutely positioned and `visibility: hidden`, so their widths
 * can be re-measured without a second render pass; `visibility: hidden` also removes them from the tab
 * order and the accessibility tree.
 */
export default function Nav({
  links,
  pathname,
  moreLinks,
  moreLabel = 'More',
}: {
  links: MenuLink[];
  pathname: string | null;
  moreLinks?: MenuLink[];
  moreLabel?: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  /** `null` until the first measurement: the row is then clipped (no wrap) instead of flashing tall. */
  const [visible, setVisible] = useState<number | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const items = Array.from(list.querySelectorAll<HTMLElement>(':scope > .v2-nav__item'));
      const more = list.querySelector<HTMLElement>(':scope > .v2-nav__more');
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      setVisible(
        fitCount(
          items.map(item => item.getBoundingClientRect().width),
          list.clientWidth,
          more?.getBoundingClientRect().width ?? 0,
          gap
        )
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [links]);

  if (links.length === 0) return null;
  const shown = visible ?? links.length;
  const overflowing = visible !== null && visible < links.length;

  return (
    <nav className="v2-nav" aria-label="Sections" data-measured={visible !== null ? '' : undefined}>
      <ul ref={listRef}>
        {links.map((link, i) => {
          const hasChildren = !!link.items && link.items.length > 0;
          const hidden = i >= shown;
          const edge = i < 2 ? ' v2-nav__item--start' : i >= shown - 2 ? ' v2-nav__item--end' : '';
          return (
            <li
              key={`${i}-${link.label}`}
              className={`v2-nav__item${hasChildren ? ' v2-nav__item--parent' : ''}${edge}${hidden ? ' v2-nav__item--hidden' : ''}`}
            >
              <NavLabel
                link={link}
                aria-current={isActiveHref(link.href, pathname) ? 'page' : undefined}
                {...(!link.href ? { tabIndex: 0 } : {})}
              />
              {hasChildren && <Flyout items={link.items!} label={link.label} />}
            </li>
          );
        })}
        <li className={`v2-nav__more${overflowing || visible === null ? '' : ' v2-nav__item--hidden'}`}>
          <MenuToggle items={moreLinks ?? links} pathname={pathname} label={moreLabel} className="v2-menutoggle--more" />
        </li>
      </ul>
    </nav>
  );
}
