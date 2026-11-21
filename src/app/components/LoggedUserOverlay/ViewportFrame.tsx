'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RectangleHorizontal, RectangleVertical, RotateCcw } from 'lucide-react';
import type { RootState } from '@/lib/store';
import { selectOrientation, selectViewport } from './ViewportSelector';
import { viewportDimensions } from './viewport';

export default function ViewportFrame({ children, theme, engine }: {
  children: ReactNode; theme: string; engine?: string;
}) {
  const dispatch = useDispatch();
  const viewport = useSelector((state: RootState) => state.loggedUser.editorialViewport);
  const orientation = useSelector((state: RootState) => state.loggedUser.viewportOrientation);
  const visible = useSelector((state: RootState) => state.loggedUser.editorialBarVisible);
  const panelOpen = useSelector((state: RootState) => Boolean(state.nodes.versionPanelOpen));
  const [wide, setWide] = useState(false);
  const [availableWidth, setAvailableWidth] = useState(0);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 720px)');
    const update = () => setWide(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const active = visible && wide && viewport !== 'responsive';
  useEffect(() => {
    if (!active || !stage.current) return;
    const element = stage.current;
    const update = () => setAvailableWidth(element.clientWidth);
    const observer = new ResizeObserver(update);
    observer.observe(element);
    update();
    return () => observer.disconnect();
  }, [active, panelOpen]);

  const setupFrame = useCallback((frame: HTMLIFrameElement | null) => {
    if (!frame) { setMount(null); return; }
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.documentElement.lang = document.documentElement.lang;
    doc.body.className = document.body.className;
    doc.head.replaceChildren(...Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'), node => node.cloneNode(true)));
    const base = doc.createElement('base');
    base.href = window.location.href;
    base.target = '_top';
    doc.head.prepend(base);
    const override = doc.createElement('style');
    override.textContent = ':root { --neon-bar-height: 0px !important; } body { margin: 0; }';
    doc.head.append(override);
    setMount(doc.body);
  }, []);

  useEffect(() => {
    if (!mount) return;
    const doc = mount.ownerDocument;
    const syncStyles = () => {
      const base = doc.createElement('base');
      base.href = window.location.href;
      base.target = '_top';
      const override = doc.createElement('style');
      override.textContent = ':root { --neon-bar-height: 0px !important; } body { margin: 0; }';
      doc.head.replaceChildren(base, ...Array.from(document.head.querySelectorAll('style, link[rel="stylesheet"]'),
        node => node.cloneNode(true)), override);
    };
    const observer = new MutationObserver(syncStyles);
    observer.observe(document.head, { childList: true, subtree: true, characterData: true, attributes: true });
    return () => observer.disconnect();
  }, [mount]);

  if (!active) return children;
  const { width, height } = viewportDimensions(viewport, orientation);
  const scale = availableWidth ? Math.min(1, Math.max(0, availableWidth - 32) / width) : 1;
  return (
    <div className={`neon-viewport-stage ${panelOpen ? 'has-history' : ''}`} ref={stage}>
      <div className="neon-viewport-strip">
        <strong>{viewport === 'tablet' ? 'Tablet' : 'Phone'}</strong>
        <span>{width} × {height} px{scale < 1 ? ` · ${Math.round(scale * 100)}%` : ''}</span>
        <div className="neon-viewport-orientation" role="group" aria-label="Device orientation">
          <button type="button" aria-label="Portrait" title="Portrait" aria-pressed={orientation === 'portrait'}
            onClick={() => selectOrientation('portrait', dispatch)}><RectangleVertical size={16} /></button>
          <button type="button" aria-label="Landscape" title="Landscape" aria-pressed={orientation === 'landscape'}
            onClick={() => selectOrientation('landscape', dispatch)}><RectangleHorizontal size={16} /></button>
        </div>
        <button type="button" onClick={() => selectViewport('responsive', dispatch)}><RotateCcw size={14} /> Reset to responsive</button>
      </div>
      <div className="neon-viewport-frame" style={{ width: width * scale, height: height * scale }}>
        <iframe title={`${viewport} editorial preview`} ref={setupFrame}
          style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left' }} />
      </div>
      {mount && createPortal(<div className="root" data-theme={theme} data-engine={engine}>{children}</div>, mount)}
    </div>
  );
}
