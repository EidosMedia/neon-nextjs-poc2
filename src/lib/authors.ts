import { sanitizeZoneSummary } from '@/lib/accessories/sanitizeZoneSummary';
import type { SummaryInline } from '@/lib/accessories/zoneHeadTypes';

/**
 * Author contract consumed from Neon (NEON-2778). An Author is a node of the base type `author`; its delivered
 * node carries `attributes.author` and a story carries its resolved Authors in `attributes.linkedAuthors`.
 */
export type AuthorContact = { label: string; icon: string; uri: string };

export type AuthorNodeAttributes = {
  kind?: string;
  name?: string;
  nickName?: string;
  contacts?: AuthorContact[];
};

export type LinkedAuthor = { id: string; name: string; nickName?: string; url?: string };

export type AuthorNodeModel = {
  title?: string;
  summary?: string;
  url?: string;
  attributes?: { author?: AuthorNodeAttributes; linkedAuthors?: LinkedAuthor[] } & Record<string, unknown>;
};

export const AUTHOR_ALIGNS = ['left', 'center', 'right'] as const;
export const AUTHOR_LOOKS = ['simple', 'summary'] as const;
export const AUTHOR_CONTACTS = ['on', 'off'] as const;
export const EMBEDDED_AUTHORS = ['on', 'off', 'name-right'] as const;

export type AuthorAlign = (typeof AUTHOR_ALIGNS)[number];
export type AuthorLook = (typeof AUTHOR_LOOKS)[number];
export type AuthorContactsMode = (typeof AUTHOR_CONTACTS)[number];
export type EmbeddedAuthorsMode = (typeof EMBEDDED_AUTHORS)[number];

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Rendering settings of an author component; a damaged or missing value falls back to the default. */
export function resolveAuthorSettings(attrs: Record<string, unknown> | undefined): {
  align: AuthorAlign;
  look: AuthorLook;
  contacts: AuthorContactsMode;
} {
  return {
    align: pick(attrs?.align, AUTHOR_ALIGNS, 'left'),
    look: pick(attrs?.look, AUTHOR_LOOKS, 'simple'),
    contacts: pick(attrs?.contacts, AUTHOR_CONTACTS, 'off'),
  };
}

/** Value of the `authors` flag of a story embedding; `off` (the default) when missing or damaged. */
export const resolveEmbeddedAuthors = (value: unknown): EmbeddedAuthorsMode => pick(value, EMBEDDED_AUTHORS, 'off');

const ICON_NAME = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** The SVG of a contact icon, served by the uicomponents service through the front-office proxy. */
export function contactIconUrl(icon: string | undefined): string | undefined {
  return icon && ICON_NAME.test(icon) ? `/shared/uicomponents/icons/contacts/${icon}.svg` : undefined;
}

/** A contact link is rendered only for the schemes Neon accepts (`https`, `mailto`, `tel`), never for anything else. */
export function isSafeContactUri(raw: string | undefined): raw is string {
  if (!raw || raw.length > 2048 || /[\u0000-\u001f\u007f\s\\]/.test(raw)) return false;
  try {
    const { protocol } = new URL(raw);
    return protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:';
  } catch {
    return false;
  }
}

export function safeContacts(author: AuthorNodeAttributes | undefined): AuthorContact[] {
  return (author?.contacts ?? []).filter(
    (contact): contact is AuthorContact => !!contact?.label && isSafeContactUri(contact.uri),
  );
}

/** The nickname (sanitized rich text) as inline nodes, or undefined when it is empty. */
export function nickNameInline(html: string | undefined): SummaryInline[] | undefined {
  if (!html) return undefined;
  const paragraphs = sanitizeZoneSummary(html, { maxVisible: 200 });
  if (!paragraphs) return undefined;
  const inline: SummaryInline[] = [];
  paragraphs.forEach((paragraph, index) => {
    if (index > 0) inline.push({ kind: 'text', text: ' ' });
    inline.push(...paragraph.children);
  });
  return inline;
}

export type AuthorView = {
  name: string;
  url?: string;
  /** The anchor text: the nickname when there is one, the name otherwise. */
  nickName?: SummaryInline[];
  summary?: string;
  contacts: AuthorContact[];
};

/** The view of an Author from its delivered node; undefined when the node is not an Author the site can show. */
export function resolveAuthorView(model: AuthorNodeModel | null | undefined): AuthorView | undefined {
  const author = model?.attributes?.author;
  const name = author?.name || model?.title;
  if (!model || !name) return undefined;
  return {
    name,
    url: model.url || undefined,
    nickName: nickNameInline(author?.nickName),
    summary: model.summary?.trim() || undefined,
    contacts: safeContacts(author),
  };
}

/** The Authors of an embedded story to show, according to the flag; at most the 20 that the delivery gives. */
export function embeddedAuthorsToShow(
  mode: EmbeddedAuthorsMode,
  model: AuthorNodeModel | null | undefined,
): LinkedAuthor[] {
  if (mode === 'off') return [];
  return (model?.attributes?.linkedAuthors ?? []).filter(author => !!author?.name);
}
