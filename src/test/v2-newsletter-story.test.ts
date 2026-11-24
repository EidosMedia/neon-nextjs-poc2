import { NextRequest } from 'next/server';
import { NeonConnection, type ContentElement, type PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { makeFixtureBlock } from '@/app/_v2/ui/fixtures';
import { NewsletterStoryExportError, renderNewsletterStoryHtml } from '@/app/_v2/lib/newsletterStoryHtml';
import { GET } from '@/app/api/newsletter/[id]/route';

jest.mock('@/utilities/security', () => ({ getAuthOptions: jest.fn().mockResolvedValue({}) }));
jest.mock('@/services/utils', () => ({
  getAPIHostnameConfig: jest.fn().mockResolvedValue({
    apiHostname: 'https://site-api.test', root: { hostname: 'https://news.test' },
  }),
  handleServicesError: jest.fn(() => Response.json({ error: 'Upstream failure' }, { status: 500 })),
}));

function node(nodeType: string, elements: ContentElement[] = [], value = '', attributes: Record<string, string> = {}): ContentElement {
  return { nodeType, elements, value, attributes };
}

function story() {
  const data = makeFixtureBlock({ type: 'newsletterstory', title: 'The story' }) as PageData<ArticleModel>;
  data.model.data.sys = { baseType: 'article', type: 'newsletterstory' };
  data.model.data.pubInfo = { publicationTime: '2026-11-23T12:00:00Z', publishedBy: { userName: '' }, visible: true, paywallLevel: 'FREE' };
  data.model.data.files = { content: { data: node('doc', [node('story', [
    node('text', [
      node('p', [node('plainText', [], 'First & second '), node('anchor', [node('plainText', [], 'link')], '', { href: '/related/' })]),
      node('inline-media-group', [
        node('image', [], '', { src: '/resources/photo.jpg', softCrop: 'Wide' }),
        node('image-caption', [node('caption', [node('p', [node('plainText', [], 'A caption')])])]),
      ]),
    ]),
  ])]) } };
  return data;
}

test('exports story text, safe links and captioned images with absolute URLs', () => {
  const html = renderNewsletterStoryHtml(story(), 'https://news.test');
  expect(html).toContain('First &amp; second');
  expect(html).toContain('href="https://news.test/related/"');
  expect(html).toContain('src="https://news.test/resources/photo.jpg"');
  expect(html).toContain('alt="A caption"');
  expect(html).toContain('A caption');
});

test('fails explicitly instead of dropping unsupported story components', () => {
  const data = story();
  data.model.data.files.content.data.elements[0].elements[0].elements.push(node('story-component'));
  expect(() => renderNewsletterStoryHtml(data, 'https://news.test')).toThrow(NewsletterStoryExportError);
});

describe('newsletter export route', () => {
  const original = globalThis.connection;
  const request = new NextRequest('https://news.test/api/newsletter/story/');
  const context = { params: Promise.resolve({ id: 'story' }) };
  let connection: NeonConnection;

  beforeEach(() => {
    connection = new NeonConnection({ frontOfficeServiceKey: '', neonFoUrl: 'https://neon.test' });
    globalThis.connection = connection;
  });
  afterEach(() => {
    jest.restoreAllMocks();
    globalThis.connection = original;
  });

  test('follows same-origin canonical redirects and exports the story', async () => {
    const fetch = jest.spyOn(connection, 'makePageRequest')
      .mockResolvedValueOnce(new Response(null, { status: 308, headers: { Location: '/news/story/' } }))
      .mockResolvedValueOnce(Response.json(story()));
    const response = await GET(request, context);
    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenLastCalledWith('https://site-api.test/news/story/', {}, { redirect: 'manual', cache: 'no-cache' });
    expect(await response.text()).toContain('https://news.test/resources/photo.jpg');
  });

  test('does not forward credentials to a different redirect origin', async () => {
    const fetch = jest.spyOn(connection, 'makePageRequest')
      .mockResolvedValue(new Response(null, { status: 302, headers: { Location: 'https://other.test/' } }));
    const response = await GET(request, context);
    expect(response.status).toBe(502);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('does not export restricted stories without server-side entitlement and metering', async () => {
    const data = story();
    data.model.data.pubInfo.paywallLevel = 'METERED';
    jest.spyOn(connection, 'makePageRequest').mockResolvedValue(Response.json(data));
    const response = await GET(request, context);
    expect(response.status).toBe(403);
  });
});
