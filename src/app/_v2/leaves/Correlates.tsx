import type { PageData, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { normalizeViewStatus } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import ArticleItem from '../items/ArticleItem';
import { resolveArticleItemView, resolveTeaserFields } from '../lib/itemView';
import { relatedTargetIds } from '../lib/leafView';
import { V2_DEFAULTS } from '../lib/settings';

type Props = { data: PageData<ArticleModel>; count: 0 | 1 | 2 | 3 };

/** Related stories row: first `count` related links, as `standard` article items. */
export default function Correlates({ data, count }: Props) {
  if (count === 0) return null;
  const nodes = (data.model.nodes ?? {}) as Record<string, WebpageNodeModel & { links?: { system?: { mainPicture?: { targetId: string }[] } } }>;
  const related = relatedTargetIds(data.model.data.links)
    .map(id => nodes[id])
    .filter(n => n?.url && n?.title)
    .slice(0, count)
    .map(n => ({ ...n, mainPicture: nodes[n.links?.system?.mainPicture?.[0]?.targetId ?? '']?.resourceUrl }) as WebpageNodeModel);
  if (related.length === 0) return null;

  const viewStatus = normalizeViewStatus(data.siteData?.viewStatus);
  return (
    <section className="v2-correlates" aria-labelledby="v2-correlates-title">
      <h2 id="v2-correlates-title" className="v2-correlates__title">Related stories</h2>
      <div className="v2-correlates__row">
        {related.map(node => {
          const f = resolveTeaserFields(node);
          const view = resolveArticleItemView(V2_DEFAULTS.articleItem, 'standard', Boolean(f.imageUrl), Boolean(f.summary));
          return <ArticleItem key={node.id} node={node} view={view} viewStatus={viewStatus} headingLevel={3} />;
        })}
      </div>
    </section>
  );
}
