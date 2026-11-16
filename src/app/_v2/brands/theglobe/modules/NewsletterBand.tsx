import { attr, blockAttrs, blockSummary, blockTitle, type BrandModuleProps } from '../../moduleData';

/**
 * Newsletter band. Reads `title`, `summary`, and `attributes.signupUrl` (the "Sign up free" link
 * is hidden without it; no form is rendered because there is no subscribe endpoint).
 */
export default function NewsletterBand({ block }: BrandModuleProps) {
  const title = blockTitle(block);
  const summary = blockSummary(block);
  if (!title && !summary) return null;
  const signup = attr(blockAttrs(block), 'signupUrl');
  return (
    <section className="v2-mod-newsletter" aria-label={title ?? 'Newsletter'}>
      <div className="v2-container v2-mod-newsletter__inner">
        <div className="v2-mod-newsletter__text">
          {title && <h2 className="v2-mod-newsletter__title">{title}</h2>}
          {summary && <p className="v2-mod-newsletter__summary">{summary}</p>}
        </div>
        {signup && <a className="v2-mod-newsletter__cta" href={signup}>Sign up free</a>}
      </div>
    </section>
  );
}
