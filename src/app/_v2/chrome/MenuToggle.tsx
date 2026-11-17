'use client';
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import Link from 'next/link';
import { activeAncestorKeys, countLinks, filterLinks, isActiveHref, nodeKey, type MenuLink } from '../lib/menu';

/** Kept for existing imports; the link tree type lives in `lib/menu`. */
export type ChromeLink = MenuLink;

/** Trees with more nodes than this get a filter box. */
const FILTER_THRESHOLD = 12;

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
 * Burger button + side drawer listing the full site menu as an accordion tree (any depth).
 * Used for the Globe "Menu" button and for the mobile (<768px) navigation in every brand.
 * Keyboard: ↑/↓/Home/End move, → expands or enters, ← collapses or goes to the parent, Esc closes.
 */
export default function MenuToggle({
  items,
  label = 'Menu',
  className,
  pathname = null,
}: {
  items: MenuLink[];
  label?: string;
  className?: string;
  pathname?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const panelId = useId();
  const titleId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const total = useMemo(() => countLinks(items), [items]);
  const filtering = query.trim() !== '';
  const visible = useMemo(() => filterLinks(items, query), [items, query]);

  const openMenu = () => {
    setExpanded(new Set(activeAncestorKeys(items, pathname)));
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
      panel?.querySelector<HTMLElement>('.v2-drawer__filter, [data-menu-nav]');
    first?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isOpen = (key: string) => filtering || expanded.has(key);
  const toggle = (key: string) => {
    if (filtering) return;
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
        panel.querySelector<HTMLElement>('[data-menu-nav]')?.focus();
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
        <span>{label}</span>
      </button>
      {open && (
        <>
          <div className="v2-drawer__backdrop" aria-hidden="true" onClick={() => close()} />
          <div
            ref={panelRef}
            id={panelId}
            className="v2-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onKeyDown={onKeyDown}
          >
            <div className="v2-drawer__head">
              <p id={titleId} className="v2-drawer__title">
                {label}
              </p>
              <button type="button" className="v2-drawer__close" aria-label="Close menu" onClick={() => close()}>
                <span aria-hidden="true">×</span>
              </button>
            </div>
            {total > FILTER_THRESHOLD && (
              <input
                type="search"
                className="v2-drawer__filter"
                placeholder="Filter sections"
                aria-label="Filter sections"
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
            )}
            <nav className="v2-drawer__body" aria-label={label}>
              {visible.length > 0 ? (
                <Tree
                  links={visible}
                  parent=""
                  depth={0}
                  isOpen={isOpen}
                  toggle={toggle}
                  onNavigate={() => close(false)}
                  pathname={pathname}
                />
              ) : (
                <p className="v2-drawer__empty" role="status">
                  No sections match “{query.trim()}”.
                </p>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
