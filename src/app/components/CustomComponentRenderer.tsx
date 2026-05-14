'use client';

import React, { useEffect, useState } from 'react';
import type { UiComponentsManifest, UiComponentCategory, NodeDescriptor } from '@/services/uiComponents';
import { useUiComponents } from '@/hooks/useUiComponents';

// ── types ────────────────────────────────────────────────────────────────────

type ResolveMode =
  /** Resolve by type-hierarchy scoring (type > baseType > contentType). */
  | { mode: 'resolve'; node: NodeDescriptor }
  /** Import a specific named component from the bundle. */
  | { mode: 'named'; name: string };

export type CustomComponentRendererProps = {
  /** Manifest fetched server-side and passed down as a prop. */
  manifest: UiComponentsManifest;
  /** Which bundle to load: 'cards', 'widgets', or 'editor'. */
  category: UiComponentCategory;
  /** Resolution strategy. */
  resolution: ResolveMode;
  /** Props forwarded verbatim to the resolved component. */
  componentProps?: Record<string, unknown>;
  /** Rendered while the bundle is loading. Defaults to null. */
  fallback?: React.ReactNode;
  /** Rendered when no matching component is found. Defaults to null. */
  notFound?: React.ReactNode;
};

// ── component ─────────────────────────────────────────────────────────────────

/**
 * Loads a custom UI component from the uicomponents bundles served at
 * `/shared/uicomponents/` and renders it with the supplied props.
 *
 * The manifest must be fetched server-side (via `fetchUiComponentsManifest`)
 * and passed in; no extra network round-trip is made by this component.
 *
 * ### Usage — resolve by type hierarchy
 * ```tsx
 * <CustomComponentRenderer
 *   manifest={manifest}
 *   category="cards"
 *   resolution={{ mode: 'resolve', node: { type: 'article/card', contentType: 'article' } }}
 *   componentProps={{ data: articleData }}
 * />
 * ```
 *
 * ### Usage — import a named component
 * ```tsx
 * <CustomComponentRenderer
 *   manifest={manifest}
 *   category="widgets"
 *   resolution={{ mode: 'named', name: 'WeatherWidget' }}
 *   componentProps={{ location: 'Milan' }}
 * />
 * ```
 */
export function CustomComponentRenderer({
  manifest,
  category,
  resolution,
  componentProps = {},
  fallback = null,
  notFound = null,
}: CustomComponentRendererProps) {
  const { resolveComponent, importComponent } = useUiComponents(manifest);

  const [Component, setComponent] = useState<React.ComponentType<any> | null | 'loading'>('loading');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      let resolved: React.ComponentType<any> | null = null;

      if (resolution.mode === 'resolve') {
        resolved = await resolveComponent(category, resolution.node);
      } else {
        resolved = await importComponent(category, resolution.name);
      }

      if (!cancelled) setComponent(resolved);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [category, resolution, resolveComponent, importComponent]);

  if (Component === 'loading') return <>{fallback}</>;
  if (Component === null) return <>{notFound}</>;

  return <Component {...componentProps} />;
}
