import Link from 'next/link';
import Logo from './Logo';
import { BaseModel, PageData, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers, cookies } from 'next/headers';
import { CircleUserRound, Menu } from 'lucide-react';
import { Button } from './baseComponents/button';
import AiSearchIcon from './icons/AiSearch';
import LoginButton from './LoginButton';

export default async function Navbar({ data }: { data: Partial<PageData<BaseModel>> }) {
  if (!data.siteNode || !data.siteNode.name) {
    throw new Error('Site node data is missing');
  }

  const site = await connection.getSiteByName(data.siteNode.name);

  if (!site) {
    throw new Error('Site not found');
  }

  const pathname = (await headers()).get('x-neon-pathname');

  const isActiveLink = (item: SiteNode) => item.path.slice(-1) === '/' && pathname === item.path.slice(0, -1);

  // Get the webauth cookie value
  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  return (
    <nav className="w-full h-max bg-white top-0">
      <div className="container mx-auto px-4 h-full flex flex-col gap-3">
        <div className="w-full rounded mt-8 flex justify-between items-center p-4">
          <div className="flex gap-2">
            <Button variant="ghost">
              <Menu />
            </Button>
            <Link href="/search" className="flex items-center justify-center gap-2">
              <AiSearchIcon />
              <span className="font-epilogue">Search</span>
            </Link>
          </div>
          <div className="flex gap-2">
            <LoginButton webauth={webauth} />
          </div>
        </div>
        <div className="flex justify-center items-center gap-4">
          <Logo data={data} />
          <h1 className="text-2xl font-bold text-gray-800">{site.root.title}</h1>
        </div>
        <div className="flex justify-center items-center">
          <ul className="hidden md:flex gap-x-6">
            {site.root.items.map(item => (
              <li key={item.id}>
                <Link href={item.path} className={clsx(isActiveLink(item) && 'text-(--color-primary)')}>
                  <h3 className="text-lg uppercase">{item.title}</h3>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="w-full h-1.5 mt-4 bg-(--color-primary) rounded"></div>
    </nav>
  );
}
