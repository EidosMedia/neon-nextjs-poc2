import {
  DEFAULT_PAGE_CHROME,
  getLinkShapes,
  getPageChrome,
  getZoneAccessoryShapes,
  getZoneShape,
  normalizeTheme,
} from '@/lib/accessories/defaultThemeAccessories';
import { itemShape, cardAccessoryClass, titleAccessoryClass, zoneAccessoryClass } from '@/lib/accessories/shapeClasses';

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

describe('zone shapes', () => {
  const zoneSet = (zone: string, values: Record<string, unknown>, theme = 'default') => ({
    theme,
    type: 'sectionwebpage',
    zone,
    items: { shape: { version: '1.0', values } },
  });
  const webpage = (zoneAccessories: unknown, theme?: string) =>
    page({ theme, type: 'sectionwebpage', baseType: 'sectionwebpage', zoneAccessories });

  test('returns undefined when there is nothing to apply', () => {
    expect(getZoneShape(webpage(undefined), 'banner')).toBeUndefined();
    expect(getZoneShape(webpage({ banner: zoneSet('banner', { bold: false }) }), 'banner')).toBeUndefined();
  });

  test('reads the set stored for the zone name', () => {
    const data = webpage({ main: zoneSet('main', { bold: true }), context: zoneSet('context', { border: true }) });
    expect(getZoneShape(data, 'main')).toEqual({ bold: true, border: false });
    expect(getZoneShape(data, 'context')).toEqual({ bold: false, border: true });
    expect(getZoneShape(data, 'insight1')).toEqual({ bold: false, border: false });
  });

  test('tolerates editor-only zone properties without changing rendered zone shape', () => {
    const data = webpage({
      main: zoneSet('main', {
        bold: true,
        layout: 'bottomlist',
        zonetitle: 'Latest updates',
        zonesummary: '<strong>Summary</strong>',
      }),
    });

    expect(getZoneShape(data, 'main')).toEqual({ bold: true, border: false });
  });

  test('ignores a set stored for another zone, an unsupported zone or another theme', () => {
    expect(getZoneShape(webpage({ main: zoneSet('context', { bold: true }) }), 'main')).toEqual({
      bold: false,
      border: false,
    });
    expect(getZoneShape(webpage({ banner: zoneSet('banner', { bold: true }) }), 'banner')).toBeUndefined();
    expect(getZoneShape(webpage({ main: zoneSet('main', { bold: true }) }, 'adn'), 'main')).toBeUndefined();
  });

  test('reads link accessories from link metadata, one entry per linked item', () => {
    const data = webpage(undefined);
    const linked = (accessories: unknown, type = 'article') =>
      ({ sys: { type, baseType: type }, linkMetadata: { linkAccessories: accessories } }) as never;
    const set = (values: Record<string, unknown>, linkedType = 'article') => ({
      theme: 'default',
      type: 'sectionwebpage',
      zone: 'main',
      linkedType,
      items: { shape: { version: '1.0', values } },
    });

    expect(
      getLinkShapes(data, 'main', [linked(set({ border: true })), linked(undefined), linked(set({ bold: true }, 'gallery'))]),
    ).toEqual([
      { bold: false, border: true },
      { bold: false, border: false },
      { bold: false, border: false },
    ]);
  });

  test('getZoneAccessoryShapes combines zone and link shapes', () => {
    const data = webpage({ main: zoneSet('main', { bold: true }) });
    expect(getZoneAccessoryShapes(data, 'main', [])).toEqual({ zone: { bold: true, border: false }, links: [] });
  });
});

describe('shape classes', () => {
  test('adds no class without an applicable value', () => {
    expect(titleAccessoryClass(undefined)).toBeUndefined();
    expect(titleAccessoryClass({ bold: false, border: false })).toBe('acc-title-regular');
    expect(cardAccessoryClass({ bold: true, border: false })).toBeUndefined();
    expect(zoneAccessoryClass({ bold: true, border: false })).toBeUndefined();
  });

  test('maps values to named classes', () => {
    expect(titleAccessoryClass({ bold: true, border: false })).toBe('acc-title-bold');
    expect(titleAccessoryClass({ bold: false, border: false })).toBe('acc-title-regular');
    expect(cardAccessoryClass({ bold: false, border: true })).toBe('acc-card-border');
    expect(zoneAccessoryClass({ bold: false, border: true })).toBe('acc-zone-border');
  });

  test('item shape takes bold from either level and border only from the link', () => {
    expect(itemShape({ bold: true, border: true }, undefined)).toEqual({ bold: true, border: false });
    expect(itemShape(undefined, { bold: false, border: true })).toEqual({ bold: false, border: true });
    expect(itemShape({ bold: false, border: true }, undefined)).toEqual({ bold: false, border: false });
    expect(itemShape({ bold: false, border: true }, { bold: true, border: true })).toEqual({
      bold: true,
      border: false,
    });
  });
});
