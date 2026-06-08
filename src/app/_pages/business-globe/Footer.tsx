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
  console.log('[NEON] render: business-globe/Footer');
  const siteName = data.siteData?.siteName || data.siteNode?.attributes?.sitename || data.siteNode?.name;
  const year = new Date().getFullYear();

  // Footer is non-critical chrome — fetch menus but never throw if the site lookup fails;
  // fall back to the hardcoded links instead.
  const site = await connection.findSite(siteName).catch(() => null);
  const footerMenu = site?.menus?.Footer;
  const footerLinks = footerMenu?.items?.length ? flattenLinks(footerMenu.items) : [];

  return (
    <footer className="bgl-footer w-full">
      <div className="bgl-footer-inner">
        <span className="bgl-footer-brand">{siteName}</span>
        <div className="bgl-footer-links">
          <span>© {year} BusinessGlobe Ltd.</span>
          {footerLinks.length
            ? footerLinks.map((link, idx) => (
                <a key={link.href || idx} href={link.href}>{link.label}</a>
              ))
            : (
              <>
                <a href="#">Terms</a>
                <a href="#">Privacy</a>
                <a href="#">Accessibility</a>
              </>
            )}
        </div>
      </div>
    </footer>
  );
}
