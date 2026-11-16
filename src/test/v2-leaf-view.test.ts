import {
  extractGalleryImages, planAdSlots, planRail, resolveArticleLeafView, resolveLiveblogLeafView,
} from '@/app/_v2/lib/leafView';

describe('planAdSlots', () => {
  it.each([
    ['low', false, ['end']],
    ['low', true, ['rail']],
    ['medium', false, ['afterHero', 'end']],
    ['medium', true, ['afterHero', 'rail']],
    ['high', false, ['afterHero', 'midBody', 'end']],
    ['high', true, ['afterHero', 'midBody', 'rail']],
  ] as const)('%s rail=%s', (d, r, out) => expect(planAdSlots(d, r)).toEqual(out));
});

describe('resolveLiveblogLeafView', () => {
  const base = { kind: 'liveblog', variant: 'livePage', liveTag: true, pinnedSummary: true, adDensity: 'medium' } as const;
  it('livePage keeps everything', () => {
    expect(resolveLiveblogLeafView(base)).toEqual({ variant: 'livePage', showLiveTag: true, showPinned: true, showHero: true });
  });
  it('endedArchive hides live tag', () => {
    expect(resolveLiveblogLeafView({ ...base, variant: 'endedArchive' }).showLiveTag).toBe(false);
  });
  it('resultsPanel hides hero', () => {
    expect(resolveLiveblogLeafView({ ...base, variant: 'resultsPanel' }).showHero).toBe(false);
  });
  it('respects toggles', () => {
    const v = resolveLiveblogLeafView({ ...base, liveTag: false, pinnedSummary: false });
    expect(v.showLiveTag).toBe(false);
    expect(v.showPinned).toBe(false);
  });
});

describe('resolveArticleLeafView', () => {
  const s = (variant: string, correlates = 2) => ({ kind: 'article', variant, correlates, adDensity: 'low' }) as never;
  it.each([
    ['standard', 'above', 'standard', false],
    ['fullBleedHero', 'behind', 'large', false],
    ['textLed', 'none', 'large', false],
    ['opinion', 'portrait', 'standard', false],
    ['paywalled', 'above', 'standard', true],
  ])('%s with image', (variant, hero, titleSize, paywall) => {
    expect(resolveArticleLeafView(s(variant), true)).toEqual({ variant, hero, titleSize, paywall, correlates: 2 });
  });
  it.each(['standard', 'fullBleedHero', 'opinion', 'paywalled'])('%s without image has no hero', variant => {
    expect(resolveArticleLeafView(s(variant), false).hero).toBe('none');
  });
});

describe('extractGalleryImages', () => {
  const img = (src: string) => ({ nodeType: 'image', attributes: { src }, elements: [], value: '' });
  const txt = (nodeType: string, value: string) => ({ nodeType, attributes: {}, elements: [], value });
  const tree = {
    nodeType: 'mediagallery', attributes: {}, value: '',
    elements: [
      { nodeType: 'inline-media-group', attributes: {}, value: '', elements: [img('a.jpg'), txt('image-caption', 'Cap A'), txt('credit', 'Ann')] },
      { nodeType: 'p', attributes: {}, value: 'x', elements: [] },
      img('b.jpg'),
      { nodeType: 'inline-media-group', attributes: {}, value: '', elements: [img('c.jpg')] },
    ],
  };
  it('returns images in order with optional fields', () => {
    expect(extractGalleryImages({ elements: [tree] })).toEqual([
      { src: 'a.jpg', caption: 'Cap A', credit: 'Ann' },
      { src: 'b.jpg', caption: undefined, credit: undefined },
      { src: 'c.jpg', caption: undefined, credit: undefined },
    ]);
  });
  it('never throws on odd shapes', () => {
    for (const v of [null, undefined, 'x', 5, [], {}, { elements: null }, { elements: ['s', null, { nodeType: 'image' }] }]) {
      expect(extractGalleryImages(v)).toEqual([]);
    }
  });
});

describe('planRail', () => {
  it.each([
    [true, 1, 0, 'show'], [true, 0, 1, 'show'], [true, 0, 0, 'collapse'], [false, 3, 3, 'collapse'],
  ] as const)('%s %i %i', (b, n, a, out) => expect(planRail(b, n, a)).toBe(out));
});
