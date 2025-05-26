import Link from 'next/link';
import Logo from './Logo';
import { BaseModel, PageData, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers } from 'next/headers';

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

  return (
    <nav className="w-full h-max bg-white top-0">
      <div className="container mx-auto px-4 h-full flex flex-col gap-6">
        <div className="flex justify-center items-center gap-4">
          <Logo data={data} />
          <h1 className="text-2xl font-bold text-gray-800">{site.root.title}</h1>
        </div>
        <div className="flex justify-center items-center">
          <ul className="hidden md:flex gap-x-6">
            {site.root.items.map(item => (
              <li key={item.id}>
                <Link href={item.path} className={clsx(isActiveLink(item) && 'text-blue-500')}>
                  <h3 className="text-lg uppercase">{item.title}</h3>
                </Link>
              </li>
            ))}
            <li>
              <Link href="/search">
                <h3 className="text-lg uppercase">Search</h3>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <h3 className="text-lg uppercase">About</h3>
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="w-full h-1.5 mt-4 bg-(--color-primary) rounded"></div>
    </nav>
  );
}
