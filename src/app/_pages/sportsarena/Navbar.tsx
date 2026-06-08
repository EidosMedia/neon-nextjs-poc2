import Link from 'next/link';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers, cookies } from 'next/headers';
import { Search } from 'lucide-react';
import LoginButton from '../../components/LoginButton';

const TICKER_ITEMS = [
  'LAL 102 — GSW 98 · Q3 3:24',
  'KC 21 — NE 7 · 4Q',
  'NYY 3 — BOS 1 · 7th',
  'MIA 2 — LAG 1 · FINAL',
  'DJK def. ALC 6-3 6-4',
];

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: sportsarena/Navbar');
  const siteName = data.siteData?.siteName || data.siteNode?.attributes?.sitename || data.siteNode?.name;
  if (!siteName) throw new Error('Site node data is missing');

  const site = await connection.findSite(siteName);
  if (!site) throw new Error('Site not found');

  const mainMenuItems: any[] = site.menus?.MainMenu?.items ?? site.menus?.MenuPrincipale1?.items ?? []; // TODO: drop legacy MenuPrincipale1 fallback once CMS menus renamed
  const pathname = (await headers()).get('x-neon-pathname');
  const isActive = (url: string) => !!url && pathname === url.replace(/\/$/, '');

  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  const fallbackSports = ['NFL', 'NBA', 'MLB', 'Soccer', 'Tennis', 'More'];

  return (
    <header className="sa-header w-full">

      {/* ── Ticker strip ─────────────────────────────────────────────── */}
      <div className="sa-ticker w-full">
        <div className="flex items-center gap-5 px-4 py-1 min-w-max">
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} className="sa-tick-item flex items-center gap-2">
              <span className="sa-tick-dot inline-block" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── Logo row ─────────────────────────────────────────────────── */}
      <div className="sa-nav-row1 w-full">
        <div className="w-full max-w-[1280px] mx-auto px-4 flex items-center justify-between" style={{ height: 52 }}>
          <Link href="/" className="sa-logo">
            {siteName}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/search" aria-label="Search" className="sa-nav-search">
              <Search className="w-4 h-4" />
            </Link>
            <LoginButton webauth={webauth} />
          </div>
        </div>
      </div>

      {/* ── Sport-tab row ─────────────────────────────────────────────── */}
      <nav className="sa-nav-row2 w-full">
        <div className="w-full max-w-[1280px] mx-auto px-4">
          <ul className="flex items-center overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {mainMenuItems.length > 0
              ? mainMenuItems.map((item: any, idx: number) => {
                  const href = item.url || item.ref || '#';
                  return (
                    <li key={item.ref || idx}>
                      <Link
                        href={href}
                        className={clsx('sa-tab', isActive(href) && 'sa-tab--active')}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })
              : fallbackSports.map(sport => (
                  <li key={sport}>
                    <span className="sa-tab">{sport}</span>
                  </li>
                ))}
          </ul>
        </div>
      </nav>

    </header>
  );
}
