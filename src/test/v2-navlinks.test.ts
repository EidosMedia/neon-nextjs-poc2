import type { Site } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getDrawerLinks, getFullLinks, getMainLinks } from '@/app/_v2/chrome/navLinks';

const menu = (...labels: string[]) => ({ items: labels.map(label => ({ label, url: `/${label.toLowerCase()}/` })) });
const site = (menus: Record<string, unknown>, sitemap: string[] = ['Cronaca', 'Cultura']) =>
  ({ menus, root: { items: sitemap.map(title => ({ title, path: `/${title.toLowerCase()}/` })) } }) as unknown as Site;
const labels = (links: { label: string }[]) => links.map(l => l.label);

describe('navLinks', () => {
  it('main: MainMenu, else sitemap', () => {
    expect(labels(getMainLinks(site({ MainMenu: menu('A') })))).toEqual(['A']);
    expect(labels(getMainLinks(site({})))).toEqual(['Cronaca', 'Cultura']);
  });
  it('full (inline nav visible): FullMenu, else sitemap, never MainMenu', () => {
    expect(labels(getFullLinks(site({ FullMenu: menu('F'), MainMenu: menu('M') })))).toEqual(['F']);
    expect(labels(getFullLinks(site({ MainMenu: menu('M') })))).toEqual(['Cronaca', 'Cultura']);
  });
  it('drawer (mobile): FullMenu, else MainMenu, else sitemap', () => {
    expect(labels(getDrawerLinks(site({ FullMenu: menu('F'), MainMenu: menu('M') })))).toEqual(['F']);
    expect(labels(getDrawerLinks(site({ MainMenu: menu('M') })))).toEqual(['M']);
    expect(labels(getDrawerLinks(site({ FullMenu: { items: [] } })))).toEqual(['Cronaca', 'Cultura']);
  });
});
