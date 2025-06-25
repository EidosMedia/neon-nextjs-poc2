'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

type Link = { label: string; href: string };

export default function FooterMenu({ title, links }: { title: string; links: Link[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Mobile: collapsible */}
      <div className="lg:hidden">
        <button
          className="w-full flex justify-between items-center font-bold mb-2 focus:outline-none"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
        >
          <span>{title}</span>
          <span>
            <ChevronDown />
          </span>
        </button>
        {open && (
          <ul className="space-y-2 mb-2">
            {links.map(link => (
              <li key={Math.random()}>
                <a href={link.href} className="hover:underline">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Desktop: always open */}
      <div className="hidden lg:block">
        <div className="font-bold mb-2">{title}</div>
        <ul className="space-y-2">
          {links.map(link => (
            <li key={Math.random()}>
              <a href={link.href} className="hover:underline">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
