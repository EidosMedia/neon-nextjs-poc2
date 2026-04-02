'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import * as ReactJSXRuntime from 'react/jsx-runtime';

type UILib = typeof import('@myorg/ui');

const UIContext = createContext<UILib | null>(null);

// Expose Next.js's own React instances to window BEFORE micro-frontend loads
// so shims proxy the SAME instance used by Next.js/UIProvider
if (typeof window !== 'undefined') {
  (window as any).React = React;
  (window as any).ReactDOM = ReactDOM;
  (window as any).ReactJSXRuntime = ReactJSXRuntime;
}

const dynamicImport = new Function('url', 'return import(url)') as (url: string) => Promise<UILib>;

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [lib, setLib] = useState<UILib | null>(null);

  useEffect(() => {
    dynamicImport('http://localhost:3000/index.js').then(setLib);
  }, []);

  return <UIContext.Provider value={lib}>{children}</UIContext.Provider>;
}

export function useUI() {
  const lib = useContext(UIContext);
  if (!lib) throw new Error('useUI must be used inside UIProvider');
  return lib;
}
