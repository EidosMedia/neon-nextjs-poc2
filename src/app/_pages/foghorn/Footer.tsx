import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    title: 'News',
    links: ['Home', 'UK', 'World', 'Climate crisis', 'Ukraine', 'Environment', 'Science', 'Global development'],
  },
  {
    title: 'Opinion',
    links: ['Columnists', 'Letters', 'Editorials', 'Sport opinion', 'Tech opinion'],
  },
  {
    title: 'Sport',
    links: ['Football', 'Cricket', 'Rugby union', 'Tennis', 'Cycling', 'Golf', 'Athletics'],
  },
  {
    title: 'Culture',
    links: ['Film', 'Music', 'TV & radio', 'Books', 'Art & design', 'Stage', 'Games'],
  },
  {
    title: 'About',
    links: ['About us', 'Contact us', 'Complaints & corrections', 'Advertise with us', 'Work for us', 'Privacy settings'],
  },
];

export default async function Footer({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: foghorn/Footer');
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
    <footer data-section="footer" className="foghorn-footer w-full">

      {/* Columns */}
      <div className="w-full max-w-[1300px] mx-auto px-4 pt-8 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {footerColumns
            ? footerColumns.map((col: { title: string; links: { label: string; href: string }[] }) => (
                <div key={col.title}>
                  <div className="foghorn-footer-col-title">{col.title}</div>
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
                  <div className="foghorn-footer-col-title">{col.title}</div>
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
      <div style={{ borderTop: '1px solid rgba(255,255,255,.15)' }} />

      {/* Logotype + social + legal */}
      <div className="w-full max-w-[1300px] mx-auto px-4 py-6 flex flex-col items-center gap-4">
        <a
          href="/"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            fontSize: '1.4rem',
            fontWeight: 700,
            color: '#ffffff',
            textDecoration: 'none',
          }}
        >
          {siteLabel}
        </a>

        <div className="flex items-center gap-5">
          <a href="#" aria-label="Facebook" style={{ color: 'rgba(255,255,255,.7)' }}><FacebookIcon size={16} /></a>
          <a href="#" aria-label="Twitter/X" style={{ color: 'rgba(255,255,255,.7)' }}><TwitterIcon size={16} /></a>
          <a href="#" aria-label="Instagram" style={{ color: 'rgba(255,255,255,.7)' }}><InstagramIcon size={16} /></a>
          <a href="#" aria-label="YouTube" style={{ color: 'rgba(255,255,255,.7)' }}><YoutubeIcon size={16} /></a>
        </div>

        <div className="foghorn-footer-legal flex flex-wrap justify-center gap-x-3 gap-y-1 text-center">
          <a href="#">© {new Date().getFullYear()} Foghorn News &amp; Media Limited</a>
          <span>·</span>
          <a href="#">Privacy policy</a>
          <span>·</span>
          <a href="#">Cookie policy</a>
          <span>·</span>
          <a href="#">Terms &amp; conditions</a>
          <span>·</span>
          <a href="#">Help</a>
          <span>·</span>
          <a href="#">Accessibility</a>
        </div>
      </div>

    </footer>
  );
}
