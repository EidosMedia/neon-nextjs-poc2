import type { PageData, WebpageModel, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import { getActiveTheme } from '@/lib/accessories/defaultThemeAccessories';
import { isSafeHref } from '@/lib/accessories/sanitizeZoneSummary';
import type { SummaryInline } from '@/lib/accessories/zoneHeadTypes';
import { resolveTeaserFields } from './itemView';
import { getNewsletterPageSettings, getNewsletterZoneSettings } from './newsletter';

type Settings = ReturnType<typeof getNewsletterPageSettings>;
type ZoneSettings = ReturnType<typeof getNewsletterZoneSettings>;
type Palette = { background: string; text: string; muted: string; brand: string; surface: string; footer: string; heading: string; body: string };

function palette(theme: string): Palette {
  if (theme === 'sportsarena') return {
    background: '#FFFFFF', text: '#1A1A1A', muted: '#4A4A4A', brand: '#004E98', surface: '#E8F3FA',
    footer: '#004E98', heading: "'Fredoka', sans-serif", body: "'Open Sans', sans-serif",
  };
  if (theme === 'nextfrontier') return {
    background: '#1D1930', text: '#F2F6FF', muted: '#D3D8E6', brand: '#FEF445', surface: '#31294C',
    footer: '#161327', heading: "'Abril Fatface', Georgia, serif", body: "'Noto Sans', sans-serif",
  };
  return {
    background: '#ffffff', text: '#2F2F2F', muted: '#595959', brand: '#3969AC', surface: '#F3F3F4',
    footer: '#1D3557', heading: "'Gabarito', sans-serif", body: 'Georgia, serif',
  };
}

export function escapeNewsletterText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeImage(src: string | undefined): string | undefined {
  if (!src || /[\u0000-\u0020\u007f\\]/.test(src)) return undefined;
  if (src.startsWith('/') && !src.startsWith('//')) return src;
  try {
    return new URL(src).protocol === 'https:' ? src : undefined;
  } catch {
    return undefined;
  }
}

function inline(nodes: SummaryInline[]): string {
  return nodes.map(node => {
    if (node.kind === 'text') return escapeNewsletterText(node.text);
    if (node.kind === 'br') return '<br />';
    const body = inline(node.children);
    if (node.kind === 'link') return `<a href="${escapeNewsletterText(node.href)}">${body}</a>`;
    return `<${node.mark}>${body}</${node.mark}>`;
  }).join('');
}

export function formatNewsletterDate(value: unknown): string {
  const date = typeof value === 'string' ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? '' : new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(date);
}

export function newsletterPalette(data: Parameters<typeof getActiveTheme>[0]) {
  return palette(getActiveTheme(data));
}

function publicUrl(data: Parameters<typeof getActiveTheme>[0], href: string): string {
  if (!href.startsWith('/') || !data.siteNode?.hostname) return href;
  const host = data.siteNode.hostname;
  const origin = new URL(host.startsWith('http') ? host : `https://${host}`);
  if (origin.protocol !== 'https:' && origin.protocol !== 'http:') throw new Error('Invalid public site hostname');
  return new URL(href, origin).toString();
}

export function newsletterHeader(data: Parameters<typeof getActiveTheme>[0], settings: Settings): string {
  const p = newsletterPalette(data);
  const label = data.siteNode?.attributes?.sitename || data.siteData?.siteName || data.siteNode?.name || '';
  const siteLabel = escapeNewsletterText(String(label));
  const date = formatNewsletterDate(data.model?.data?.pubInfo?.publicationTime);
  const edition = settings.edition ? ` · ${escapeNewsletterText(settings.edition)}` : '';
  const browser = settings.browserUrl
    ? `<a href="${escapeNewsletterText(publicUrl(data, settings.browserUrl))}" style="color:${p.muted}">View in browser</a>` : '';
  const preheader = settings.header === 'standard' && (settings.preheader || browser)
    ? `<div style="font:12px ${p.body};color:${p.muted};padding-bottom:14px">${escapeNewsletterText(settings.preheader)} ${browser}</div>` : '';
  return `${preheader}<div style="border-bottom:2px solid ${p.brand};padding:18px 0;color:${p.text}">
    <strong style="font:700 28px ${p.heading}">${siteLabel}</strong>
    ${settings.header === 'standard' ? `<div style="font:12px ${p.body};color:${p.muted};margin-top:8px">${date}${edition}</div>` : `<span style="font:12px ${p.body};color:${p.muted};float:right">${date}</span>`}
  </div>`;
}

export function newsletterFooter(data: Parameters<typeof getActiveTheme>[0], settings: Settings): string {
  const p = newsletterPalette(data);
  const site = escapeNewsletterText(String(data.siteNode?.attributes?.sitename || data.siteData?.siteName || data.siteNode?.name || ''));
  const links = [
    settings.unsubscribeUrl && `<a href="${escapeNewsletterText(publicUrl(data, settings.unsubscribeUrl))}" style="color:inherit">Unsubscribe</a>`,
    settings.footer === 'standard' && settings.preferencesUrl && `<a href="${escapeNewsletterText(publicUrl(data, settings.preferencesUrl))}" style="color:inherit">Manage preferences</a>`,
    settings.footer === 'standard' && settings.browserUrl && `<a href="${escapeNewsletterText(publicUrl(data, settings.browserUrl))}" style="color:inherit">View in browser</a>`,
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');
  const dark = settings.footer === 'standard';
  const social = dark ? [
    ['Facebook', settings.facebookUrl], ['Instagram', settings.instagramUrl],
    ['YouTube', settings.youtubeUrl], ['Telegram', settings.telegramUrl],
  ].filter(([, href]) => href).map(([label, href]) =>
    `<a href="${escapeNewsletterText(publicUrl(data, href))}" style="color:inherit">${label}</a>`,
  ).join(' &nbsp;·&nbsp; ') : '';
  return `<div style="background:${dark ? p.footer : p.background};color:${dark ? '#FFFFFF' : p.muted};padding:28px 24px;text-align:center;font:12px/1.6 ${p.body}">
    ${dark ? `<strong style="font:700 20px ${p.heading}">${site}</strong>` : ''}
    ${social ? `<p>${social}</p>` : ''}
    ${links ? `<p>${links}</p>` : ''}
    <p>${settings.legal ? escapeNewsletterText(settings.legal) : `&copy; ${new Date().getUTCFullYear()} ${site}`}</p>
  </div>`;
}

function teaser(node: WebpageNodeModel, data: PageData<WebpageModel>, p: Palette, s: ZoneSettings, layout: 'lead' | 'row' | 'card' | 'numbered', index: number): string {
  const fields = resolveTeaserFields(node, layout === 'lead' ? 'Wide_large' : 'Wide_small');
  const href = isSafeHref(fields.href) ? publicUrl(data, fields.href) : '';
  const imageUrl = s.image && layout !== 'numbered' ? safeImage(fields.imageUrl) : undefined;
  const image = imageUrl ? publicUrl(data, imageUrl) : undefined;
  const title = escapeNewsletterText(fields.title ?? '');
  const link = (content: string) => href ? `<a href="${escapeNewsletterText(href)}" style="color:inherit;text-decoration:none">${content}</a>` : content;
  const img = image ? link(`<img src="${escapeNewsletterText(image)}" alt="${title}" width="${layout === 'row' ? '96' : '592'}" style="display:block;width:100%;height:auto;border:0" />`) : '';
  const label = s.label && fields.kicker ? `<div style="font:700 11px ${p.body};text-transform:uppercase;color:${p.brand};margin-bottom:6px">${escapeNewsletterText(fields.kicker)}</div>` : '';
  const summary = s.summary && fields.summary ? `<p style="font:14px/1.5 ${p.body};color:${p.muted};margin:8px 0 0">${escapeNewsletterText(fields.summary)}</p>` : '';
  const text = `${label}<h3 style="margin:0;font:700 ${layout === 'lead' ? 24 : 17}px/1.3 ${p.heading};color:${p.text}">${link(title)}</h3>${summary}`;
  if (layout === 'row') return `<tr><td style="padding:14px 0;border-top:1px solid ${p.muted}"><table role="presentation" width="100%"><tr>${img ? `<td width="96" valign="top" style="padding-right:14px">${img}</td>` : ''}<td valign="top">${text}</td></tr></table></td></tr>`;
  if (layout === 'numbered') return `<tr><td style="padding:12px 0;border-top:1px solid ${p.muted}"><table role="presentation" width="100%"><tr><td width="35" valign="top" style="color:${p.brand};font:700 20px ${p.heading}">${index + 1}</td><td>${text}</td></tr></table></td></tr>`;
  return `<tr><td style="padding:12px 0">${img}<div style="padding-top:12px">${text}</div></td></tr>`;
}

function zoneHtml(name: 'main' | 'context' | 'insight1', items: WebpageNodeModel[], data: PageData<WebpageModel>, p: Palette): string {
  if (!items.length) return '';
  const s = getNewsletterZoneSettings(data, name);
  const head = s.zone.head;
  const title = head?.title || (name === 'main' ? 'Top stories' : name === 'context' ? 'In context' : 'More stories');
  const summary = s.heading === 'summary' ? head?.summary?.map(paragraph => `<p style="margin:8px 0">${inline(paragraph.children)}</p>`).join('') ?? '' : '';
  const more = s.zone.moreLink ? `<a href="${escapeNewsletterText(publicUrl(data, s.zone.moreLink))}" style="color:${p.brand}">See all →</a>` : '';
  const heading = s.heading !== 'hidden' && s.zone.showTitle
    ? `<div style="padding:20px 0 8px"><h2 style="margin:0;font:700 19px ${p.heading};color:${p.text}">${escapeNewsletterText(title)}</h2><div style="font:14px/1.5 ${p.body};color:${p.muted}">${summary}${more}</div></div>` : '';
  let rows: string;
  if (s.layout === 'cards') {
    const lead = teaser(items[0], data, p, s, 'lead', 0);
    const cards: string[] = [];
    for (let i = 1; i < items.length; i += 2) {
      const card = (item: WebpageNodeModel | undefined, index: number) => item
        ? `<td class="neon-newsletter-card" width="50%" valign="top" style="padding:8px"><table role="presentation" width="100%">${teaser(item, data, p, s, 'card', index)}</table></td>` : '<td class="neon-newsletter-card" width="50%"></td>';
      cards.push(`<tr>${card(items[i], i)}${card(items[i + 1], i + 1)}</tr>`);
    }
    rows = `${lead}<tr><td><table role="presentation" width="100%">${cards.join('')}</table></td></tr>`;
  } else {
    rows = items.map((item, index) => teaser(item, data, p, s,
      s.layout === 'numbered' ? 'numbered' : s.layout === 'list' ? 'row' : index === 0 ? 'lead' : 'row', index)).join('');
  }
  const bg = name === 'context' && s.contextStyle === 'box' ? p.surface : p.background;
  return `<tr><td style="padding:0 24px 24px;background:${bg}">${heading}<table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rows}</table></td></tr>`;
}

export async function renderV2NewsletterWebpage(data: PageData<WebpageModel>): Promise<string> {
  const p = newsletterPalette(data);
  const settings = getNewsletterPageSettings(data);
  const [main, context, insight] = await Promise.all([
    connection.getDwxLinkedObjects(data, 'main'),
    connection.getDwxLinkedObjects(data, 'context'),
    connection.getDwxLinkedObjects(data, 'insight1'),
  ]);
  const title = data.model.data.title;
  const summary = data.model.data.summary;
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background: ${p.background};color:${p.text}">
    <tr><td align="center"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="640" id="neon-newsletter-table" style="width:100%;max-width:640px;background:${p.background}">
      <tr><td style="padding:24px">${newsletterHeader(data, settings)}</td></tr>
      <tr><td style="padding:0 24px 16px"><h1 style="font:700 32px/1.2 ${p.heading};margin:0">${escapeNewsletterText(title ?? '')}</h1>${settings.showTitleSummary && summary ? `<p style="font:16px/1.5 ${p.body};color:${p.muted}">${escapeNewsletterText(summary)}</p>` : ''}</td></tr>
      ${zoneHtml('main', main, data, p)}${zoneHtml('context', context, data, p)}${zoneHtml('insight1', insight, data, p)}
      <tr><td>${newsletterFooter(data, settings)}</td></tr>
    </table></td></tr>
  </table>`;
}
