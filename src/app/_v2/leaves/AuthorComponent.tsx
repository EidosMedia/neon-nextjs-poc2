import clsx from 'clsx';
import { isSafeHref } from '@/lib/accessories/sanitizeZoneSummary';
import {
  contactIconUrl,
  embeddedAuthorsToShow,
  resolveAuthorSettings,
  resolveAuthorView,
  resolveEmbeddedAuthors,
  type AuthorContact,
  type AuthorNodeModel,
} from '@/lib/authors';
import { renderInline } from '../zones/ZoneTitle';

type Attributes = Record<string, unknown> | undefined;

/** The contacts of an Author, in the order of the metadata, each with the 14x14 icon of its set. */
export function AuthorContacts({ contacts }: { contacts: AuthorContact[] }) {
  if (contacts.length === 0) return null;
  return (
    <ul className="v2-author__contacts">
      {contacts.map((contact, index) => {
        const icon = contactIconUrl(contact.icon);
        return (
          <li key={`${contact.uri}-${index}`}>
            <a href={contact.uri} rel="noopener noreferrer">
              {icon && <img className="v2-author__icon" src={icon} width={14} height={14} alt="" />}
              <span>{contact.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * The author component of a story body (`author-component`, NEON-2778): the Author is rendered inline, aligned as the
 * editor set, with the citation of its summary when the look is `summary` and the contacts when they are on.
 * An empty component (a template placeholder) or an Author that is not published has no node and renders nothing.
 */
export function AuthorComponent({ attributes, model }: { attributes?: Attributes; model?: AuthorNodeModel | null }) {
  const view = resolveAuthorView(model);
  if (!view) return null;
  const { align, look, contacts } = resolveAuthorSettings(attributes);
  const href = view.url && isSafeHref(view.url) ? view.url : undefined;
  const label = view.nickName ? renderInline(view.nickName) : view.name;

  return (
    <aside className={clsx('v2-author', `v2-author--${align}`)} data-look={look} data-testid="author-component">
      {href ? (
        <a className="v2-author__name" href={href} rel="author">
          {label}
        </a>
      ) : (
        <span className="v2-author__name">{label}</span>
      )}
      {look === 'summary' && view.summary && <p className="v2-author__summary">“{view.summary}”</p>}
      {contacts === 'on' && <AuthorContacts contacts={view.contacts} />}
    </aside>
  );
}

/**
 * The Authors of a story that another story embeds, by the `authors` flag of the embedding: `on` lists them, `name-right`
 * shows only their names on the right, `off` (the default) nothing. Rendered next to the embedded item, not inside its
 * link, so the links of the Authors are not nested in another one.
 */
export function EmbeddedAuthors({ mode, model }: { mode: unknown; model?: AuthorNodeModel | null }) {
  const resolved = resolveEmbeddedAuthors(mode);
  const authors = embeddedAuthorsToShow(resolved, model);
  if (authors.length === 0) return null;
  return (
    <p className={clsx('v2-embedded-authors', resolved === 'name-right' && 'v2-embedded-authors--right')} data-testid="embedded-authors">
      {authors.map((author, index) => (
        <span key={author.id}>
          {index > 0 && ', '}
          {author.url && isSafeHref(author.url) ? (
            <a href={author.url} rel="author">
              {author.name}
            </a>
          ) : (
            author.name
          )}
        </span>
      ))}
    </p>
  );
}
