import { NextRequest } from 'next/server';
import { GET } from '@/app/api/accessories/route';
import defaultAccessoryDefinitions from '@/app/_pages/accessories.json';

const mockWarn = jest.fn();
const mockError = jest.fn();
jest.mock('pino', () => ({
  __esModule: true,
  default: () => ({ warn: (...args: unknown[]) => mockWarn(...args), error: (...args: unknown[]) => mockError(...args) }),
}));

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
    expect(await response.json()).toEqual({ error: 'Not Found - Invalid Call' });
  });

  test('logs the reason of a rejection without printing any secret', async () => {
    mockWarn.mockClear();
    await GET(createRequest('default', 'wrong-secret'));

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(mockWarn.mock.calls)).toContain(headerName);
    expect(JSON.stringify(mockWarn.mock.calls)).not.toContain('wrong-secret');
    expect(JSON.stringify(mockWarn.mock.calls)).not.toContain(secretValue);
  });

  test('rejects every call and logs once when the shared secret is not configured', async () => {
    mockError.mockClear();
    mockWarn.mockClear();
    delete process.env.INVALIDATE_NEXTJS_HEADER_VALUE;
    try {
      const first = await GET(createRequest('default'));
      const second = await GET(createRequest('default'));

      expect(first.status).toBe(404);
      expect(second.status).toBe(404);
      expect(mockError).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(mockWarn.mock.calls)).toContain('INVALIDATE_NEXTJS_HEADER_VALUE is not configured');
    } finally {
      process.env.INVALIDATE_NEXTJS_HEADER_VALUE = secretValue;
    }
  });

  test('rejects a request without a theme', async () => {
    const response = await GET(createRequest());

    expect(response.status).toBe(400);
  });

  test('returns not found for themes without a definition document', async () => {
    const response = await GET(createRequest('other-theme'));

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'Theme definitions were not found.' });
  });

  test.each(['constructor', '__proto__', 'toString', 'Default', 'default/../x', '../default', 'x'.repeat(300)])(
    'never resolves %s to a definition document',
    async theme => {
      const response = await GET(createRequest(theme));

      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: 'Theme definitions were not found.' });
    },
  );
});