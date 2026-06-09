import React from 'react';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { FacebookIcon, TwitterIcon, InstagramIcon, YoutubeIcon } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    title: 'NEWS',
    links: ['Home Page', 'World', 'U.S.', 'Politics', 'N.Y.', 'Business', 'Tech', 'Science', 'Health'],
  },
  {
    title: 'ARTS',
    links: ['Today\'s Arts', 'Books', 'Dance', 'Movies', 'Music', 'Pop Culture', 'Television', 'Theater'],
  },
  {
    title: 'LIVING',
    links: ['Automobiles', 'Games', 'Education', 'Food', 'Health', 'Jobs', 'Love', 'Magazine'],
  },
  {
    title: 'MORE',
    links: ['Reader Center', 'Wirecutter', 'Live Events', 'The Learning Network', 'Tools & Services', 'Multimedia', 'Photography'],
  },
  {
    title: 'SUBSCRIBE',
    links: ['Home Delivery', 'Digital Subscriptions', 'Games', 'Cooking'],
  },
];

export default async function Footer({
 data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: oldtown/Footer');
  const siteName = data.siteData?.siteName || data.siteNode?.name;
  if (!siteName) throw new Error('Site node data is missing');

  const site = await connection.findSite(siteName);
  if (!site) throw new Error('Site not found');

  const menus = site.menus;
  const footerMenu = menus?.Footer; // TODO: add legacy fallback name here if/when one is identified for oldtown
  const footerColumns = footerMenu?.items?.length
    ? footerMenu.items.map((item: any) => ({
      title: item.label,
      links: (item.items ?? []).map((subItem: any) => ({
        label: subItem.label,
        href: subItem.url || subItem.ref || '#',
      })),
    }))
    : null;

  return (
    <footer data-section="footer" className="w-full mt-10">

      {/* Main columns */}
      <div className="w-full max-w-[1280px] mx-auto px-4 pt-8 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {footerColumns
            ? footerColumns.map((col: { title: string; links: { label: string; href: string }[] }) => (
              <div key={col.title}>
                <div className="footer-col-title">{col.title}</div>
                <ul className="flex flex-col gap-1.5">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <a href={link.href} className="text-xs hover:underline" style={{ color: '#363636' }}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
            : FOOTER_COLUMNS.map(col => (
              <div key={col.title}>
                <div className="footer-col-title">{col.title}</div>
                <ul className="flex flex-col gap-1.5">
                  {col.links.map(label => (
                    <li key={label}>
                      <a href="#" className="text-xs hover:underline" style={{ color: '#363636' }}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" style={{ borderColor: '#DFDFDF' }} />

      {/* Masthead + social + legal */}
      <div className="w-full max-w-[1280px] mx-auto px-4 py-6 flex flex-col items-center gap-4">
        <a href="/" style={{
          fontFamily: '\'Old English Text MT\', \'UnifrakturMaguntia\', \'Times New Roman\', serif',
          fontSize: '1.4rem',
          color: '#121212',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
        }}>
          The Oldtown Tribune
        </a>

        {/* Social icons */}
        <div className="flex items-center gap-5">
          <a href="#" aria-label="Facebook" className="footer-social-icon" style={{ color: '#666' }}><FacebookIcon size={16} /></a>
          <a href="#" aria-label="Twitter/X" className="footer-social-icon" style={{ color: '#666' }}><TwitterIcon size={16} /></a>
          <a href="#" aria-label="Instagram" className="footer-social-icon" style={{ color: '#666' }}><InstagramIcon size={16} /></a>
          <a href="#" aria-label="YouTube" className="footer-social-icon" style={{ color: '#666' }}><YoutubeIcon size={16} /></a>
        </div>

        {/* Legal */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 footer-legal text-center">
          <a href="#">© {new Date().getFullYear()} The Oldtown Tribune</a>
          <span>·</span>
          <a href="#">NYTCo</a>
          <span>·</span>
          <a href="#">Contact Us</a>
          <span>·</span>
          <a href="#">Accessibility</a>
          <span>·</span>
          <a href="#">Work with us</a>
          <span>·</span>
          <a href="#">Advertise</a>
          <span>·</span>
          <a href="#">T Brand Studio</a>
          <span>·</span>
          <a href="#">Privacy Policy</a>
          <span>·</span>
          <a href="#">Terms of Service</a>
          <span>·</span>
          <a href="#">Site Map</a>
        </div>
      </div>

    </footer>
  );
}
