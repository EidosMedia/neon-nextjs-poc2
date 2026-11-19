'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ArticleOverlay from '../../components/base/ArticleOverlay';
import ErrorBoundaryContainer from '../../components/base/ErrorBoundaryContainer/ErrorBoundaryContainer';
import { formatResultDate, htmlToParts, resultHref } from './searchLogic';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  result: any;
  /** The site (its `root` and `viewStatus` feed the editor overlay). */
  data: any;
};

const FALLBACK_IMAGE = '/static/img/nothumb.jpeg';

/** Backend titles and highlight snippets are HTML; they render as text with the highlight tags emphasised. */
function Highlighted({ html }: { html: string }) {
  return (
    <>
      {htmlToParts(html).map((part, i) =>
        part.emphasis ? <mark key={i} className="v2-result__mark">{part.text}</mark> : part.text,
      )}
    </>
  );
}

/** v2 search hit: date, title, highlights and picture, inside the editor article overlay. */
export default function SearchResultItem({ result, data }: Props) {
  const node = result.nodeData;
  const title: string = node.attributes?.teaser?.title || node.title || '';
  const picture = node.links?.system?.mainPicture?.[0]?.dynamicCropsResourceUrls?.Wide_small;
  const highlights: string[] | undefined = result.highlights?.['_full_text.content.all'];

  const textRef = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // The clamped text offers "Show more" only when it actually overflows.
  useEffect(() => {
    const el = textRef.current;
    if (el && !expanded) setOverflows(el.scrollHeight > el.clientHeight);
  }, [expanded, highlights]);

  return (
    <article className="v2-result">
      <ArticleOverlay data={data.root} viewStatus={data.viewStatus}>
        <ErrorBoundaryContainer>
          <div className="v2-result__row">
            <div className="v2-result__text">
              <div ref={textRef} className={`v2-result__clamp${expanded ? ' v2-result__clamp--open' : ''}`}>
                <p className="v2-result__date">
                  {formatResultDate(node.pubInfo?.publicationTime || node.sys?.creationTime)}
                </p>
                <h3 className="v2-result__title">
                  <Link href={resultHref(result)}><Highlighted html={title} /></Link>
                </h3>
                {highlights?.map((snippet, i) => (
                  <p key={i} className="v2-result__snippet">
                    ...<Highlighted html={snippet.replaceAll('\n', ' ')} />...
                  </p>
                ))}
              </div>
              {overflows && !expanded && (
                <button type="button" className="v2-btn v2-btn--link" onClick={() => setExpanded(true)}>
                  Show more
                </button>
              )}
            </div>
            <Link href={resultHref(result)} className="v2-result__media" tabIndex={-1} aria-hidden="true">
              <img alt="" decoding="async" src={picture || node.sys?.previewImageUrl || FALLBACK_IMAGE} />
            </Link>
          </div>
        </ErrorBoundaryContainer>
      </ArticleOverlay>
    </article>
  );
}
