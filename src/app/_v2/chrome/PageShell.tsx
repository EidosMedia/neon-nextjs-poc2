import type { ReactNode } from 'react';
import type { BaseModel, PageData, Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getBrand } from '../brands/registry';
import { getPageSettings, V2_DEFAULTS } from '../lib/settings';
import { getActiveTheme, normalizeTheme } from '@/lib/accessories/defaultThemeAccessories';
import Header from './Header';
import Footer from './Footer';
import BlockSlot from '../blocks/BlockSlot';

type Common = { children: ReactNode; rail?: ReactNode; wide?: boolean; hero?: 'overlay' };
type ModelProps = Common & { data: PageData<BaseModel>; site?: undefined };
type SiteProps = Common & { site: Site; data?: undefined };

/** Page frame for every v2 page: header, header blocks, main, footer blocks, footer. */
export default async function PageShell(props: ModelProps | SiteProps) {
  const { children, rail, wide, hero } = props;
  let site: Site | undefined;
  let theme: string;
  let siteLabel: string | undefined;
  let settings: ReturnType<typeof getPageSettings> | { header: typeof V2_DEFAULTS.header; footer: typeof V2_DEFAULTS.footer };

  if (props.data) {
    const data = props.data;
    const siteName = data.siteData?.siteName || data.siteNode?.name;
    if (!siteName) throw new Error('Site node data is missing');
    site = await connection.findSite(siteName);
    theme = getActiveTheme(data);
    siteLabel = data.siteNode?.attributes?.sitename || siteName || data.siteNode?.name;
    settings = getPageSettings(data);
  } else {
    site = props.site;
    theme = normalizeTheme(site.root?.attributes?.theme);
    siteLabel = site.root?.attributes?.sitename || site.siteName || site.root?.name;
    settings = { header: V2_DEFAULTS.header, footer: V2_DEFAULTS.footer };
  }
  if (!site) throw new Error('Site not found');

  const brand = getBrand(theme);
  const frame = { site, brand, siteLabel };

  return (
    <>
      <link rel="stylesheet" href={brand.fontsHref} precedence="default" />
      {settings.header.enabled && <Header {...frame} header={settings.header} />}
      {props.data && <BlockSlot data={props.data} area="headers" />}
      <main
        data-hero={hero}
        className={`v2-main${wide ? ' v2-main--wide' : ''}${rail ? ' v2-main--rail' : ''}`}
      >
        {rail ? (
          <div className="v2-container v2-main__grid">
            <div className="v2-main__content">{children}</div>
            <aside className="v2-main__rail">{rail}</aside>
          </div>
        ) : (
          children
        )}
        {props.data && <BlockSlot data={props.data} area="includes" />}
      </main>
      {props.data && <BlockSlot data={props.data} area="footers" />}
      {settings.footer.enabled && <Footer {...frame} footer={settings.footer} />}
    </>
  );
}
