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
  console.log('[NEON] render: nextfrontier/Footer');
  const siteName = data.siteData?.siteName || data.siteNode?.name;
  const siteLabel = data.siteNode?.attributes?.sitename || siteName;
  if (!siteName) throw new Error('Site node data is missing');
  const year = new Date().getFullYear();

  // Footer is non-critical chrome — fetch menus but never throw if the site lookup fails;
  // fall back to the hardcoded links instead.
  const site = await connection.findSite(siteName).catch(() => null);
  const footerMenu = site?.menus?.Footer;
  const footerLinks = footerMenu?.items?.length ? flattenLinks(footerMenu.items) : [];

  return (
    <footer className="nf-footer w-full">
      <div className="nf-footer-inner">
        <span className="nf-footer-logo">
          NEXT<br /><span style={{ color: 'var(--nf-accent)' }}>FRONT</span><br />IER
        </span>
        <div className="nf-footer-links">
          <span>© {year} {siteLabel}</span>
          {footerLinks.length
            ? footerLinks.map((link, idx) => (
                <a key={link.href || idx} href={link.href}>{link.label}</a>
              ))
            : (
              <>
                <a href="#">About</a>
                <a href="#">Contact</a>
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
              </>
            )}
        </div>
      </div>
    </footer>
  );
}
