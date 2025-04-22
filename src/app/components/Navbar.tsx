import Link from 'next/link';
import Logo from './Logo';
import { BaseModel, PageData, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import clsx from 'clsx';
import { headers } from 'next/headers';

export default async function Navbar({ data }: { data: PageData<BaseModel> }) {
  const site = await connection.getSiteByName(data.siteNode.name);

  if (!site) {
    throw new Error('Site not found');
  }

  const pathname = (await headers()).get('x-neon-pathname');

  const isActiveLink = (item: SiteNode) => item.path.slice(-1) === '/' && pathname === item.path.slice(0, -1);

  return (
    <nav className="w-full h-20 bg-white sticky top-0">
      <div className="container mx-auto px-4 h-full">
        <div className="flex justify-center items-center h-full">
          <Logo data={data} />
          <ul className="hidden md:flex gap-x-6">
            {site.root.items.map(item => (
              <li key={item.id}>
                <Link href={item.path} className={clsx(isActiveLink(item) && 'text-blue-500')}>
                  <span className="text-lg">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button />
        </div>
      </div>
    </nav>
  );
}
