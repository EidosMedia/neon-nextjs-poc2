import { hasContent, withContent } from '@/app/_v2/lib/leafContent';

describe('leaf content fallback', () => {
  const article = { id: 'lb', title: 'T', files: { content: { mimeType: 'application/json', data: null } } };

  it('detects a page response without the content document', () => {
    expect(hasContent(article)).toBe(false);
    expect(hasContent({ files: { content: { data: { nodeType: 'doc' } } } })).toBe(true);
    expect(hasContent({})).toBe(false);
  });

  it('puts the fetched node content into a copy of the article', () => {
    const doc = { nodeType: 'doc', elements: [] };
    const out = withContent(article, { files: { content: { data: doc } } });
    expect(out.files.content.data).toBe(doc);
    expect(out.files.content.mimeType).toBe('application/json');
    expect(out.title).toBe('T');
    expect(article.files.content.data).toBeNull();
  });

  it('keeps the article when the fetched node has no content either', () => {
    expect(withContent(article, { files: { content: { data: null } } })).toBe(article);
    expect(withContent(article, undefined)).toBe(article);
  });

  it('also takes the fetched links when the article has none', () => {
    const links = { system: { mainPicture: [{ dynamicCropsResourceUrls: { Wide_large: '/w.jpg' } }] } };
    const out = withContent(article, { files: { content: { data: { nodeType: 'doc' } } }, links });
    expect((out as { links?: unknown }).links).toBe(links);
  });

  it('keeps the article links when it has them', () => {
    const own = { system: {} };
    const out = withContent({ ...article, links: own }, { files: { content: { data: { nodeType: 'doc' } } }, links: { x: 1 } });
    expect(out.links).toBe(own);
  });
});
