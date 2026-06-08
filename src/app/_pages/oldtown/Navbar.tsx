import Link from 'next/link';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers, cookies } from 'next/headers';
import { Search } from 'lucide-react';
import LoginButton from '../../components/LoginButton';
import MenuToggle from './MenuToggle';

const UTILITY_LINKS = [
  { label: 'Today\'s Paper', href: '/todays-paper' },
  { label: 'Video', href: '/video' },
  { label: 'Live', href: '/live' },
  { label: 'Games', href: '/games' },
  { label: 'Cooking', href: '/cooking' },
  { label: 'Wirecutter', href: '/wirecutter' },
  { label: 'The Athletic', href: '/athletic' },
];

export default async function Navbar({
 data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: oldtown/Navbar');
  const siteName = data.siteData?.siteName || data.siteNode?.attributes?.sitename || data.siteNode?.name;
  if (!siteName) throw new Error('Site node data is missing');

  const site = await connection.findSite(siteName);
  if (!site) throw new Error('Site not found');

  const menus = site.menus;
  const mainMenuItems: any[] = menus?.MainMenu?.items ?? menus?.MenuPrincipale1?.items ?? []; // TODO: drop legacy MenuPrincipale1 fallback once CMS menus renamed
  const fullMenuItems: any[] = menus?.FullMenu?.items ?? [];

  const pathname = (await headers()).get('x-neon-pathname');
  const isActive = (url: string) => url && pathname === url.replace(/\/$/, '');

  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <header className="oldtown-header w-full">

      {/* ── Row 1: utility bar ────────────────────────────────────────────── */}
      <div className="oldtown-utility-bar w-full">
        <div className="w-full max-w-[1280px] mx-auto px-4 flex items-center justify-between" style={{ height: 34 }}>
          {/* Left: hamburger + sections */}
          <div className="flex items-center gap-4">
            <MenuToggle items={fullMenuItems} />
            <nav className="hidden lg:flex items-center gap-5">
              {UTILITY_LINKS.map(link => (
                <Link key={link.href} href={link.href} className="oldtown-utility-link">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: date + search + account */}
          <div className="flex items-center gap-4">
            <span className="hidden md:block oldtown-utility-link">{dateLabel}</span>
            <Link href="/search" aria-label="Search" className="oldtown-utility-link">
              <Search className="w-4 h-4" />
            </Link>
            <LoginButton webauth={webauth} />
          </div>
        </div>
      </div>

      {/* ── Row 2: masthead ───────────────────────────────────────────────── */}
      <div className="w-full border-b border-[#DFDFDF]">
        <div className="w-full max-w-[1280px] mx-auto px-4 flex items-center justify-center" style={{ minHeight: 72 }}>
          <Link href="/" className="oldtown-masthead">
            {siteName}
          </Link>
        </div>
      </div>

      {/* ── Row 3: section nav — driven by MenuPrincipale1 ───────────────── */}
      {mainMenuItems.length > 0 && (
        <div className="w-full border-b border-[#DFDFDF] overflow-x-auto">
          <div className="w-full max-w-[1280px] mx-auto px-4 flex items-center" style={{ minHeight: 36 }}>
            <ul className="oldtown-section-list flex items-center overflow-x-auto" style={{ gap: '0 24px' }}>
              {mainMenuItems.map((item: any, idx: number) => {
                const href = item.url || item.ref || '#';
                return (
                  <li key={item.ref || idx} className="shrink-0">
                    <Link
                      href={href}
                      className={clsx(
                        'oldtown-section-link block py-2 whitespace-nowrap',
                        isActive(href) && 'oldtown-section-link--active',
                      )}
                    >
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
