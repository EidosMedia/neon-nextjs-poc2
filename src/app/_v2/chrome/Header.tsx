import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { normalizeViewStatus, ViewStatus, type Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { Brand } from '../brands/registry';
import type { FooterSettings, HeaderSettings } from '../lib/settings';
import HeaderActions from './HeaderActions';
import MenuToggle from './MenuToggle';
import Nav from './Nav';
import SearchIcon from './SearchIcon';
import SiteMark from './SiteMark';
import { getDrawerLinks, getFullLinks, getMainLinks } from './navLinks';

export type SiteFrameProps = {
  site: Site;
  header: HeaderSettings;
  footer: FooterSettings;
  brand: Brand;
  /** Wordmark text shown in header and footer. */
  siteLabel?: string;
};

export default async function Header({ site, header, brand, siteLabel }: Omit<SiteFrameProps, 'footer'>) {
  const label = siteLabel || site.siteName || site.root?.name || '';
  const requestHeaders = await headers();
  const pathname = requestHeaders.get('x-neon-pathname');
  const preview = normalizeViewStatus(requestHeaders.get('x-neon-view-status')) === ViewStatus.PREVIEW;
  const authenticated = Boolean((await cookies()).get('webauth')?.value);
  const mainLinks = getMainLinks(site);
  const fullLinks = getFullLinks(site);
  const drawerLinks = getDrawerLinks(site);
  const minimal = header.variant === 'minimal';
  const showActions = header.variant === 'regular';
  const showNav = header.sectionsMenu && !minimal;

  const wordmark = (
    <Link href="/" className="v2-header__wordmark" aria-label={`${label} home`}>
      <SiteMark key={site.logoUrl || ''} logoUrl={site.logoUrl} label={label} showInitials={brand.header === 'arena'} />
      <span className="v2-header__name">{label}</span>
    </Link>
  );

  const search = !minimal && (
    <Link href="/search" className="v2-header__search">
      <SearchIcon />
      <span>Search</span>
    </Link>
  );

  const actions = showActions && (
    <div className="v2-header__actions">
      <HeaderActions authenticated={authenticated} preview={preview} />
    </div>
  );

  // Bottom of the mobile drawer: same Subscribe and account entries as the header.
  const drawerActions = showActions && (
    <HeaderActions authenticated={authenticated} preview={preview} drawer />
  );

  return (
    <header className={`v2-header v2-header--${brand.header} v2-header--${header.variant}`}>
      <div className="v2-container v2-header__inner">
        {brand.header === 'globe' && (
          <>
            <div className="v2-header__tools">
              {!minimal && <MenuToggle items={fullLinks} drawerItems={drawerLinks} pathname={pathname} className="v2-menutoggle--desktop" />}
            </div>
            {wordmark}
            {/* Right cell: Search, a divider, then Subscribe and the account link. */}
            {!minimal && (
              <div className="v2-header__end">
                {search}
                {actions && <span className="v2-header__divider" aria-hidden="true" />}
                {actions}
              </div>
            )}
          </>
        )}
        {brand.header === 'arena' && (
          <div className="v2-header__pill">
            {wordmark}
            {showNav && <Nav links={mainLinks} moreLinks={fullLinks} pathname={pathname} />}
            {search}
            {actions}
            {showNav && <MenuToggle items={fullLinks} drawerItems={drawerLinks} pathname={pathname} actions={drawerActions} iconOnly />}
          </div>
        )}
        {brand.header === 'frontier' && (
          <>
            {wordmark}
            <div className="v2-header__tools">
              {search}
              {actions}
            </div>
          </>
        )}
      </div>
      {showNav && brand.header !== 'arena' && (
        <div className="v2-container v2-header__navrow">
          <Nav links={mainLinks} moreLinks={fullLinks} pathname={pathname} />
          <MenuToggle items={drawerLinks} pathname={pathname} className="v2-menutoggle--mobile" label="Sections" actions={drawerActions} />
        </div>
      )}
    </header>
  );
}
