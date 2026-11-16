import Link from 'next/link';
import CurrentYear from './CurrentYear';
import type { SiteFrameProps } from './Header';

type FooterItem = { label: string; url?: string; ref?: string; items?: FooterItem[] };
const href = (item: { url?: string; ref?: string }) => item.url || item.ref || '#';

export default function Footer({ site, footer, brand, siteLabel }: Omit<SiteFrameProps, 'header'>) {
  const label = siteLabel || site.siteName || site.root?.name || '';
  const columns = ((site.menus?.Footer?.items ?? []) as FooterItem[]).filter(item => item.label);
  const lite = footer.variant === 'lite';
  const showColumns = footer.menu && !lite && columns.length > 0;

  return (
    <footer className={`v2-footer v2-footer--${brand.footer} v2-footer--${footer.variant}`}>
      <div className="v2-container v2-footer__inner">
        <p className="v2-footer__wordmark">{label}</p>
        {showColumns && (
          <nav className="v2-footer__columns" aria-label="Footer">
            {columns.map(col => (
              <div key={`${href(col)}-${col.label}`} className="v2-footer__column">
                <h2 className="v2-footer__title">
                  {col.url || col.ref ? <Link href={href(col)}>{col.label}</Link> : col.label}
                </h2>
                {col.items && col.items.length > 0 && (
                  <ul>
                    {col.items.map(link => (
                      <li key={`${href(link)}-${link.label}`}>
                        <Link href={href(link)}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        )}
        <p className="v2-footer__copy">
          &copy; <CurrentYear /> {label}
        </p>
      </div>
    </footer>
  );
}
