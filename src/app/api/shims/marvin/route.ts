/**
 * Generates an ES-module stub for @eidosmedia/react-marvin-components.
 *
 * The upstream uicomponents bundle imports named exports from this package
 * (e.g. editor UI widgets). Since the package is not installed here and is
 * only used for editor-side controls, we stub every imported name as a no-op.
 *
 * Names are extracted at runtime by fetching the editor bundle + chunks and
 * scanning for `import { ... } from "@eidosmedia/react-marvin-components"`.
 * The result is cached with a long max-age.
 */

import { handleServicesError } from '@/services/utils';

async function collectTexts(): Promise<string[]> {
  const visited = new Set<string>();
  const texts: string[] = [];
  const baseUrl = 'https://uicomponents.invalid/';

  async function visit(path: string) {
    if (visited.has(path)) return;
    visited.add(path);
    const res = await connection.fetchUiComponent(path);
    if (!res.ok) throw new Error(`Failed to fetch UI component bundle: ${res.status}`);
    const text = await res.text();
    texts.push(text);
    for (const m of text.matchAll(/(?:from|import)\s*["'](\.\/[^"']+)["']/g)) {
      const url = new URL(m[1], new URL(path, baseUrl));
      await visit(url.pathname.slice(1));
    }
  }

  await visit('editor.js');
  return texts;
}

let _cached: Response | null = null;

export async function GET() {
  if (_cached) return _cached.clone();

  let texts: string[];
  try {
    texts = await collectTexts();
  } catch (error) {
    console.error('[uicomponents] Marvin shim bundle fetch failed:', error);
    return handleServicesError(error);
  }
  const names = new Set<string>();

  for (const text of texts) {
    for (const m of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']@eidosmedia\/react-marvin-components["']/g)) {
      for (const part of m[1].split(',')) {
        const name = part
          .trim()
          .split(/\s+as\s+/)[0]
          .trim();
        if (name) names.add(name);
      }
    }
  }

  const lines = ['const _noop = () => null;'];
  for (const name of names) lines.push(`export { _noop as ${name} };`);
  lines.push('export default _noop;');

  const body = lines.join('\n');
  _cached = new Response(body, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  });
  return _cached.clone();
}
