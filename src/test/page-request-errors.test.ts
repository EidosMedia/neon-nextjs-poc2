import Page, { generateMetadata } from '@/app/[[...slug]]/page';
import { connection as requestConnection } from 'next/server';
import { headers } from 'next/headers';
import { fetchPageDataCached, fetchPageDataDirect } from '@/utilities/pageCache';

jest.mock('next/server', () => ({ connection: jest.fn().mockResolvedValue(undefined) }));
jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue(new Headers({
    'x-neon-backend-url': 'https://preview.test',
    'x-neon-site-name': 'Test',
    'x-neon-view-status': 'preview',
    'x-neon-pathname': '/story/',
  })),
  cookies: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  notFound: () => { throw new Error('NOT_FOUND'); },
  redirect: jest.fn(),
}));
jest.mock('@/utilities/security', () => ({ getAuthOptions: jest.fn().mockResolvedValue({}) }));
jest.mock('@/utilities/pageCache', () => ({
  fetchPageDataDirect: jest.fn(),
  fetchPageDataCached: jest.fn(),
  isUnavailablePageStatus: (status: unknown) => typeof status === 'number' && [401, 403, 404, 410].includes(status),
}));
jest.mock('@/app/_themeRouter', () => ({ resolvePageComponent: jest.fn(), resolveRenderTheme: jest.fn() }));
jest.mock('@/app/_v2', () => ({}));
jest.mock('@/app/components/LoggedUserOverlay/LoggedUserBar', () => ({ __esModule: true, default: () => null }));
jest.mock('@/app/components/LoggedUserOverlay/ViewportFrame', () => ({ __esModule: true, default: () => null }));

beforeEach(() => jest.clearAllMocks());

test.each([502, 503])('upstream %i reaches the page error boundary, not a 404', async status => {
  const failure = { status, cause: { message: 'Backend unavailable' } };
  jest.mocked(fetchPageDataDirect).mockRejectedValue(failure);
  await expect(Page({ params: Promise.resolve({ slug: ['section', 'story'] }) })).rejects.toBe(failure);
  expect(jest.mocked(requestConnection).mock.invocationCallOrder[0])
    .toBeLessThan(jest.mocked(headers).mock.invocationCallOrder[0]);
});

test.each([401, 403, 404, 410])('unavailable content (%i) retains not-found behavior', async status => {
  jest.mocked(fetchPageDataDirect).mockRejectedValue({ status });
  await expect(Page({ params: Promise.resolve({ slug: ['section', 'story'] }) })).rejects.toThrow('NOT_FOUND');
});

test.each([401, 403, 404, 410])('a LIVE unavailable result (%i) renders not-found', async status => {
  jest.mocked(headers).mockResolvedValueOnce(new Headers({
    'x-neon-backend-url': 'https://live.test',
    'x-neon-site-name': 'Test',
    'x-neon-view-status': 'live',
    'x-neon-pathname': '/story/',
  }) as Awaited<ReturnType<typeof headers>>);
  jest.mocked(fetchPageDataCached).mockResolvedValue({ status });
  await expect(Page({ params: Promise.resolve({ slug: ['section', 'story'] }) })).rejects.toThrow('NOT_FOUND');
});

test('metadata defers request work and logs upstream errors explicitly', async () => {
  const failure = { status: 502 };
  jest.mocked(fetchPageDataDirect).mockRejectedValue(failure);
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    await generateMetadata({ params: Promise.resolve({ slug: ['story'] }) });
    expect(warn).toHaveBeenCalledWith('Error generating metadata:', failure);
    expect(jest.mocked(requestConnection).mock.invocationCallOrder[0])
      .toBeLessThan(jest.mocked(headers).mock.invocationCallOrder[0]);
  } finally { warn.mockRestore(); }
});

test('missing page metadata does not report an unexpected error', async () => {
  jest.mocked(fetchPageDataDirect).mockRejectedValue({ status: 404 });
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  try {
    await expect(generateMetadata({ params: Promise.resolve({ slug: ['story'] }) }))
      .resolves.toEqual({ title: 'Page not found' });
    expect(warn).not.toHaveBeenCalled();
  } finally { warn.mockRestore(); }
});
