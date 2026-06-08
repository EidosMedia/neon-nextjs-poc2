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
      <button className="adn-hamburger flex items-center" aria-label="Menu" onClick={() => setOpen(true)}>
        <Menu className="w-5 h-5" />
      </button>
      <FullMenuOverlay items={items} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default MenuToggle;
