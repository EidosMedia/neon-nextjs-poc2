/* eslint-disable react/no-children-prop -- React 19 requires children in typed createElement props. */
import React, { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import type { NodeVersion } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { makeStore } from '@/lib/store';
import { setEditorialBarVisible, setEditorialViewport, setViewportOrientation } from '@/lib/features/loggedUserSlice';
import { makeFixtureBlock } from '@/app/_v2/ui/fixtures';
import History from '@/app/components/LoggedUserOverlay/History';
import ViewStatusSelector from '@/app/components/LoggedUserOverlay/ViewStatus';
import ViewportSelector from '@/app/components/LoggedUserOverlay/ViewportSelector';
import ViewportFrame from '@/app/components/LoggedUserOverlay/ViewportFrame';
import VisibilityChip from '@/app/components/LoggedUserOverlay/VisibilityChip';
import { parseEditorialViewport, parseViewportOrientation } from '@/app/components/LoggedUserOverlay/viewport';

const published: NodeVersion = {
  nodeId: 'published', title: 'Published version', type: 'article', versionTimestamp: 2,
  versionDate: '2026-11-20T12:00:00Z', major: 2, minor: 0, prevTsVersion: 1, live: true,
  pubInfo: {
    siteName: 'Test', status: '', publicationTime: '', canonical: '/published/', sectionPath: '',
    visible: true, publishedBy: { userName: 'Editor', userId: 'editor' },
  },
};
const draft: NodeVersion = {
  ...published, nodeId: 'draft', title: 'Draft version', versionTimestamp: 1,
  versionDate: '2026-11-19T12:00:00Z', major: 1, prevTsVersion: 0, live: false,
};
let mockVersions = [published, draft];
let mockError = false;
let mockVersionLabel = 'PREVIEW 1.0';
jest.mock('@/hooks/useAuthContext', () => ({
  __esModule: true, default: () => ({ data: { hasEditorialAuth: true } }),
}));
jest.mock('@/hooks/useVersions', () => ({
  __esModule: true,
  default: () => ({
    data: { versions: mockVersions }, panelOpened: true, setPanelOpened: jest.fn(), isError: mockError,
    isLoading: false, refetch: jest.fn(), getVersionLabelFromVersion: () => mockVersionLabel,
    getLatestViewVersion: () => draft,
  }),
}));

function fixture() {
  const data = makeFixtureBlock({ type: 'article', title: 'Article' });
  data.model.data.sys.baseType = 'article';
  data.model.data.url = '/article/';
  data.model.data.version = 'draft';
  data.siteData.viewStatus = 'preview';
  return data;
}

test.each([
  [{ endVisible: '2030-01-22T15:46:00Z' }, 'This item will expire on'],
  [{ startVisible: '2030-01-22T15:46:00Z' }, 'This item will be visible from'],
  [{ startVisible: '2030-01-22T15:46:00Z', endVisible: '2030-01-23T15:46:00Z' }, 'and will expire on'],
] as const)('visibility notice retains each scheduled boundary', (pubInfo, label) => {
  const data = { ...fixture(), editUrl: '/editor' };
  data.model.data.pubInfo = pubInfo;
  const html = renderToStaticMarkup(createElement(VisibilityChip, { data }));
  expect(html).toContain(label);
  for (const value of Object.values(pubInfo)) {
    const date = new Date(value);
    expect(html).toContain(date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }));
    expect(html).toContain(date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  }
});

test('visibility notice is absent without scheduling information', () => {
  const data = { ...fixture(), editUrl: '/editor' };
  data.model.data.pubInfo = undefined;
  expect(renderToStaticMarkup(createElement(VisibilityChip, { data }))).toBe('');
});

function renderHistory(filter: 'all' | 'live', locked = false, selectedVersion = 'draft') {
  jest.spyOn(React, 'useState')
    .mockReturnValueOnce([locked ? { baseType: 'article', type: 'article', lockedBy: { userId: 'editor', userName: 'Editor' } } : null, jest.fn()])
    .mockReturnValueOnce([false, jest.fn()])
    .mockReturnValueOnce([null, jest.fn()])
    .mockReturnValueOnce([null, jest.fn()])
    .mockReturnValueOnce([filter, jest.fn()]);
  const data = fixture();
  data.model.data.version = selectedVersion;
  return renderToStaticMarkup(createElement(Provider, {
    store: makeStore(), children: createElement(History, { data }),
  }));
}

afterEach(() => {
  jest.restoreAllMocks();
  mockVersions = [published, draft];
  mockError = false;
  mockVersionLabel = 'PREVIEW 1.0';
});

test('history distinguishes the selected draft from the live version and links both', () => {
  const html = renderHistory('all');
  expect(html).toContain('Published version');
  expect(html).toContain('Draft version');
  expect(html).toContain('Latest published');
  expect(html).toContain('Viewing in Preview');
  expect(html).toContain('href="/published"');
  expect(html).toContain('data-prev-version="1.0"');
});

test('only the selected older editable version offers restore, unless the latest preview is locked', () => {
  mockVersions = [published, { ...draft, nodeId: 'latest', versionTimestamp: 3 }, draft];
  expect(renderHistory('all')).toContain('Restore this version');
  jest.restoreAllMocks();
  expect(renderHistory('all', true)).not.toContain('Restore this version');
  jest.restoreAllMocks();
  expect(renderHistory('all', false, 'latest')).not.toContain('Restore this version');
});

test('live filter and history failure show the correct states', () => {
  const html = renderHistory('live');
  expect(html).toContain('Published version');
  expect(html).not.toContain('Draft version');
  jest.restoreAllMocks();
  mockError = true;
  expect(renderHistory('all')).toContain('Could not load versions');
});

test('historical status and selected viewport are exposed as labelled controls', () => {
  const store = makeStore();
  store.dispatch(setEditorialViewport('phone'));
  const data = { ...fixture(), editUrl: '/editor', previewHost: 'preview.test', liveHost: 'live.test' };
  const html = renderToStaticMarkup(createElement(Provider, {
    store, children: createElement('div', null,
      createElement(ViewStatusSelector, { data }), createElement(ViewportSelector)),
  }));
  expect(html).toContain('View status: PREVIEW 1.0');
  expect(html).toContain('Viewport: Phone');
  expect(parseEditorialViewport('phone')).toBe('phone');
  expect(parseEditorialViewport('untrusted')).toBeUndefined();
});

test.each([
  ['phone', 'portrait', 390, 844],
  ['phone', 'landscape', 844, 390],
  ['tablet', 'portrait', 768, 1024],
  ['tablet', 'landscape', 1024, 768],
] as const)('%s %s renders a real %i × %i viewport', (device, orientation, width, height) => {
  const store = makeStore();
  store.dispatch(setEditorialBarVisible(true));
  store.dispatch(setEditorialViewport(device));
  store.dispatch(setViewportOrientation(orientation));
  jest.spyOn(React, 'useState')
    .mockReturnValueOnce([true, jest.fn()])
    .mockReturnValueOnce([1400, jest.fn()])
    .mockReturnValueOnce([null, jest.fn()]);
  const html = renderToStaticMarkup(createElement(Provider, {
    store, children: createElement(ViewportFrame, { theme: 'default', children: 'Page content' }),
  }));
  expect(html).toContain(`${width} × ${height} px`);
  expect(html).toContain(`width:${width}px;height:${height}px;transform:scale(1)`);
  expect(html).toContain(`aria-label="${orientation === 'portrait' ? 'Portrait' : 'Landscape'}" title="${orientation === 'portrait' ? 'Portrait' : 'Landscape'}" aria-pressed="true"`);
});

test('viewport menu reports rotated dimensions and rejects invalid stored orientations', () => {
  const store = makeStore();
  store.dispatch(setViewportOrientation('landscape'));
  jest.spyOn(React, 'useState').mockReturnValueOnce([true, jest.fn()]);
  const html = renderToStaticMarkup(createElement(Provider, {
    store, children: createElement(ViewportSelector),
  }));
  expect(html).toContain('1024 × 768 px');
  expect(html).toContain('844 × 390 px');
  expect(parseViewportOrientation('landscape')).toBe('landscape');
  expect(parseViewportOrientation('invalid')).toBeUndefined();
});
