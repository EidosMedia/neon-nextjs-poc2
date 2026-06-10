/**
 * Server-side service for the uicomponents manifest.
 *
 * The `/shared/uicomponents/` path is proxied to the upstream Neon
 * uicomponents service by the catch-all route at
 * `src/app/shared/uicomponents/[[...slug]]/route.ts`.
 *
 * This module is safe to import from Server Components and API routes only.
 * Client-side bundle loading is handled by `useUiComponents` and
 * `CustomComponentRenderer`.
 */

export type UiComponentsManifest = {
  categories: {
    cards: string[];
    editor: string[];
    widgets: string[];
  };
};

export type ComponentMeta = {
  /** Exact typeName match — most specific. */
  type?: string;
  /** Base-type family match — mid-level. */
  baseType?: string;
  /** Broad content-category match — least specific. Required. */
  contentType: string;
};

export type NodeDescriptor = {
  type?: string;
  baseType?: string;
  contentType?: string;
};

export type UiComponentCategory = 'cards' | 'widgets' | 'editor';

const NULL_MANIFEST: UiComponentsManifest = {
  categories: { cards: [], editor: [], widgets: [] },
};

// ── simple in-process cache (ETag / Last-Modified) ───────────────────────────

let _cachedManifest: UiComponentsManifest | null = null;
let _manifestEtag: string | null = null;
let _manifestLastModified: string | null = null;

/**
 * Fetches the uicomponents manifest from the upstream service.
 * Uses conditional requests (ETag / Last-Modified) to avoid redundant fetches.
 * Returns a null manifest on error so callers can treat it as "no custom components".
 *
 * Must be called from a Server Component or API route.
 */
export async function fetchUiComponentsManifest(): Promise<UiComponentsManifest> {
  try {
    const headers: HeadersInit = {};
    if (_manifestEtag) headers['If-None-Match'] = _manifestEtag;
    else if (_manifestLastModified) headers['If-Modified-Since'] = _manifestLastModified;

    const r = await connection.makeApiRequest('/shared/uicomponents/manifest.json', undefined, {
      headers,
      cache: 'no-store',
    });

    if (r.status === 304) {
      return _cachedManifest ?? NULL_MANIFEST;
    }

    if (!r.ok) {
      console.warn(`[uicomponents] manifest fetch failed: ${r.status} ${r.statusText}`);
      return _cachedManifest ?? NULL_MANIFEST;
    }

    const etag = r.headers.get('ETag');
    const lastModified = r.headers.get('Last-Modified');
    if (etag) _manifestEtag = etag;
    else if (lastModified) _manifestLastModified = lastModified;

    _cachedManifest = (await r.json()) ?? NULL_MANIFEST;
    return _cachedManifest ?? NULL_MANIFEST;
  } catch (err) {
    console.warn('[uicomponents] manifest fetch error:', err);
    return _cachedManifest ?? NULL_MANIFEST;
  }
}

/**
 * Returns true when the manifest declares at least one component in the
 * given category — useful for conditionally rendering the client-side loader.
 */
export function hasUiComponents(manifest: UiComponentsManifest, category: UiComponentCategory): boolean {
  return manifest.categories[category].length > 0;
}

/**
 * Resolves the best-matching component name for a node descriptor against the
 * manifest's card list, using the same type-hierarchy logic as the original
 * UiComponents.ts (type > baseType > contentType).
 *
 * Returns null when no match is found. Actual component loading happens
 * client-side via `useUiComponents`.
 */
export function resolveComponentName(
  manifest: UiComponentsManifest,
  category: UiComponentCategory,
  node: NodeDescriptor,
): string | null {
  const list = manifest.categories[category];
  if (list.length === 0) return null;

  // Without loading the actual bundle server-side we can only match by name.
  // Check type → baseType → contentType against the manifest list.
  if (node.type && list.includes(node.type)) return node.type;
  if (node.baseType && list.includes(node.baseType)) return node.baseType;
  if (node.contentType && list.includes(node.contentType)) return node.contentType;

  return null;
}
