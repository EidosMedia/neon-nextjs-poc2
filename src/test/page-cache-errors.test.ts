import type { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { cacheLife, cacheTag } from 'next/cache';
import { fetchPageDataCached } from '@/utilities/pageCache';

jest.mock('next/cache', () => ({ cacheLife: jest.fn(), cacheTag: jest.fn() }));

const makePageRequest = jest.fn();
const redactSiteConfig = jest.fn((data: unknown) => data);

beforeAll(() => {
  global.connection = { makePageRequest, redactSiteConfig } as unknown as NeonConnection;
});

beforeEach(() => {
  jest.clearAllMocks();
});

test.each([401, 403, 404, 410])('retries unavailable status %i outside the cache boundary', async status => {
  const failure = { status };
  makePageRequest.mockRejectedValue(failure);

  await expect(fetchPageDataCached('https://site.test/missing', 'site', {})).rejects.toBe(failure);
  expect(makePageRequest).toHaveBeenCalledTimes(2);
  expect(cacheLife).toHaveBeenCalledWith({ stale: 0, revalidate: 0, expire: 0 });
  expect(cacheTag).not.toHaveBeenCalled();
});

test('a page that becomes available during the retry is returned immediately', async () => {
  const data = { model: { data: { id: 'article-1' } } };
  makePageRequest.mockRejectedValueOnce({ status: 404 }).mockResolvedValueOnce(Response.json(data));

  await expect(fetchPageDataCached('https://site.test/story', 'site', {}))
    .resolves.toEqual({ status: 200, data });
});

test('successful pages retain the existing cache profile and node tags', async () => {
  const data = { model: { data: { id: 'article-1' } } };
  makePageRequest.mockResolvedValue(Response.json(data));

  await expect(fetchPageDataCached('https://site.test/story', 'site', {}))
    .resolves.toEqual({ status: 200, data });
  expect(makePageRequest).toHaveBeenCalledTimes(1);
  expect(cacheLife).toHaveBeenCalledWith('hours');
  expect(cacheTag).toHaveBeenCalledWith('neon:site:site');
  expect(cacheTag).toHaveBeenCalledWith('neon:node:article-1');
});

test('unexpected upstream failures continue to reach the error boundary', async () => {
  const failure = { status: 503 };
  makePageRequest.mockRejectedValue(failure);

  await expect(fetchPageDataCached('https://site.test/story', 'site', {})).rejects.toBe(failure);
  expect(makePageRequest).toHaveBeenCalledTimes(1);
});
