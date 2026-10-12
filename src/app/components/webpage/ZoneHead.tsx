import React from 'react';
import clsx from 'clsx';
import { titleAccessoryClass, type AccessoryShape } from '@/lib/accessories/shapeClasses';
import type { SummaryInline, ZoneHeadContent } from '@/lib/accessories/zoneHeadTypes';

/** Title element of the first card in the zone; the head sizes are derived from it. */
export type ZoneHeadCardTitle = 'h1' | 'h2' | 'hero';

function renderInline(nodes: SummaryInline[]): React.ReactNode {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case 'text':
        return node.text;
      case 'br':
        return <br key={index} />;
      case 'link':
        return (
          <a key={index} href={node.href}>
            {renderInline(node.children)}
          </a>
        );
      case 'mark': {
        const Mark = node.mark;
        return <Mark key={index}>{renderInline(node.children)}</Mark>;
      }
    }
  });
}

const ZoneHead: React.FC<{ head: ZoneHeadContent; cardTitle: ZoneHeadCardTitle; shape?: AccessoryShape }> = ({
  head,
  cardTitle,
  shape,
}) => (
  <div className="acc-zone-head" data-card-title={cardTitle}>
    {head.title && <h2 className={clsx('acc-zone-title', titleAccessoryClass(shape))}>{head.title}</h2>}
    {head.summary && (
      <div className="acc-zone-summary">
        {head.summary.map((paragraph, index) => (
          <p key={index} style={paragraph.align ? { textAlign: paragraph.align } : undefined}>
            {renderInline(paragraph.children)}
          </p>
        ))}
      </div>
    )}
  </div>
);

export default ZoneHead;
