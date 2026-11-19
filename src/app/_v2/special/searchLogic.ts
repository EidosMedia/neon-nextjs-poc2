// Pure search helpers: tabs, time windows, URLs and text rendering of backend HTML. No React here.
import { isSafeHref } from '@/lib/accessories/sanitizeZoneSummary';

export type ActiveTab = 'chat' | 'articles' | 'images' | 'videos';

export const THREAD_ID_KEY = 'search-thread-id';

export const TABS: { value: ActiveTab; label: string }[] = [
  { value: 'chat', label: 'AI Chat' },
  { value: 'articles', label: 'Articles' },
  { value: 'images', label: 'Images' },
  { value: 'videos', label: 'Videos' },
];

export const TIME_OPTIONS = ['Today', 'Last Week', 'Last Month', 'Last Quarter', 'Last Year'] as const;
export const DEFAULT_TIME = 'Last Year';

export function urlParamToTab(t: string | null): ActiveTab {
  if (t === 'articles' || t === 'images' || t === 'videos') return t;
  return 'chat'; // default and 't=c'
}

export function tabToUrlParam(tab: ActiveTab): string {
  return tab === 'chat' ? 'c' : tab;
}

export function tabToBaseType(tab: ActiveTab): string {
  if (tab === 'images') return 'image';
  if (tab === 'videos') return 'url';
  return 'article'; // 'articles' and fallback
}

export function buildSearchUrl(tab: ActiveTab, text: string, time: string): string {
  const params = new URLSearchParams();
  params.append('query', text);
  params.append('time', time);
  params.append('t', tabToUrlParam(tab));
  return `/search?${params.toString()}`;
}

/** Start of the selected window, used as `startDate` of the standard search. */
export function optionToDate(selectedOption: string, now: Date = new Date()): Date {
  const date = new Date(now);
  switch (selectedOption) {
    case 'Today': date.setDate(date.getDate() - 1); break;
    case 'Last Week': date.setDate(date.getDate() - 7); break;
    case 'Last Month': date.setMonth(date.getMonth() - 1); break;
    case 'Last Quarter': date.setMonth(date.getMonth() - 3); break;
    case 'Last Year': date.setFullYear(date.getFullYear() - 1); break;
    default: date.setDate(date.getDate() - 7); break;
  }
  date.setHours(0, 0, 0, 0);
  return date;
}

/** `pastDays` of the AI chat search. */
export function optionToDays(selectedOption: string): string {
  switch (selectedOption) {
    case 'Today': return '1';
    case 'Last Week': return '7';
    case 'Last Month': return '30';
    case 'Last Quarter': return '120';
    case 'Last Year': return '365';
    default: return '7';
  }
}

export function chatSearchParams(query: string, time: string, threadId: string): URLSearchParams {
  const params = new URLSearchParams();
  params.append('query', query);
  params.append('pastDays', optionToDays(time));
  params.append('searchType', 'CHAT');
  if (threadId) params.append('threadId', threadId);
  return params;
}

/** `null` when the URL has no query (nothing to search). */
export function standardSearchParams(urlParams: { has(k: string): boolean; get(k: string): string | null }, baseType: string): URLSearchParams | null {
  if (!urlParams.has('query')) return null;
  const params = new URLSearchParams();
  params.append('query', urlParams.get('query') ?? '');
  params.append('startDate', optionToDate(urlParams.get('time') ?? DEFAULT_TIME).toISOString());
  params.append('baseType', baseType);
  return params;
}

export type TextPart = { text: string; emphasis: boolean };

const EMPHASIS_TAGS = new Set(['em', 'b', 'strong', 'mark']);
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decode = (text: string): string =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return ENTITIES[entity.toLowerCase()] ?? match;
  });

/**
 * Turns backend HTML (titles and highlight snippets) into plain text parts. Highlight tags (em, b, strong,
 * mark) become emphasised parts; every other tag is dropped. The result is rendered as React text, never as HTML.
 */
export function htmlToParts(html: string): TextPart[] {
  const parts: TextPart[] = [];
  let depth = 0;
  let last = 0;
  const pattern = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)[^>]*>/g;
  const push = (raw: string) => {
    const text = decode(raw);
    if (text) parts.push({ text, emphasis: depth > 0 });
  };
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    push(html.slice(last, match.index));
    last = match.index + match[0].length;
    if (EMPHASIS_TAGS.has(match[2].toLowerCase()) && !match[0].endsWith('/>')) {
      depth = match[1] ? Math.max(0, depth - 1) : depth + 1;
    }
  }
  push(html.slice(last));
  return parts;
}

const ordinal = (n: number) => (n === 1 || n === 21 || n === 31 ? 'st' : n === 2 || n === 22 ? 'nd' : n === 3 || n === 23 ? 'rd' : 'th');

/** "3rd March 2026"; empty for a missing or invalid date. */
export function formatResultDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date
    .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/^(\d{1,2})/, (d) => `${parseInt(d, 10)}${ordinal(parseInt(d, 10))}`);
}

export const formatRefDate = (publicationTime?: string): string =>
  publicationTime
    ? new Date(publicationTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

/** Strips tool tags (e.g. `<tool id="search-assistant" />`) the backend injects into answers. */
export const cleanAnswer = (text: string): string => text.replace(/<[a-zA-Z][^>]*\/>/g, '').trim();

export type InlinePart = { text: string; style: 'plain' | 'bold' | 'italic' };

/** Inline `**bold**` and `*italic*` markers (bold is matched first). */
export function parseInline(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push({ text: text.slice(last, match.index), style: 'plain' });
    parts.push(match[1] !== undefined ? { text: match[1], style: 'bold' } : { text: match[2], style: 'italic' });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ text: text.slice(last), style: 'plain' });
  return parts;
}

export type AnswerBlock = { kind: 'list'; items: string[] } | { kind: 'paragraph'; lines: string[] };

/** Splits an answer into paragraphs and `- ` lists (a block with any `- ` line is a list). */
export function parseAnswer(text: string): AnswerBlock[] {
  const blocks: AnswerBlock[] = [];
  for (const block of cleanAnswer(text).split(/\n{2,}/)) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    const lines = trimmed.split('\n');
    if (lines.some((l) => l.trimStart().startsWith('- '))) {
      const items = lines
        .map((line) => (line.trimStart().startsWith('- ') ? line.trimStart().slice(2) : line.trim()))
        .filter(Boolean);
      blocks.push({ kind: 'list', items });
    } else {
      blocks.push({ kind: 'paragraph', lines });
    }
  }
  return blocks;
}

type Resultish = { nodeData: { url?: string; sys?: { detailPage?: string; importUrl?: string } } };

/** Link target of a result, with the same fallbacks as the legacy list. */
export const resultHref = (item: Resultish): string => {
  const href = item.nodeData.url || item.nodeData.sys?.detailPage || item.nodeData.sys?.importUrl || '';
  return href && isSafeHref(href) ? href : '#';
};

/** Copy of the empty state: what happened and what to try next. */
export function emptyMessage(tab: ActiveTab, query: string, time: string): string {
  const q = query.trim();
  if (!q) return 'Type a keyword to search articles, images and videos.';
  const what = tab === 'images' ? 'images' : tab === 'videos' ? 'videos' : 'articles';
  const when = time === 'Today' ? 'today' : `in the ${time.toLowerCase()}`;
  return `There are no ${what} for “${q}” ${when}. Try a different keyword or a longer time period.`;
}
