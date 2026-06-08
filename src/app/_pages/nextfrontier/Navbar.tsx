import Link from 'next/link';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers } from 'next/headers';
import MenuToggle from './MenuToggle';

const FALLBACK_SECTIONS = ['Tech', 'Reviews', 'AI', 'Science', 'Policy', 'Entertainment'];

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  console.log('[NEON] render: nextfrontier/Navbar');
  const siteName = data.siteData?.siteName || data.siteNode?.attributes?.sitename || data.siteNode?.name;
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

      {/* Promo banner */}
      <div className="nf-banner">
        NextFrontier+ — Subscribe for ad-free reading and exclusive content →
      </div>

      {/* Header: logo + nav + icons */}
      <div className="nf-header w-full">
        <Link href="/" className="nf-logo">
          {siteName}
        </Link>

        <nav className="nf-nav">
          {sections
            ? sections.map((item: any, idx: number) => {
                const href = item.url || item.ref || '#';
                return (
                  <Link
                    key={item.ref || idx}
                    href={href}
                    className={clsx('nf-nav-item', isActive(href) && 'nf-nav-item--active')}
                  >
                    {item.label}
                  </Link>
                );
              })
            : FALLBACK_SECTIONS.map((label) => (
                <span key={label} className="nf-nav-item">{label}</span>
              ))}
        </nav>

        <div className="nf-header-icons">
          <span aria-label="Search">🔍</span>
          <MenuToggle items={fullMenuItems} />
        </div>
      </div>

    </header>
  );
}
