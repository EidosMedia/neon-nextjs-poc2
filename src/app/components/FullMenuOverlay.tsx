'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { MenuItem } from '@eidosmedia/neon-frontoffice-ts-sdk';

type FullMenuOverlayProps = {
  items: MenuItem[];
  open: boolean;
  onClose: () => void;
};

const FullMenuOverlay: React.FC<FullMenuOverlayProps> = ({ items, open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !items || items.length === 0) {
    return null;
  }

  return (
    <div
      className="full-menu-overlay fixed inset-0 z-[200] bg-black/70 flex items-start justify-end"
      onClick={onClose}
    >
      <div
        className="full-menu-panel relative bg-white text-black w-full max-w-md h-full overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close menu"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X />
        </button>
        <nav className="mt-12">
          <ul className="flex flex-col gap-3">
            {items.map((item, idx) => (
              <li key={item.ref || item.url || idx}>
                <Link href={item.url || item.ref || '#'} onClick={onClose}>
                  {item.label}
                </Link>
                {item.items && item.items.length > 0 && (
                  <ul className="flex flex-col gap-2 mt-2 ml-4 pl-2 border-l border-gray-300">
                    {item.items.map((subItem, subIdx) => (
                      <li key={subItem.ref || subItem.url || subIdx}>
                        <Link href={subItem.url || subItem.ref || '#'} onClick={onClose}>
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default FullMenuOverlay;
