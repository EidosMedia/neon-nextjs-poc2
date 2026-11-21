/* eslint-disable react/no-children-prop -- React 19 requires children in typed createElement props. */
import React, { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ViewStatus, type ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { renderContent } from '@/utilities/content';
import ContentEditable from '@/app/components/utilities/ContentEditable';
import { ContentEditingProvider } from '@/app/components/utilities/ContentEditingContext';
import ArticleItem from '@/app/_v2/items/ArticleItem';
import ArticleActions from '@/app/components/base/ArticleOverlay/components/ArticleActions';
import ArticleOverlay, { type OverlayDataObj } from '@/app/components/base/ArticleOverlay/ArticleOverlay';
import useVersions from '@/hooks/useVersions';

let mockInspect = true;
jest.mock('@/hooks/useLoggedUserInfo', () => ({
  __esModule: true, default: () => ({ data: { inspectItems: mockInspect, preview: false } }),
}));
jest.mock('@/hooks/useAuthContext', () => ({
  __esModule: true, default: () => ({ data: { hasEditorialAuth: true } }),
}));
jest.mock('@/hooks/useVersions', () => ({
  __esModule: true, default: jest.fn(() => ({ changeEdited: jest.fn(), refetch: jest.fn() })),
}));

const plain = (value: string): ContentElement => ({ nodeType: 'plainText', value, attributes: {}, elements: [] });
const item = (nodeType: string, id?: string): ContentElement => ({
  nodeType, attributes: id ? { id } : {}, value: '',
  elements: nodeType === 'p' ? [plain('Body paragraph')] : [
    { nodeType: 'p', attributes: {}, value: '', elements: [plain('Editorial text')] },
  ],
});

function article(lockedBy?: string): ArticleModel {
  return {
    id: 'target-article', foreignId: '', title: 'Target title', summary: 'Target summary',
    sys: { baseType: 'article', type: 'article', ...(lockedBy ? { lockedBy } : {}) },
    children: [], cacheTTLSeconds: 0, resourceUrl: '', url: '/news/target/index.html',
    files: { content: { data: item('headline', 'headline-id') } },
    links: { system: { mainPicture: [] }, hyperlink: { image: [] } },
    attributes: {
      teaser: { title: 'Target teaser', summary: 'Target teaser summary' },
      contentIds: { teaserTitle: 'teaser-title-id', teaserSummary: 'teaser-summary-id' },
    },
    pubInfo: { publicationTime: '', publishedBy: { userName: '' }, visible: true },
  };
}

function render(children: ReactNode, viewStatus = ViewStatus.PREVIEW, lockedBy?: unknown, objectId = 'target-article') {
  return renderToStaticMarkup(createElement(ContentEditingProvider, { objectId, viewStatus, lockedBy, children }));
}

beforeEach(() => {
  mockInspect = true;
  jest.mocked(useVersions).mockClear();
});
afterEach(() => jest.restoreAllMocks());

test.each(['headline', 'overhead', 'summary', 'p'])(
  'leaf %s inherits PREVIEW without an explicit viewStatus prop', nodeType => {
    const html = render(renderContent(item(nodeType, `${nodeType}-id`), article(), nodeType === 'p' ? 'text' : undefined));
    expect(html).toMatch(/contentEditable="true"/i);
    expect(html).toContain(`id="${nodeType}-id"`);
    expect(html).toContain('aria-label="Save"');
    expect(useVersions).toHaveBeenLastCalledWith(expect.objectContaining({ viewStatus: ViewStatus.PREVIEW }));
  },
);

test('switch off, LIVE and missing content-item IDs remain read-only', () => {
  const child = createElement(ContentEditable, { data: article(), children: createElement('h1', { id: 'headline-id' }, 'Title') });
  expect(render(child, ViewStatus.LIVE)).not.toMatch(/contentEditable="true"/i);
  mockInspect = false;
  expect(render(child)).not.toContain('aria-label="Save"');
  mockInspect = true;
  expect(render(renderContent(item('headline'), article()))).not.toMatch(/contentEditable="true"/i);
  expect(render(renderContent(item('headline', 'headline-id')))).not.toMatch(/contentEditable="true"/i);
});

test.each(['editor-lock', 'CollaborationEditor'])('object lock %s blocks inline editing', lockedBy => {
  const html = render(renderContent(item('headline', 'headline-id'), article(lockedBy)));
  expect(html).not.toMatch(/contentEditable="true"/i);
  expect(html).not.toContain('aria-label="Save"');
  expect(html).toContain(`Locked by ${lockedBy}`);
});

test.each([
  [undefined, 2], ['item-lock', 0],
])('locked host page uses the linked object lock (%s) for teaser editing', (lockedBy, editors) => {
  const html = render(createElement(ArticleItem, {
    node: article(lockedBy),
    viewStatus: ViewStatus.PREVIEW,
    headingLevel: 2,
    view: { variant: 'standard', showImage: false, showStandfirst: true, solidBlock: false },
  }), ViewStatus.PREVIEW, { userId: 'editor', userName: 'Page lock owner' }, 'host-webpage');
  expect(html).toContain('Target teaser');
  expect(html).not.toContain('Locked by Page lock owner');
  expect(html.match(/contentEditable="true"/gi) ?? []).toHaveLength(editors);
  if (lockedBy) {
    expect(html).toContain(`Locked by ${lockedBy}`);
    expect(html).not.toContain('aria-label="Save"');
  }
});

test('same-object lock inheritance and LIVE status remain enforced', () => {
  const nested = createElement(ContentEditingProvider, {
    objectId: 'target-article',
    viewStatus: ViewStatus.PREVIEW,
    children: renderContent(item('headline', 'headline-id'), article()),
  });
  expect(render(nested, ViewStatus.LIVE)).not.toMatch(/contentEditable="true"/i);
  const html = render(nested, ViewStatus.PREVIEW, 'host-lock');
  expect(html).not.toMatch(/contentEditable="true"/i);
  expect(html).toContain('Locked by host-lock');
});

test('different block objects do not inherit the host lock, but still inherit LIVE status', () => {
  const nested = createElement(ContentEditingProvider, {
    objectId: 'target-article', viewStatus: ViewStatus.PREVIEW,
    children: renderContent(item('headline', 'headline-id'), article()),
  });
  expect(render(nested, ViewStatus.PREVIEW, 'page-lock', 'host-webpage')).toMatch(/contentEditable="true"/i);
  expect(render(nested, ViewStatus.LIVE, undefined, 'host-webpage')).not.toMatch(/contentEditable="true"/i);
});

test('an authoritative unlocked result clears the same object stale initial lock', () => {
  const nested = createElement(ContentEditingProvider, {
    objectId: 'target-article', viewStatus: ViewStatus.PREVIEW, lockedBy: null,
    children: renderContent(item('headline', 'headline-id'), article('stale-lock')),
  });
  const html = render(nested, ViewStatus.PREVIEW, 'stale-lock');
  expect(html).toMatch(/contentEditable="true"/i);
  expect(html).not.toContain('Locked by stale-lock');
});

test.each([
  { id: 'target-article', lockedBy: undefined, editable: true },
  { id: 'target-article', lockedBy: 'fresh-lock', editable: false },
  { id: 'other-target', lockedBy: undefined, editable: false },
])('overlay metadata for $id ($lockedBy) respects its owning object', ({ id, lockedBy, editable }) => {
  const snapshot: OverlayDataObj = {
    id, title: 'Target title', authors: [], pubInfo: { publicationTime: '' },
    sys: { lockedTime: '', lockedBy: lockedBy ? { id: lockedBy, name: lockedBy } : undefined },
  };
  jest.spyOn(React, 'useState').mockReturnValueOnce([snapshot, jest.fn()]);
  const target = article('stale-lock');
  const html = render(createElement(ArticleOverlay, {
    data: {
      ...target, name: 'target', nodeType: 'article', uri: target.resourceUrl, path: target.url,
      items: [], hostname: 'live.test', previewHostname: 'preview.test',
    },
    viewStatus: ViewStatus.PREVIEW,
    children: renderContent(item('headline', 'headline-id'), target),
  }), ViewStatus.PREVIEW, 'stale-lock');
  expect(/contentEditable="true"/i.test(html)).toBe(editable);
  if (lockedBy) expect(html).toContain(`Locked by ${lockedBy}`);
  if (id !== target.id) expect(html).toContain('Locked by stale-lock');
});

test('locking one linked item does not disable its unlocked sibling', () => {
  const locked = {
    ...article('item-lock'), id: 'locked-target',
    attributes: { contentIds: { teaserTitle: 'locked-title', teaserSummary: 'locked-summary' } },
  };
  const teaser = (node: ArticleModel) => createElement(ArticleItem, {
    node, viewStatus: ViewStatus.PREVIEW, headingLevel: 2,
    view: { variant: 'standard', showImage: false, showStandfirst: true, solidBlock: false },
  });
  const html = render(createElement('div', null, teaser(article()), teaser(locked)),
    ViewStatus.PREVIEW, 'page-lock', 'host-webpage');
  expect(html.match(/contentEditable="true"/gi)).toHaveLength(2);
  expect(html).toContain('Locked by item-lock');
  expect(html).not.toContain('Locked by page-lock');
});

test('v2 teaser editors retain the target object and teaser content-item IDs', () => {
  const target = article();
  const html = render(createElement(ArticleItem, {
    node: target,
    viewStatus: ViewStatus.PREVIEW,
    headingLevel: 2,
    view: { variant: 'standard', showImage: false, showStandfirst: true, solidBlock: false },
  }));
  expect(html.match(/contentEditable="true"/gi)).toHaveLength(2);
  expect(html).toContain('id="teaser-title-id"');
  expect(html).toContain('id="teaser-summary-id"');
  expect(useVersions).toHaveBeenCalledWith(expect.objectContaining({ currentNode: target, notLoadOnInit: true }));
});

test.each([
  [ViewStatus.PREVIEW, 'Publish'], [ViewStatus.LIVE, 'Unpublish'],
])('locked objects keep %s block actions available', (viewStatus, promotionLabel) => {
  const html = render(createElement(ArticleActions, {
    data: article('editor-lock'), viewStatus,
    overlayData: {
      id: 'target-article', title: 'Target title', authors: [],
      pubInfo: { publicationTime: '' },
      sys: { lockedBy: { id: 'editor', name: 'Lock owner' }, lockedTime: '' },
    },
  }), viewStatus, 'editor-lock');
  expect(html).toContain(`title="${promotionLabel}"`);
  expect(html).toContain('title="Info"');
  expect(html).not.toContain('disabled');
});
