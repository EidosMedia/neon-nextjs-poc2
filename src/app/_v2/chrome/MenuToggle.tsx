'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';

export type ChromeLink = { label: string; href: string; items?: ChromeLink[] };

/**
 * Disclosure button + panel listing the site menu. Used for the Globe "Menu" button and for the
 * mobile (<768px) collapsed navigation in every brand.
 */
export default function MenuToggle({
  items,
  label = 'Menu',
  className,
}: {
  items: ChromeLink[];
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  return (
    <div className={`v2-menutoggle${className ? ` ${className}` : ''}`}>
      <button
        ref={buttonRef}
        type="button"
        className="v2-menutoggle__button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(v => !v)}
      >
        <span className="v2-menutoggle__icon" aria-hidden="true" />
        <span>{label}</span>
      </button>
      <div id={panelId} className="v2-menutoggle__panel" hidden={!open}>
        <ul>
          {items.map(item => (
            <li key={`${item.href}-${item.label}`}>
              <Link href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
              {item.items && item.items.length > 0 && (
                <ul>
                  {item.items.map(child => (
                    <li key={`${child.href}-${child.label}`}>
                      <Link href={child.href} onClick={() => setOpen(false)}>
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
