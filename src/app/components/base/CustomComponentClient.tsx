'use client';

import React, { useEffect, useState } from 'react';
import type { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { UiComponentCategory } from '@/services/uiComponents';
import { loadComponentChunk } from '@/hooks/useUiComponents';

/** Coerce CMS string attributes to their natural types for uicomponent renderers. */
function coerceAttributes(raw: Record<string, string>): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (v === 'true') out[k] = true;
    else if (v === 'false') out[k] = false;
    else if (v !== '' && !Number.isNaN(Number(v))) out[k] = Number(v);
    else out[k] = v;
  }
  return out;
}

/**
 * Extracts component attributes from the CMS content structure.
 *
 * Top-level attributes are merged with params extracted from the nested
 * `*-params` > `entry` children (each entry has `key` and `value` attributes).
 *
 * Example input:
 *   attributes: { href: '...', componentname: 'PexelsVideoRenderer' }
 *   elements[0]: { nodeType: 'video-component-params', elements: [
 *     { nodeType: 'entry', attributes: { key: 'url', value: '...' } }
 *   ]}
 * Example output: { href: '...', componentname: '...', url: '...' }
 */
function extractAttributes(content: ContentElement): Record<string, string | number | boolean> {
  const raw: Record<string, string> = { ...content.attributes };

  for (const child of content.elements ?? []) {
    if (child.nodeType.endsWith('-params')) {
      for (const entry of child.elements ?? []) {
        if (entry.nodeType === 'entry' && entry.attributes?.key) {
          raw[entry.attributes.key] = entry.attributes.value ?? '';
        }
      }
    }
  }

  return coerceAttributes(raw);
}

function categoryFromNodeType(nodeType: string): UiComponentCategory {
  if (nodeType.startsWith('card-')) return 'cards';
  if (nodeType.startsWith('widget-')) return 'widgets';
  if (nodeType.endsWith('-component')) return 'editor';
  return 'editor';
}

type LoadState =
  | { status: 'step'; label: string }
  | { status: 'loaded'; Component: React.ComponentType<Record<string, unknown>> }
  | { status: 'not-found'; reason: string }
  | { status: 'error'; error: string };

type Props = {
  nodeType: string;
  componentname: string;
  content: ContentElement;
};

export default function CustomComponent({ nodeType, componentname, content }: Props) {
  const [state, setState] = useState<LoadState>({ status: 'step', label: 'mounting…' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!componentname) {
        setState({ status: 'not-found', reason: 'componentname attribute is empty' });
        return;
      }

      const category = categoryFromNodeType(nodeType);

      // Step 1 — fetch manifest to validate the component name exists.
      setState({ status: 'step', label: 'fetching manifest…' });
      let manifest: Record<string, string[]>;
      try {
        const r = await fetch('/shared/uicomponents/manifest.json');
        const json = (await r.json()) as { categories: Record<string, string[]> };
        manifest = json.categories;
      } catch (err) {
        if (cancelled) return;
        setState({ status: 'error', error: `manifest fetch failed: ${err}` });
        return;
      }
      if (cancelled) return;

      const list: string[] = manifest[category] ?? [];
      if (!list.includes(componentname)) {
        setState({
          status: 'not-found',
          reason: `"${componentname}" not in ${category} manifest. Available: [${list.join(', ')}]`,
        });
        return;
      }

      // Step 2 — load the component's specific chunk (not the full bundle).
      setState({ status: 'step', label: 'fetching bundle…' });
      let mod: Record<string, unknown>;
      try {
        mod = await loadComponentChunk(category, componentname);
      } catch (err) {
        if (cancelled) return;
        setState({ status: 'error', error: `bundle load failed: ${err}` });
        return;
      }
      if (cancelled) return;

      const comp = mod[componentname];
      if (typeof comp === 'function') {
        setState({ status: 'loaded', Component: comp as React.ComponentType<Record<string, unknown>> });
      } else {
        setState({ status: 'not-found', reason: `"${componentname}" is not a function in the bundle exports` });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [nodeType, componentname]);

  if (state.status === 'step') {
    return (
      <div
        data-component={componentname}
        data-node-type={nodeType}
        style={{ border: '1px dashed #ccc', padding: '8px', fontSize: '12px', fontFamily: 'monospace', color: '#999' }}
      >
        {`⏳ ${componentname}: ${state.label}`}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div
        data-component={componentname}
        data-node-type={nodeType}
        style={{ border: '2px solid red', padding: '8px', fontSize: '12px', fontFamily: 'monospace', color: 'red' }}
      >
        <strong>[CustomComponent error]</strong> {state.error}
      </div>
    );
  }

  if (state.status === 'not-found') {
    return (
      <div
        data-component={componentname}
        data-node-type={nodeType}
        style={{
          border: '2px dashed orange',
          padding: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          color: 'orange',
        }}
      >
        <strong>[CustomComponent not found]</strong> {state.reason}
      </div>
    );
  }

  console.log('coerceAttributes', content, '->', coerceAttributes(content.attributes ?? {}));

  const { Component } = state;
  return <Component attributes={extractAttributes(content)} content={content} nodeType={nodeType} />;
}
