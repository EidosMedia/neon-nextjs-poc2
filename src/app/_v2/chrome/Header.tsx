import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { Brand } from '../brands/registry';
import type { FooterSettings, HeaderSettings } from '../lib/settings';
import AccountLink from './AccountLink';
import MenuToggle from './MenuToggle';
import Nav from './Nav';
import { getFullLinks, getMainLinks } from './navLinks';

export type SiteFrameProps = {
  site: Site;
  header: HeaderSettings;
  footer: FooterSettings;
  brand: Brand;
  /** Wordmark text shown in header and footer. */
  siteLabel?: string;
};

import { initials } from './initials';

export default async function Header({ site, header, brand, siteLabel }: Omit<SiteFrameProps, 'footer'>) {
  const label = siteLabel || site.siteName || site.root?.name || '';
  const pathname = (await headers()).get('x-neon-pathname');
  const webauth = (await cookies()).get('webauth')?.value;
  const mainLinks = getMainLinks(site);
  const fullLinks = getFullLinks(site);
  const minimal = header.variant === 'minimal';
  const showActions = header.variant === 'regular';
  const showNav = header.sectionsMenu && !minimal;

  const wordmark = (
    <Link href="/" className="v2-header__wordmark" aria-label={`${label} home`}>
      {brand.header !== 'globe' && (
        <span className="v2-header__disc" aria-hidden="true">
          {brand.header === 'arena' ? initials(label) : ''}
        </span>
      )}
      <span className="v2-header__name">{label}</span>
    </Link>
  );

  const actions = showActions && (
    <div className="v2-header__actions">
      <Link href="/login" className="v2-header__subscribe">
        Subscribe
      </Link>
      <AccountLink webauth={webauth} />
    </div>
  );

  return (
    <header className={`v2-header v2-header--${brand.header} v2-header--${header.variant}`}>
      <div className="v2-container v2-header__inner">
        {brand.header === 'globe' && (
          <>
            <div className="v2-header__tools">
              {!minimal && <MenuToggle items={fullLinks} pathname={pathname} className="v2-menutoggle--desktop" />}
              {!minimal && (
                <Link href="/search" className="v2-header__search">
                  Search
                </Link>
              )}
            </div>
            {wordmark}
            {actions}
          </>
        )}
        {brand.header === 'arena' && (
          <div className="v2-header__pill">
            {wordmark}
            {showNav && <Nav links={mainLinks} moreLinks={fullLinks} pathname={pathname} />}
            {!minimal && (
              <Link href="/search" className="v2-header__search">
                Search
              </Link>
            )}
            {actions}
            {showNav && <MenuToggle items={fullLinks} pathname={pathname} className="v2-menutoggle--mobile" />}
          </div>
        )}
        {brand.header === 'frontier' && (
          <>
            {wordmark}
            <div className="v2-header__tools">
              {!minimal && (
                <Link href="/search" className="v2-header__search">
                  Search
                </Link>
              )}
              {actions}
            </div>
          </>
        )}
      </div>
      {showNav && brand.header !== 'arena' && (
        <div className="v2-container v2-header__navrow">
          <Nav links={mainLinks} moreLinks={fullLinks} pathname={pathname} />
          <MenuToggle items={fullLinks} pathname={pathname} className="v2-menutoggle--mobile" label="Sections" />
        </div>
      )}
    </header>
  );
}
