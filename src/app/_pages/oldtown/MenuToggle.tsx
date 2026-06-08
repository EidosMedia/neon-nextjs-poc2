'use client';
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { MenuItem } from '@eidosmedia/neon-frontoffice-ts-sdk';
import FullMenuOverlay from '../../components/FullMenuOverlay';

type MenuToggleProps = {
  items: MenuItem[];
};

const MenuToggle: React.FC<MenuToggleProps> = ({ items }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="flex items-center gap-1.5 oldtown-utility-link font-bold" aria-label="Sections" onClick={() => setOpen(true)}>
        <Menu className="w-4 h-4" />
        <span className="hidden sm:inline text-xs tracking-widest uppercase">Sections</span>
      </button>
      <FullMenuOverlay items={items} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default MenuToggle;
