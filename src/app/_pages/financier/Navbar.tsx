import Link from 'next/link';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { Search } from 'lucide-react';
import { cookies } from 'next/headers';
import LoginButton from '../../components/LoginButton';

const PILLARS = [
  { label: 'News',      href: '/news' },
  { label: 'Markets',   href: '/markets' },
  { label: 'Companies', href: '/companies' },
  { label: 'Industry',  href: '/industry' },
  { label: 'Tech',      href: '/tech' },
  { label: 'Start-ups', href: '/startups' },
  { label: 'Regions',   href: '/regions' },
  { label: 'Opinion',   href: '/opinion' },
  { label: 'Wealth',    href: '/wealth' },
];

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: financier/Navbar');

  const siteName = data.siteData?.siteName || data.siteNode?.name;
  const siteLabel = data.siteNode?.attributes?.sitename || siteName;
  if (!siteName) throw new Error('Site node data is missing');

  const site = await connection.findSite(siteName);
  const menus = site?.menus;
  const mainMenuItems: any[] = menus?.MainMenu?.items ?? [];

  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  return (
    <header className="financier-header w-full">

      {/* ── Row 1: Masthead row ──────────────────────────────────────────── */}
      <div className="w-full" style={{ minHeight: 64 }}>
        <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center justify-between" style={{ minHeight: 64 }}>
          <Link href="/" className="financier-masthead">
            {siteLabel}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/search" aria-label="Search" className="financier-search-icon">
              <Search className="w-5 h-5" />
            </Link>
            <LoginButton webauth={webauth} />
          </div>
        </div>
      </div>

      {/* ── Row 2: Category bar ──────────────────────────────────────────── */}
      <div className="financier-category-bar w-full" style={{ height: 38 }}>
        <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center h-full">
          <nav className="flex items-center h-full overflow-x-auto">
            {mainMenuItems.length > 0
              ? mainMenuItems.map((item: any, idx: number) => (
                  <Link
                    key={item.ref || item.url || idx}
                    href={item.url || item.ref || '#'}
                    className="financier-nav-link flex items-center h-full"
                  >
                    {item.label}
                  </Link>
                ))
              : PILLARS.map(({ label, href }) => (
                  <Link key={href} href={href} className="financier-nav-link flex items-center h-full">
                    {label}
                  </Link>
                ))}
          </nav>
        </div>
      </div>

    </header>
  );
}
