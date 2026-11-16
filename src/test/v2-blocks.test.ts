import { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { BLOCK_LIMITS, blockCacheTags, decideBlockRender, extractBlockLinks } from '@/app/_v2/lib/blocks';

const link = (id: string) => ({ targetId: id });
const model = (pagelink: unknown, nodes: unknown = {}) => ({ data: { links: { pagelink } }, nodes });

describe('extractBlockLinks', () => {
  it('returns [] for missing or odd shapes', () => {
    expect(extractBlockLinks(undefined, 'headers')).toEqual([]);
    expect(extractBlockLinks({ data: {} }, 'headers')).toEqual([]);
    expect(extractBlockLinks(model('nope'), 'headers')).toEqual([]);
    expect(extractBlockLinks(model({ headers: [null, {}, 3] }), 'headers')).toEqual([]);
  });
  it('reads url and blockType from the node map', () => {
    const m = model({ footers: [link('a')] }, { a: { url: '/blocks/a/', sys: { type: 'menu', baseType: 'contentblock' } } });
    expect(extractBlockLinks(m, 'footers')).toEqual([{ area: 'footers', id: 'a', url: '/blocks/a/', blockType: 'menu' }]);
  });
  it('leaves blockType undefined when the node is unknown', () => {
    expect(extractBlockLinks(model({ includes: [link('z')] }), 'includes')[0].blockType).toBeUndefined();
  });
  it('truncates to BLOCK_LIMITS', () => {
    const m = model({ headers: ['1', '2', '3', '4', '5'].map(link) });
    expect(extractBlockLinks(m, 'headers')).toHaveLength(BLOCK_LIMITS.headers);
    expect(BLOCK_LIMITS.headers).toBe(2);
  });
});

describe('blockCacheTags', () => {
  it('tags site and each node', () => {
    const l = [{ area: 'headers', id: 'a', url: '/a' }, { area: 'headers', id: 'b', url: '/b' }] as const;
    expect(blockCacheTags('s', [...l])).toEqual(['neon:site:s', 'neon:node:a', 'neon:node:b']);
  });
});

describe('decideBlockRender', () => {
  it('prefers a registered module', () => {
    expect(decideBlockRender('menu', 'webpage', ['menu'], ViewStatus.LIVE)).toEqual({ kind: 'module', key: 'menu' });
  });
  it('renders webpage-like base types', () => {
    for (const b of ['webpage', 'contentblock', 'homewebpage', 'sectionwebpage'])
      expect(decideBlockRender('x', b, [], ViewStatus.LIVE)).toEqual({ kind: 'webpage' });
  });
  it('placeholder in preview, none in live for unknown', () => {
    expect(decideBlockRender('x', 'article', [], ViewStatus.PREVIEW)).toEqual({ kind: 'placeholder' });
    expect(decideBlockRender('x', undefined, [], ViewStatus.LIVE)).toEqual({ kind: 'none' });
  });
});
