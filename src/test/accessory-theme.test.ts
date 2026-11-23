import { accessoryThemeOf, getAccessoryTheme, getPageChrome } from '@/lib/accessories/defaultThemeAccessories';

// Neon stores accessory values under the theme it resolves: the root `theme` attribute, else `default`.
// It does not read the site configuration theme, which the POC uses for the look.
const site = (attributes: Record<string, unknown>, staticAttributes: Record<string, unknown> = {}) => ({ attributes, staticAttributes });
const data = (siteNode: unknown, pageAccessories?: unknown) =>
  ({
    siteNode,
    model: { data: { sys: { type: 'article', baseType: 'article' }, pubInfo: { attributes: { pageAccessories } } } },
  }) as never;
const header = (theme: string) => ({ theme, type: 'article', items: { header: { version: '1.0', values: { enabled: false } } } });

describe('accessory theme (Neon resolution)', () => {
  it('ignores the site configuration theme', () => {
    expect(accessoryThemeOf(site({}, { theme: 'nextfrontier' }))).toBe('default');
    expect(accessoryThemeOf(site({ theme: 'theglobe' }, { theme: 'nextfrontier' }))).toBe('theglobe');
  });

  it('matches values Neon stored as default on a v2 site themed by configuration', () => {
    const d = data(site({}, { theme: 'nextfrontier' }), header('default'));
    expect(getAccessoryTheme(d)).toBe('default');
    expect(getPageChrome(d).showHeader).toBe(false);
  });

  it('does not apply values when the configuration selects a legacy theme', () => {
    const d = data(site({}, { theme: 'adn' }), header('default'));
    expect(getAccessoryTheme(d)).toBe('adn');
    expect(getPageChrome(d).showHeader).toBe(true);
  });

  it('keeps the explicit root theme', () => {
    expect(getPageChrome(data(site({ theme: 'theglobe' }), header('theglobe'))).showHeader).toBe(false);
    expect(getPageChrome(data(site({ theme: 'theglobe' }), header('default'))).showHeader).toBe(true);
  });
});
