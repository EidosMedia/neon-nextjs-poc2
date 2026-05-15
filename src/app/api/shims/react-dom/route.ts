/**
 * ESM shim for `react-dom`.
 *
 * Returns a JavaScript ES module that re-exports all react-dom named exports
 * from the `globalThis.__shim_react_dom` instance set by ReactShimExposer.
 */

import * as ReactDOMModule from 'react-dom';

const names = Object.keys(ReactDOMModule).filter(k => k !== 'default');

const body = [
  `const _r = globalThis.__shim_react_dom;`,
  `export default _r;`,
  ...names.map(k => `export const ${k} = _r[${JSON.stringify(k)}];`),
].join('\n');

export function GET() {
  return new Response(body, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
