import type { WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { itemKind, limitToCapacity, nodePublicationDate } from '@/app/_v2/lib/zoneItems';

const node = (o: Record<string, unknown>) => o as unknown as WebpageNodeModel;

describe('itemKind', () => {
  it('detects gallery, liveblog and defaults to article', () => {
    expect(itemKind(node({ sys: { type: 'gallery', baseType: 'article' } }))).toBe('gallery');
    expect(itemKind(node({ sys: { type: 'liveblog', baseType: 'liveblog' } }))).toBe('liveblog');
    expect(itemKind(node({ sys: { type: 'story', baseType: 'article' } }))).toBe('article');
    expect(itemKind(node({}))).toBe('article');
  });
});

describe('nodePublicationDate', () => {
  it('prefers publicationTime then pubDate', () => {
    expect(nodePublicationDate(node({ pubInfo: { publicationTime: 'a', pubDate: 'b' } }))).toBe('a');
    expect(nodePublicationDate(node({ pubInfo: { pubDate: 'b' } }))).toBe('b');
    expect(nodePublicationDate(node({ pubInfo: { publicationTime: '' } }))).toBeUndefined();
    expect(nodePublicationDate(node({}))).toBeUndefined();
  });
});

describe('limitToCapacity', () => {
  it('truncates fixed compositions only', () => {
    expect(limitToCapacity([1, 2, 3], 'overlayPair')).toEqual([1, 2]);
    expect(limitToCapacity([1, 2, 3], 'threeUp')).toEqual([1, 2, 3]);
  });
});
