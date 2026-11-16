import type { CSSProperties, ReactNode } from 'react';
import type { Brand } from '../brands/registry';
import { planRail } from '../lib/leafView';

type Props = {
  brand: Brand;
  /** Number of rail ad slots planned for this leaf. */
  railAds: number;
  /** Sidebar blocks (Task 15 supplies these). */
  sidebarBlocks?: number;
  header?: ReactNode;
  rail?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Owns the leaf grid instead of PageShell's `rail` prop: leaf columns are pixel widths from
 * `brand.leafWidths` (header spans main; body column is `body`; rail is `rail`), while PageShell's
 * grid is a fixed 2fr/1fr container split for web pages.
 */
export default function LeafLayout({ brand, railAds, sidebarBlocks = 0, header, rail, children, className }: Props) {
  const showRail = planRail(brand.leafRail, sidebarBlocks, railAds) === 'show';
  const { main, body, rail: railWidth } = brand.leafWidths;
  const style = {
    '--v2-leaf-main': `${main}px`,
    '--v2-leaf-body': `${body}px`,
    '--v2-leaf-rail': `${railWidth}px`,
  } as CSSProperties;
  return (
    <div className={`v2-leaf v2-container${className ? ` ${className}` : ''}`} style={style}>
      {header}
      <div className={`v2-leaf__grid${showRail ? ' v2-leaf__grid--rail' : ''}`}>
        <div className="v2-leaf__main">{children}</div>
        {showRail && <aside className="v2-leaf__rail">{rail}</aside>}
      </div>
    </div>
  );
}
