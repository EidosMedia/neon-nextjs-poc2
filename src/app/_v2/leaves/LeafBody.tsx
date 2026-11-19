import type { ReactNode } from 'react';
import type { ContentElement } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { renderContent } from '@/utilities/content';
import { splitAfterParagraphs } from '../lib/leafView';
import { prepareBody } from './prepareBody';

type Props = {
  article: ArticleModel;
  pageNodes: Record<string, unknown> | undefined;
  text: ContentElement | undefined;
  /** Rendered after the 3rd top-level paragraph (mid-body ad or paywall card). */
  insertAfter?: ReactNode;
  /** Show `insertAfter` at the end when the body has fewer than 3 paragraphs (paywall). */
  insertWhenShort?: boolean;
  /** Drop everything after the insertion point (paywall). */
  hideTail?: boolean;
  className?: string;
};

/**
 * Body text through the legacy renderContent (which carries the ContentEditable wrappers). When an
 * insertion is requested, the content JSON is split into two `text` nodes at the 3rd top-level `p`.
 */
export default async function LeafBody({
  article, pageNodes, text, insertAfter, insertWhenShort, hideTail, className = 'v2-leaf__text',
}: Props) {
  if (!text) return null;
  const { customComponents, nodeDataMap } = await prepareBody(text, pageNodes);
  const render = (node: ContentElement) =>
    renderContent(node, article, undefined, 'flex flex-col gap-4', customComponents, nodeDataMap);

  if (!insertAfter) return <div className={className}>{render(text)}</div>;

  const { head, tail, split } = splitAfterParagraphs(text.elements ?? [], 3);
  const showInsert = split || insertWhenShort;
  return (
    <div className={className}>
      {render({ ...text, elements: head })}
      {showInsert && insertAfter}
      {!hideTail && tail.length > 0 && (
        // `id: undefined` avoids a duplicate id="text" for the second half.
        <div className="v2-leaf__text-rest">
          {render({ ...text, attributes: { ...text.attributes, id: undefined as unknown as string }, elements: tail })}
        </div>
      )}
    </div>
  );
}
