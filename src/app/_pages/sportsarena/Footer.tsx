import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

export default async function Footer({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: sportsarena/Footer');
  const siteName = data.siteData?.siteName || data.siteNode?.name || 'SportsArena';
  const year = new Date().getFullYear();

  return (
    <footer className="sa-footer w-full">
      <div
        className="w-full max-w-[1280px] mx-auto px-4 flex items-center justify-between"
        style={{ height: 56 }}
      >
        <span className="sa-footer-brand">{siteName}</span>
        <span className="sa-footer-copy">© {year} · All rights reserved</span>
      </div>
    </footer>
  );
}
