import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

function flattenLinks(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap(item => {
    if (Array.isArray(item.items) && item.items.length) {
      return flattenLinks(item.items);
    }
    return [{ label: item.label, href: item.url || item.ref || '#' }];
  });
}

export default async function Footer({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: sportsarena/Footer');
  const siteName = data.siteData?.siteName || data.siteNode?.attributes?.sitename || data.siteNode?.name;
  const year = new Date().getFullYear();

  // Footer is non-critical chrome — fetch menus but never throw if the site lookup fails.
  const site = await connection.findSite(siteName).catch(() => null);
  const footerMenu = site?.menus?.Footer;
  const footerLinks = footerMenu?.items?.length ? flattenLinks(footerMenu.items) : [];

  return (
    <footer className="sa-footer w-full">
      <div className="w-full max-w-[1280px] mx-auto px-4 flex flex-col items-center" style={{ minHeight: 56 }}>
        <div className="w-full flex items-center justify-between" style={{ height: 56 }}>
          <span className="sa-footer-brand">{siteName}</span>
          <span className="sa-footer-copy">© {year} · All rights reserved</span>
        </div>
        {footerLinks.length > 0 && (
          <div className="sa-footer-links w-full flex flex-wrap items-center gap-x-5 gap-y-1 pb-3">
            {footerLinks.map((link, idx) => (
              <a key={link.href || idx} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
