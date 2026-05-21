import Link from 'next/link';
import Logo from './Logo';
import { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { cookies } from 'next/headers';
import LoginButton from './LoginButton';

export default async function NavbarSearch({ data }: { data: Partial<PageData<BaseModel>> }) {
  const siteName = data.siteData?.siteName || data.siteNode?.name;
  if (!siteName) {
    throw new Error('Site node data is missing');
  }

  const site = await connection.findSite(siteName);

  if (!site) {
    throw new Error('Site not found');
  }

  const cookieStore = await cookies();
  const webauth = cookieStore.get('webauth')?.value;

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-10">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo data={data} size="small" />
          <Link href="/" className="text-lg font-bold text-gray-800 no-underline">
            {site.root.title}
          </Link>
        </div>
        <div className="flex gap-2">
          <LoginButton webauth={webauth} />
        </div>
      </div>
    </nav>
  );
}
