import { siteThemeOf, withSiteTheme } from '@/lib/accessories/defaultThemeAccessories';

describe('withSiteTheme', () => {
  const cached = {
    siteNode: { attributes: { theme: 'nextfrontier', other: 1 }, staticAttributes: { theme: 'x', keep: 'y' } },
    model: { data: { id: 'n1' } },
  };

  it('replaces the stale cached theme with the current site theme', () => {
    const out = withSiteTheme(cached, { attributes: { theme: 'theglobe' }, staticAttributes: {} });
    expect(siteThemeOf(out.siteNode)).toBe('theglobe');
    expect(out.siteNode.attributes.other).toBe(1);
    expect(out.siteNode.staticAttributes.keep).toBe('y');
    expect(out.model).toBe(cached.model);
  });

  it('follows a configuration-only theme when the root has none', () => {
    const out = withSiteTheme(cached, { attributes: {}, staticAttributes: { theme: 'sportsarena' } });
    expect(siteThemeOf(out.siteNode)).toBe('sportsarena');
  });

  it('does not mutate the cached object', () => {
    withSiteTheme(cached, { attributes: { theme: 'theglobe' } });
    expect(cached.siteNode.attributes.theme).toBe('nextfrontier');
  });

  it('keeps the cached data when the site is unknown', () => {
    expect(withSiteTheme(cached, undefined)).toBe(cached);
  });
});
