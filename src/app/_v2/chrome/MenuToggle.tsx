'use client';
import {
  useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
  type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type ReactNode,
} from 'react';
import Link from 'next/link';
import {
  activeAncestorKeys, countLinks, filterLinks, isActiveHref, megaGroups, nodeKey, toggleAccordion, type MenuLink,
} from '../lib/menu';

/** Kept for existing imports; the link tree type lives in `lib/menu`. */
export type ChromeLink = MenuLink;

/** Trees with more nodes than this get a filter box. */
const FILTER_THRESHOLD = 12;
/** Level-2 links shown per group in the desktop panel; the rest live on the section page. */
const MEGA_CAP = 8;
/** Same breakpoint as the header CSS: from here up the full menu is the panel under the header. */
const DESKTOP_QUERY = '(min-width: 768px)';

type Mode = 'drawer' | 'mega';

/** Desktop full menu: every section in menu order, flowing in columns (heading + up to MEGA_CAP level-2 links). */
function Mega({ links, pathname, onNavigate }: { links: MenuLink[]; pathname: string | null; onNavigate: () => void }) {
  const groups = megaGroups(links, MEGA_CAP, pathname);
  const label = (link: MenuLink, className: string) =>
    link.href ? (
      <Link href={link.href} className={className} onClick={onNavigate}
        aria-current={isActiveHref(link.href, pathname) ? 'page' : undefined}>
        {link.label}
      </Link>
    ) : (
      <span className={className}>{link.label}</span>
    );
  return (
    <ul className="v2-mega__groups">
      {groups.map(({ link, shown, hidden, active }, i) => (
        <li
          key={`${i}-${link.label}`}
          className={`v2-mega__group${active ? ' v2-mega__group--active' : ''}${shown.length === 0 ? ' v2-mega__group--leaf' : ''}`}
        >
          <h3 className="v2-mega__heading">{label(link, 'v2-mega__heading-link')}</h3>
          {shown.length > 0 && (
            <ul className="v2-mega__links">
              {shown.map((child, j) => (
                <li key={`${j}-${child.label}`}>{label(child, 'v2-mega__link')}</li>
              ))}
              {hidden > 0 && link.href && (
                <li>
                  <Link href={link.href} className="v2-mega__all" onClick={onNavigate}>
                    All in {link.label} ({shown.length + hidden})
                  </Link>
                </li>
              )}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

type TreeProps = {
  links: MenuLink[];
  parent: string;
  depth: number;
  isOpen: (key: string) => boolean;
  toggle: (key: string) => void;
  onNavigate: () => void;
  pathname: string | null;
};

/** One level of the accordion tree. Collapsed branches are not rendered, so huge trees stay cheap. */
function Tree({ links, parent, depth, isOpen, toggle, onNavigate, pathname }: TreeProps) {
  return (
    <ul className={depth === 0 ? 'v2-drawer__tree' : 'v2-drawer__sub'}>
      {links.map((link, i) => {
        const key = nodeKey(parent, i);
        const hasChildren = !!link.items && link.items.length > 0;
        const expanded = hasChildren && isOpen(key);
        const nav = { 'data-menu-nav': '', 'data-key': key, 'data-parent': parent };
        const chevron = <span className="v2-drawer__chevron" aria-hidden="true" />;
        return (
          <li key={`${key}-${link.label}`} className="v2-drawer__node" data-depth={Math.min(depth, 4)}>
            <div className="v2-drawer__row">
              {link.href ? (
                <Link
                  href={link.href}
                  className="v2-drawer__link"
                  aria-current={isActiveHref(link.href, pathname) ? 'page' : undefined}
                  onClick={onNavigate}
                  {...nav}
                >
                  {link.label}
                </Link>
              ) : (
                hasChildren && (
                  <button
                    type="button"
                    className="v2-drawer__link v2-drawer__group"
                    aria-expanded={expanded}
                    onClick={() => toggle(key)}
                    {...nav}
                  >
                    {link.label}
                    {chevron}
                  </button>
                )
              )}
              {link.href && hasChildren && (
                <button
                  type="button"
                  className="v2-drawer__toggle"
                  aria-expanded={expanded}
                  aria-label={`${expanded ? 'Collapse' : 'Expand'} ${link.label}`}
                  onClick={() => toggle(key)}
                  {...nav}
                >
                  {chevron}
                </button>
              )}
            </div>
            {expanded && (
              <Tree
                links={link.items!}
                parent={key}
                depth={depth + 1}
                isOpen={isOpen}
                toggle={toggle}
                onNavigate={onNavigate}
                pathname={pathname}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Burger button + full site menu, shared by every brand (brands only restyle it).
 * - Desktop (≥768px, unless `variant="drawer"`): a panel under the header with one group per
 *   section in menu order (level 1 + up to 8 level-2 links, then "All in …"), flowing in columns, and a
 *   filter for large trees (the filtered view is the full tree, every level).
 * - Mobile: a side drawer with a site search field, the filter for large trees, an accordion tree
 *   of any depth with one open branch per level, and `actions` (Subscribe/Login) at the bottom.
 * Keyboard: Esc closes, Tab stays inside; in trees ↑/↓/Home/End move, → expands or enters,
 * ← collapses or goes to the parent.
 */
export default function MenuToggle({
  items,
  label = 'Menu',
  iconOnly = false,
  className,
  pathname = null,
  drawerItems,
  actions,
  variant = 'auto',
}: {
  /** Tree for the desktop panel (and for the drawer when `drawerItems` is not given). */
  items: MenuLink[];
  /** Tree for the mobile drawer, where the inline navigation is hidden. */
  drawerItems?: MenuLink[];
  label?: string;
  iconOnly?: boolean;
  className?: string;
  pathname?: string | null;
  /** Shown at the bottom of the mobile drawer (Subscribe, Login). */
  actions?: ReactNode;
  /** `drawer` always uses the side drawer; `auto` uses the panel on desktop. */
  variant?: 'auto' | 'drawer';
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('drawer');
  const [megaTop, setMegaTop] = useState(0);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const panelId = useId();
  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const tree = mode === 'drawer' ? (drawerItems ?? items) : items;
  const total = useMemo(() => countLinks(tree), [tree]);
  const filtering = query.trim() !== '';
  const visible = useMemo(() => filterLinks(tree, query), [tree, query]);

  /** Bottom edge of the header (the Arena pill when the header itself is an overlay). */
  const headerBottom = () => {
    const button = buttonRef.current;
    const anchor = button?.closest('.v2-header__pill') ?? button?.closest('.v2-header');
    return Math.max(0, Math.round(anchor?.getBoundingClientRect().bottom ?? 0));
  };

  const openMenu = () => {
    const desktop = variant === 'auto' && window.matchMedia(DESKTOP_QUERY).matches;
    setMode(desktop ? 'mega' : 'drawer');
    if (desktop) setMegaTop(headerBottom());
    // One open branch per level: only the path to the current page starts open.
    setExpanded(new Set(activeAncestorKeys(desktop ? items : (drawerItems ?? items), pathname)));
    setQuery('');
    setOpen(true);
  };
  const close = (restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    const first =
      panel?.querySelector<HTMLElement>('[aria-current="page"]') ??
      panel?.querySelector<HTMLElement>('.v2-drawer__filter, [data-menu-nav], .v2-mega a');
    first?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // The panel follows the header on resize; crossing the breakpoint closes the menu.
  useLayoutEffect(() => {
    if (!open || variant === 'drawer') return;
    const media = window.matchMedia(DESKTOP_QUERY);
    const onResize = () => {
      if ((media.matches ? 'mega' : 'drawer') !== mode) setOpen(false);
      else if (mode === 'mega') setMegaTop(headerBottom());
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open, mode, variant]);

  const isOpen = (key: string) => filtering || expanded.has(key);
  const toggle = (key: string) => {
    if (filtering) return;
    setExpanded(prev => toggleAccordion(prev, key));
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const panel = panelRef.current;
    if (!panel) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'Tab') {
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>('a[href], button, input'));
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl?.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl?.focus();
      }
      return;
    }
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT') {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        panel.querySelector<HTMLElement>('[data-menu-nav], .v2-mega a')?.focus();
      }
      return;
    }
    const navs = Array.from(panel.querySelectorAll<HTMLElement>('[data-menu-nav]'));
    const index = navs.indexOf(target);
    if (index < 0) return;
    const key = target.dataset.key ?? '';
    const focusAt = (i: number) => navs[Math.max(0, Math.min(navs.length - 1, i))]?.focus();
    const hasChildren = !!panel.querySelector(`[data-key="${key}"][aria-expanded]`);
    const isExpanded = panel.querySelector(`[data-key="${key}"][aria-expanded]`)?.getAttribute('aria-expanded') === 'true';
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (index === 0) panel.querySelector<HTMLElement>('.v2-drawer__filter')?.focus();
        else focusAt(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusAt(navs.length - 1);
        break;
      case 'ArrowRight':
        if (!hasChildren) break;
        event.preventDefault();
        if (!isExpanded) toggle(key);
        else panel.querySelector<HTMLElement>(`[data-parent="${key}"]`)?.focus();
        break;
      case 'ArrowLeft': {
        event.preventDefault();
        if (hasChildren && isExpanded) toggle(key);
        else panel.querySelector<HTMLElement>(`[data-key="${target.dataset.parent}"]`)?.focus();
        break;
      }
    }
  };

  const filterBox = (
    <input
      type="search"
      className="v2-drawer__filter"
      placeholder="Filter sections"
      aria-label="Filter sections"
      value={query}
      onChange={event => setQuery(event.target.value)}
    />
  );

  return (
    <div className={`v2-menutoggle${className ? ` ${className}` : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className="v2-menutoggle__button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-haspopup="dialog"
        onClick={() => (open ? close(false) : openMenu())}
      >
        <span className="v2-menutoggle__icon" aria-hidden="true" />
        <span className={iconOnly ? 'v2-visually-hidden' : undefined}>{label}</span>
      </button>
      {open && (
        <>
          <div
            className={`v2-drawer__backdrop${mode === 'mega' ? ' v2-drawer__backdrop--mega' : ''}`}
            style={mode === 'mega' ? { top: megaTop } : undefined}
            aria-hidden="true"
            onClick={() => close()}
          />
          <div
            ref={panelRef}
            id={panelId}
            className={mode === 'mega' ? 'v2-mega' : 'v2-drawer'}
            style={mode === 'mega' ? ({ top: megaTop, '--v2-mega-top': `${megaTop}px` } as CSSProperties) : undefined}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onKeyDown={onKeyDown}
          >
            <div className={mode === 'mega' ? 'v2-mega__head' : 'v2-drawer__head'}>
              <p id={titleId} className={mode === 'mega' ? 'v2-visually-hidden' : 'v2-drawer__title'}>
                {label}
              </p>
              {total > FILTER_THRESHOLD && mode === 'mega' && filterBox}
              <button type="button" className="v2-drawer__close" aria-label="Close menu" onClick={() => close()}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            {mode === 'drawer' && (
              <form className="v2-drawer__search" role="search" action="/search" method="get">
                <label className="v2-visually-hidden" htmlFor={`${panelId}-q`}>Search</label>
                <input id={`${panelId}-q`} type="search" name="query" className="v2-drawer__search-input" placeholder="Search" />
              </form>
            )}
            {total > FILTER_THRESHOLD && mode === 'drawer' && filterBox}
            <nav className={mode === 'mega' ? 'v2-mega__body' : 'v2-drawer__body'} aria-label={label}>
              {visible.length === 0 ? (
                <p className="v2-drawer__empty" role="status">
                  No sections match “{query.trim()}”.
                </p>
              ) : mode === 'mega' && !filtering ? (
                <Mega links={visible} pathname={pathname} onNavigate={() => close(false)} />
              ) : (
                <Tree
                  links={visible}
                  parent=""
                  depth={0}
                  isOpen={isOpen}
                  toggle={toggle}
                  onNavigate={() => close(false)}
                  pathname={pathname}
                />
              )}
            </nav>
            {mode === 'drawer' && actions && <div className="v2-drawer__actions">{actions}</div>}
          </div>
        </>
      )}
    </div>
  );
}
