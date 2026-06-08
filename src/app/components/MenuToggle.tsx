'use client';
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { MenuItem } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { Button } from './baseComponents/button';
import FullMenuOverlay from './FullMenuOverlay';

type MenuToggleProps = {
  items: MenuItem[];
};

const MenuToggle: React.FC<MenuToggleProps> = ({ items }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <Menu />
      </Button>
      <FullMenuOverlay items={items} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default MenuToggle;
