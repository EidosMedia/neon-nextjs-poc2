'use client';
import React, { useState } from 'react';
import { MenuItem } from '@eidosmedia/neon-frontoffice-ts-sdk';
import FullMenuOverlay from '../../components/FullMenuOverlay';

type MenuToggleProps = {
  items: MenuItem[];
};

const MenuToggle: React.FC<MenuToggleProps> = ({ items }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" aria-label="Menu" onClick={() => setOpen(true)}>☰</button>
      <FullMenuOverlay items={items} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default MenuToggle;
