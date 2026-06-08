import Link from 'next/link';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers, cookies } from 'next/headers';
import { Search } from 'lucide-react';
import LoginButton from '../../components/LoginButton';

export default async function Navbar({
 data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: wire/Navbar');
  const siteName = data.siteData?.siteName || data.siteNode?.attributes?.sitename || data.siteNode?.name;
  if (!siteName) throw new Error('Site node data is missing');

  const site = await connection.findSite(siteName);
  if (!site) throw new Error('Site not found');

  const menus = site.menus;
  const mainMenuItems: any[] = menus?.MenuPrincipale1?.items ?? [];

  const pathname = (await headers()).get('x-neon-pathname');
  const isActive = (url: string) => url && pathname === url.replace(/\/$/, '');

  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  const now = new Date();
  const utcString = now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <header className="wire-header w-full">

      {/* ── Top bar: brand + status + clock ─────────────────────────────── */}
      <div className="w-full max-w-[1440px] mx-auto px-4 flex items-center justify-between" style={{ height: 40 }}>

        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="wire-brand">{siteName}</Link>
          <span className="wire-brand-service">/ API Preview</span>
          <span className="wire-status-live">LIVE</span>
        </div>

        {/* Right: clock + search + account */}
        <div className="flex items-center gap-4">
          <span className="wire-clock hidden md:block">{utcString}</span>
          <Link href="/search" aria-label="Search" className="wire-clock hover:text-[#0050FF]">
            <Search className="w-3.5 h-3.5" />
          </Link>
          <LoginButton webauth={webauth} />
        </div>
      </div>

      {/* ── Section tabs — driven by MenuPrincipale1 ────────────────────── */}
      <ul className="wire-tabs w-full max-w-[1440px] mx-auto px-4 overflow-x-auto">
        <li>
          <Link
            href="/"
            className={clsx('wire-tab-link', isActive('/') && 'wire-tab-link--active')}
          >
            ALL
          </Link>
        </li>
        {mainMenuItems.map((item: any, idx: number) => {
          const href = item.url || item.ref || '#';
          return (
            <li key={item.ref || idx}>
              <Link
                href={href}
                className={clsx('wire-tab-link', isActive(href) && 'wire-tab-link--active')}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

    </header>
  );
}
