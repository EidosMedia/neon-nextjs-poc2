import { renderToStaticMarkup } from 'react-dom/server';
import { NeonConnection, type PageData, type WebpageModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { makeFixtureBlock } from '@/app/_v2/ui/fixtures';
import NewsletterWebpage from '@/app/_v2/pages/NewsletterWebpage';
import { renderNewsletterFragment, renderNewsletterHtml } from '@/utilities/newsletter';
import { getNewsletterPageSettings, getNewsletterZoneSettings } from '@/app/_v2/lib/newsletter';

const originalConnection = globalThis.connection;

beforeAll(() => {
  globalThis.connection = new NeonConnection({ frontOfficeServiceKey: '', neonFoUrl: 'https://neon.test' });
  jest.useFakeTimers().setSystemTime(new Date('2026-11-23T12:00:00Z'));
});

afterAll(() => {
  globalThis.connection = originalConnection;
  jest.useRealTimers();
});

function fixture(theme: string) {
  const data = makeFixtureBlock({
    type: 'newsletter',
    title: 'The daily digest',
    items: [{ title: 'First story' }, { title: 'Second story' }, { title: 'Third story' }, { title: 'Fourth story' }],
  }) as PageData<WebpageModel>;
  data.model.data.sys = { baseType: 'webpage', type: 'newsletter' };
  const main = data.model.data.links.pagelink.main;
  data.model.data.links.pagelink.context = [main.pop()!];
  data.siteNode = {
    id: 'site', name: 'News', nodeType: 'site', title: 'News', uri: '', url: '/', path: '/',
    items: [], hostname: '', previewHostname: '', attributes: { theme },
  };
  data.siteData.siteName = 'News';
  return data;
}

test.each([
  ['default', '#ffffff', '#3969AC', 'Gabarito'],
  ['theglobe', '#ffffff', '#3969AC', 'Gabarito'],
  ['sportsarena', '#FFFFFF', '#004E98', 'Fredoka'],
  ['nextfrontier', '#1D1930', '#FEF445', 'Abril Fatface'],
])('%s newsletter preview and email export share the brand palette and stories', async (theme, bg, accent, font) => {
  const data = fixture(theme);
  const fragment = await renderNewsletterFragment(data);
  const preview = renderToStaticMarkup(await NewsletterWebpage({ data }));
  const exported = await renderNewsletterHtml(data);
  expect(preview).toContain(fragment);
  expect(exported).toContain(fragment);
  expect(fragment).toContain(`background: ${bg}`);
  expect(fragment).toContain(accent);
  expect(fragment).toContain(font);
  for (const title of ['First story', 'Second story', 'Third story', 'Fourth story']) expect(fragment).toContain(title);
  expect(fragment).toContain('Top stories');
  expect(fragment).toContain('In context');
  expect(fragment.indexOf('Third story')).toBeLessThan(fragment.indexOf('In context'));
  expect(fragment.indexOf('In context')).toBeLessThan(fragment.indexOf('Fourth story'));
  expect(fragment).toContain('width="640"');
});

test('newsletter page and zone accessories control the email without unsafe markup or links', async () => {
  const data = fixture('theglobe');
  data.model.data.summary = 'Page summary';
  const first = data.model.nodes['fixture-newsletter-item-1'];
  first.summary = 'Hidden teaser summary';
  first.attributes = { overhead: 'Hidden label' };
  first.links = {
    hyperlink: { image: [{ targetId: '' }] },
    system: { mainPicture: [{
      targetId: 'image',
      metadata: {
        metadataType: 'image',
        softCrops: { Wide: { id: '' }, Portrait: { id: '' }, Ultrawide: { id: '' }, Square: { id: '' } },
      },
      dynamicCropsResourceUrls: { Wide_large: 'https://example.test/hidden.jpg' },
    }] },
  };
  data.model.data.pubInfo = { attributes: { pageAccessories: {
    theme: 'theglobe', type: 'webpage/newsletter', items: {
      newsletter: { version: '1.0', values: {
        headerVariant: 'standard', footerVariant: 'minimal', titleVariant: 'title',
        preheader: 'A & briefing', unsubscribeUrl: 'javascript:alert(1)', preferencesUrl: 'https://example.test/preferences',
      } },
    },
  } } };
  data.model.data.zoneAccessories = {
    main: { theme: 'theglobe', type: 'webpage/newsletter', zone: 'main', items: {
      zone: { version: '1.0', values: { zonetitle: 'Custom heading', zonesummary: '<p>Hello <strong>readers</strong><script>bad()</script></p>' } },
      newsletterZone: { version: '1.0', values: { layout: 'numbered', image: false, summary: false, label: false } },
    } },
  };
  const fragment = await renderNewsletterFragment(data);
  expect(fragment).toContain('A &amp; briefing');
  expect(fragment).toContain('Custom heading');
  expect(fragment).toContain('Hello <strong>readers</strong>');
  expect(fragment).not.toContain('bad()');
  expect(fragment).not.toContain('Page summary');
  expect(fragment).not.toContain('Hidden teaser summary');
  expect(fragment).not.toContain('Hidden label');
  expect(fragment).not.toContain('hidden.jpg');
  expect(fragment).not.toContain('javascript:');
  expect(fragment).not.toContain('preferences');
  expect(fragment).toContain('width="35"');
});

test.each([
  ['theglobe', 'standard', 'standard', true, 'stream', 'numbered', 'plain'],
  ['sportsarena', 'compact', 'minimal', false, 'cards', 'list', 'box'],
  ['nextfrontier', 'standard', 'standard', true, 'stream', 'list', 'box'],
] as const)('%s uses the design’s brand defaults', (theme, header, footer, summary, main, context, contextStyle) => {
  const data = fixture(theme);
  expect(getNewsletterPageSettings(data)).toMatchObject({ header, footer, showTitleSummary: summary });
  expect(getNewsletterZoneSettings(data, 'main').layout).toBe(main);
  expect(getNewsletterZoneSettings(data, 'context')).toMatchObject({ layout: context, contextStyle });
});

test('preserves insight1 items after the two designed zones', async () => {
  const data = fixture('theglobe');
  data.model.nodes.extra = { ...data.model.nodes['fixture-newsletter-item-1'], id: 'extra', title: 'Extra story' };
  data.model.data.links.pagelink.insight1 = [{ targetId: 'extra' }];
  const html = await renderNewsletterFragment(data);
  expect(html.indexOf('Fourth story')).toBeLessThan(html.indexOf('Extra story'));
  expect(html).toContain('More stories');
});

test('newsletter uses the linked main image when no crop URL is provided', async () => {
  const data = fixture('theglobe');
  const node = data.model.nodes['fixture-newsletter-item-1'];
  node.links = {
    hyperlink: { image: [{ targetId: '' }, { targetId: '' }] },
    system: { mainPicture: [{
      targetId: 'image',
      metadata: {
        metadataType: 'image',
        softCrops: { Wide: { id: '' }, Portrait: { id: '' }, Ultrawide: { id: '' }, Square: { id: '' } },
      },
      dynamicCropsResourceUrls: {},
    }] },
  };
  data.model.nodes.image = { resourceUrl: 'https://example.test/image.jpg' } as typeof node;
  expect(await renderNewsletterFragment(data)).toContain('src="https://example.test/image.jpg"');
});

test('newsletter style-guide fixture renders without a resolved site', async () => {
  const data = makeFixtureBlock({
    type: 'newsletter',
    items: [{ title: 'The stories shaping today' }],
  }) as PageData<WebpageModel>;
  const preview = renderToStaticMarkup(await NewsletterWebpage({ data }));
  expect(preview).toContain('The stories shaping today');
  expect(preview).toContain('#3969AC');
});
