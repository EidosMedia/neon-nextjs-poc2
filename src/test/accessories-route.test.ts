import { NextRequest } from 'next/server';
import { GET } from '@/app/api/accessories/route';
import defaultAccessoryDefinitions from '@/lib/accessories/accessory.json';

const headerName = 'x-accessory-secret';
const secretValue = 'shared-secret';

const createRequest = (theme?: string, secret = secretValue): NextRequest => {
  const url = new URL('http://localhost/api/accessories');
  if (theme !== undefined) {
    url.searchParams.set('theme', theme);
  }
  return new NextRequest(url, { headers: { [headerName]: secret } });
};

describe('GET /api/accessories', () => {
  const originalHeaderName = process.env.INVALIDATE_NEXTJS_HEADER_NAME;
  const originalHeaderValue = process.env.INVALIDATE_NEXTJS_HEADER_VALUE;

  beforeAll(() => {
    process.env.INVALIDATE_NEXTJS_HEADER_NAME = headerName;
    process.env.INVALIDATE_NEXTJS_HEADER_VALUE = secretValue;
  });

  afterAll(() => {
    if (originalHeaderName === undefined) {
      delete process.env.INVALIDATE_NEXTJS_HEADER_NAME;
    } else {
      process.env.INVALIDATE_NEXTJS_HEADER_NAME = originalHeaderName;
    }
    if (originalHeaderValue === undefined) {
      delete process.env.INVALIDATE_NEXTJS_HEADER_VALUE;
    } else {
      process.env.INVALIDATE_NEXTJS_HEADER_VALUE = originalHeaderValue;
    }
  });

  test('returns the complete document for the configured theme', async () => {
    const response = await GET(createRequest('default'));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(defaultAccessoryDefinitions);
  });

  test('rejects a missing or incorrect shared secret', async () => {
    const response = await GET(createRequest('default', 'wrong-secret'));

    expect(response.status).toBe(404);
  });

  test('rejects a request without a theme', async () => {
    const response = await GET(createRequest());

    expect(response.status).toBe(400);
  });

  test('returns not found for themes without a definition document', async () => {
    const response = await GET(createRequest('other-theme'));

    expect(response.status).toBe(404);
  });
});