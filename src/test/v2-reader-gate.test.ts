/* eslint-disable react/no-children-prop -- React 19 requires children in typed createElement props. */
import React, { createElement, type ComponentProps } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Provider } from 'react-redux';
import { makeStore } from '@/lib/store';
import { setPreviewReaderTier, setInspectItems, setEditorialBarVisible } from '@/lib/features/loggedUserSlice';
import { setUserName } from '@/lib/features/webauthSlice';
import ReaderGate from '@/app/_v2/leaves/ReaderGate';
import PaywallIcon from '@/app/_v2/items/PaywallIcon';
import PreviewReaderSelect from '@/app/_v2/chrome/PreviewReaderSelect';
import HeaderActions from '@/app/_v2/chrome/HeaderActions';
import LoggedUserBar from '@/app/components/LoggedUserOverlay/LoggedUserBar';
import { PAYWALL_LEVELS, type PreviewReaderTier } from '@/app/_v2/lib/paywall';
import * as meter from '@/app/_v2/leaves/useMeteredAccess';
import { makeFixtureBlock } from '@/app/_v2/ui/fixtures';
import type { NodeHistory } from '@eidosmedia/neon-frontoffice-ts-sdk';

let mockHistory: Partial<NodeHistory> = {};
jest.mock('@/app/_v2/leaves/useMeteredAccess', () => ({ useMeteredAccess: jest.fn() }));
jest.mock('@/neon-frontoffice-ts-sdk/src', () => ({
  ...jest.requireActual('@/neon-frontoffice-ts-sdk/src'), isNeonAppPreview: () => false,
}));
jest.mock('@/hooks/useAuth', () => ({
  __esModule: true, default: () => ({ data: { user: { name: 'Editor', alias: 'Editor', id: 'editor' } } }),
}));
jest.mock('@/hooks/useAuthContext', () => ({
  __esModule: true, default: () => ({ data: { hasEditorialAuth: true } }),
}));
jest.mock('@/hooks/useVersions', () => ({
  __esModule: true, default: () => ({ data: mockHistory, panelOpened: false, setPanelOpened: jest.fn() }),
}));
jest.mock('@/app/components/LoggedUserOverlay/ViewStatus', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/components/LoggedUserOverlay/History', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/components/LoggedUserOverlay/EditedChip', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/components/LoggedUserOverlay/InfoTooltip', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/components/PromotionButton', () => ({ __esModule: true, default: () => null }));
const useMeter = jest.mocked(meter.useMeteredAccess);

function render(props: Partial<ComponentProps<typeof ReaderGate>> = {}, tier: PreviewReaderTier = 'FREE', inspect = false) {
  const store = makeStore();
  store.dispatch(setPreviewReaderTier(tier));
  store.dispatch(setInspectItems(inspect));
  return renderToStaticMarkup(createElement(Provider, {
    store,
    children: createElement(ReaderGate, {
      level: 'FREE', registered: false, siteName: 'site', url: '/story', children: 'Protected article body', ...props,
    }),
  }));
}

beforeEach(() => {
  mockHistory = {};
  useMeter.mockReset();
  useMeter.mockReturnValue({ identity: 'test' });
});

function webpageData(baseType: string, viewStatus: 'preview' | 'live') {
  const data = makeFixtureBlock({ type: baseType, title: 'Webpage' });
  data.model.data.sys.baseType = baseType;
  data.model.data.url = '/';
  data.siteData = { viewStatus, siteName: 'Test' };
  data.siteNode = {
    id: 'site', name: 'Test', nodeType: 'site', title: 'Test', uri: '', url: '/', path: '/',
    items: [], hostname: 'site.test', previewHostname: 'preview.site.test', attributes: { theme: 'sportsarena' },
  };
  return { ...data, editUrl: '/editor', previewHost: 'preview.site.test', liveHost: 'site.test' };
}

test.each(['webpage', 'homewebpage', 'sectionwebpage'])(
  '%s offers preview teaser editing without a host version; LIVE stays informational', baseType => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      for (const viewStatus of ['preview', 'live'] as const) {
        const html = renderToStaticMarkup(createElement(Provider, {
          store: makeStore(),
          children: createElement(LoggedUserBar, { data: webpageData(baseType, viewStatus) }),
        }));
        expect(html).toContain(viewStatus === 'preview' ? 'Edit Content Items' : 'View Additional Information');
        expect(html).toContain('type="checkbox"');
      }
    } finally { log.mockRestore(); }
  },
);

test('webpage history loading and refetching do not switch teaser editing off', () => {
  const History = jest.requireActual<typeof import('@/app/components/LoggedUserOverlay/History')>(
    '@/app/components/LoggedUserOverlay/History',
  ).default;
  const store = makeStore();
  const effect = jest.spyOn(React, 'useEffect').mockImplementation(() => {});
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  const runHistory = () => {
    effect.mockClear();
    renderToStaticMarkup(createElement(Provider, {
      store, children: createElement(History, { data: webpageData('homewebpage', 'preview') }),
    }));
    const historyEffect = effect.mock.calls.at(-1)?.[0];
    expect(historyEffect).toBeDefined();
    historyEffect?.();
  };
  try {
    runHistory();
    expect(store.getState().loggedUser.inspectItemsVisible).toBe(true);
    store.dispatch(setInspectItems(true));
    mockHistory = { versions: [] };
    runHistory();
    expect(store.getState().loggedUser.inspectItemsVisible).toBe(true);
    expect(store.getState().loggedUser.inspectItems).toBe(true);
  } finally {
    effect.mockRestore();
    log.mockRestore();
  }
});

test('article leaves still need history eligibility to expose the editing switch', () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  try {
    const html = renderToStaticMarkup(createElement(Provider, {
      store: makeStore(), children: createElement(LoggedUserBar, { data: webpageData('article', 'preview') }),
    }));
    expect(html).not.toContain('Edit Content Items');
  } finally { log.mockRestore(); }
});

test('all non-free tiers show an identical anonymous gate; FREE stays open', () => {
  expect(render()).toContain('Protected article body');
  const gates = PAYWALL_LEVELS.slice(1).map(level => render({ level }));
  expect(new Set(gates).size).toBe(1);
  expect(gates[0]).toContain('Log in to continue reading');
  expect(gates[0]).not.toContain('Protected article body');
  expect(useMeter).toHaveBeenLastCalledWith(false, 'site', '/story', false);
});

test('LIVE ignores the preview selection and retains the signed-in demo policy', () => {
  expect(render({ level: 'PREMIUM' }, 'PREMIUM')).not.toContain('Protected article body');
  expect(render({ level: 'PREMIUM', registered: true })).toContain('Protected article body');
  expect(render({ level: 'FREEMIUM', registered: true })).toContain('Protected article body');
  expect(useMeter).toHaveBeenLastCalledWith(false, 'site', '/story', false);
});

test('preview REGISTERED blocks PREMIUM even when a real reader cookie is present', () => {
  const html = render({ level: 'PREMIUM', registered: true, preview: true }, 'REGISTERED');
  expect(html).toContain('Premium subscription required');
  expect(html).not.toContain('Protected article body');
  expect(html).not.toContain('href="/login"');
  expect(render({ level: 'PREMIUM', preview: true }, 'PREMIUM')).toContain('Protected article body');
  expect(render({ level: 'FREEMIUM', preview: true }, 'REGISTERED')).toContain('Protected article body');
});

test('preview REGISTERED uses its own meter; preview PREMIUM never consumes it', () => {
  render({ level: 'METERED', preview: true }, 'REGISTERED');
  expect(useMeter).toHaveBeenLastCalledWith(true, 'site', '/story', true);
  expect(render({ level: 'METERED', preview: true }, 'PREMIUM')).toContain('Protected article body');
  expect(useMeter).toHaveBeenLastCalledWith(false, 'site', '/story', true);
});

test('PREVIEW editing reveals gated bodies without metering; LIVE never bypasses reader access', () => {
  for (const level of ['METERED', 'PREMIUM'] as const) {
    expect(render({ level, preview: true }, 'FREE', true)).toContain('Protected article body');
    expect(useMeter).toHaveBeenLastCalledWith(false, 'site', '/story', true);
    expect(render({ level, preview: false }, 'FREE', true)).not.toContain('Protected article body');
  }
});

test('editorial preview remains fully readable until a reader simulation is selected', () => {
  const html = renderToStaticMarkup(createElement(Provider, {
    store: makeStore(),
    children: createElement(ReaderGate, {
      level: 'PREMIUM', registered: false, siteName: 'site', url: '/story', preview: true,
      children: 'Editable editorial body',
    }),
  }));
  expect(html).toContain('Editable editorial body');
  expect(html).not.toContain('Log in to continue reading');
  expect(useMeter).toHaveBeenLastCalledWith(false, 'site', '/story', true);
});

test('metered leaves distinguish pending, failure, allowance, exhausted and reread states', () => {
  const props = { level: 'METERED', registered: true } as const;
  expect(render(props)).toContain('Checking your daily allowance');
  expect(render(props)).not.toContain('Protected article body');
  useMeter.mockReturnValue({ identity: 'test', failed: true });
  expect(render(props)).toContain('Your daily allowance could not be saved');
  const record = { day: '2026-11-20', paths: ['/story'] };
  useMeter.mockReturnValue({ identity: 'test', result: { record, allowed: true, remaining: 9 } });
  expect(render(props)).toContain('9 of 10 metered articles left for today');
  expect(render(props)).toContain('Protected article body');
  useMeter.mockReturnValue({ identity: 'test', result: { record, allowed: false, remaining: 0 } });
  expect(render(props)).toContain('Daily allowance reached');
  expect(render(props)).not.toContain('Protected article body');
  useMeter.mockReturnValue({ identity: 'test', result: { record, allowed: true, remaining: 0 } });
  expect(render(props)).toContain('Protected article body');
});

test('all restricted-tier icons are identical and FREE has none', () => {
  expect(renderToStaticMarkup(createElement(PaywallIcon, { level: 'FREE' }))).toBe('');
  const icons = PAYWALL_LEVELS.slice(1).map(level => renderToStaticMarkup(createElement(PaywallIcon, { level })));
  expect(new Set(icons).size).toBe(1);
  expect(icons[0]).toContain('aria-label="Restricted content"');
});

test('selector reflects the Redux simulation level', () => {
  const store = makeStore();
  store.dispatch(setPreviewReaderTier('REGISTERED'));
  const html = renderToStaticMarkup(createElement(Provider, {
    store, children: createElement(PreviewReaderSelect),
  }));
  expect(html).toContain('aria-label="Reader view: Registered"');
  expect(html).toContain('Reader view');
});

function renderHeaderActions(tier: PreviewReaderTier, authenticated: boolean, preview: boolean, barVisible: boolean, drawer = false) {
  const store = makeStore();
  store.dispatch(setPreviewReaderTier(tier));
  store.dispatch(setEditorialBarVisible(barVisible));
  store.dispatch(setUserName('Actual reader'));
  return renderToStaticMarkup(createElement(Provider, {
    store, children: createElement(HeaderActions, { authenticated, preview, drawer }),
  }));
}

test.each([false, true])('preview header and drawer simulate all reader tiers (drawer: %s)', drawer => {
  for (const authenticated of [false, true]) {
    const free = renderHeaderActions('FREE', authenticated, true, true, drawer);
    expect(free).toContain('>Subscribe</a>');
    expect(free).toContain('>Login</a>');
    expect(free).not.toContain('Actual reader');

    const registered = renderHeaderActions('REGISTERED', authenticated, true, true, drawer);
    expect(registered).toContain('>Subscribe</a>');
    expect(registered).toContain('Registered reader');
    expect(registered).toMatch(/<button[^>]*disabled=""[^>]*>Logout<\/button>/);
    expect(registered).not.toContain('Actual reader');

    const premium = renderHeaderActions('PREMIUM', authenticated, true, true, drawer);
    expect(premium).not.toContain('>Subscribe</a>');
    expect(premium).toContain('Premium subscriber');
    expect(premium).toMatch(/<button[^>]*disabled=""[^>]*>Logout<\/button>/);
    expect(premium).not.toContain('>Login</a>');
  }
});

test.each([[false, true], [true, false]])(
  'header uses real reader session outside active editorial preview (preview: %s, bar visible: %s)',
  (preview, barVisible) => {
    const anonymous = renderHeaderActions('PREMIUM', false, preview, barVisible);
    expect(anonymous).toContain('>Subscribe</a>');
    expect(anonymous).toContain('>Login</a>');
    const signedIn = renderHeaderActions('FREE', true, preview, barVisible);
    expect(signedIn).toContain('>Subscribe</a>');
    expect(signedIn).toContain('Actual reader');
    expect(signedIn).toMatch(/<button(?![^>]*disabled)[^>]*>Logout<\/button>/);
  },
);

test('reader menu describes all simulation levels and marks the selected level', () => {
  const store = makeStore();
  store.dispatch(setPreviewReaderTier('REGISTERED'));
  const state = jest.spyOn(React, 'useState').mockReturnValueOnce([true, jest.fn()]);
  try {
    const html = renderToStaticMarkup(createElement(Provider, {
      store, children: createElement(PreviewReaderSelect),
    }));
    expect(html.match(/role="menuitemradio"/g)).toHaveLength(3);
    expect(html).toContain('Anonymous reader');
    expect(html).toContain('Signed-in reader');
    expect(html).toContain('Premium subscriber');
    expect(html).toMatch(/aria-checked="true"[^>]*>.*Signed-in reader/);
  } finally { state.mockRestore(); }
});

test('admin bar displays the Neon symbol without the wordmark', () => {
  const html = renderToStaticMarkup(createElement(Provider, {
    store: makeStore(), children: createElement(LoggedUserBar, { data: webpageData('webpage', 'preview') }),
  }));
  expect(html).toMatch(/class="neon-admin__brand"><svg[^>]*aria-label="Neon"[^>]*><path d="M296\.92,23\.25/);
  expect(html).toMatch(/<path d="M296\.92,23\.25[^"]*"><\/path><\/svg><\/span>/);
});

test('visibility notice appears immediately before the site name', () => {
  const data = webpageData('article', 'preview');
  data.model.data.pubInfo = { endVisible: '2030-01-22T15:46:00Z' };
  const html = renderToStaticMarkup(createElement(Provider, {
    store: makeStore(), children: createElement(LoggedUserBar, { data }),
  }));
  expect(html).toMatch(/class="neon-admin__visibility".*This item will expire on .*<\/span><span class="neon-admin__site">Test<\/span>/);
});

test.each([
  ['preview', 'sportsarena', true],
  ['live', 'sportsarena', false],
  ['preview', 'adn', false],
] as const)('admin selector visibility: %s / %s', (viewStatus, theme, visible) => {
  const data: ComponentProps<typeof LoggedUserBar>['data'] = {
    siteData: {
      viewStatus, siteName: 'Test', logoUrl: '', menus: {}, nodes: {},
      apiHostnames: { liveHostname: '', previewHostname: '', stageHostname: '' },
      root: {
        id: 'site', name: 'Test', nodeType: 'site', title: 'Test', uri: '', url: '/', path: '/',
        items: [], hostname: 'site.test', previewHostname: 'preview.site.test', attributes: { theme },
      },
    },
  };
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  try {
    const html = renderToStaticMarkup(createElement(Provider, {
      store: makeStore(), children: createElement(LoggedUserBar, { data }),
    }));
    expect(html.includes('Reader view')).toBe(visible);
  } finally { log.mockRestore(); }
});
