import { normalizeViewStatus, type PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { ContentEditingProvider } from '@/app/components/utilities/ContentEditingContext';
import { findElementsInContentJson, renderContent } from '@/utilities/content';
import PaywallIcon from '../items/PaywallIcon';
import LeafAccess from '../leaves/LeafAccess';
import LeafBody from '../leaves/LeafBody';
import { loadContent } from '../leaves/loadContent';
import { getNewsletterPageSettings } from '../lib/newsletter';
import { formatNewsletterDate, newsletterFooter, newsletterHeader, newsletterPalette } from '../lib/newsletterHtml';
import { hasText } from '../lib/leafView';
import { resolvePaywallLevel } from '../lib/paywall';

export default async function NewsletterStory({ data }: { data: PageData<ArticleModel> }) {
  const article = await loadContent(data.model.data);
  const content = article.files?.content?.data;
  const [headline] = content ? findElementsInContentJson('headline', content) : [];
  const [summary] = content ? findElementsInContentJson('summary', content) : [];
  const [text] = content ? findElementsInContentJson('text', content) : [];
  const settings = getNewsletterPageSettings(data);
  const palette = newsletterPalette(data);
  const date = article.pubInfo?.publicationTime ? formatNewsletterDate(article.pubInfo.publicationTime) : '';

  return (
    <ContentEditingProvider
      objectId={article.id}
      viewStatus={normalizeViewStatus(data.siteData?.viewStatus)}
      lockedBy={article.sys?.lockedBy}
    >
      <div className="v2-newsletter-preview" style={{ background: palette.background, color: palette.text }}>
        <article className="v2-newsletter-story" style={{ background: palette.background, color: palette.text, fontFamily: palette.body }}>
          <div className="v2-newsletter-story__header" dangerouslySetInnerHTML={{ __html: newsletterHeader(data, settings) }} />
          <div className="v2-newsletter-story__content">
            {date && (
              <time dateTime={article.pubInfo.publicationTime}>
                {date}
              </time>
            )}
            <div className="v2-newsletter-story__title" style={{ fontFamily: palette.heading }}>
              <PaywallIcon level={resolvePaywallLevel(article.pubInfo?.paywallLevel)} />
              {headline ? renderContent(headline, article) : <h1>{article.title}</h1>}
            </div>
            {(hasText(summary) || article.summary) && (
              <div className="v2-newsletter-story__summary">
                {hasText(summary) ? renderContent(summary, article) : <p>{article.summary}</p>}
              </div>
            )}
            <LeafAccess data={data} article={article}>
              <LeafBody article={article} pageNodes={data.model.nodes} text={text} className="v2-leaf__text v2-newsletter-story__body" />
              {settings.showForward && settings.forwardText && <p className="v2-newsletter-story__forward">{settings.forwardText}</p>}
            </LeafAccess>
          </div>
          <div dangerouslySetInnerHTML={{ __html: newsletterFooter(data, settings) }} />
        </article>
      </div>
    </ContentEditingProvider>
  );
}
