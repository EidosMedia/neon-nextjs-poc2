import { renderToStaticMarkup } from 'react-dom/server';
import { createElement, type ReactNode } from 'react';
import type { ContentElement, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { makeFixtureBlock } from '@/app/_v2/ui/fixtures';
import NewsletterStory from '@/app/_v2/pages/NewsletterStory';

jest.mock('@/app/components/utilities/ContentEditingContext', () => ({
  ContentEditingProvider: ({ children, objectId, viewStatus, lockedBy }: {
    children: ReactNode; objectId: string; viewStatus: string; lockedBy?: string;
  }) => createElement('div', { 'data-owner': objectId, 'data-view': viewStatus, 'data-lock': lockedBy }, children),
}));
jest.mock('@/app/components/utilities/ContentEditable', () => ({
  __esModule: true, default: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/app/_v2/leaves/LeafAccess', () => ({
  __esModule: true, default: ({ children }: { children: ReactNode }) => createElement('section', { 'data-reader-gate': true }, children),
}));
jest.mock('@/app/_v2/leaves/LeafBody', () => ({
  __esModule: true, default: ({ text, className }: { text?: ContentElement; className?: string }) =>
    createElement('div', { 'data-body-type': text?.nodeType, className }, 'Body content'),
}));

function node(nodeType: string, elements: ContentElement[] = [], value = ''): ContentElement {
  return { nodeType, elements, value, attributes: {} };
}

test('newsletter stories retain object-scoped editing and reader gating while using newsletter settings', async () => {
  const data = makeFixtureBlock({ type: 'newsletterstory', title: 'Editorial newsletter' }) as PageData<ArticleModel>;
  data.model.data.sys = { baseType: 'article', type: 'newsletterstory', lockedBy: 'An editor' };
  data.model.data.pubInfo = {
    publicationTime: '2026-11-23T12:00:00Z', publishedBy: { userName: '' }, visible: true,
    attributes: { pageAccessories: {
      theme: 'default', type: 'article/newsletterstory',
      items: { newsletter: { version: '1.0', values: { showForward: true, forwardText: 'Forward this edition' } } },
    } },
  };
  data.model.data.files = { content: { data: node('doc', [node('story', [
    node('headline', [node('p', [node('plainText', [], 'Editorial newsletter')])]),
    node('text', [node('p', [node('plainText', [], 'Body content')])]),
  ])]) } };
  data.siteData.viewStatus = 'preview';
  const html = renderToStaticMarkup(await NewsletterStory({ data }));
  expect(html).toContain('data-owner="fixture-newsletterstory"');
  expect(html).toContain('data-view="PREVIEW"');
  expect(html).toContain('data-lock="An editor"');
  expect(html).toContain('data-reader-gate');
  expect(html).toContain('data-body-type="text"');
  expect(html).toContain('class="v2-leaf__text v2-newsletter-story__body"');
  expect(html).toContain('Forward this edition');
});
