import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { PageData, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import PostsTimeline from '@/app/_v2/liveblog/PostsTimeline';
import PostsFeed from '@/app/_v2/liveblog/PostsFeed';
import LiveblogItem from '@/app/_v2/items/LiveblogItem';
import LegacyTimeline from '@/app/components/base/Organism/LiveblogOrganism/LiveblogOrganismPosts';
import DefaultPosts from '@/app/_pages/LiveblogPosts';
import AdnPosts from '@/app/_pages/adn/LiveblogPosts';
import OldtownPosts from '@/app/_pages/oldtown/LiveblogPosts';
import WirePosts from '@/app/_pages/wire/LiveblogPosts';
import FoghornPosts from '@/app/_pages/foghorn/LiveblogPosts';
import FinancierPosts from '@/app/_pages/financier/LiveblogPosts';
import BusinessGlobePosts from '@/app/_pages/business-globe/LiveblogPosts';
import * as liveblogHook from '@/hooks/useLiveblogPosts';

jest.mock('@/utilities/content', () => ({
  renderContent: () => 'Post body',
  findElementsInContentJson: () => [],
  findText: () => '',
}));

jest.mock('@/app/_v2/items/ItemFrame', () => ({
  __esModule: true,
  default: ({ children }: {
    children: (fields: { imageUrl: string; kicker: string }, controls: { Title: () => null; Summary: () => null }) => ReactNode;
  }) => children({ imageUrl: '/cover.jpg', kicker: 'Overhead' }, { Title: () => null, Summary: () => null }),
}));

const emptyPage = {
  model: { data: { id: 'liveblog', children: [] }, nodes: {} },
} as unknown as PageData<ArticleModel>;

describe('liveblog first-load rendering', () => {
  test.each<[string, ReactNode]>([
    ['v2 timeline', createElement(PostsTimeline, { liveblogId: 'liveblog' })],
    ['v2 feed', createElement(PostsFeed, { liveblogId: 'liveblog', initialPosts: [] })],
    ['legacy timeline', createElement(LegacyTimeline, { liveblogId: 'liveblog' })],
    ...[DefaultPosts, AdnPosts, OldtownPosts, WirePosts, FoghornPosts, FinancierPosts, BusinessGlobePosts]
      .map((Posts): [string, ReactNode] => [Posts.name, createElement(Posts, { data: emptyPage })]),
  ])('%s reserves space with a skeleton instead of showing an empty message', (_name, element) => {
    const html = renderToStaticMarkup(element);
    expect(html).toContain('aria-label="Loading live blog posts"');
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain('No liveblog posts');
    expect(html).not.toContain('Nessun aggiornamento');
  });

  test('embedded posts render immediately in v2 and legacy feeds', () => {
    const initialPosts = [{ id: 'post', content: {}, publicationTime: '2026-11-16T10:00:00Z' }];
    const seededPage = {
      model: {
        data: { id: 'liveblog', children: ['post'] },
        nodes: { post: { files: { content: { data: {} } }, sys: { postEventTime: initialPosts[0].publicationTime } } },
      },
    } as unknown as PageData<ArticleModel>;
    for (const element of [
      createElement(PostsFeed, { liveblogId: 'liveblog', initialPosts }),
      createElement(AdnPosts, { data: seededPage }),
    ]) {
      const html = renderToStaticMarkup(element);
      expect(html).toContain('Post body');
      expect(html).not.toContain('liveblog-skeleton');
    }
  });

  test('settled empty and failed requests are not mistaken for loading', () => {
    const hook = jest.spyOn(liveblogHook, 'useLiveblogPosts');
    try {
      hook.mockReturnValue({ liveblogId: 'liveblog', posts: [], isLoading: false, error: false });
      const empty = renderToStaticMarkup(createElement(PostsFeed, { liveblogId: 'liveblog', initialPosts: [] }));
      expect(empty).toContain('No liveblog posts');
      expect(empty).not.toContain('liveblog-skeleton');

      hook.mockReturnValue({ liveblogId: 'liveblog', posts: [], isLoading: false, error: true });
      const failed = renderToStaticMarkup(createElement(PostsTimeline, { liveblogId: 'liveblog' }));
      expect(failed).toContain('Unable to load live blog posts');
      expect(failed).not.toContain('liveblog-skeleton');

      hook.mockReturnValue({
        liveblogId: 'liveblog', isLoading: false, error: true,
        posts: [{ id: 'post', content: {}, publicationTime: '2026-11-16T10:00:00Z' }],
      });
      const refresh = renderToStaticMarkup(createElement(PostsFeed, { liveblogId: 'liveblog', initialPosts: [] }));
      expect(refresh).toContain('Post body');
      expect(refresh).not.toContain('Unable to load');
      expect(refresh).not.toContain('liveblog-skeleton');
    } finally {
      hook.mockRestore();
    }
  });
});

test('pinned-summary teasers respect image on and off like the other variants', () => {
  for (const showImage of [true, false]) {
    const html = renderToStaticMarkup(createElement(LiveblogItem, {
      node: { id: 'liveblog' } as WebpageNodeModel,
      view: { variant: 'pinnedSummary', showImage, showShare: false },
      viewStatus: ViewStatus.LIVE,
      headingLevel: 3,
      posts: false,
    }));
    expect(html.includes('src="/cover.jpg"')).toBe(showImage);
  }
});

test('compact liveblogs put Live before the overhead and omit the timeline', () => {
  for (const showImage of [true, false]) {
    const html = renderToStaticMarkup(createElement(LiveblogItem, {
      node: { id: 'liveblog' } as WebpageNodeModel,
      view: { variant: 'compact', showImage, showShare: false },
      viewStatus: ViewStatus.LIVE,
      headingLevel: 3,
    }));
    expect(html).toContain('v2-item__overhead');
    expect(html.indexOf('v2-item__live-dot')).toBeLessThan(html.indexOf('Overhead'));
    expect(html.includes('v2-item__media--3-2')).toBe(showImage);
    expect(html).not.toContain('v2-item__posts');
    expect(html).not.toContain('liveblog-skeleton');
  }
});
