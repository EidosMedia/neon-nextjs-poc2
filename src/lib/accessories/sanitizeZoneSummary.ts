import type { SummaryAlign, SummaryInline, SummaryParagraph } from './zoneHeadTypes';

const MAX_HREF_LENGTH = 256;
const MAX_WRAPPER_DEPTH = 6;
const MARK_TAGS = new Set(['strong', 'em', 'u', 's']);
const DROPPED_WITH_CONTENT = new Set(['script', 'style', 'template', 'textarea', 'title', 'noscript', 'iframe', 'object', 'svg', 'math']);
const ALIGN_STYLE = /^\s*text-align\s*:\s*(left|center|right|justify)\s*;?\s*$/i;
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y;
const ATTRIBUTE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };

type Token =
  | { type: 'text'; text: string }
  | { type: 'open'; name: string; attrs: Record<string, string>; selfClosing: boolean }
  | { type: 'close'; name: string };

type Frame = { tag: string; children: SummaryInline[]; wrap?: (children: SummaryInline[]) => SummaryInline };

/** Root-relative same-site paths and absolute https URLs only. */
export function isSafeHref(raw: string): boolean {
  const href = raw.trim();
  if (!href || href.length > MAX_HREF_LENGTH || /[\u0000-\u001f\u007f\s\\]/.test(href)) {
    return false;
  }
  if (href.startsWith('/')) {
    return !href.startsWith('//');
  }
  if (!/^https:\/\//i.test(href)) {
    return false;
  }
  try {
    return new URL(href).protocol === 'https:';
  } catch {
    return false;
  }
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (match, entity: string) => {
    if (entity.startsWith('#')) {
      const codePoint = entity[1] === 'x' || entity[1] === 'X' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      const isControl = codePoint < 0x20 && codePoint !== 0x09 && codePoint !== 0x0a;
      const isInvalid = !Number.isInteger(codePoint) || codePoint <= 0 || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff);
      return isControl || isInvalid ? '' : String.fromCodePoint(codePoint);
    }
    return NAMED_ENTITIES[entity] ?? match;
  });
}

function parseAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of source.matchAll(ATTRIBUTE)) {
    const name = match[1].toLowerCase();
    if (!(name in attrs)) {
      attrs[name] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
    }
  }
  return attrs;
}

function tokenize(html: string): Token[] {
  const tokens: Token[] = [];
  const pushText = (text: string) => {
    if (text) {
      tokens.push({ type: 'text', text: decodeEntities(text) });
    }
  };
  let index = 0;

  while (index < html.length) {
    const lt = html.indexOf('<', index);
    if (lt === -1) {
      pushText(html.slice(index));
      break;
    }
    pushText(html.slice(index, lt));

    if (html.startsWith('<!--', lt)) {
      const end = html.indexOf('-->', lt + 4);
      index = end === -1 ? html.length : end + 3;
      continue;
    }

    TAG.lastIndex = lt;
    const match = TAG.exec(html);
    if (!match) {
      pushText('<');
      index = lt + 1;
      continue;
    }

    const [whole, closing, rawName, rawAttrs, selfClosing] = match;
    const name = rawName.toLowerCase();
    index = lt + whole.length;

    if (closing) {
      tokens.push({ type: 'close', name });
      continue;
    }
    if (DROPPED_WITH_CONTENT.has(name) && !selfClosing) {
      const end = html.toLowerCase().indexOf(`</${name}`, index);
      const close = end === -1 ? -1 : html.indexOf('>', end);
      index = close === -1 ? html.length : close + 1;
      continue;
    }
    tokens.push({ type: 'open', name, attrs: parseAttributes(rawAttrs), selfClosing: selfClosing === '/' });
  }

  return tokens;
}

function parseAlign(style: string | undefined): SummaryAlign | undefined {
  const match = style === undefined ? null : ALIGN_STYLE.exec(style);
  return match ? (match[1].toLowerCase() as SummaryAlign) : undefined;
}

function pruneInline(nodes: SummaryInline[]): SummaryInline[] {
  const pruned: SummaryInline[] = [];
  for (const node of nodes) {
    if (node.kind === 'text') {
      if (node.text) {
        pruned.push(node);
      }
    } else if (node.kind === 'br') {
      pruned.push(node);
    } else {
      const children = pruneInline(node.children);
      if (children.length > 0) {
        pruned.push({ ...node, children });
      }
    }
  }
  return pruned;
}

function visibleText(nodes: SummaryInline[]): string {
  return nodes
    .map(node => (node.kind === 'text' ? node.text : node.kind === 'br' ? '' : visibleText(node.children)))
    .join('');
}

function build(tokens: Token[]): SummaryParagraph[] {
  const paragraphs: SummaryParagraph[] = [];
  let current: { align?: SummaryAlign; children: SummaryInline[] } | null = null;
  let stack: Frame[] = [];

  const container = (): SummaryInline[] => (stack.length > 0 ? stack[stack.length - 1].children : current!.children);
  const ensureParagraph = () => {
    if (!current) {
      current = { children: [] };
      stack = [];
    }
  };
  const popFrame = () => {
    const frame = stack.pop()!;
    const parent = container();
    if (frame.wrap) {
      parent.push(frame.wrap(frame.children));
    } else {
      parent.push(...frame.children);
    }
  };
  const closeParagraph = () => {
    if (!current) {
      return;
    }
    while (stack.length > 0) {
      popFrame();
    }
    paragraphs.push({ ...(current.align ? { align: current.align } : {}), children: current.children });
    current = null;
  };
  const wrapperDepth = () => stack.filter(frame => frame.wrap).length;

  for (const token of tokens) {
    if (token.type === 'text') {
      if (current || token.text.trim()) {
        ensureParagraph();
        container().push({ kind: 'text', text: token.text });
      }
    } else if (token.type === 'open') {
      const { name, attrs, selfClosing } = token;
      if (name === 'p') {
        closeParagraph();
        const align = parseAlign(attrs.style);
        current = { ...(align ? { align } : {}), children: [] };
        stack = [];
        if (selfClosing) {
          closeParagraph();
        }
      } else if (name === 'br') {
        ensureParagraph();
        container().push({ kind: 'br' });
      } else if (selfClosing) {
        continue;
      } else if (MARK_TAGS.has(name)) {
        ensureParagraph();
        const mark = name as 'strong' | 'em' | 'u' | 's';
        stack.push({
          tag: name,
          children: [],
          wrap: wrapperDepth() < MAX_WRAPPER_DEPTH ? children => ({ kind: 'mark', mark, children }) : undefined,
        });
      } else if (name === 'a') {
        ensureParagraph();
        const href = attrs.href?.trim() ?? '';
        const insideLink = stack.some(frame => frame.tag === 'a' && frame.wrap);
        const usable = !insideLink && isSafeHref(href) && wrapperDepth() < MAX_WRAPPER_DEPTH;
        stack.push({ tag: 'a', children: [], wrap: usable ? children => ({ kind: 'link', href, children }) : undefined });
      }
    } else if (token.name === 'p') {
      closeParagraph();
    } else if (current && (MARK_TAGS.has(token.name) || token.name === 'a')) {
      const target = stack.map(frame => frame.tag).lastIndexOf(token.name);
      while (target !== -1 && stack.length > target) {
        popFrame();
      }
    }
  }
  closeParagraph();

  return paragraphs;
}

/**
 * Re-sanitizes the stored summary into a typed tree, or returns undefined when it is empty, oversize or unusable.
 * Only `p` (with one text-align), `br`, `strong`, `em`, `u`, `s` and safe `a[href]` survive; all else is dropped.
 */
export function sanitizeZoneSummary(
  html: string,
  { maxVisible, maxSerialized = maxVisible * 2 }: { maxVisible: number; maxSerialized?: number },
): SummaryParagraph[] | undefined {
  if (html.length > maxSerialized) {
    return undefined;
  }

  const paragraphs = build(tokenize(html)).map(paragraph => ({ ...paragraph, children: pruneInline(paragraph.children) }));
  const hasContent = (paragraph: SummaryParagraph) => visibleText(paragraph.children).trim() !== '';

  const first = paragraphs.findIndex(hasContent);
  if (first === -1) {
    return undefined;
  }
  const last = paragraphs.length - 1 - [...paragraphs].reverse().findIndex(hasContent);
  const trimmed = paragraphs.slice(first, last + 1);

  const visibleLength = trimmed.reduce((total, paragraph) => total + visibleText(paragraph.children).length, 0);
  return visibleLength > maxVisible ? undefined : trimmed;
}
