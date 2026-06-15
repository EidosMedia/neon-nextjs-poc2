import Link from 'next/link';
import { headers } from 'next/headers';
import * as DefaultPages from './_pages';
import { resolvePageComponent } from './_themeRouter';

export default async function NotFound() {
  const currentHeaders = await headers();
  const siteName = currentHeaders.get('x-neon-site-name') ?? '';

  const site = siteName ? await connection.findSite(siteName) : null;

  if (!site) {
    // No resolvable site context (e.g. unknown host) — render a bare
    // fallback. Navbar/Footer need real site data (menus, etc.) and
    // throw on the empty placeholder, so they can't be used here.
    return (
      <div className="root" data-theme="default">
        <main className="flex-1 container mx-auto px-4 py-20">
          <h1 className="text-2xl font-bold mb-4">
            We are sorry, but the page you are trying to visit no longer exists or is no longer available.
          </h1>
          <p className="text-base text-gray-600">
            You can try to check if the URL is correct, or{' '}
            <Link href="/" className="underline hover:text-primary">
              go to the homepage
            </Link>
            .
          </p>
        </main>
      </div>
    );
  }

  const theme: string = site.root.attributes?.theme ?? 'default';
  const NotFoundComponent =
    (resolvePageComponent('NotFound', theme) as React.ComponentType<any>) ?? DefaultPages.NotFound;

  return (
    <div className="root" data-theme={theme}>
      <NotFoundComponent data={site} />
    </div>
  );
}
