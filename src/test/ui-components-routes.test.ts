import { NextRequest } from 'next/server';
import type { NeonConnection } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { GET as getComponent } from '@/app/shared/uicomponents/[[...slug]]/route';
import { GET as getMarvinShim } from '@/app/api/shims/marvin/route';

const fetchUiComponent = jest.fn();
const request = new NextRequest('https://preview.example.test/shared/uicomponents/manifest.json', {
  headers: { 'x-neon-backend-url': 'https://site-backend.example.test' },
});

beforeAll(() => {
  global.connection = { fetchUiComponent } as unknown as NeonConnection;
});

beforeEach(() => {
  fetchUiComponent.mockReset();
});

test('proxies component assets from the shared service, not the site backend', async () => {
  fetchUiComponent.mockResolvedValue(new Response('{"categories":{}}', {
    headers: { 'content-type': 'application/json' },
  }));

  const response = await getComponent(request, { params: Promise.resolve({ slug: ['manifest.json'] }) });

  expect(fetchUiComponent).toHaveBeenCalledWith('manifest.json');
  expect(response.status).toBe(200);
  expect(response.headers.get('content-type')).toBe('application/json');
  expect(await response.text()).toBe('{"categories":{}}');
});

test('reports upstream component failures instead of returning an empty 500', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    fetchUiComponent.mockRejectedValue({ status: 404, cause: { message: 'Not found' } });
    const response = await getComponent(request, { params: Promise.resolve({ slug: ['missing.js'] }) });

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ message: 'Not found' });
    expect(log).toHaveBeenCalled();
  } finally {
    log.mockRestore();
  }
});

test('the Marvin shim retries failed authenticated bundle fetches and discovers chunk imports', async () => {
  const log = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    fetchUiComponent.mockRejectedValueOnce({ status: 503, cause: { message: 'Unavailable' } });
    const failure = await getMarvinShim();
    expect(failure.status).toBe(503);

    fetchUiComponent.mockImplementation(async (path: string) => {
      if (path === 'editor.js') return new Response('import "./chunks/editor.js";');
      if (path === 'chunks/editor.js') {
        return new Response('import { Widget as W, Button } from "@eidosmedia/react-marvin-components";');
      }
      throw new Error(`Unexpected path ${path}`);
    });

    const response = await getMarvinShim();
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(fetchUiComponent).toHaveBeenCalledWith('chunks/editor.js');
    expect(body).toContain('export { _noop as Widget };');
    expect(body).toContain('export { _noop as Button };');
  } finally {
    log.mockRestore();
  }
});
