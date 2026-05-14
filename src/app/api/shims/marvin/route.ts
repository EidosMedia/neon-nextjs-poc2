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

const BASE_URL = process.env.BASE_NEON_FO_URL!;
const BUNDLE_URL = `${BASE_URL}/shared/uicomponents/editor.js`;
const RELATIVE_RE = /(?:from|import)\s*["'](\.\/[^"']+)["']/g;
const NAMED_RE = /import\s*\{([^}]*)\}\s*from\s*["']@eidosmedia\/react-marvin-components["']/g;

async function collectTexts(): Promise<string[]> {
  const visited = new Set<string>();
  const texts: string[] = [];

  async function visit(url: string) {
    if (visited.has(url)) return;
    visited.add(url);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return;
    const text = await res.text();
    texts.push(text);
    for (const m of text.matchAll(/(?:from|import)\s*["'](\.\/[^"']+)["']/g)) {
      await visit(new URL(m[1], url).toString());
    }
  }

  await visit(BUNDLE_URL);
  return texts;
}

let _cached: Response | null = null;

export async function GET() {
  if (_cached) return _cached.clone();

  const texts = await collectTexts();
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
