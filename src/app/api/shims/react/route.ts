/**
 * ESM shim for `react`.
 *
 * Returns a JavaScript ES module that re-exports all React named exports from
 * the `globalThis.__shim_react` instance set by ReactShimExposer.
 *
 * The server's React export list omits client APIs, so include those explicitly.
 */

import * as ReactModule from 'react';

const names = [...new Set([
  ...Object.keys(ReactModule).filter(k => k !== 'default'),
  'Component', 'PureComponent', 'act', 'createContext', 'startTransition', 'unstable_useCacheRefresh',
  'useActionState', 'useContext', 'useDeferredValue', 'useEffect', 'useImperativeHandle',
  'useInsertionEffect', 'useLayoutEffect', 'useOptimistic', 'useReducer', 'useRef',
  'useState', 'useSyncExternalStore', 'useTransition',
])];

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
