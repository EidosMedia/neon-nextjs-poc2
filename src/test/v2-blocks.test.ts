import { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import MatchCard from '@/app/_v2/brands/sportsarena/modules/MatchCard';
import { BLOCK_LIMITS, blockCacheTags, blockContentTags, isFetchable, decideBlockRender, extractBlockLinks, getModuleKeys } from '@/app/_v2/lib/blocks';

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

describe('isFetchable / blockContentTags', () => {
  it('flags links without a url', () => {
    expect(isFetchable({ area: 'headers', id: 'a', url: '' })).toBe(false);
    expect(isFetchable({ area: 'headers', id: 'a', url: '/b/' })).toBe(true);
    expect(extractBlockLinks(model({ headers: [link('x')] }), 'headers').map(isFetchable)).toEqual([false]);
  });
  it('tags every pagelink target across zones, deduped', () => {
    const m = { data: { links: { pagelink: { main: [link('a'), link('b')], side: [link('a'), {}] } } } };
    expect(blockContentTags(m)).toEqual(['neon:node:a', 'neon:node:b']);
    expect(blockContentTags(undefined)).toEqual([]);
  });
});

describe('getModuleKeys', () => {
  it('returns the module keys of each brand', () => {
    expect(getModuleKeys('sportsarena')).toEqual(['breakingnews', 'results', 'scorecard']);
    expect(getModuleKeys('nextfrontier')).toEqual(['breakingnews', 'liveticker', 'topstories', 'hottopics', 'verdict', 'specs']);
  });

  test('only live Sports Arena match statuses receive the live styling', () => {
    const render = (status: string) => renderToStaticMarkup(createElement(MatchCard, {
      match: { home: 'Home', away: 'Away', status },
    }));
    expect(render("Live 63'")).toContain('v2-mod-match__status--live');
    expect(render('Final')).not.toContain('v2-mod-match__status--live');
    expect(render('Liverpool')).not.toContain('v2-mod-match__status--live');
  });
  it('maps default, theglobe and unknown themes to the Globe keys', () => {
    for (const t of ['default', 'theglobe', '', 'x']) expect(getModuleKeys(t)).toEqual(['newsletter']);
  });
});
