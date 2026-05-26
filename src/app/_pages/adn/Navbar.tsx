import Link from 'next/link';
import Image from 'next/image';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers, cookies } from 'next/headers';
import { Menu, Search } from 'lucide-react';
import LoginButton from '../../components/LoginButton';

const UTILITY_LINKS = [
  { label: 'Meteo', href: '/meteo' },
  { label: 'Oroscopo', href: '/oroscopo' },
  { label: 'Newsletter', href: '/newsletter' },
  { label: 'AK Blog', href: '/blog' },
  { label: 'Gruppo Adnkronos', href: '/gruppo' },
];

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  const siteName = data.siteData?.siteName || data.siteNode?.name;
  if (!siteName) throw new Error('Site node data is missing');

  const site = await connection.findSite(siteName);
  if (!site) throw new Error('Site not found');

  const menus = site.menus;
  const mainMenuItems: any[] = menus?.MenuPrincipale1?.items ?? [];
  const temiCaldiItems: any[] = menus?.TemiCaldi?.items ?? [];

  const pathname = (await headers()).get('x-neon-pathname');
  const isActive = (url: string) => url && pathname === url.replace(/\/$/, '');

  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('it-IT', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeLabel = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="adn-header w-full">

      {/* ── Row 1: utility bar (gray) ─────────────────────────────────────── */}
      <div className="adn-utility-bar w-full">
        <div className="adn-utility-inner w-full max-w-[1280px] mx-auto px-3 flex items-center justify-between" style={{ height: 36 }}>
          {/* Left: hamburger */}
          <button className="adn-hamburger flex items-center" aria-label="Menu">
            <Menu className="w-5 h-5" />
          </button>

          {/* Center: adnverify badge + utility links */}
          <div className="flex items-center gap-5">
            <a href="/adnverify" className="adn-verify-badge flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              adnverify
            </a>

            <nav className="hidden md:flex items-center gap-5">
              {UTILITY_LINKS.map(link => (
                <Link key={link.href} href={link.href} className="adn-utility-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: search + login */}
          <div className="flex items-center gap-3">
            <Link href="/search" aria-label="Cerca" className="adn-utility-search">
              <Search className="w-4 h-4" />
            </Link>
            <LoginButton webauth={webauth} />
          </div>
        </div>
      </div>

      {/* ── Row 2: logo bar (light gray) ──────────────────────────────────── */}
      <div className="adn-logo-bar w-full">
        <div className="w-full max-w-[1280px] mx-auto px-3 flex items-center justify-between" style={{ minHeight: 90 }}>
          <div className="w-40 hidden md:block" />

          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/adn/Adn_Logo.svg"
              alt="ADNKronos"
              width={260}
              height={60}
              priority
              className="adn-logo"
              style={{ height: 56, width: 'auto' }}
            />
          </Link>

          <div className="hidden md:flex flex-col items-end" style={{ width: 160 }}>
            <span className="adn-date-label capitalize">{dateLabel}</span>
            <span className="adn-time-label">Aggiornato: {timeLabel}</span>
          </div>
        </div>
      </div>

      {/* ── Row 3: main nav bar (white) — driven by MenuPrincipale1 ──────── */}
      <div className="adn-nav-bar w-full">
        <div className="w-full max-w-[1280px] mx-auto px-3 flex items-center justify-between" style={{ minHeight: 42 }}>
          <ul className="adn-main-nav hidden md:flex items-center overflow-x-auto">
            {mainMenuItems.map((item: any, idx: number) => {
              const href = item.url || item.ref || '#';
              return (
                <li key={item.ref || idx}>
                  <Link
                    href={href}
                    className={clsx(
                      'adn-main-nav-link block px-3 py-2.5 whitespace-nowrap',
                      isActive(href) && 'adn-main-nav-link--active',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <button className="md:hidden p-2 adn-hamburger" aria-label="Apri menu">
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/ultimora" className="adn-ultimora-btn shrink-0 ml-3">
            ULTIM&apos;ORA
          </Link>
        </div>
      </div>

      {/* ── Row 4: Temi Caldi bar — hidden when menu is absent or empty ───── */}
      {temiCaldiItems.length > 0 && (
        <div className="adn-topics-bar w-full">
          <div className="w-full max-w-[1280px] mx-auto px-3 flex items-center gap-5 overflow-x-auto" style={{ minHeight: 32 }}>
            <ul className="adn-topics-list flex items-center gap-5 overflow-x-auto">
              {temiCaldiItems.map((item: any, idx: number) => {
                const href = item.url || item.ref || '#';
                return (
                  <li key={item.ref || idx}>
                    <Link href={href} className="adn-topic-link shrink-0 whitespace-nowrap">
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

    </header>
  );
}
