import type { CSSProperties, ReactNode } from 'react';
import type { Brand } from '../brands/registry';
import type { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import BlockSlot from '../blocks/BlockSlot';
import { extractBlockLinks } from '../lib/blocks';
import { planRail } from '../lib/leafView';

type Props = {
  brand: Brand;
  /** Number of rail ad slots planned for this leaf. */
  railAds: number;
  /** Page data: its sidebar content blocks are rendered in the rail and counted for rail planning. */
  data?: PageData<BaseModel>;
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
export default function LeafLayout({ brand, railAds, data, header, rail, children, className }: Props) {
  const sidebarBlocks = data ? extractBlockLinks(data.model, 'sidebars').length : 0;
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
        {showRail && <aside className="v2-leaf__rail">
            {rail}
            {data && <BlockSlot data={data} area="sidebars" />}
          </aside>}
      </div>
    </div>
  );
}
