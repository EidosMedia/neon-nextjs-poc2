import { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

/**
 * Hand-extracted palette per theme, mirroring the CSS custom properties each
 * theme's stylesheet defines (see src/app/themes/<theme>.css and globals.css).
 *
 * Mail clients (Outlook, Gmail, …) strip <style> blocks, CSS variables,
 * flexbox/grid and class-based styling, so every value here is meant to be
 * inlined directly into `style="..."` attributes on table-based markup.
 */
type NewsletterThemePalette = {
  bg: string;
  text: string;
  muted: string;
  accent: string;
  headlineFont: string;
  bodyFont: string;
};

const NEWSLETTER_THEME_STYLES: Record<string, NewsletterThemePalette> = {
  default: {
    bg: '#ffffff',
    text: '#2F2F2F',
    muted: '#999999',
    accent: '#3969AC',
    headlineFont: "'Gabarito', sans-serif",
    bodyFont: "'Georgia', serif",
  },
  nextfrontier: {
    bg: '#ffffff',
    text: '#1a1a1a',
    muted: '#6b6b6b',
    accent: '#0050FF',
    headlineFont: "'Epilogue', system-ui, sans-serif",
    bodyFont: "'Inter', system-ui, sans-serif",
  },
  sportsarena: {
    bg: '#0d0d0d',
    text: '#f0f0f0',
    muted: '#888888',
    accent: '#e31837',
    headlineFont: "'Barlow Condensed', system-ui, sans-serif",
    bodyFont: "'Inter', system-ui, sans-serif",
  },
};

const getThemePalette = (theme: string): NewsletterThemePalette =>
  NEWSLETTER_THEME_STYLES[theme] ?? NEWSLETTER_THEME_STYLES.default;

/**
 * Mirrors getTeaserOrMainImageUrl in src/app/components/contentElements/MainImage.tsx
 * (lines 11-23): prefer the teaser picture's "Wide_large" crop, falling back to
 * the main picture's. May be undefined — callers must handle a missing image.
 */
const getTeaserImageUrl = (linkedObject: any): string | undefined =>
  linkedObject?.links?.system?.teaserPicture?.[0]?.dynamicCropsResourceUrls?.['Wide_large'] ??
  linkedObject?.links?.system?.mainPicture?.[0]?.dynamicCropsResourceUrls?.['Wide_large'];

/**
 * Mirrors the link resolution in ArticleOrganism
 * (src/app/components/base/Organism/ArticleOrganism/index.tsx): `linkedObject.url`,
 * with a safe fallback for the rare case it's missing.
 */
const getTeaserLinkUrl = (linkedObject: any): string => linkedObject?.url ?? '#';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Builds one teaser-card "row" (a full-width <table> row) for a linked object.
 * Table-based layout + inline styles only — no flex/grid/class/var(--), so the
 * markup renders correctly in mail clients that strip <style> blocks.
 */
const renderTeaserRow = (linkedObject: any, palette: NewsletterThemePalette): string => {
  const title = linkedObject?.title ?? '';
  const summary = linkedObject?.summary ?? '';
  const imageUrl = getTeaserImageUrl(linkedObject);
  const linkUrl = getTeaserLinkUrl(linkedObject);

  const imageCell = imageUrl
    ? `
              <tr>
                <td style="padding: 0 0 16px 0;">
                  <a href="${escapeHtml(linkUrl)}" style="text-decoration: none;">
                    <img src="${escapeHtml(imageUrl)}" alt="" width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0;" />
                  </a>
                </td>
              </tr>`
    : '';

  return `
        <tr>
          <td style="padding: 24px 24px; border-bottom: 1px solid ${palette.muted};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              ${imageCell}
              <tr>
                <td style="padding: 0;">
                  <a href="${escapeHtml(linkUrl)}" style="text-decoration: none; color: ${palette.text};">
                    <h2 style="margin: 0 0 8px 0; font-family: ${palette.headlineFont}; font-size: 22px; line-height: 1.3; color: ${palette.text};">
                      ${escapeHtml(title)}
                    </h2>
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 0;">
                  <p style="margin: 0; font-family: ${palette.bodyFont}; font-size: 15px; line-height: 1.5; color: ${palette.muted};">
                    ${escapeHtml(summary)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
};

/**
 * Renders a complete, mail-client-compatible HTML document for a webpage's
 * newsletter representation. This is the SINGLE source of truth for newsletter
 * markup: both the in-browser preview (<iframe srcDoc>) and the raw-HTML export
 * API endpoint call this function verbatim and must receive byte-identical output.
 *
 * Table-based layout, inline styles only — no flexbox/grid/CSS variables/Tailwind
 * classes, since Outlook/Gmail strip those. Any <style> block is progressive
 * enhancement only (e.g. mobile @media tweaks) and never load-bearing.
 */
export async function renderNewsletterHtml(data: PageData<WebpageModel>): Promise<string> {
  const theme = (data.siteNode?.attributes?.theme as string | undefined) ?? 'default';
  const palette = getThemePalette(theme);

  const siteName = data.siteData?.siteName || data.siteNode?.name;
  const siteLabel = data.siteNode?.attributes?.sitename || siteName;
  const siteLabelHtml = escapeHtml(String(siteLabel ?? ''));

  // Same three zones a normal webpage renders, in the same vertical order:
  // MainWithHero -> main, Context -> context, Insight1 -> insight1
  // (see src/app/_pages/WebpageColumnsLayout.tsx).
  const [mainItems, contextItems, insightItems]: WebpageNodeModel[][] = await Promise.all([
    connection.getDwxLinkedObjects(data, 'main'),
    connection.getDwxLinkedObjects(data, 'context'),
    connection.getDwxLinkedObjects(data, 'insight1'),
  ]);

  const teaserItems = [...mainItems, ...contextItems, ...insightItems];

  const teaserRows = teaserItems.map((linkedObject) => renderTeaserRow(linkedObject, palette)).join('');

  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      /* Progressive enhancement only — every element below must already look
         correct with this block stripped (Gmail strips <style> tags). */
      @media only screen and (max-width: 620px) {
        #neon-newsletter-table {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background: ${palette.bg};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${palette.bg};">
      <tr>
        <td align="center" style="padding: 24px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" id="neon-newsletter-table" style="width: 600px; max-width: 600px; background: ${palette.bg};">
            <tr>
              <td style="padding: 24px; border-bottom: 2px solid ${palette.accent};">
                <span style="font-family: ${palette.headlineFont}; font-size: 24px; font-weight: 700; color: ${palette.text};">
                  ${siteLabelHtml}
                </span>
              </td>
            </tr>
            ${teaserRows}
            <tr>
              <td style="padding: 24px; text-align: center;">
                <p style="margin: 0 0 8px 0; font-family: ${palette.bodyFont}; font-size: 12px; line-height: 1.5; color: ${palette.muted};">
                  &copy; ${year} ${siteLabelHtml}. All rights reserved.
                </p>
                <p style="margin: 0; font-family: ${palette.bodyFont}; font-size: 12px; line-height: 1.5; color: ${palette.muted};">
                  <a href="#" style="color: ${palette.accent}; text-decoration: underline;">Unsubscribe</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
