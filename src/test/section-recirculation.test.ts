import { Children, isValidElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { ancestorPaths, collectSectionRecommendations, getSectionRecommendations, sectionHasObjects } from '@/utilities/sectionRecirculation';
import { fetchPageDataCached, fetchPageDataDirect } from '@/utilities/pageCache';
import { headers } from 'next/headers';
import ChildrenPage from '@/app/_v2/pages/ChildrenPage';
import SectionPage from '@/app/_v2/pages/SectionPage';
import EmptySection from '@/app/components/EmptySection';
import DefaultSectionItemsRenderer from '@/app/components/DefaultSectionItemsRenderer';
import AdnSection from '@/app/_pages/adn/SectionWebPage';
import OldtownSection from '@/app/_pages/oldtown/SectionWebPage';
import WireSection from '@/app/_pages/wire/SectionWebPage';
import FoghornSection from '@/app/_pages/foghorn/SectionWebPage';
import FinancierSection from '@/app/_pages/financier/SectionWebPage';
import BusinessGlobeSection from '@/app/_pages/business-globe/SectionWebPage';

jest.mock('next/headers', () => ({ headers: jest.fn(), cookies: jest.fn() }));
jest.mock('@/utilities/security', () => ({ getAuthOptions: jest.fn().mockResolvedValue({ editorialAuth: 'test' }) }));
jest.mock('@/utilities/pageCache', () => ({ fetchPageDataCached: jest.fn(), fetchPageDataDirect: jest.fn() }));

const article = (id: string, baseType = 'article') => ({
  id, url: `/${id}/`, title: id, sys: { baseType }, links: {},
});
const page = (nodes: ReturnType<typeof article>[], zones: Record<string, string[]> = {}) => ({
  status: 200,
  data: {
    model: {
      data: { children: nodes.map(node => node.id), links: { pagelink: Object.fromEntries(
        Object.entries(zones).map(([name, ids]) => [name, ids.map(targetId => ({ targetId }))]),
      ) } },
      nodes: Object.fromEntries(nodes.map(node => [node.id, node])),
    },
  },
});

beforeEach(() => {
  jest.clearAllMocks();
  global.connection = {
    getDwxLinkedObjects: async (data, zone) =>
      (data.model.data.links.pagelink[zone ?? ''] ?? []).map(link => data.model.nodes[link.targetId]),
  } as typeof global.connection;
});

test('finds nearest parent sections followed by the site root', () => {
  expect(ancestorPaths('/sport/basket/nba/')).toEqual(['/sport/basket/', '/sport/', '/']);
  expect(ancestorPaths('/basket/')).toEqual(['/']);
  expect(ancestorPaths('/')).toEqual([]);
});

test('section webpages with any linked object or block are not empty', () => {
  const data = page([]).data;
  expect(sectionHasObjects(data as never)).toBe(false);
  data.model.data.links.pagelink = { headers: [{ targetId: 'block' }] };
  expect(sectionHasObjects(data as never)).toBe(true);
  data.model.data.links.pagelink = {};
  Object.assign(data.model.data.links, { blocklink: { includes: [{ targetId: 'block' }] } });
  expect(sectionHasObjects(data as never)).toBe(true);
  Object.assign(data.model.data.links, { blocklink: { main: [{ targetId: 'block', url: '/block/' }] } });
  expect(sectionHasObjects(data as never)).toBe(true);
  Object.assign(data.model.data.links, { blocklink: {} });
  data.model.data.children = ['article'];
  expect(sectionHasObjects(data as never)).toBe(true);
});

test('collects up to four unique articles from parent sections and root zones', async () => {
  const first = page([article('one'), article('non-article', 'liveblog'), article('two')]);
  const root = page([article('two'), article('three'), article('four'), article('five')], { main: ['three'] });
  const fetchPage = jest.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(root);
  const items = await collectSectionRecommendations('/sport/basket/', fetchPage);
  expect(fetchPage.mock.calls.map(([path]) => path)).toEqual(['/sport/', '/']);
  expect(items.map(item => item.id)).toEqual(['one', 'two', 'three', 'four']);
});

test('uses root webpage zones and ignores missing or non-article targets', async () => {
  const root = page([article('one'), article('two', 'section'), article('three')], { main: ['three', 'missing', 'one'] });
  root.data.model.data.children = [];
  expect((await collectSectionRecommendations('/basket/', async () => root)).map(item => item.id)).toEqual(['three', 'one']);
});

test('does not fetch more distant ancestors once four articles are found', async () => {
  const fetchPage = jest.fn().mockResolvedValue(page(['a', 'b', 'c', 'd'].map(id => article(id))));
  const items = await collectSectionRecommendations('/sport/basket/', fetchPage);
  expect(items.map(item => item.id)).toEqual(['a', 'b', 'c', 'd']);
  expect(fetchPage).toHaveBeenCalledTimes(1);
});

test('skips missing parents but propagates upstream failures', async () => {
  const fetchPage = jest.fn().mockRejectedValueOnce({ status: 404 }).mockResolvedValueOnce(page([article('root')]));
  expect((await collectSectionRecommendations('/sport/basket/', fetchPage)).map(item => item.id)).toEqual(['root']);
  const error = { status: 503 };
  await expect(collectSectionRecommendations('/basket/', async () => { throw error; })).rejects.toBe(error);
});

test.each([
  ['live', fetchPageDataCached],
  ['preview', fetchPageDataDirect],
])('%s recommendations use the matching page fetch and auth context', async (view, fetcher) => {
  jest.mocked(headers).mockResolvedValue(new Headers({
    'x-neon-backend-url': 'https://backend.test', 'x-neon-site-name': 'Site',
    'x-neon-pathname': '/basket/', 'x-neon-view-status': view,
  }) as Awaited<ReturnType<typeof headers>>);
  jest.mocked(fetcher).mockResolvedValue(page([]));
  await expect(getSectionRecommendations()).resolves.toEqual([]);
  expect(fetcher).toHaveBeenCalledWith(
    'https://backend.test/', ...(view === 'live' ? ['Site'] : []), { editorialAuth: 'test' },
  );
});

test('follows same-origin page redirects without forwarding auth to another origin', async () => {
  jest.mocked(headers).mockResolvedValue(new Headers({
    'x-neon-backend-url': 'https://backend.test', 'x-neon-site-name': 'Site',
    'x-neon-pathname': '/basket/', 'x-neon-view-status': 'live',
  }) as Awaited<ReturnType<typeof headers>>);
  jest.mocked(fetchPageDataCached)
    .mockResolvedValueOnce({ status: 302, redirectLocation: '/home/' })
    .mockResolvedValueOnce(page([article('one')]));
  expect((await getSectionRecommendations()).map(item => item.id)).toEqual(['one']);
  expect(fetchPageDataCached).toHaveBeenLastCalledWith('https://backend.test/home/', 'Site', { editorialAuth: 'test' });

  jest.mocked(fetchPageDataCached).mockReset().mockResolvedValueOnce({
    status: 302, redirectLocation: 'https://elsewhere.test/',
  });
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    expect(await getSectionRecommendations()).toEqual([]);
    expect(fetchPageDataCached).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalled();
  } finally { warn.mockRestore(); }
});

test('empty sections without recommendations show only the empty message', async () => {
  jest.mocked(headers).mockResolvedValue(new Headers({
    'x-neon-backend-url': 'https://backend.test', 'x-neon-site-name': 'Site',
    'x-neon-pathname': '/basket/', 'x-neon-view-status': 'live',
  }) as Awaited<ReturnType<typeof headers>>);
  jest.mocked(fetchPageDataCached).mockResolvedValue(page([]));
  const data = { model: { data: { title: 'Basket' } } };
  const markup = renderToStaticMarkup(await EmptySection({ data: data as never, v2: true }));
  expect(markup).toContain('First stories arriving soon.');
  expect(markup).not.toContain('While you wait:');
});

test('only empty section listings choose the empty state', () => {
  const data = (baseType: string, children: string[]) => ({
    model: { data: { sys: { baseType }, children }, nodes: {} },
    siteData: { viewStatus: ViewStatus.LIVE },
  });
  const empty = ChildrenPage({ data: data('section', []) as never });
  expect(isValidElement(empty.props.children) && empty.props.children.type).toBe(EmptySection);
  const populated = ChildrenPage({ data: data('section', ['item']) as never });
  expect(isValidElement(populated.props.children) && populated.props.children.type).not.toBe(EmptySection);
  const site = ChildrenPage({ data: data('site', []) as never });
  expect(isValidElement(site.props.children) && site.props.children.type).not.toBe(EmptySection);
  const withBlock = data('section', []);
  Object.assign(withBlock.model.data, { links: { pagelink: { headers: [{ targetId: 'block' }] } } });
  const blocked = ChildrenPage({ data: withBlock as never });
  expect(isValidElement(blocked.props.children) && blocked.props.children.type).not.toBe(EmptySection);
  const legacy = DefaultSectionItemsRenderer({ data: data('section', []) as never });
  expect(legacy.type).toBe(EmptySection);
  const legacyLanding = DefaultSectionItemsRenderer({ data: data('site', []) as never });
  expect(legacyLanding.type).not.toBe(EmptySection);
});

test('empty section webpages show the fallback without replacing populated pages', async () => {
  const empty = { ...page([]).data, siteData: { viewStatus: ViewStatus.LIVE } };
  const result = await SectionPage({ data: empty as never });
  if (!isValidElement<{ children: ReactNode[] }>(result)) throw new Error('Missing section page');
  const fallback = result.props.children[1];
  if (!isValidElement<{ showTitle?: boolean }>(fallback)) throw new Error('Missing section fallback');
  expect(fallback.type).toBe(EmptySection);
  expect(fallback.props.showTitle).toBe(false);
  empty.model.data.links.pagelink = { main: [{ targetId: 'one' }] };
  const populated = await SectionPage({ data: empty as never });
  if (!isValidElement<{ children: ReactNode[] }>(populated)) throw new Error('Missing section page');
  const content = populated.props.children[1];
  expect(isValidElement(content) && content.type).not.toBe(EmptySection);
});

test.each([
  ['adn', AdnSection], ['oldtown', OldtownSection], ['wire', WireSection],
  ['foghorn', FoghornSection], ['financier', FinancierSection], ['business-globe', BusinessGlobeSection],
])('%s section webpage only displays the fallback when empty', async (_theme, Component) => {
  jest.mocked(headers).mockResolvedValue(new Headers({ 'x-neon-pathname': '/basket/' }) as Awaited<ReturnType<typeof headers>>);
  const containsFallback = (root: ReactNode): boolean => {
    let found = false;
    const visit = (node: ReactNode) => Children.forEach(node, child => {
      if (!isValidElement<{ children?: ReactNode }>(child)) return;
      if (child.type === EmptySection) found = true;
      visit(child.props.children);
    });
    visit(root);
    return found;
  };
  const data = { ...page([]).data, siteData: {}, siteNode: { title: 'Basket' } };
  expect(containsFallback(await Component({ data: data as never }))).toBe(true);
  data.model.data.links.pagelink = { main: [{ targetId: 'item' }] };
  expect(containsFallback(await Component({ data: data as never }))).toBe(false);
});
