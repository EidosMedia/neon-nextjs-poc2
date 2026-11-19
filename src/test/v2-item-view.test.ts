import type { WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import {
  resolveArticleItemView,
  resolveGalleryItemView,
  resolveLiveblogItemView,
  resolveTeaserFields,
} from '@/app/_v2/lib/itemView';
import { V2_DEFAULTS } from '@/app/_v2/lib/settings';

const node = (o: Record<string, unknown>) => o as unknown as WebpageNodeModel;

describe('resolveTeaserFields', () => {
  it('uses teaser overrides, ids, overhead and image', () => {
    const f = resolveTeaserFields(node({
      title: 'T', summary: 'S', url: '/world/a/',
      mainPicture: 'http://img/1.jpg',
      author: 'Jane',
      pubInfo: { publicationTime: '2026-10-26T08:00:00Z' },
      attributes: {
        teaser: { title: 'TT', summary: 'TS' },
        overhead: 'Over',
        contentIds: { teaserTitle: 'tid', teaserSummary: 'sid' },
      },
    }));
    expect(f).toEqual({
      title: 'TT', summary: 'TS', titleId: 'tid', summaryId: 'sid', kicker: 'Over',
      imageUrl: 'http://img/1.jpg', href: '/world/a/', byline: 'Jane', date: '2026-10-26T08:00:00Z',
    });
  });
  it('falls back to node fields without a kicker from the url; no ids', () => {
    const f = resolveTeaserFields(node({ title: 'T', summary: 'S', url: '/world/a/' }));
    expect(f.title).toBe('T');
    expect(f.summary).toBe('S');
    expect(f.kicker).toBeUndefined();
    expect(f.titleId).toBeUndefined();
    expect(f.summaryId).toBeUndefined();
    expect(f.imageUrl).toBeUndefined();
    expect(f.byline).toBeUndefined();
    expect(f.date).toBeUndefined();
  });
  it('returns undefined rather than empty strings', () => {
    const f = resolveTeaserFields(node({ title: 'T', summary: '', url: '/', author: '' }));
    expect(f.summary).toBeUndefined();
    expect(f.kicker).toBeUndefined();
    expect(f.byline).toBeUndefined();
  });
});

describe('teaser image crops', () => {
  const crops = (u: string) => [{ dynamicCropsResourceUrls: { Wide_small: u } }];
  it('prefers teaser crop, then main crop, then mainPicture', () => {
    const links = { system: { teaserPicture: crops('t'), mainPicture: crops('m') } };
    expect(resolveTeaserFields(node({ title: 'T', url: '/', mainPicture: 'raw', links })).imageUrl).toBe('t');
    expect(resolveTeaserFields(node({ title: 'T', url: '/', mainPicture: 'raw', links: { system: { mainPicture: crops('m') } } })).imageUrl).toBe('m');
    expect(resolveTeaserFields(node({ title: 'T', url: '/', mainPicture: 'raw', links })).imageUrl).not.toBe('raw');
    expect(resolveTeaserFields(node({ title: 'T', url: '/', mainPicture: 'raw' }), 'Wide_large').imageUrl).toBe('raw');
  });
});

describe('resolveArticleItemView', () => {
  const base = V2_DEFAULTS.articleItem;
  it('auto takes the slot', () => {
    expect(resolveArticleItemView(base, 'lead', true, true)).toEqual({
      variant: 'lead', showImage: true, showStandfirst: false, solidBlock: false,
    });
  });
  it('explicit variant wins', () => {
    expect(resolveArticleItemView({ ...base, variant: 'opinion' }, 'lead', true, true).variant).toBe('opinion');
  });
  it('textOnly hides image even when image true', () => {
    expect(resolveArticleItemView({ ...base, variant: 'textOnly', image: true }, 'standard', true, false).showImage).toBe(false);
  });
  it('image setting false hides image', () => {
    expect(resolveArticleItemView({ ...base, image: false }, 'standard', true, false).showImage).toBe(false);
  });
  it('no image: overlay gets solid block', () => {
    expect(resolveArticleItemView(base, 'overlay', false, false)).toMatchObject({
      variant: 'overlay', showImage: false, solidBlock: true,
    });
  });
  it('no image: lead stays lead without solid block', () => {
    expect(resolveArticleItemView(base, 'lead', false, false)).toMatchObject({
      variant: 'lead', showImage: false, solidBlock: false,
    });
  });
  it('overlay with image is not solid', () => {
    expect(resolveArticleItemView(base, 'overlay', true, false).solidBlock).toBe(false);
  });
  it('standfirst needs setting and content', () => {
    const s = { ...base, standfirst: true };
    expect(resolveArticleItemView(s, 'standard', true, true).showStandfirst).toBe(true);
    expect(resolveArticleItemView(s, 'standard', true, false).showStandfirst).toBe(false);
  });
});

describe('resolveLiveblogItemView', () => {
  const base = V2_DEFAULTS.liveblogItem;
  it('auto maps lead/overlay to panel, others to feed', () => {
    expect(resolveLiveblogItemView(base, 'lead').variant).toBe('panel');
    expect(resolveLiveblogItemView(base, 'overlay').variant).toBe('panel');
    expect(resolveLiveblogItemView(base, 'compact').variant).toBe('feed');
    expect(resolveLiveblogItemView(base, 'standard').variant).toBe('feed');
  });
  it('explicit wins and flags pass through', () => {
    expect(resolveLiveblogItemView({ ...base, variant: 'pinnedSummary', image: true, share: false }, 'lead')).toEqual({
      variant: 'pinnedSummary', showImage: true, showShare: false,
    });
  });
});

describe('resolveGalleryItemView', () => {
  const base = V2_DEFAULTS.galleryItem;
  it('auto maps slots', () => {
    expect(resolveGalleryItemView(base, 'lead').variant).toBe('fullBleed');
    expect(resolveGalleryItemView(base, 'overlay').variant).toBe('fullBleed');
    expect(resolveGalleryItemView(base, 'standard').variant).toBe('panelWithThumbs');
    expect(resolveGalleryItemView(base, 'compact').variant).toBe('grid');
  });
  it('grid forces thumbnails off', () => {
    expect(resolveGalleryItemView({ ...base, variant: 'grid', thumbnails: true }, 'lead')).toEqual({
      variant: 'grid', showCaptions: true, showThumbnails: false,
    });
  });
  it('non-grid keeps thumbnails setting', () => {
    expect(resolveGalleryItemView({ ...base, variant: 'panelWithThumbs', thumbnails: true }, 'lead').showThumbnails).toBe(true);
  });
});
