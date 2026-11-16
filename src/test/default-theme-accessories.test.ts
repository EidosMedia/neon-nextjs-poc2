import { DEFAULT_PAGE_CHROME, getPageChrome, normalizeTheme } from '@/lib/accessories/defaultThemeAccessories';

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
  items: { header: { version: '2.0', values } },
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
            header: { version: '2.0', values: { enabled: false } },
            footer: { version: '2.0', values: { menu: false } },
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
