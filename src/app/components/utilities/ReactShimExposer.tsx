'use client';

/**
 * Exposes the React instances loaded by Next.js as globalThis properties so
 * that the ESM shim API routes (/api/shims/react, /api/shims/react-jsx-runtime,
 * etc.) can re-export them to uicomponents bundles that import React as a bare
 * specifier via the import map.
 *
 * Top-level module code runs synchronously when the chunk is first evaluated —
 * before any React rendering — so the globals are available by the time any
 * custom component bundle is loaded in a useEffect.
 *
 * This component renders nothing; it only exists to pull the module into the
 * client bundle.
 */

import * as _React from 'react';
import * as _ReactJsxRuntime from 'react/jsx-runtime';
import * as _ReactJsxDevRuntime from 'react/jsx-dev-runtime';
import * as _ReactDOM from 'react-dom';
import * as _ReactDOMClient from 'react-dom/client';

(globalThis as Record<string, unknown>).__shim_react = _React;
(globalThis as Record<string, unknown>).__shim_react_jsx_runtime = _ReactJsxRuntime;
(globalThis as Record<string, unknown>).__shim_react_jsx_dev_runtime = _ReactJsxDevRuntime;
(globalThis as Record<string, unknown>).__shim_react_dom = _ReactDOM;
(globalThis as Record<string, unknown>).__shim_react_dom_client = _ReactDOMClient;

export function ReactShimExposer() {
  return null;
}
