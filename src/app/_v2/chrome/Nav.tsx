import Link from 'next/link';
import type { MenuItem, Site, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ChromeLink } from './MenuToggle';

const menuHref = (item: { url?: string; ref?: string }) => item.url || item.ref || '#';

/** Main navigation links: the MainMenu when configured, otherwise the site root sections. */
export function getMainLinks(site: Site): ChromeLink[] {
  const main = site.menus?.MainMenu?.items ?? [];
  if (main.length > 0) return main.map(item => ({ label: item.label, href: menuHref(item) }));
  return (site.root?.items ?? []).map((item: SiteNode) => ({ label: item.title, href: item.path }));
}

/** Full menu links (with one level of children), falling back to the main links. */
export function getFullLinks(site: Site): ChromeLink[] {
  const full = site.menus?.FullMenu?.items ?? [];
  if (full.length === 0) return getMainLinks(site);
  const toLink = (item: MenuItem): ChromeLink => ({
    label: item.label,
    href: menuHref(item),
    items: item.items?.map(child => ({ label: child.label, href: menuHref(child) })),
  });
  return full.map(toLink);
}

const normalize = (href: string) => href.replace(/\/$/, '');

export default function Nav({ links, pathname }: { links: ChromeLink[]; pathname: string | null }) {
  if (links.length === 0) return null;
  return (
    <nav className="v2-nav" aria-label="Sections">
      <ul>
        {links.map(link => {
          const active = !!pathname && normalize(link.href) !== '' && normalize(link.href) === normalize(pathname);
          return (
            <li key={`${link.href}-${link.label}`}>
              <Link href={link.href} aria-current={active ? 'page' : undefined}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
