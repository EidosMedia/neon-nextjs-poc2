import { DEFAULT_PAGE_CHROME, getActiveTheme, getPageChrome, normalizeTheme, siteThemeOf } from '@/lib/accessories/defaultThemeAccessories';

function page(options: {
  theme?: string;
  type?: string;
  baseType?: string;
  pageAccessories?: unknown;
  zoneAccessories?: unknown;
}) {
  return {
    siteNode: { attributes: options.theme === undefined ? {} : { theme: options.theme } },
    model: {
      data: {
        sys: { type: options.type ?? 'article', baseType: options.baseType ?? 'article' },
        pubInfo: { attributes: { pageAccessories: options.pageAccessories } },
        zoneAccessories: options.zoneAccessories,
      },
    },
  } as never;
}

const headerSet = (values: Record<string, unknown>, theme = 'default', type = 'article') => ({
  theme,
  type,
  items: { header: { version: '1.0', values } },
});

describe('normalizeTheme', () => {
  test.each([[undefined], [null], [''], ['   ']])('treats %p as default', value => {
    expect(normalizeTheme(value)).toBe('default');
  });

  test('keeps a named theme', () => {
    expect(normalizeTheme(' adn ')).toBe('adn');
  });
});

describe('getPageChrome', () => {
  test('renders defaults when nothing is stored', () => {
    expect(getPageChrome(page({}))).toEqual(DEFAULT_PAGE_CHROME);
  });

  test('applies stored header and footer values for the default theme', () => {
    const chrome = getPageChrome(
      page({
        pageAccessories: {
          theme: 'default',
          type: 'article',
          items: {
            header: { version: '1.0', values: { enabled: false } },
            footer: { version: '1.0', values: { menu: false } },
          },
        },
      }),
    );
    expect(chrome).toEqual({ showHeader: false, showSectionsMenu: true, showFooter: true, showFooterMenu: false });
  });

  test('applies a blank site theme as the default theme', () => {
    const chrome = getPageChrome(page({ theme: '', pageAccessories: headerSet({ sectionsMenu: false }) }));
    expect(chrome.showSectionsMenu).toBe(false);
  });

  test('ignores values for non-default and unknown themes', () => {
    expect(getPageChrome(page({ theme: 'adn', pageAccessories: headerSet({ enabled: false }, 'default') }))).toEqual(
      DEFAULT_PAGE_CHROME,
    );
    expect(getPageChrome(page({ theme: 'unknown', pageAccessories: headerSet({ enabled: false }) }))).toEqual(
      DEFAULT_PAGE_CHROME,
    );
  });

  test('ignores a set saved under a different page type or version', () => {
    expect(
      getPageChrome(page({ type: 'liveblog', baseType: 'liveblog', pageAccessories: headerSet({ enabled: false }) })),
    ).toEqual(DEFAULT_PAGE_CHROME);
    expect(
      getPageChrome(
        page({
          pageAccessories: {
            theme: 'default',
            type: 'article',
            items: { header: { version: '9.9', values: { enabled: false } } },
          },
        }),
      ),
    ).toEqual(DEFAULT_PAGE_CHROME);
  });
});

describe('siteThemeOf', () => {
  it('uses the theme set on the site root first', () => {
    expect(siteThemeOf({ attributes: { theme: 'nextfrontier' }, staticAttributes: { theme: 'sportsarena' } })).toBe('nextfrontier');
  });
  it('falls back to the site configuration theme (staticAttributes)', () => {
    expect(siteThemeOf({ attributes: {}, staticAttributes: { theme: ' sportsarena ', invalidateNextJsTimeoutMs: '10000' } })).toBe('sportsarena');
    expect(siteThemeOf({ attributes: { theme: '  ' }, staticAttributes: { theme: 'sportsarena' } })).toBe('sportsarena');
  });
  it('treats an explicit root "default" as a choice that beats the configuration', () => {
    expect(siteThemeOf({ attributes: { theme: 'default' }, staticAttributes: { theme: 'sportsarena' } })).toBe('default');
  });
  it('is default when neither level sets a usable theme', () => {
    expect(siteThemeOf({ staticAttributes: { theme: 42 } })).toBe('default');
    expect(siteThemeOf(undefined)).toBe('default');
  });
  it('drives getActiveTheme from page data siteNode', () => {
    expect(getActiveTheme({ siteNode: { staticAttributes: { theme: 'sportsarena' } } as never })).toBe('sportsarena');
  });
});
