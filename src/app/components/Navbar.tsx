import Link from 'next/link';
import Logo from './Logo';
import { BaseModel, PageData, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers, cookies } from 'next/headers';
import AiSearchIcon from './icons/AiSearch';
import LoginButton from './LoginButton';
import MenuToggle from './MenuToggle';

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  const siteName = data.siteData?.siteName || data.siteNode?.attributes?.sitename || data.siteNode?.name;
  if (!siteName) {
    throw new Error('Site node data is missing');
  }

  const site = await connection.findSite(siteName);

  if (!site) {
    throw new Error('Site not found');
  }

  const menus = site.menus;
  const mainMenuItems = menus?.MainMenu?.items ?? [];
  const hotTopicsItems = menus?.HotTopics?.items ?? [];
  const fullMenuItems = menus?.FullMenu?.items ?? [];

  const pathname = (await headers()).get('x-neon-pathname');

  const isActiveLink = (item: SiteNode) => item.path.slice(-1) === '/' && pathname === item.path.slice(0, -1);

  const isActiveMenuLink = (item: { url?: string; ref?: string }) => {
    const href = (item.url || item.ref || '').replace(/\/$/, '');
    return !!href && pathname === href;
  };

  // Get the webauth cookie value
  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  return (
    <nav className="w-full h-max bg-white top-0">
      <div className="container mx-auto px-4 h-full flex flex-col gap-1">
        <div className="w-full rounded flex justify-between items-center p-4">
          <div className="flex gap-2">
            <MenuToggle items={fullMenuItems} />
            <Link href="/search" className="flex items-center justify-center gap-2">
              <AiSearchIcon />
              <span className="font-epilogue">Search</span>
            </Link>
          </div>
          <div className="flex gap-2">
            <LoginButton webauth={webauth} />
          </div>
        </div>
        <div className="flex justify-center items-center gap-4 mb-8">
          <Logo data={data} />
          <h1 className="text-2xl font-bold text-gray-800">{siteName}</h1>
        </div>
        <div className="flex justify-center items-center">
          <ul className="hidden md:flex gap-x-6">
            {mainMenuItems.length > 0
              ? mainMenuItems.map((item, idx) => {
                  const href = item.url || item.ref || '#';
                  return (
                    <li key={item.ref || item.url || idx}>
                      <Link href={href} className={clsx(isActiveMenuLink(item) && 'text-(--color-primary)')}>
                        <h3 className="text-lg uppercase">{item.label}</h3>
                      </Link>
                    </li>
                  );
                })
              : site.root.items.map(item => (
                  <li key={item.id}>
                    <Link href={item.path} className={clsx(isActiveLink(item) && 'text-(--color-primary)')}>
                      <h3 className="text-lg uppercase">{item.title}</h3>
                    </Link>
                  </li>
                ))}
          </ul>
        </div>
        {hotTopicsItems.length > 0 && (
          <div className="flex justify-center items-center">
            <ul className="hidden md:flex gap-x-4 overflow-x-auto py-1 border-t border-gray-100">
              {hotTopicsItems.map((item, idx) => {
                const href = item.url || item.ref || '#';
                return (
                  <li key={item.ref || item.url || idx} className="shrink-0 whitespace-nowrap">
                    <Link href={href} className="text-sm uppercase text-(--color-primary)">
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      <div className="w-full h-1.5 mt-4 bg-(--color-primary) rounded"></div>
    </nav>
  );
}
