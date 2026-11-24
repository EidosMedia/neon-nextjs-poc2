import Link from 'next/link';
import type { BaseModel, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getSectionRecommendations } from '@/utilities/sectionRecirculation';
import { resolveTeaserFields } from '../_v2/lib/itemView';
import ZoneRenderer from '../_v2/zones/ZoneRenderer';

export default async function EmptySection({ data, v2 = false, showTitle = true }: {
  data: PageData<BaseModel>; v2?: boolean; showTitle?: boolean;
}) {
  const articles = await getSectionRecommendations();
  if (v2) {
    return (
      <div className="v2-container v2-empty-section">
        {showTitle && <h1 className="v2-empty-section__section">{data.model.data.title}</h1>}
        <p className="v2-empty-section__message">First stories arriving soon.</p>
        {articles.length > 0 && (
          <ZoneRenderer data={data} items={articles} composition="fourUp" title="While you wait:" />
        )}
      </div>
    );
  }
  return (
    <section className="py-12">
      <p className="text-xl font-semibold">First stories arriving soon.</p>
      {articles.length > 0 && (
        <>
          <h2 className="mt-8 mb-4 text-lg font-semibold">While you wait:</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {articles.map(article => {
              const fields = resolveTeaserFields(article);
              return (
                <article key={article.id}>
                  <Link href={fields.href}>
                    {fields.imageUrl && <img src={fields.imageUrl} alt="" className="w-full aspect-video object-cover" loading="lazy" />}
                    <h3 className="mt-2 font-semibold">{fields.title}</h3>
                  </Link>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
