import Link from 'next/link';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers } from 'next/headers';
import MenuToggle from './MenuToggle';

const TICKER_ITEMS = [
  { label: 'S&P 500',     change: '-1.40%', up: false },
  { label: 'FTSE 100',    change: '+0.07%', up: true  },
  { label: 'EUR/USD',     change: '-0.56%', up: false },
  { label: 'Brent Crude', change: '-1.70%', up: false },
  { label: '10Y US Gov',  change: '-0.36%', up: false },
];

const FALLBACK_SECTIONS = ['World', 'Companies', 'Markets', 'Tech', 'Opinion', 'Life & Arts', 'Climate'];

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: business-globe/Navbar');
  const siteName = data.siteData?.siteName || data.siteNode?.name;
  const siteLabel = data.siteNode?.attributes?.sitename || siteName;
  if (!siteName) throw new Error('Site node data is missing');

  const site = await connection.findSite(siteName);
  if (!site) throw new Error('Site not found');

  const mainMenuItems: any[] = site.menus?.MainMenu?.items ?? site.menus?.MenuPrincipale1?.items ?? []; // TODO: drop legacy MenuPrincipale1 fallback once CMS menus renamed
  const fullMenuItems: any[] = site.menus?.FullMenu?.items ?? [];
  const pathname = (await headers()).get('x-neon-pathname');
  const isActive = (url: string) => !!url && pathname === url.replace(/\/$/, '');

  const sections = mainMenuItems.length > 0 ? mainMenuItems : null;

  return (
    <header className="w-full sticky top-0 z-[100]">

      {/* ── Markets ticker ───────────────────────────────────────── */}
      <div className="bgl-ticker w-full">
        <div className="bgl-ticker-inner">
          {TICKER_ITEMS.map((item) => (
            <span key={item.label} className="bgl-tick-item">
              {item.label}
              <span className={clsx('bgl-tick-badge', item.up ? 'bgl-tick-badge--up' : 'bgl-tick-badge--down')}>
                {item.change}
              </span>
            </span>
          ))}
          <a href="#" className="bgl-tick-link">Markets Data →</a>
        </div>
      </div>

      {/* ── Masthead ─────────────────────────────────────────────── */}
      <div className="bgl-masthead w-full">
        <div className="bgl-masthead-side bgl-masthead-icons">
          <MenuToggle items={fullMenuItems} />
          <span aria-label="Search">🔍</span>
        </div>
        <Link href="/" className="bgl-masthead-logo">
          {siteLabel}
        </Link>
        <div className="bgl-masthead-side" style={{ justifyContent: 'flex-end' }}>
          <a href="#" className="bgl-subscribe-btn">Subscribe</a>
          <a href="#" className="bgl-signin-link">Sign in</a>
        </div>
      </div>

      {/* ── Section nav ──────────────────────────────────────────── */}
      <nav className="bgl-section-nav w-full">
        <ul>
          {sections
            ? sections.map((item: any, idx: number) => {
                const href = item.url || item.ref || '#';
                return (
                  <li key={item.ref || idx}>
                    <Link href={href} className={clsx('bgl-nav-item', isActive(href) && 'bgl-nav-item--active')}>
                      {item.label}
                    </Link>
                  </li>
                );
              })
            : FALLBACK_SECTIONS.map((label) => (
                <li key={label}>
                  <span className="bgl-nav-item">{label}</span>
                </li>
              ))}
        </ul>
      </nav>

    </header>
  );
}
