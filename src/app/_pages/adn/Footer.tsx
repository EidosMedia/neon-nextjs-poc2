import React from 'react';
import Image from 'next/image';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { InstagramIcon, FacebookIcon, TwitterIcon, YoutubeIcon, LinkedinIcon, RssIcon } from 'lucide-react';
import FooterMenu from '../../components/FooterMenu';

export default async function Footer({
 data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: adn/Footer');
  const siteName = data.siteData?.siteName || data.siteNode?.name;
  if (!siteName) {
    throw new Error('Site node data is missing');
  }
  const site = await connection.findSite(siteName);
  if (!site) {
    throw new Error('Site not found');
  }

  const menus = site.menus;

  function flattenLinks(items: any[]): any[] {
    if (!Array.isArray(items)) return [];
    return items.map(child => ({
      label: child.label,
      href: child.url || child.ref || '#',
    }));
  }

  const footerMenu = menus?.Footer ?? menus?.MenuFooter; // TODO: drop legacy MenuFooter fallback once CMS menus renamed

  return (
    <footer data-section="footer" className="w-full mt-8" style={{ backgroundColor: '#111111' }}>
      {/* Main footer columns */}
      <div className="w-full max-w-[1280px] mx-auto px-4 pt-10 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {footerMenu?.items?.map((item: any, idx: number) => (
            <div key={item.ref || idx}>
              <div className="footer-col-title">{item.label}</div>
              <ul className="flex flex-col gap-2">
                {flattenLinks(item.items).map((link: any) => (
                  <li key={link.href}>
                    <a href={link.href} className="text-xs hover:text-white transition-colors" style={{ color: '#AAAAAA' }}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider border-t" style={{ borderColor: '#333333' }} />

      {/* Bottom bar: logo + social + legal */}
      <div className="w-full max-w-[1280px] mx-auto px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* ADN Logo */}
        <a href="/" className="footer-logo shrink-0">
          <Image
            src="/adn/Adn_Logo.svg"
            alt="ADNKronos"
            width={120}
            height={30}
            className="opacity-80 brightness-0 invert"
          />
        </a>

        {/* Social icons */}
        <div className="flex items-center gap-4">
          <a href="#" aria-label="RSS" className="footer-social-icon"><RssIcon size={16} /></a>
          <a href="#" aria-label="Facebook" className="footer-social-icon"><FacebookIcon size={16} /></a>
          <a href="#" aria-label="Twitter" className="footer-social-icon"><TwitterIcon size={16} /></a>
          <a href="#" aria-label="Instagram" className="footer-social-icon"><InstagramIcon size={16} /></a>
          <a href="#" aria-label="YouTube" className="footer-social-icon"><YoutubeIcon size={16} /></a>
          <a href="#" aria-label="LinkedIn" className="footer-social-icon"><LinkedinIcon size={16} /></a>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap items-center gap-2 footer-legal">
          <a href="/about">Chi siamo</a>
          <span style={{ color: '#444' }}>·</span>
          <a href="#">Privacy</a>
          <span style={{ color: '#444' }}>·</span>
          <a href="#">Cookie</a>
          <span style={{ color: '#444' }}>·</span>
          <a href="#">Disclaimer</a>
          <span style={{ color: '#444' }}>·</span>
          <a href="#">Contatti</a>
        </div>
      </div>

      {/* Copyright */}
      <div className="w-full max-w-[1280px] mx-auto px-4 pb-6">
        <p className="text-center footer-legal">
          © {new Date().getFullYear()} ADNKronos — Tutti i diritti riservati
        </p>
      </div>
    </footer>
  );
}
