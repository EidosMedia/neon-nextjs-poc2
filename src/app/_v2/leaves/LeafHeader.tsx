import type { ArticleModel } from '@/types/models';
import { findElementsInContentJson, renderContent } from '@/utilities/content';
import { hasText } from '../lib/leafView';
import PaywallIcon from '../items/PaywallIcon';
import { resolvePaywallLevel } from '../lib/paywall';

type Props = {
  article: ArticleModel;
  hero: 'above' | 'behind' | 'none' | 'portrait';
  titleSize: 'standard' | 'large';
  imageUrl?: string;
  /** Whether to render the hero image (articles: yes; gallery leaves supply their own media). */
  showImage?: boolean;
  /** Omit the standfirst (the live blog renders it once, in its pinned summary block). */
  hideSummary?: boolean;
};

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined;

/**
 * Overhead, headline, summary and byline. Every element goes through renderContent with the
 * article model, so the legacy ContentEditable wrappers (inline edit, lock, versions) stay intact.
 */
export default function LeafHeader({ article, hero, titleSize, imageUrl, showImage = true, hideSummary = false }: Props) {
  const content = article.files.content.data;
  const [overhead] = findElementsInContentJson(['overhead'], content);
  const [headline] = findElementsInContentJson(['headline'], content);
  const [summary] = findElementsInContentJson(['summary'], content);
  const [rawByline] = findElementsInContentJson(['byline'], content);
  // An empty byline element would render as a bare "By" (and a dangling separator before the date).
  const byline = hasText(rawByline) ? rawByline : undefined;
  const [caption] = findElementsInContentJson(['web-image-caption'], content);
  const date = formatDate(article.pubInfo?.publicationTime);
  const image = showImage ? imageUrl : undefined;
  const level = resolvePaywallLevel(article.pubInfo?.paywallLevel);

  const text = (
    <div className="v2-leaf-head__text">
      {(overhead || level !== 'FREE') && (
        <div className="v2-leaf-head__kicker">
          <PaywallIcon level={level} />
          {overhead && renderContent(overhead, article)}
        </div>
      )}
      {/* Without a content document (loadContent failed) the plain title and summary still show. */}
      {headline ? (
        <div className="v2-leaf-head__title">{renderContent(headline, article)}</div>
      ) : article.title ? (
        <div className="v2-leaf-head__title"><h1>{article.title}</h1></div>
      ) : null}
      {!hideSummary && (summary ? (
        <div className="v2-leaf-head__standfirst">{renderContent(summary, article)}</div>
      ) : article.summary ? (
        <div className="v2-leaf-head__standfirst"><p>{article.summary}</p></div>
      ) : null)}
      <div className="v2-leaf-head__meta">
        {hero === 'portrait' && image && <img className="v2-leaf-head__portrait" src={image} alt="" />}
        <span className="v2-leaf-head__by">
          {byline && <>By {renderContent(byline, article, undefined, 'v2-leaf-head__byline')}</>}
          {date && <time dateTime={article.pubInfo?.publicationTime}>{date}</time>}
        </span>
      </div>
    </div>
  );

  if (hero === 'behind' && image) {
    return (
      <header className={`v2-leaf-head v2-leaf-head--behind v2-leaf-head--${titleSize}`}>
        <img className="v2-leaf-head__bg" src={image} alt="" />
        <div className="v2-container v2-leaf-head__inner">{text}</div>
      </header>
    );
  }
  return (
    <header className={`v2-leaf-head v2-leaf-head--${hero} v2-leaf-head--${titleSize}`}>
      {text}
      {hero === 'above' && image && (
        <figure className="v2-leaf-head__hero">
          <img src={image} alt="" />
          {caption && <figcaption>{renderContent(caption, article)}</figcaption>}
        </figure>
      )}
    </header>
  );
}
