import { getItemSettings, getPageSettings, getZoneSettings, V2_DEFAULTS } from '@/app/_v2/lib/settings';

function page(o: {
  theme?: string; type?: string; baseType?: string; pageAccessories?: unknown; zoneAccessories?: unknown;
}) {
  return {
    siteNode: { attributes: o.theme === undefined ? {} : { theme: o.theme } },
    model: {
      data: {
        sys: { type: o.type ?? 'article', baseType: o.baseType ?? 'article' },
        pubInfo: { attributes: { pageAccessories: o.pageAccessories } },
        zoneAccessories: o.zoneAccessories,
      },
    },
  } as never;
}

const pageSet = (theme: string, type: string, items: Record<string, Record<string, unknown>>) => ({
  theme,
  type,
  items: Object.fromEntries(Object.entries(items).map(([k, values]) => [k, { version: '2.0', values }])),
});

const zoneSet = (values: Record<string, unknown>, theme = 'sportsarena', type = 'webpage', zone = 'main') => ({
  theme, type, zone, items: { zone: { version: '2.0', values } },
});

const wp = (zoneAccessories: unknown) =>
  page({ theme: 'sportsarena', type: 'webpage', baseType: 'webpage', zoneAccessories });

describe('getPageSettings', () => {
  test('defaults for theme default', () => {
    const s = getPageSettings(page({}));
    expect(s.header).toEqual(V2_DEFAULTS.header);
    expect(s.footer).toEqual(V2_DEFAULTS.footer);
    expect(s.leaf).toEqual(V2_DEFAULTS.articleLeaf);
  });

  test('applies stored values for sportsarena', () => {
    const s = getPageSettings(page({
      theme: 'sportsarena',
      pageAccessories: pageSet('sportsarena', 'article', {
        header: { variant: 'compact', enabled: false },
        footer: { variant: 'lite' },
        articleLeaf: { variant: 'opinion', correlates: '0', adDensity: 'high' },
      }),
    }));
    expect(s.header).toEqual({ enabled: false, sectionsMenu: true, variant: 'compact' });
    expect(s.footer.variant).toBe('lite');
    expect(s.leaf).toEqual({ kind: 'article', variant: 'opinion', correlates: 0, adDensity: 'high' });
  });

  test('ignores values stored under another theme', () => {
    const s = getPageSettings(page({
      theme: 'sportsarena',
      pageAccessories: pageSet('default', 'article', { header: { variant: 'compact' } }),
    }));
    expect(s.header).toEqual(V2_DEFAULTS.header);
  });

  test('ignores v1 shape/bold values', () => {
    const s = getPageSettings(page({
      zoneAccessories: undefined,
      pageAccessories: { theme: 'default', type: 'article', items: { shape: { version: '1.0', values: { bold: true } } } },
    }));
    expect(s.header).toEqual(V2_DEFAULTS.header);
    const z = getZoneSettings(
      wp({ main: { theme: 'sportsarena', type: 'webpage', zone: 'main', items: { shape: { version: '1.0', values: { bold: true } } } } }),
      'main',
    );
    expect(z).toEqual(V2_DEFAULTS.zone);
  });

  test('unknown theme yields defaults even with stored values', () => {
    const s = getPageSettings(page({
      theme: 'business-globe2',
      pageAccessories: pageSet('business-globe2', 'article', { header: { variant: 'compact' } }),
    }));
    expect(s.header).toEqual(V2_DEFAULTS.header);
    expect(s.footer).toEqual(V2_DEFAULTS.footer);
    expect(s.leaf).toEqual(V2_DEFAULTS.articleLeaf);
  });

  test('longform forces fullBleedHero', () => {
    const s = getPageSettings(page({
      type: 'longform',
      pageAccessories: pageSet('default', 'longform', { articleLeaf: { variant: 'textLed' } }),
    }));
    expect(s.leaf).toMatchObject({ kind: 'article', variant: 'fullBleedHero' });
  });

  test('gallery page yields a gallery leaf', () => {
    const s = getPageSettings(page({
      type: 'gallery',
      pageAccessories: pageSet('default', 'gallery', { galleryLeaf: { variant: 'photoEssay', captions: false } }),
    }));
    expect(s.leaf).toEqual({ kind: 'gallery', variant: 'photoEssay', captions: false, thumbnails: true, adDensity: 'medium' });
  });

  test('liveblog page yields a liveblog leaf; webpage has none', () => {
    expect(getPageSettings(page({ type: 'liveblog', baseType: 'liveblog' })).leaf).toEqual(V2_DEFAULTS.liveblogLeaf);
    expect(getPageSettings(page({ type: 'webpage', baseType: 'webpage' })).leaf).toBeUndefined();
  });
});

describe('getZoneSettings', () => {
  test('carousel: autoplay and dots are zone toggles, the new compositions are accepted', () => {
    const z = getZoneSettings(wp({ main: zoneSet({ composition: 'carousel', autoplay: true, dots: false }) }), 'main');
    expect(z).toMatchObject({ composition: 'carousel', autoplay: true, dots: false });
    expect(getZoneSettings(wp({ main: zoneSet({ composition: 'banner' }) }), 'main').composition).toBe('banner');
    expect(getZoneSettings(wp({ main: zoneSet({ composition: 'highlight' }) }), 'main').composition).toBe('highlight');
  });

  test('defaults', () => {
    expect(getZoneSettings(wp(undefined), 'main')).toEqual(V2_DEFAULTS.zone);
  });

  test('moreLink: unsafe dropped, safe kept', () => {
    const bad = getZoneSettings(wp({ main: zoneSet({ moreLink: 'javascript:alert(1)' }) }), 'main');
    expect(bad.moreLink).toBeUndefined();
    const ok = getZoneSettings(wp({ main: zoneSet({ moreLink: '/sport/', sponsorName: 'Acme', composition: 'split' }) }), 'main');
    expect(ok).toMatchObject({ moreLink: '/sport/', sponsorName: 'Acme', composition: 'split' });
  });

  test('blank title with empty summary gives no head', () => {
    const z = getZoneSettings(wp({ main: zoneSet({ zonetitle: '   ', zonesummary: '' }) }), 'main');
    expect(z.head).toBeUndefined();
  });

  test('title is trimmed', () => {
    const z = getZoneSettings(wp({ main: zoneSet({ zonetitle: '  Top   stories ' }) }), 'main');
    expect(z.head).toEqual({ title: 'Top stories' });
  });

  test('summary is re-sanitised', () => {
    const z = getZoneSettings(
      wp({ main: zoneSet({ zonesummary: '<p onclick="x()">Hi <strong>there</strong><script>alert(1)</script></p>' }) }),
      'main',
    );
    const json = JSON.stringify(z.head);
    expect(json).toContain('strong');
    expect(json).toContain('there');
    expect(json).not.toContain('script');
    expect(json).not.toContain('onclick');
    expect(json).not.toContain('alert');
  });

  test('over-long title or summary is rejected', () => {
    expect(getZoneSettings(wp({ main: zoneSet({ zonetitle: 'a'.repeat(257) }) }), 'main').head).toBeUndefined();
    expect(getZoneSettings(wp({ main: zoneSet({ zonesummary: 'a'.repeat(4001) }) }), 'main').head).toBeUndefined();
  });
});

describe('getItemSettings', () => {
  const link = (sys: Record<string, string>, values?: Record<string, unknown>, key = 'articleItem', linkedType = sys.type) => ({
    sys,
    linkMetadata: values
      ? { linkAccessories: { theme: 'sportsarena', type: 'webpage', zone: 'main', linkedType, items: { [key]: { version: '2.0', values } } } }
      : undefined,
  }) as never;
  const data = wp(undefined);

  test('article defaults and stored', () => {
    expect(getItemSettings(data, 'main', link({ type: 'article', baseType: 'article' }))).toEqual(V2_DEFAULTS.articleItem);
    expect(
      getItemSettings(data, 'main', link({ type: 'article', baseType: 'article' }, { variant: 'lead', standfirst: true })),
    ).toEqual({ kind: 'article', variant: 'lead', image: true, standfirst: true, kicker: true });
  });

  test('kind comes from node sys', () => {
    expect(getItemSettings(data, 'main', link({ type: 'liveblog', baseType: 'liveblog' })).kind).toBe('liveblog');
    expect(getItemSettings(data, 'main', link({ type: 'gallery', baseType: 'article' })).kind).toBe('gallery');
    expect(
      getItemSettings(data, 'main', link({ type: 'gallery', baseType: 'article' }, { variant: 'grid', captions: false }, 'galleryItem')),
    ).toEqual({ kind: 'gallery', variant: 'grid', captions: false, thumbnails: true });
  });
});
