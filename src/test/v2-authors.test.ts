import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AuthorComponent, EmbeddedAuthors } from '@/app/_v2/leaves/AuthorComponent';
import {
  contactIconUrl,
  embeddedAuthorsToShow,
  isSafeContactUri,
  resolveAuthorSettings,
  resolveAuthorView,
  resolveEmbeddedAuthors,
  type AuthorNodeModel,
} from '@/lib/authors';

const model: AuthorNodeModel = {
  title: 'Quincy Quill',
  summary: 'Reports on the sea.',
  url: '/author/1abc/quincy-quill',
  attributes: {
    author: {
      kind: 'EDITORIAL_USER',
      name: 'Quincy Quill',
      nickName: '<p>The <em>Quill</em></p>',
      contacts: [
        { label: 'Mail', icon: 'mail', uri: 'mailto:q@example.com' },
        { label: 'Evil', icon: 'x', uri: 'javascript:alert(1)' },
        { label: 'Site', icon: '../bad', uri: 'https://example.com/q' },
      ],
    },
    linkedAuthors: [
      { id: 'a', name: 'Quincy Quill', url: '/author/1abc/quincy-quill' },
      { id: 'b', name: 'Bad Link', url: 'javascript:alert(1)' },
    ],
  },
};

const render = (attributes: Record<string, unknown>, node: AuthorNodeModel | null = model) =>
  renderToStaticMarkup(createElement(AuthorComponent, { attributes, model: node }));

describe('author component settings', () => {
  test('uses the defaults for a missing or damaged value', () => {
    expect(resolveAuthorSettings(undefined)).toEqual({ align: 'left', look: 'simple', contacts: 'off' });
    expect(resolveAuthorSettings({ align: 'middle', look: 1, contacts: 'maybe' })).toEqual({
      align: 'left',
      look: 'simple',
      contacts: 'off',
    });
    expect(resolveAuthorSettings({ align: 'right', look: 'summary', contacts: 'on' })).toEqual({
      align: 'right',
      look: 'summary',
      contacts: 'on',
    });
  });

  test('the embedding flag is off unless it is a known value', () => {
    expect(resolveEmbeddedAuthors(undefined)).toBe('off');
    expect(resolveEmbeddedAuthors('name-right')).toBe('name-right');
    expect(resolveEmbeddedAuthors('all')).toBe('off');
  });
});

describe('author contacts', () => {
  test('only https, mailto and tel links are accepted, the icon only by a plain name', () => {
    expect(isSafeContactUri('https://example.com')).toBe(true);
    expect(isSafeContactUri('mailto:q@example.com')).toBe(true);
    expect(isSafeContactUri('tel:+3912345')).toBe(true);
    expect(isSafeContactUri('http://example.com')).toBe(false);
    expect(isSafeContactUri('javascript:alert(1)')).toBe(false);
    expect(isSafeContactUri('https://exa mple.com')).toBe(false);
    expect(contactIconUrl('instagram')).toBe('/shared/uicomponents/icons/contacts/instagram.svg');
    expect(contactIconUrl('../x')).toBeUndefined();
  });
});

describe('AuthorComponent', () => {
  test('renders nothing for an empty component or an Author that is not delivered', () => {
    expect(render({}, null)).toBe('');
    expect(render({}, {})).toBe('');
  });

  test('the simple look is the name, linked to the author page, aligned as set, without summary and contacts', () => {
    const html = render({ align: 'center', look: 'simple', contacts: 'off' }, { ...model, attributes: { author: { name: 'Quincy Quill' } } });
    expect(html).toContain('v2-author--center');
    expect(html).toContain('href="/author/1abc/quincy-quill"');
    expect(html).toContain('>Quincy Quill<');
    expect(html).not.toContain('Reports on the sea');
    expect(html).not.toContain('v2-author__contacts');
  });

  test('the nickname replaces the name as the text of the anchor', () => {
    const html = render({});
    expect(html).toContain('The <em>Quill</em>');
    expect(html).not.toContain('>Quincy Quill<');
  });

  test('the summary look adds the citation of the summary', () => {
    expect(render({ look: 'summary' })).toContain('“Reports on the sea.”');
  });

  test('the contacts are shown in order with the 14x14 icon, and the unsafe ones are dropped', () => {
    const html = render({ contacts: 'on' });
    expect(html).toContain('href="mailto:q@example.com"');
    expect(html).toContain('src="/shared/uicomponents/icons/contacts/mail.svg" width="14" height="14"');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('Evil');
    expect(html).toContain('Site');
    expect(html).not.toContain('../bad');
  });

  test('the view of an Author falls back to the title when the author attributes are missing', () => {
    expect(resolveAuthorView({ title: 'Plain' })).toMatchObject({ name: 'Plain', contacts: [] });
  });
});

describe('Authors of an embedded story', () => {
  test('off shows nothing, on and name-right show the Authors that the delivery gives', () => {
    expect(embeddedAuthorsToShow('off', model)).toEqual([]);
    expect(embeddedAuthorsToShow('on', model)).toHaveLength(2);
    expect(renderToStaticMarkup(createElement(EmbeddedAuthors, { mode: 'off', model }))).toBe('');
    expect(renderToStaticMarkup(createElement(EmbeddedAuthors, { mode: undefined, model }))).toBe('');
    const right = renderToStaticMarkup(createElement(EmbeddedAuthors, { mode: 'name-right', model }));
    expect(right).toContain('v2-embedded-authors--right');
    expect(right).toContain('href="/author/1abc/quincy-quill"');
    expect(right).not.toContain('javascript:');
    expect(right).toContain('Bad Link');
  });

  test('a story without linked Authors shows nothing', () => {
    expect(renderToStaticMarkup(createElement(EmbeddedAuthors, { mode: 'on', model: { title: 'x' } }))).toBe('');
  });
});
