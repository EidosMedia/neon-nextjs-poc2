import { headers } from 'next/headers';
import * as DefaultPages from './_pages';
import { resolvePageComponent } from './_themeRouter';

export default async function NotFound() {
  const currentHeaders = await headers();
  const siteName = currentHeaders.get('x-neon-site-name') ?? '';

  const site = siteName ? await connection.findSite(siteName) : null;
  const theme: string = site?.root.attributes?.theme ?? 'default';

  const NotFoundComponent =
    (resolvePageComponent('NotFound', theme) as React.ComponentType<any>) ?? DefaultPages.NotFound;

  if (!site) {
    return (
      <div className="root" data-theme="default">
        <DefaultPages.NotFound data={{ root: { name: '', title: '', items: [], attributes: {}, menus: {} } } as any} />
      </div>
    );
  }

  return (
    <div className="root" data-theme={theme}>
      <NotFoundComponent data={site} />
    </div>
  );
}
