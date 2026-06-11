/**
 * Server-side loader for uicomponents ESM bundles.
 *
 * Fetches the bundle (and all relative chunk imports) from the upstream service,
 * writes them to a per-request temp directory, then imports the entry file via a
 * `file://` URL. Node.js resolves bare specifiers (react, react/jsx-runtime, …)
 * from the project's own node_modules, so the same React instance is used as
 * Next.js SSR.
 *
 * Source-map comments are stripped before writing to avoid Node.js trying to
 * resolve them as relative URLs.
 *
 * Must only be imported from Server Components or API routes (Node.js runtime).
 */

import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import type React from 'react';
import type { UiComponentCategory } from './uiComponents';

type Module = Record<string, unknown>;

// ── text pre-processing ───────────────────────────────────────────────────────

const SOURCE_MAP_RE = /\/\/[#@]\s*sourceMappingURL=\S+/g;
const RELATIVE_IMPORT_RE = /(?:from|import)\s+["'](\.\/[^"']+)["']/g;

function stripSourceMaps(text: string): string {
  return text.replace(SOURCE_MAP_RE, '');
}

// ── chunk collector ───────────────────────────────────────────────────────────

/**
 * Recursively fetches all relative chunks referenced by `bundleText` and
 * returns a flat map of { relativeSpecifier → processed text }.
 */
async function collectChunks(
  baseUrl: string,
  bundleText: string,
  collected: Map<string, string> = new Map(),
): Promise<Map<string, string>> {
  const matches = [...bundleText.matchAll(RELATIVE_IMPORT_RE)];
  for (const match of matches) {
    const specifier = match[1]; // e.g. "./PexelsVideoRenderer-BhiawHts.js"
    if (collected.has(specifier)) continue;

    const chunkUrl = new URL(specifier, baseUrl).toString();
    try {
      const chunkPath = specifier.replace(/^\.?\//, '');
      const res = await connection.fetchUiComponent(chunkPath);
      if (!res.ok) {
        console.warn(`[uiComponentsServerLoader] chunk fetch failed ${chunkUrl}: ${res.status}`);
        continue;
      }
      const text = stripSourceMaps(await res.text());
      collected.set(specifier, text);
      await collectChunks(chunkUrl, text, collected);
    } catch (err) {
      console.warn(`[uiComponentsServerLoader] failed to fetch chunk ${chunkUrl}:`, err);
    }
  }
  return collected;
}

// ── temp-file importer ────────────────────────────────────────────────────────

/**
 * Writes the entry bundle and all chunks to a temp directory, imports the
 * entry as a file:// URL (so Node.js resolves bare specifiers from node_modules),
 * then cleans up the temp directory.
 */
async function importFromTempDir(
  category: UiComponentCategory,
  entryText: string,
  chunks: Map<string, string>,
): Promise<Module> {
  // Write inside the project root so Node.js can walk up to find node_modules.
  // /tmp is isolated from node_modules, causing ERR_MODULE_NOT_FOUND for react etc.
  const tmpDir = join(process.cwd(), '.next', 'cache', 'uicomponents', `${category}-${randomBytes(6).toString('hex')}`);
  mkdirSync(tmpDir, { recursive: true });

  try {
    // Mark the temp dir as an ES module package so Node.js treats all .js
    // files as ESM. Without this, chunks written as .js are treated as CJS
    // and named imports (e.g. `import { n } from './Chunk.js'`) break.
    writeFileSync(join(tmpDir, 'package.json'), JSON.stringify({ type: 'module' }), 'utf8');

    // In development, Next.js uses react/jsx-dev-runtime (jsxDEV) while the
    // upstream bundle is built against the production jsx-runtime. The two
    // runtimes produce incompatible element objects in dev mode, causing React
    // to throw "Attempted to render element without development properties".
    //
    // Always write a react/jsx-runtime shim so the dynamically-imported ESM
    // bundle never tries to consume the bare 'react/jsx-runtime' specifier
    // directly. In production Next.js bundles react/jsx-runtime as a CJS
    // module; named imports from CJS via ESM static analysis fail with
    // "Named export 'jsx' not found". The shim does a default import (which
    // always works for CJS) and re-exports the named symbols.
    //
    // In development the shim additionally patches Object.freeze to inject
    // React 19 RSC debug properties (_debugStack, _debugTask) that the RSC
    // renderer requires on every element.
    const shimFilename = '_shim_react_jsx_runtime.mjs';
    let shimBody: string;
    if (process.env.NODE_ENV !== 'production') {
      // Dev: delegate to the standard jsx-runtime via named imports (works in
      // dev where react/jsx-runtime is proper ESM), and patch freeze.
      shimBody = [
        "import { jsx as _j, jsxs as _js, Fragment } from 'react/jsx-runtime';",
        'function _patch(fn, type, props, key) {',
        '  const orig = Object.freeze;',
        '  Object.freeze = function(o) {',
        '    if (o !== null && typeof o === "object" && typeof o.$$typeof === "symbol") {',
        '      if (o._debugStack === undefined)',
        '        try { Object.defineProperty(o, "_debugStack", { configurable: false, enumerable: false, writable: true, value: new Error("react-stack-top-frame") }); } catch {}',
        '      if (o._debugTask === undefined)',
        '        try { Object.defineProperty(o, "_debugTask", { configurable: false, enumerable: false, writable: true, value: null }); } catch {}',
        '    }',
        '    return orig.call(Object, o);',
        '  };',
        '  try { return fn(type, props, key); } finally { Object.freeze = orig; }',
        '}',
        'export function jsx(type, props, key) { return _patch(_j, type, props, key); }',
        'export function jsxs(type, props, key) { return _patch(_js, type, props, key); }',
        'export { Fragment };',
      ].join('\n');
    } else {
      // Production: react/jsx-runtime may be a CJS module. A default import
      // always succeeds for CJS; then we re-export the named symbols.
      shimBody = [
        "import pkg from 'react/jsx-runtime';",
        'export const jsx = pkg.jsx;',
        'export const jsxs = pkg.jsxs;',
        'export const Fragment = pkg.Fragment;',
      ].join('\n');
    }
    writeFileSync(join(tmpDir, shimFilename), shimBody, 'utf8');
    // Replace bare 'react/jsx-runtime' imports with the local shim path in
    // both the entry bundle and all chunks.
    const patchText = (t: string) => t.replace(/(['"])react\/jsx-runtime\1/g, `'./${shimFilename}'`);

    const STUB_PACKAGES = ['@eidosmedia/react-marvin-components'];
    const stubExports = new Map<string, Set<string>>();
    for (const pkg of STUB_PACKAGES) stubExports.set(pkg, new Set());

    const allChunkTexts = [entryText, ...chunks.values()];
    for (const text of allChunkTexts) {
      for (const m of text.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']([^"']+)["']/g)) {
        const pkgName = m[2];
        if (!stubExports.has(pkgName)) continue;
        const names = m[1]
          .split(',')
          .map(s =>
            s
              .trim()
              .split(/\s+as\s+/)[0]
              .trim(),
          )
          .filter(Boolean);
        for (const name of names) stubExports.get(pkgName)!.add(name);
      }
    }

    for (const pkg of STUB_PACKAGES) {
      const names = [...(stubExports.get(pkg) ?? [])];
      const lines = ['const _noop = () => null;'];
      for (const name of names) lines.push(`export { _noop as ${name} };`);
      lines.push('export default _noop;');

      const pkgDir = join(tmpDir, 'node_modules', pkg);
      mkdirSync(pkgDir, { recursive: true });
      writeFileSync(
        join(pkgDir, 'package.json'),
        JSON.stringify({ type: 'module', exports: { '.': './index.js' } }),
        'utf8',
      );
      writeFileSync(join(pkgDir, 'index.js'), lines.join('\n'), 'utf8');
    }

    // Write chunks first (they must exist when the entry is imported).
    for (const [specifier, text] of chunks) {
      const filename = specifier.replace(/^\.\//, '');
      writeFileSync(join(tmpDir, filename), patchText(text), 'utf8');
    }

    // Write the entry bundle.
    const entryFilename = `${category}.mjs`;
    const entryPath = join(tmpDir, entryFilename);
    writeFileSync(entryPath, patchText(entryText), 'utf8');

    // Use new Function to prevent webpack/Turbopack from statically analysing
    // the import() specifier at build time.
    const dynamicImport = new Function('url', 'return import(url)') as (url: string) => Promise<Module>;

    const fileUrl = `file://${entryPath}`;
    return await dynamicImport(fileUrl);
  } finally {
    // Module is fully evaluated by the time import() resolves; temp files
    // are no longer needed.
    try {
      rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

// ── in-process bundle cache ───────────────────────────────────────────────────

const _cache = new Map<UiComponentCategory, Module>();
const _inFlight = new Map<UiComponentCategory, Promise<Module>>();

async function _fetchAndEvaluate(category: UiComponentCategory): Promise<Module> {
  const baseUrl = process.env.BASE_NEON_FO_URL;
  if (!baseUrl) throw new Error('[uiComponentsServerLoader] BASE_NEON_FO_URL is not set');

  const bundleUrl = `${baseUrl}/shared/uicomponents/${category}.js`;
  const res = await connection.fetchUiComponent(`${category}.js`);
  if (!res.ok) {
    throw new Error(
      `[uiComponentsServerLoader] bundle fetch failed for "${category}": ${res.status} ${res.statusText}`,
    );
  }

  const entryText = stripSourceMaps(await res.text());
  const chunks = await collectChunks(bundleUrl, entryText);

  return importFromTempDir(category, entryText, chunks);
}

/**
 * Loads a uicomponents bundle server-side with in-process caching.
 * Concurrent callers for the same category share the same in-flight promise.
 */
export async function loadServerBundle(category: UiComponentCategory): Promise<Module> {
  if (_cache.has(category)) return _cache.get(category)!;

  let promise = _inFlight.get(category);
  if (!promise) {
    promise = _fetchAndEvaluate(category).then(
      mod => {
        _cache.set(category, mod);
        _inFlight.delete(category);
        return mod;
      },
      err => {
        _inFlight.delete(category);
        throw err;
      },
    );
    _inFlight.set(category, promise);
  }
  return promise;
}

/**
 * Resolves a named React component from the specified bundle category.
 * Returns `null` when the bundle cannot be loaded or the name is not exported.
 */
export async function resolveServerComponent(
  category: UiComponentCategory,
  componentname: string,
): Promise<React.ComponentType<Record<string, unknown>> | null> {
  try {
    const mod = await loadServerBundle(category);
    const comp = mod[componentname];
    return typeof comp === 'function' ? (comp as React.ComponentType<Record<string, unknown>>) : null;
  } catch (err) {
    console.error(`[uiComponentsServerLoader] failed to resolve "${componentname}" from "${category}":`, err);
    return null;
  }
}
