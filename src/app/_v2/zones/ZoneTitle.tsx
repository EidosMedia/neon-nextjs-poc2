import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from 'next/link';
import type { SummaryInline, ZoneHeadContent } from '@/lib/accessories/zoneHeadTypes';

function renderInline(nodes: SummaryInline[]): ReactNode {
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

type Props = {
  head?: ZoneHeadContent;
  style: 'bar' | 'column';
  moreLink?: string;
};

/** Zone title + summary. The summary tree is already sanitized; it is mapped to React elements, never raw HTML. */
export default function ZoneTitle({ head, style, moreLink }: Props) {
  const title = head?.title;
  const summary = head?.summary;
  if (!title && !summary) return null;
  return (
    <div className={clsx('v2-zone-title', `v2-zone-title--${style}`)}>
      <div className="v2-zone-title__row">
        {title && <h2 className="v2-zone-title__text">{title}</h2>}
        {moreLink && (
          <Link className="v2-zone-title__more" href={moreLink}>
            View all
          </Link>
        )}
      </div>
      {summary && (
        <div className="v2-zone-title__summary">
          {summary.map((paragraph, index) => (
            <p key={index} style={paragraph.align ? { textAlign: paragraph.align } : undefined}>
              {renderInline(paragraph.children)}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
