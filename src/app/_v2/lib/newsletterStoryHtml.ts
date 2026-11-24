import type { ContentElement, PageData } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { ArticleModel } from '@/types/models';
import { isSafeHref } from '@/lib/accessories/sanitizeZoneSummary';
import { getNewsletterPageSettings } from './newsletter';
import { escapeNewsletterText as escape, formatNewsletterDate, newsletterFooter, newsletterHeader, newsletterPalette } from './newsletterHtml';

export class NewsletterStoryExportError extends Error {}

function findText(node: ContentElement | undefined): ContentElement | undefined {
  if (!node) return undefined;
  if (node.nodeType === 'text') return node;
  for (const child of node.elements ?? []) {
    const found = findText(child);
    if (found) return found;
  }
  return undefined;
}

function textContent(node: ContentElement): string {
  return node.nodeType === 'plainText' ? node.value ?? '' : (node.elements ?? []).map(textContent).join('');
}

function absoluteUrl(raw: string | undefined, origin: string): string | undefined {
  if (!raw || !isSafeHref(raw)) return undefined;
  return new URL(raw, origin).toString();
}

function renderNode(node: ContentElement, origin: string): string {
  const children = () => (node.elements ?? []).map(child => renderNode(child, origin)).join('');
  switch (node.nodeType) {
    case 'plainText': return escape(node.value ?? '');
    case 'text': return children();
    case 'p': return `<p style="margin:0 0 18px;line-height:1.65">${children()}</p>`;
    case 'br': return '<br />';
    case 'anchor': {
      const href = absoluteUrl(node.attributes?.href, origin);
      return href ? `<a href="${escape(href)}">${children()}</a>` : children();
    }
    case 'inline-media-group': {
      const images = (node.elements ?? []).filter(child => child.nodeType === 'image');
      const image = images.find(child => child.attributes?.softcropenabled === 'enabled-preferred')
        ?? images.find(child => child.attributes?.softcropenabled === 'enabled')
        ?? images[0];
      if (!image) throw new NewsletterStoryExportError('An inline media group has no supported image.');
      const src = absoluteUrl(image.attributes?.src, origin);
      if (!src) throw new NewsletterStoryExportError('An inline image has no safe URL.');
      const caption = (node.elements ?? []).find(child => child.nodeType === 'image-caption');
      const alt = image.attributes?.alt || (caption ? textContent(caption).trim() : '');
      return `<div style="margin:20px 0"><img src="${escape(src)}" alt="${escape(alt)}" width="592" style="display:block;width:100%;height:auto;border:0" />${caption ? renderNode(caption, origin) : ''}</div>`;
    }
    case 'image-caption':
      return `<div style="font-size:12px;font-style:italic">${children()}</div>`;
    case 'caption':
    case 'credit':
      return `<div>${children()}</div>`;
    case 'strong':
    case 'b':
    case 'em':
    case 'i':
    case 'u':
    case 's':
    case 'ul':
    case 'ol':
    case 'li':
    case 'blockquote':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'table':
    case 'tbody':
    case 'tr':
    case 'th':
    case 'td':
      return `<${node.nodeType}>${children()}</${node.nodeType}>`;
    case 'span':
      return children();
    default:
      throw new NewsletterStoryExportError(`Unsupported newsletter story content: ${node.nodeType || '(unnamed)'}.`);
  }
}

export function renderNewsletterStoryHtml(data: PageData<ArticleModel>, origin: string): string {
  const article = data.model.data;
  const text = findText(article.files?.content?.data);
  if (!text) throw new NewsletterStoryExportError('Newsletter story body is unavailable.');
  const palette = newsletterPalette(data);
  const settings = getNewsletterPageSettings(data);
  const date = article.pubInfo?.publicationTime ? formatNewsletterDate(article.pubInfo.publicationTime) : '';
  const forward = settings.showForward && settings.forwardText
    ? `<p style="margin-top:32px;font-style:italic">${escape(settings.forwardText)}</p>` : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
    <body style="margin:0;background:${palette.background};color:${palette.text}">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" style="width:100%;max-width:640px;background:${palette.background}">
          <tr><td style="padding:24px">${newsletterHeader(data, settings)}</td></tr>
          <tr><td style="padding:0 24px 24px;font:16px/1.65 ${palette.body}">
            ${date ? `<p style="font-size:13px">${date}</p>` : ''}
            <h1 style="font:700 32px/1.2 ${palette.heading}">${escape(article.title ?? '')}</h1>
            ${article.summary ? `<p style="margin-bottom:24px">${escape(article.summary)}</p>` : ''}
            ${renderNode(text, origin)}${forward}
          </td></tr>
          <tr><td>${newsletterFooter(data, settings)}</td></tr>
        </table>
      </td></tr></table>
    </body></html>`;
}
