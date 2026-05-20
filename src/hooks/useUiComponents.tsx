'use client';

import { useCallback, useRef } from 'react';
import type { UiComponentsManifest, UiComponentCategory, ComponentMeta, NodeDescriptor } from '@/services/uiComponents';

// ── module-script dynamic import (mirrors UiComponents.ts) ───────────────────

/**
 * Imports an ES-module bundle that uses bare specifiers resolved via the
 * page's import map. Injects a `<script type="module">` so the dynamic
 * import() runs in module context and honours the import map.
 */
function importViaModuleScript(url: string): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const key = `__uicomp_${url.replace(/[^a-z0-9]/gi, '_')}` as keyof Window;
    const w = window as any;

    if (w[key]) {
      (w[key] as Promise<Record<string, unknown>>).then(resolve, reject);
      return;
    }

    let settled = false;
    let res!: (v: Record<string, unknown>) => void;
    let rej!: (e: unknown) => void;

    w[key] = new Promise<Record<string, unknown>>((r, j) => {
      res = r;
      rej = j;
    });

    const resolveOnce = (m: Record<string, unknown>) => {
      if (!settled) {
        settled = true;
        res(m);
      }
    };
    const rejectOnce = (e: unknown) => {
      if (!settled) {
        settled = true;
        rej(e);
      }
    };

    w[key].__resolve = resolveOnce;
    w[key].__reject = rejectOnce;

    const cleanup = () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };

    const onError = (ev: ErrorEvent) => {
      const msg = ev.message || ev.error?.message || '';
      if (!msg.includes(url) && !msg.includes('/shared/uicomponents/')) return;
      cleanup();
      rejectOnce(new Error(`importViaModuleScript failed for ${url}: ${msg}`));
    };

    const onRejection = (ev: PromiseRejectionEvent) => {
      const msg = ev.reason instanceof Error ? ev.reason.message : String(ev.reason ?? '');
      if (!msg.includes(url) && !msg.includes('/shared/uicomponents/')) return;
      cleanup();
      rejectOnce(new Error(`importViaModuleScript failed for ${url}: ${msg}`));
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import(${JSON.stringify(url)})
        .then(m => window[${JSON.stringify(key)}].__resolve(m))
        .catch(e => window[${JSON.stringify(key)}].__reject(e));
    `;
    script.onerror = e => {
      cleanup();
      rejectOnce(new Error(`script injection failed for ${url}`));
    };
    document.head.appendChild(script);
    script.addEventListener('load', () => script.remove(), { once: true });

    const timeoutId = setTimeout(() => {
      cleanup();
      rejectOnce(new Error(`importViaModuleScript timeout: ${url}`));
    }, 10000);

    w[key].then(
      () => {
        cleanup();
        clearTimeout(timeoutId);
      },
      () => {
        cleanup();
        clearTimeout(timeoutId);
      },
    );
    w[key].then(resolve, reject);
  });
}

// ── per-category bundle loaders (module-level singletons) ────────────────────

const UICOMPONENTS_BASE = '/shared/uicomponents';

const _bundles: Partial<Record<UiComponentCategory, Promise<Record<string, unknown>>>> = {};

export function loadBundle(category: UiComponentCategory): Promise<Record<string, unknown>> {
  _bundles[category] ??= importViaModuleScript(`${UICOMPONENTS_BASE}/${category}.js`);
  return _bundles[category]!;
}

// Cache of component-name → its specific chunk URL (avoids loading the full bundle)
const _chunkUrls: Partial<Record<string, Promise<string | null>>> = {};

/**
 * Parses the category entry bundle to find which chunk file exports the given
 * component name, then loads just that chunk via the import map.
 * Falls back to the full bundle if the chunk cannot be identified.
 */
export function loadComponentChunk(
  category: UiComponentCategory,
  componentName: string,
): Promise<Record<string, unknown>> {
  const key = `${category}:${componentName}`;
  _chunkUrls[key] ??= fetch(`${UICOMPONENTS_BASE}/${category}.js`)
    .then(r => r.text())
    .then(text => {
      // Chunk files are named {ComponentName}-{hash}.js by the bundler.
      // Find any relative import in the entry bundle matching that pattern.
      const re = new RegExp(`["'](\\.\\/  ${componentName}-[^"']+\\.js)["']`);
      const m = text.match(re);
      return m ? `${UICOMPONENTS_BASE}/${m[1].replace('./', '')}` : null;
    })
    .catch(() => {
      delete _chunkUrls[key];
      return null;
    });

  return _chunkUrls[key]!.then(chunkUrl => {
    if (!chunkUrl) return loadBundle(category);
    // Load the specific chunk directly — it only imports react/jsx-runtime,
    // not the heavy editor-only dependencies like @eidosmedia/react-marvin-components.
    _bundles[key as UiComponentCategory] ??= importViaModuleScript(chunkUrl);
    return _bundles[key as UiComponentCategory]!;
  });
}

// ── public hook ───────────────────────────────────────────────────────────────

export type ResolvedComponent = React.ComponentType<any>;

export type UseUiComponentsReturn = {
  /**
   * Resolves the best-matching component from the given bundle category
   * using the same type-hierarchy scoring as the original UiComponents.ts
   * (type score 3, baseType score 2, contentType score 1).
   *
   * Returns `null` when no match is found or the bundle is unavailable.
   */
  resolveComponent: (category: UiComponentCategory, node: NodeDescriptor) => Promise<ResolvedComponent | null>;

  /**
   * Imports a named component directly from a bundle.
   * Returns `null` when the name is not present in the bundle.
   */
  importComponent: (category: UiComponentCategory, name: string) => Promise<ResolvedComponent | null>;
};

/**
 * Client-side hook for loading and resolving custom UI components from the
 * uicomponents bundles served at `/shared/uicomponents/`.
 *
 * Pass the `manifest` fetched server-side so no extra round-trip is needed.
 *
 * ```tsx
 * // Server Component
 * const manifest = await fetchUiComponentsManifest();
 *
 * // Client Component
 * const { resolveComponent } = useUiComponents(manifest);
 * const Card = await resolveComponent('cards', { type: 'article/card', contentType: 'article' });
 * ```
 */
export function useUiComponents(manifest: UiComponentsManifest): UseUiComponentsReturn {
  // Keep manifest in a ref so callbacks don't close over a stale value.
  const manifestRef = useRef(manifest);
  manifestRef.current = manifest;

  const resolveComponent = useCallback(
    async (category: UiComponentCategory, node: NodeDescriptor): Promise<ResolvedComponent | null> => {
      const list = manifestRef.current.categories[category];
      if (list.length === 0) return null;

      let m: Record<string, unknown>;
      try {
        m = await loadBundle(category);
      } catch (err) {
        console.warn(`[uicomponents] failed to load ${category} bundle:`, err);
        return null;
      }

      let best: ResolvedComponent | null = null;
      let bestScore = 0;

      for (const key of Object.keys(m)) {
        const exported = m[key];
        if (typeof exported !== 'function') continue;
        const meta: ComponentMeta | undefined = (exported as any).meta;
        if (!meta) continue;

        let score = 0;
        if (node.type && meta.type === node.type) score = 3;
        else if (node.baseType && meta.baseType === node.baseType) score = 2;
        else if (node.contentType && meta.contentType === node.contentType) score = 1;

        if (score > bestScore) {
          bestScore = score;
          best = exported as ResolvedComponent;
        }
      }

      return bestScore > 0 ? best : null;
    },
    [],
  );

  const importComponent = useCallback(
    async (category: UiComponentCategory, name: string): Promise<ResolvedComponent | null> => {
      const list = manifestRef.current.categories[category];
      if (!list.includes(name)) {
        console.warn(`[uicomponents] "${name}" not listed in ${category} manifest`);
        return null;
      }

      let m: Record<string, unknown>;
      try {
        m = await loadBundle(category);
      } catch (err) {
        console.warn(`[uicomponents] failed to load ${category} bundle:`, err);
        return null;
      }

      const comp = m[name];
      return typeof comp === 'function' ? (comp as ResolvedComponent) : null;
    },
    [],
  );

  return { resolveComponent, importComponent };
}
