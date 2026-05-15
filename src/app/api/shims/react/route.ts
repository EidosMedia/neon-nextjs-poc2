/**
 * ESM shim for `react`.
 *
 * Returns a JavaScript ES module that re-exports all React named exports from
 * the `globalThis.__shim_react` instance set by ReactShimExposer.
 *
 * The export list is derived at module-init time from the installed `react`
 * package, so it always matches the version Next.js is using.
 */

import * as ReactModule from 'react';

const names = Object.keys(ReactModule).filter(k => k !== 'default');

const body = [
  `const _r = globalThis.__shim_react;`,
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
