/**
 * ESM shim for `react/jsx-runtime`.
 *
 * In development, uicomponent bundles use the production `jsx` function which
 * creates elements without the dev-only `_store` property. React's dev-mode
 * reconciler rejects those elements. To match the server-side fix (which
 * rewrites bundle text to use jsxDEV), this shim also delegates to jsxDEV
 * in development so client-side rendering behaves identically.
 *
 * In production, re-exports from `globalThis.__shim_react_jsx_runtime` set by
 * ReactShimExposer.
 */

const isDev = process.env.NODE_ENV !== 'production';

const body = isDev
  ? [
      'const _dev = globalThis.__shim_react_jsx_dev_runtime;',
      'const Fragment = _dev.Fragment;',
      'function jsx(type, props, key) { return _dev.jsxDEV(type, props, key, false, undefined, undefined); }',
      'function jsxs(type, props, key) { return _dev.jsxDEV(type, props, key, true, undefined, undefined); }',
      'export { jsx, jsxs, Fragment };',
    ].join('\n')
  : [
      'const _r = globalThis.__shim_react_jsx_runtime;',
      'export const jsx = _r.jsx;',
      'export const jsxs = _r.jsxs;',
      'export const Fragment = _r.Fragment;',
    ].join('\n');

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
