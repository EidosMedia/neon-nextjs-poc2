'use client';
import type { ReactNode } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import type { ViewStatus, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import ArticleOverlay from '@/app/components/base/ArticleOverlay';
import ContentEditable from '@/app/components/utilities/ContentEditable';
import useLoggedUserInfo from '@/hooks/useLoggedUserInfo';
import { useState } from 'react';
import { absoluteUrl } from '../lib/share';
import { resolveTeaserFields, type TeaserFields } from '../lib/itemView';

export type HeadingLevel = 2 | 3;

export type Editable = {
  /** Title text; wrapped in ContentEditable only when the teaser title content-item id exists. */
  Title: (p: { level: HeadingLevel; className?: string }) => ReactNode;
  /** Summary text; wrapped in ContentEditable only when the teaser summary content-item id exists. */
  Summary: (p: { className?: string }) => ReactNode;
};

type Props = {
  node: WebpageNodeModel;
  viewStatus: ViewStatus;
  className?: string;
  format?: string;
  showShare?: boolean;
  children: (fields: TeaserFields, editable: Editable) => ReactNode;
};

/**
 * Shared editor contract for v2 teasers: ArticleOverlay (inspect/publish/info), link that is
 * neutralised while inspect is on, and ContentEditable title/summary whose FIRST CHILD carries
 * the teaser content-item id and a <p> with the text.
 */
export default function ItemFrame({ node, viewStatus, className, format, showShare, children }: Props) {
  const [copied, setCopied] = useState(false);
  const { data: loggedUserInfo } = useLoggedUserInfo();
  const fields = resolveTeaserFields(node, format);
  const { title, summary, titleId, summaryId, href } = fields;

  const editable: Editable = {
    Title: ({ level, className: cls }) => {
      const H = `h${level}` as 'h2' | 'h3';
      const heading = (
        <H className={cls} id={titleId} data-type="title">
          <p>{title}</p>
        </H>
      );
      if (!titleId) return heading;
      return (
        <ContentEditable viewStatus={viewStatus} data={node as never} minimal>
          {heading}
        </ContentEditable>
      );
    },
    Summary: ({ className: cls }) => {
      if (!summary && !summaryId) return null;
      // Empty summary with a content-item id: editable only in inspect mode, nothing for readers.
      if (!summary && !loggedUserInfo.inspectItems) return null;
      const body = (
        <div className={cls} id={summaryId} data-type="summary">
          <p>{summary ?? ''}</p>
        </div>
      );
      if (!summaryId) return body;
      return (
        <ContentEditable viewStatus={viewStatus} data={node as never} minimal>
          {body}
        </ContentEditable>
      );
    },
  };

  const onShare = async () => {
    const url = absoluteUrl(href, window.location.origin);
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* share cancelled or clipboard unavailable */
    }
  };

  return (
    <ArticleOverlay data={node as never} viewStatus={viewStatus} width="max">
      <div className="v2-item-wrap">
        <Link
          id={node.id.replaceAll('-', '_')}
          className={clsx('v2-item__link', className)}
          href={loggedUserInfo.inspectItems ? '' : href}
        >
          {children(fields, editable)}
        </Link>
        {showShare && (
          <div className="v2-item__share">
            <button type="button" className="v2-item__share-btn" onClick={onShare}>
              Share
            </button>
            <span className="v2-item__share-note" aria-live="polite">
              {copied ? 'Link copied' : ''}
            </span>
          </div>
        )}
      </div>
    </ArticleOverlay>
  );
}
