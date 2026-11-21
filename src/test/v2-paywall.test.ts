import {
  PAYWALL_LEVELS, readerAccess, resolvePaywallLevel, meteredStorageKey,
  meteredPath, readMeteredDay, recordMeteredVisit, type MeteredDay,
} from '@/app/_v2/lib/paywall';

describe('publication-tier reader policy', () => {
  test.each([
    ['FREE', 'open', 'open'],
    ['FREEMIUM', 'login', 'open'],
    ['METERED', 'login', 'metered'],
    ['PREMIUM', 'login', 'subscription'],
  ] as const)('LIVE %s: anonymous %s, signed-in %s', (level, anonymous, signedIn) => {
    expect(readerAccess(level, false)).toBe(anonymous);
    expect(readerAccess(level, true)).toBe(signedIn);
  });

  test.each([
    ['FREE', ['open', 'login', 'login', 'login']],
    ['REGISTERED', ['open', 'open', 'metered', 'upgrade']],
    ['PREMIUM', ['open', 'open', 'open', 'subscription']],
  ] as const)('PREVIEW %s overrides actual reader authentication', (tier, expected) => {
    for (const registered of [false, true]) {
      expect(PAYWALL_LEVELS.map(level => readerAccess(level, registered, tier))).toEqual(expected);
    }
  });

  test('missing levels are free, unknown nonempty levels warn and stay restricted', () => {
    for (const value of [undefined, null, '']) expect(resolvePaywallLevel(value)).toBe('FREE');
    const warning = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      for (const value of ['premium', 'UNKNOWN', true]) expect(resolvePaywallLevel(value)).toBe('PREMIUM');
      expect(warning).toHaveBeenCalledTimes(3);
    } finally { warning.mockRestore(); }
  });
});

describe('daily distinct-article meter', () => {
  const now = new Date('2026-11-20T23:59:59Z');
  const tomorrow = new Date('2026-11-21T00:00:00Z');

  test('the tenth unique article opens, the eleventh blocks, revisits stay free', () => {
    let record = readMeteredDay(null, now);
    for (let i = 1; i <= 10; i++) {
      const visit = recordMeteredVisit(record, `/news/${i}/index.html`, now);
      expect(visit.allowed).toBe(true);
      expect(visit.remaining).toBe(10 - i);
      record = readMeteredDay(JSON.stringify(visit.record), now);
    }
    const blocked = recordMeteredVisit(record, '/news/11/', now);
    expect(blocked).toMatchObject({ allowed: false, remaining: 0, record });
    expect(recordMeteredVisit(record, '/news/1/?ref=home#headline', now))
      .toMatchObject({ allowed: true, remaining: 0, record });
  });

  test('canonical URL forms share one slot', () => {
    let record = readMeteredDay(null, now);
    for (const url of ['/news/a/index.html', '/news/a/', '/news/a?ref=home', 'https://preview.example/news/a/#top']) {
      const visit = recordMeteredVisit(record, url, now);
      expect(visit.remaining).toBe(9);
      record = visit.record;
    }
    expect(meteredPath('/')).toBe('/');
  });

  test('UTC midnight resets both persisted histories and active visits', () => {
    const record = recordMeteredVisit(readMeteredDay(null, now), '/yesterday', now).record;
    expect(readMeteredDay(JSON.stringify(record), tomorrow)).toEqual({ day: '2026-11-21', paths: [] });
    expect(recordMeteredVisit(record, '/today', tomorrow))
      .toEqual({ allowed: true, remaining: 9, record: { day: '2026-11-21', paths: ['/today'] } });
  });

  test('deduplicates stored paths and rejects corrupt data instead of resetting quota', () => {
    const record: MeteredDay = { day: '2026-11-20', paths: ['/one/', '/one/index.html'] };
    expect(readMeteredDay(JSON.stringify(record), now).paths).toEqual(['/one']);
    for (const raw of ['not json', 'null', '{}', '{"day":"2026-11-20","paths":[7]}',
      JSON.stringify({ ...record, paths: Array.from({ length: 11 }, (_, i) => `/${i}`) })]) {
      expect(() => readMeteredDay(raw, now)).toThrow();
    }
  });

  test('sites and PREVIEW/LIVE have independent storage namespaces', () => {
    expect(new Set([
      meteredStorageKey('site:a'), meteredStorageKey('site:b'),
      meteredStorageKey('site:a', true), meteredStorageKey('site:b', true),
    ]).size).toBe(4);
  });
});
