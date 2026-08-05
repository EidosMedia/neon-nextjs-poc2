import { jest } from '@jest/globals';
import { NextRequest } from 'next/server';
import { getAPIHostnameConfig } from '@/services/utils';
import { proxy } from '@/proxy';
import { ViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';

jest.mock('@/services/utils', () => ({
  getAPIHostnameConfig: jest.fn(),
}));

const getAPIHostnameConfigMock = jest.mocked(getAPIHostnameConfig);
const previewAuthorization = jest.fn<NeonConnection['previewAuthorization']>();

const siteConfig = {
  apiHostname: 'https://api.neon.example.test',
  viewStatus: ViewStatus.PREVIEW,
  root: {
    name: 'news',
  },
};

const createRequest = (path: string, forwardedHost: string): NextRequest =>
  new NextRequest(`https://${forwardedHost}${path}`, {
    headers: { 'x-forwarded-host': forwardedHost },
  });

describe('editorialauth cookie handling', () => {
  const originalDevMode = process.env.DEV_MODE;

  beforeAll(() => {
    process.env.DEV_MODE = 'false';
    global.connection = {
      previewAuthorization,
    } as unknown as NeonConnection;
  });

  beforeEach(() => {
    getAPIHostnameConfigMock.mockResolvedValue(siteConfig as never);
    previewAuthorization.mockReset();
  });

  afterAll(() => {
    process.env.DEV_MODE = originalDevMode;
  });

  test('sets a host-only cookie and expires a legacy domain cookie when exchanging a switch token', async () => {
    const response = await proxy(
      createRequest('/story?switch-view=PREVIEW&switch-token=switch-token', 'PREVIEW-NEWS.EXAMPLE.TEST:8443'),
    );

    const editorialCookie = response.cookies.get('editorialauth');

    expect(editorialCookie).toMatchObject({
      value: 'switch-token',
      path: '/',
    });
    expect(editorialCookie?.domain).toBeUndefined();
    expect(response.headers.get('set-cookie')).toContain('Domain=preview-news.example.test; Max-Age=0');
    expect(response.headers.get('set-cookie')).not.toContain('Domain=PREVIEW-NEWS.EXAMPLE.TEST:8443');
  });

  test('uses the same host-only policy for PreviewToken authorization', async () => {
    previewAuthorization.mockResolvedValue({
      status: 204,
      headers: {
        getSetCookie: () => ['empreviewtoken=editorial-token; Path=/; HttpOnly'],
      },
    });

    const response = await proxy(
      createRequest('/story?PreviewToken=preview-token&id=node-1&siteName=news', 'preview-news.example.test:8443'),
    );

    const editorialCookie = response.cookies.get('editorialauth');

    expect(editorialCookie).toMatchObject({
      value: 'editorial-token',
      path: '/',
    });
    expect(editorialCookie?.domain).toBeUndefined();
    expect(response.headers.get('set-cookie')).toContain('Domain=preview-news.example.test; Max-Age=0');
  });
});