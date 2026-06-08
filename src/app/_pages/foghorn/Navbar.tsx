import Link from 'next/link';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { Search } from 'lucide-react';
import { cookies } from 'next/headers';
import LoginButton from '../../components/LoginButton';

const PILLARS = [
  { label: 'News',      href: '/news' },
  { label: 'Economy',  href: '/business' },
  { label: 'Sport',     href: '/sport' },
  { label: 'Culture',   href: '/culture' },
  { label: 'Lifestyle', href: '/lifestyle' },
];

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: foghorn/Navbar');

  const siteName = data.siteData?.siteName || data.siteNode?.name;
  const siteLabel = data.siteNode?.attributes?.sitename || siteName;
  if (!siteName) throw new Error('Site node data is missing');

  const site = await connection.findSite(siteName);
  const menus = site?.menus;
  const mainMenuItems: any[] = menus?.MainMenu?.items ?? [];
  const hotTopicsItems: any[] = menus?.HotTopics?.items ?? [];

  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="foghorn-header w-full">

      {/* ── Row 1: Pillars bar ────────────────────────────────────────────── */}
      <div className="w-full" style={{ height: 36 }}>
        <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center justify-between h-full">
          <nav className="flex items-center h-full">
            {mainMenuItems.length > 0
              ? mainMenuItems.map((item: any, idx: number) => (
                  <Link
                    key={item.ref || item.url || idx}
                    href={item.url || item.ref || '#'}
                    className="foghorn-pillar-link flex items-center h-full"
                  >
                    {item.label}
                  </Link>
                ))
              : PILLARS.map(({ label, href }) => (
                  <Link key={href} href={href} className="foghorn-pillar-link flex items-center h-full">
                    {label}
                  </Link>
                ))}
          </nav>
          <div className="flex items-center gap-4 hidden">
            <Link href="/subscribe" className="foghorn-subscribe-link">Subscribe</Link>
            <a href="/support" className="foghorn-support-btn">Support us</a>
          </div>
        </div>
      </div>

      {/* ── Row 2: Masthead row ───────────────────────────────────────────── */}
      <div className="w-full" style={{ borderTop: '1px solid rgba(255,255,255,.15)', minHeight: 60 }}>
        <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center justify-between" style={{ minHeight: 60 }}>
          <Link href="/" className="foghorn-masthead">
            {siteLabel}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/search" aria-label="Search" style={{ color: 'rgba(255,255,255,.85)' }}>
              <Search className="w-5 h-5" />
            </Link>
            <LoginButton webauth={webauth} />
          </div>
        </div>
      </div>

      {/* ── Hot topics bar — driven by HotTopics menu ─────────────────────── */}
      {hotTopicsItems.length > 0 && (
        <div className="foghorn-hot-topics w-full overflow-x-auto">
          <div className="w-full max-w-[1300px] mx-auto px-4 flex items-center gap-1">
            {hotTopicsItems.map((item: any, idx: number) => (
              <Link
                key={item.ref || item.url || idx}
                href={item.url || item.ref || '#'}
                className="foghorn-pillar-link flex items-center h-full"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Date line ─────────────────────────────────────────────────────── */}
      <div className="foghorn-date-line w-full sm:block">
        <div className="fw-full max-w-[1300px] mx-auto px-4">{dateLabel}</div>
      </div>

    </header>
  );
}
