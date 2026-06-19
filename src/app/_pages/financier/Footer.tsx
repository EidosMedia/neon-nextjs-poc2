import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { FacebookIcon, TwitterIcon, LinkedinIcon, YoutubeIcon } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    title: 'Help & Subscriptions',
    links: ['Contact us', 'Subscriptions', 'Advertise with us', 'Help centre', 'Accessibility'],
  },
  {
    title: 'Services',
    links: ['Latest news', 'Newsletters', 'Podcasts', 'Archives', 'RSS feeds'],
  },
  {
    title: 'Company',
    links: ['About us', 'Careers', 'Press', 'Legal notices', 'Privacy policy'],
  },
];

export default async function Footer({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: financier/Footer');
  const siteName = data.siteData?.siteName || data.siteNode?.name;
  const siteLabel = data.siteNode?.attributes?.sitename || siteName;
  if (!siteName) throw new Error('Site node data is missing');

  const site = await connection.findSite(siteName);
  const menus = site?.menus;
  const footerMenu = menus?.Footer;
  const footerColumns = footerMenu?.items?.length
    ? footerMenu.items.map((item: any) => ({
        title: item.label,
        links: (item.items ?? []).map((sub: any) => ({ label: sub.label, href: sub.url || sub.ref || '#' })),
      }))
    : null;

  return (
    <footer data-section="footer" className="financier-footer w-full">

      {/* Columns */}
      <div className="w-full max-w-[1300px] mx-auto px-4 pt-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {footerColumns
            ? footerColumns.map((col: { title: string; links: { label: string; href: string }[] }) => (
                <div key={col.title}>
                  <div className="financier-footer-col-title">{col.title}</div>
                  <ul className="flex flex-col gap-1.5">
                    {col.links.map(link => (
                      <li key={link.href}>
                        <a href={link.href}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            : FOOTER_COLUMNS.map(col => (
                <div key={col.title}>
                  <div className="financier-footer-col-title">{col.title}</div>
                  <ul className="flex flex-col gap-1.5">
                    {col.links.map(label => (
                      <li key={label}>
                        <a href="#">{label}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--color-neutral-light)' }} />

      {/* Logotype + social + legal */}
      <div className="w-full max-w-[1300px] mx-auto px-4 py-6 flex flex-col items-center gap-4">
        <a
          href="/"
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: '1.4rem',
            fontWeight: 700,
            color: 'var(--color-neutral-primary)',
            textDecoration: 'none',
          }}
        >
          {siteLabel}
        </a>

        <div className="flex items-center gap-5">
          <a href="#" aria-label="LinkedIn" style={{ color: 'var(--color-neutral-light-2)' }}><LinkedinIcon size={16} /></a>
          <a href="#" aria-label="YouTube" style={{ color: 'var(--color-neutral-light-2)' }}><YoutubeIcon size={16} /></a>
          <a href="#" aria-label="Twitter/X" style={{ color: 'var(--color-neutral-light-2)' }}><TwitterIcon size={16} /></a>
          <a href="#" aria-label="Facebook" style={{ color: 'var(--color-neutral-light-2)' }}><FacebookIcon size={16} /></a>
        </div>

        <div className="financier-footer-legal flex flex-wrap justify-center gap-x-3 gap-y-1 text-center">
          <a href="#">© {new Date().getFullYear()} {siteLabel}</a>
          <span>·</span>
          <a href="#">Privacy policy</a>
          <span>·</span>
          <a href="#">Cookie policy</a>
          <span>·</span>
          <a href="#">Terms &amp; conditions</a>
          <span>·</span>
          <a href="#">Help</a>
        </div>
      </div>

    </footer>
  );
}
