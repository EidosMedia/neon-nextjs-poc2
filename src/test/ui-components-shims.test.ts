jest.mock('react', () => ({ Fragment: Symbol('Fragment') }));
jest.mock('react-dom', () => ({ version: 'server' }));

import { GET as getReactShim } from '@/app/api/shims/react/route';
import { GET as getReactDomShim } from '@/app/api/shims/react-dom/route';

test('React shim includes browser-only hooks even when the server React export omits them', async () => {
  const body = await getReactShim().text();
  expect(body).toContain('export const useContext = _r["useContext"];');
  expect(body).toContain('export const useState = _r["useState"];');
  expect(body).toContain('export const createContext = _r["createContext"];');
});

test('React DOM shim includes browser-only APIs when absent from the server export', async () => {
  const body = await getReactDomShim().text();
  expect(body).toContain('export const createPortal = _r["createPortal"];');
  expect(body).toContain('export const flushSync = _r["flushSync"];');
});
