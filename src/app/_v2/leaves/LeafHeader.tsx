import type { ArticleModel } from '@/types/models';
import { findElementsInContentJson, renderContent } from '@/utilities/content';

type Props = {
  article: ArticleModel;
  hero: 'above' | 'behind' | 'none' | 'portrait';
  titleSize: 'standard' | 'large';
  imageUrl?: string;
  /** Whether to render the hero image (articles: yes; gallery leaves supply their own media). */
  showImage?: boolean;
};

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : undefined;

/**
 * Overhead, headline, summary and byline. Every element goes through renderContent with the
 * article model, so the legacy ContentEditable wrappers (inline edit, lock, versions) stay intact.
 */
export default function LeafHeader({ article, hero, titleSize, imageUrl, showImage = true }: Props) {
  const content = article.files.content.data;
  const [overhead] = findElementsInContentJson(['overhead'], content);
  const [headline] = findElementsInContentJson(['headline'], content);
  const [summary] = findElementsInContentJson(['summary'], content);
  const [byline] = findElementsInContentJson(['byline'], content);
  const [caption] = findElementsInContentJson(['web-image-caption'], content);
  const date = formatDate(article.pubInfo?.publicationTime);
  const image = showImage ? imageUrl : undefined;

  const text = (
    <div className="v2-leaf-head__text">
      {overhead && <div className="v2-leaf-head__kicker">{renderContent(overhead, article)}</div>}
      {headline && <div className="v2-leaf-head__title">{renderContent(headline, article)}</div>}
      {summary && <div className="v2-leaf-head__standfirst">{renderContent(summary, article)}</div>}
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
