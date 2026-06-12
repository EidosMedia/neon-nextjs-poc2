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
  'business-globe': {
    bg: '#FFF1E5',
    text: '#1A1A1A',
    muted: '#807060',
    accent: '#990F3D',
    headlineFont: 'Georgia, serif',
    bodyFont: 'Inter, system-ui, sans-serif',
  },
  adn: {
    bg: '#FFFFFF',
    text: '#1A1A1A',
    muted: '#888888',
    accent: '#E30613',
    headlineFont: "'Barlow Condensed', sans-serif",
    bodyFont: "'Nunito Sans', sans-serif",
  },
  foghorn: {
    bg: '#ffffff',
    text: '#121212',
    muted: '#666666',
    accent: '#052962',
    headlineFont: "'Georgia', 'Times New Roman', serif",
    bodyFont: "'Georgia', 'Times New Roman', serif",
  },
  wire: {
    bg: '#FFFFFF',
    text: '#0A0A0A',
    muted: '#6B6B6B',
    accent: '#0050FF',
    headlineFont: "'IBM Plex Sans', 'Inter', system-ui, sans-serif",
    bodyFont: "'IBM Plex Sans', 'Inter', system-ui, sans-serif",
  },
  oldtown: {
    bg: '#F7F7F5',
    text: '#121212',
    muted: '#666666',
    accent: '#000000',
    headlineFont: "'Cheltenham', 'Georgia', 'Times New Roman', serif",
    bodyFont: "'Georgia', 'Times New Roman', serif",
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
 * Date/issue header shown under the masthead, e.g. "Thursday, June 12, 2026".
 */
const renderDateLine = (palette: NewsletterThemePalette): string => {
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date());

  return `
        <tr>
          <td style="padding: 16px 24px 0 24px;">
            <p style="margin: 0; font-family: ${palette.bodyFont}; font-size: 13px; line-height: 1.5; color: ${palette.muted};">
              ${escapeHtml(dateLabel)}
            </p>
          </td>
        </tr>`;
};

/**
 * Short editorial intro blurb shown below the date line, above "Top Stories".
 */
const renderIntroBlock = (palette: NewsletterThemePalette): string => `
        <tr>
          <td style="padding: 8px 24px 16px 24px;">
            <p style="margin: 0; font-family: ${palette.bodyFont}; font-size: 15px; line-height: 1.5; color: ${palette.text};">
              Your morning briefing &mdash; the stories shaping today, starting with our top picks.
            </p>
          </td>
        </tr>`;

/**
 * Small uppercase section label (e.g. "Top Stories", "More Headlines")
 * separating groups of teaser rows.
 */
const renderSectionHeader = (label: string, palette: NewsletterThemePalette): string => `
        <tr>
          <td style="padding: 16px 24px 8px 24px; border-top: 1px solid ${palette.muted};">
            <span style="font-family: ${palette.headlineFont}; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: ${palette.accent};">
              ${escapeHtml(label)}
            </span>
          </td>
        </tr>`;

/**
 * Compact teaser row for "More Headlines": small thumbnail (if any) beside
 * a smaller title and short summary, instead of the full image+title+summary
 * stack used by `renderTeaserRow`.
 */
const renderCompactTeaserRow = (linkedObject: any, palette: NewsletterThemePalette): string => {
  const title = linkedObject?.title ?? '';
  const summary = linkedObject?.summary ?? '';
  const imageUrl = getTeaserImageUrl(linkedObject);
  const linkUrl = getTeaserLinkUrl(linkedObject);

  const imageCell = imageUrl
    ? `
              <td width="96" valign="top" style="padding: 0 12px 0 0;">
                <a href="${escapeHtml(linkUrl)}" style="text-decoration: none;">
                  <img src="${escapeHtml(imageUrl)}" alt="" width="96" style="display: block; width: 96px; height: auto; border: 0; border-radius: 4px;" />
                </a>
              </td>`
    : '';

  return `
        <tr>
          <td style="padding: 12px 24px; border-bottom: 1px solid ${palette.muted};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
              <tr>
                ${imageCell}
                <td valign="top" style="padding: 0;">
                  <a href="${escapeHtml(linkUrl)}" style="text-decoration: none; color: ${palette.text};">
                    <h3 style="margin: 0 0 4px 0; font-family: ${palette.headlineFont}; font-size: 16px; line-height: 1.3; color: ${palette.text};">
                      ${escapeHtml(title)}
                    </h3>
                  </a>
                  <p style="margin: 0; font-family: ${palette.bodyFont}; font-size: 13px; line-height: 1.4; color: ${palette.muted};">
                    ${escapeHtml(summary)}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>`;
};

/**
 * Renders the mail-client-compatible newsletter markup for a webpage as a
 * standalone HTML fragment (no <html>/<head>/<body> wrapper). This is the
 * SINGLE source of truth for newsletter markup: both the in-page preview
 * (rendered directly into the page via dangerouslySetInnerHTML) and
 * `renderNewsletterHtml` (used for raw-HTML export) build on this fragment.
 *
 * Table-based layout, inline styles only — no flexbox/grid/CSS variables/Tailwind
 * classes, since Outlook/Gmail strip those.
 */
export async function renderNewsletterFragment(data: PageData<WebpageModel>): Promise<string> {
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

  // First 3 items get the full "Top Stories" treatment, the rest a compact
  // "More Headlines" treatment.
  const topItems = teaserItems.slice(0, 3);
  const restItems = teaserItems.slice(3);

  const topStoriesSection = topItems.length
    ? renderSectionHeader('Top Stories', palette) +
      topItems.map((linkedObject) => renderTeaserRow(linkedObject, palette)).join('')
    : '';

  const moreHeadlinesSection = restItems.length
    ? renderSectionHeader('More Headlines', palette) +
      restItems.map((linkedObject) => renderCompactTeaserRow(linkedObject, palette)).join('')
    : '';

  const teaserRows = topStoriesSection + moreHeadlinesSection;

  const year = new Date().getFullYear();

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${palette.bg};">
      <tr>
        <td align="center" style="padding: 24px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" id="neon-newsletter-table" style="width: auto; max-width: 600px; background: ${palette.bg};">
            <tr>
              <td style="padding: 24px; border-bottom: 2px solid ${palette.accent};">
                <span style="font-family: ${palette.headlineFont}; font-size: 24px; font-weight: 700; color: ${palette.text};">
                  ${siteLabelHtml}
                </span>
              </td>
            </tr>
            ${renderDateLine(palette)}
            ${renderIntroBlock(palette)}
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
    </table>`;
}

/**
 * Wraps `renderNewsletterFragment` in a complete HTML document for the
 * raw-HTML export endpoint (`/api/newsletter`). Any <style> block is
 * progressive enhancement only (e.g. mobile @media tweaks) and never
 * load-bearing — every element must already look correct with it stripped,
 * since Gmail strips <style> tags.
 */
export async function renderNewsletterHtml(data: PageData<WebpageModel>): Promise<string> {
  const theme = (data.siteNode?.attributes?.theme as string | undefined) ?? 'default';
  const palette = getThemePalette(theme);
  const fragment = await renderNewsletterFragment(data);

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @media only screen and (max-width: 620px) {
        #neon-newsletter-table {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background: ${palette.bg};">
    ${fragment}
  </body>
</html>`;
}
