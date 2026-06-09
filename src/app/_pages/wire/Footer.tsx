import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';

const API_LINKS = [
  { label: 'REST API Docs', href: '/api/docs' },
  { label: 'GraphQL Endpoint', href: '/api/graphql' },
  { label: 'Webhook Guide', href: '/api/webhooks' },
  { label: 'SDKs', href: '/api/sdks' },
  { label: 'Status', href: '/status' },
  { label: 'Rate Limits', href: '/api/rate-limits' },
];

const LEGAL_LINKS = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Content License', href: '/license' },
  { label: 'Contact', href: '/contact' },
];

function flattenLinks(items: any[]): any[] {
  if (!Array.isArray(items)) return [];
  return items.flatMap(item => {
    if (Array.isArray(item.items) && item.items.length) {
      return flattenLinks(item.items);
    }
    return [{ label: item.label, href: item.url || item.ref || '#' }];
  });
}

export default async function Footer({
 data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: wire/Footer');
  const siteName = data.siteData?.siteName || data.siteNode?.name || 'Wire Feed';
  const siteLabel = data.siteNode?.attributes?.sitename || siteName;
  const now = new Date();
  const utcString = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  // Footer is non-critical chrome — fetch menus but never throw if the site lookup fails;
  // fall back to the hardcoded link arrays instead.
  const site = await connection.findSite(siteName).catch(() => null);
  const menus = site?.menus;
  const footerMenu = menus?.Footer; // TODO: add legacy fallback name here if/when one is identified for wire
  const footerLinks = footerMenu?.items?.length ? flattenLinks(footerMenu.items) : [];

  return (
    <footer data-section="footer" className="w-full mt-8">
      <div className="w-full max-w-[1440px] mx-auto px-4 py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        {/* Brand + build info */}
        <div className="flex flex-col gap-1">
          <span className="wire-brand">{siteLabel}</span>
          <span style={{ fontFamily: 'var(--font-meta)', fontSize: 10, color: '#6B6B6B', letterSpacing: '0.06em' }}>
            Content Distribution Platform · v2.4.1 · {utcString}
          </span>
        </div>

        {footerLinks.length ? (
          <>
            {/* Menu-driven links */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {footerLinks.map((link, idx) => (
                <a key={link.href || idx} href={link.href} className="text-xs hover:text-[#0050FF]">
                  {link.label}
                </a>
              ))}
            </div>

            {/* Legal / copyright */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-xs">© {now.getFullYear()} Wire Feed Inc.</span>
            </div>
          </>
        ) : (
          <>
            {/* API links */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {API_LINKS.map(link => (
                <a key={link.href} href={link.href} className="text-xs hover:text-[#0050FF]">
                  {link.label}
                </a>
              ))}
            </div>

            {/* Legal */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {LEGAL_LINKS.map(link => (
                <a key={link.href} href={link.href} className="text-xs">
                  {link.label}
                </a>
              ))}
              <span className="text-xs">© {now.getFullYear()} Wire Feed Inc.</span>
            </div>
          </>
        )}

      </div>
    </footer>
  );
}
