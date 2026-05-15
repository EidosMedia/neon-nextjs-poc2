/**
 * ESM shim for `react-dom/client`.
 *
 * Returns a JavaScript ES module that re-exports `createRoot` and `hydrateRoot`
 * from the `globalThis.__shim_react_dom_client` instance set by ReactShimExposer.
 */

const body = [
  `const _r = globalThis.__shim_react_dom_client;`,
  `export const createRoot = _r.createRoot;`,
  `export const hydrateRoot = _r.hydrateRoot;`,
].join('\n');

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
