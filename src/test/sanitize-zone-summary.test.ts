import { isSafeHref, sanitizeZoneSummary } from '@/lib/accessories/sanitizeZoneSummary';

const options = { maxVisible: 2000 };
const text = (value: string) => ({ kind: 'text', text: value }) as const;

describe('sanitizeZoneSummary', () => {
  test('keeps paragraphs, marks, line breaks and per-paragraph alignment', () => {
    const html =
      '<p>One <strong>bold <em>both</em></strong><br>next <u>u</u> <s>s</s></p>' +
      '<p style="text-align: center">Two</p><p style="TEXT-ALIGN:justify;">Three</p>';

    expect(sanitizeZoneSummary(html, options)).toEqual([
      {
        children: [
          text('One '),
          { kind: 'mark', mark: 'strong', children: [text('bold '), { kind: 'mark', mark: 'em', children: [text('both')] }] },
          { kind: 'br' },
          text('next '),
          { kind: 'mark', mark: 'u', children: [text('u')] },
          text(' '),
          { kind: 'mark', mark: 's', children: [text('s')] },
        ],
      },
      { align: 'center', children: [text('Two')] },
      { align: 'justify', children: [text('Three')] },
    ]);
  });

  test('keeps only a single exact text-align declaration', () => {
    const html =
      '<p style="color: red">a</p><p style="text-align: center; color: red">b</p>' +
      '<p style="text-align: middle">c</p><p style="text-align: left; text-align: right">d</p>';

    expect(sanitizeZoneSummary(html, options)).toEqual([
      { children: [text('a')] },
      { children: [text('b')] },
      { children: [text('c')] },
      { children: [text('d')] },
    ]);
  });

  test('wraps loose inline content in a paragraph and ignores whitespace between blocks', () => {
    expect(sanitizeZoneSummary('\n  <p>a</p>\n  <p>b</p>\n', options)).toEqual([
      { children: [text('a')] },
      { children: [text('b')] },
    ]);
    expect(sanitizeZoneSummary('plain <em>text</em>', options)).toEqual([
      { children: [text('plain '), { kind: 'mark', mark: 'em', children: [text('text')] }] },
    ]);
  });

  test('drops scripts, styles, unknown tags, comments, classes and event attributes but keeps their text', () => {
    const html =
      '<p class="x" onclick="alert(1)">a<script>alert(1)</script><style>p{color:red}</style><!-- c -->' +
      '<span style="color:red" onmouseover="x()">b</span><img src="x" onerror="y()"><div>c</div></p>';

    expect(sanitizeZoneSummary(html, options)).toEqual([{ children: [text('a'), text('b'), text('c')] }]);
  });

  test('decodes entities to text and never produces markup from them', () => {
    expect(sanitizeZoneSummary('<p>&lt;b&gt; &amp; &#65;&#x42; &unknown; &#0;</p>', options)).toEqual([
      { children: [text('<b> & AB &unknown; ')] },
    ]);
  });

  test('keeps safe links and drops the link, not the text, for unsafe ones', () => {
    const html =
      '<p><a href="/news/today" target="_blank" onclick="x()">rel</a> ' +
      '<a href="https://example.com/a?b=1">abs</a> ' +
      '<a href="javascript:alert(1)">js</a> <a href="//evil.com">proto</a> <a href="http://example.com">http</a> <a>none</a></p>';

    expect(sanitizeZoneSummary(html, options)).toEqual([
      {
        children: [
          { kind: 'link', href: '/news/today', children: [text('rel')] },
          text(' '),
          { kind: 'link', href: 'https://example.com/a?b=1', children: [text('abs')] },
          text(' '),
          text('js'),
          text(' '),
          text('proto'),
          text(' '),
          text('http'),
          text(' '),
          text('none'),
        ],
      },
    ]);
  });

  test('does not nest links', () => {
    expect(sanitizeZoneSummary('<p><a href="/a">x<a href="/b">y</a>z</a></p>', options)).toEqual([
      { children: [{ kind: 'link', href: '/a', children: [text('x'), text('y'), text('z')] }] },
    ]);
  });

  test('closes unclosed and misnested marks inside their paragraph', () => {
    expect(sanitizeZoneSummary('<p><strong>a<em>b</strong>c</em></p><p>d', options)).toEqual([
      {
        children: [
          { kind: 'mark', mark: 'strong', children: [text('a'), { kind: 'mark', mark: 'em', children: [text('b')] }] },
          text('c'),
        ],
      },
      { children: [text('d')] },
    ]);
  });

  test('is absent when empty, whitespace-only or without visible text', () => {
    expect(sanitizeZoneSummary('', options)).toBeUndefined();
    expect(sanitizeZoneSummary('<p> &nbsp; </p><p><br></p>', options)).toBeUndefined();
    expect(sanitizeZoneSummary('<script>x</script>', options)).toBeUndefined();
  });

  test('trims leading and trailing empty paragraphs but keeps inner spacing', () => {
    expect(sanitizeZoneSummary('<p><br></p><p>a</p><p><br></p><p>b</p><p></p>', options)).toEqual([
      { children: [text('a')] },
      { children: [{ kind: 'br' }] },
      { children: [text('b')] },
    ]);
  });

  test('rejects oversize visible text and oversize serialized payloads', () => {
    expect(sanitizeZoneSummary(`<p>${'x'.repeat(10)}</p>`, { maxVisible: 10 })).toBeDefined();
    expect(sanitizeZoneSummary(`<p>${'x'.repeat(11)}</p>`, { maxVisible: 10 })).toBeUndefined();
    expect(sanitizeZoneSummary(`<p style="text-align: center">x</p>`, { maxVisible: 10 })).toBeUndefined();
    expect(sanitizeZoneSummary(`<p style="text-align: center">x</p>`, { maxVisible: 10, maxSerialized: 100 })).toBeDefined();
  });

  test('counts markup-free visible characters only', () => {
    const html = '<p><strong>abcde</strong><br><a href="/very/long/path">fghij</a></p>';
    expect(sanitizeZoneSummary(html, { maxVisible: 10, maxSerialized: 200 })).toBeDefined();
    expect(sanitizeZoneSummary(html, { maxVisible: 9, maxSerialized: 200 })).toBeUndefined();
  });

  test('flattens very deep nesting instead of producing a deep tree', () => {
    const html = `<p>${'<strong>'.repeat(50)}x${'</strong>'.repeat(50)}</p>`;
    const [paragraph] = sanitizeZoneSummary(html, { maxVisible: 100, maxSerialized: 1000 }) ?? [];
    let depth = 0;
    let node = paragraph?.children[0];
    while (node && node.kind === 'mark') {
      depth++;
      node = node.children[0];
    }
    expect(depth).toBeLessThanOrEqual(6);
    expect(node).toEqual(text('x'));
  });

  test('treats malformed tags as text', () => {
    expect(sanitizeZoneSummary('<p>a < b <3 <strong</p>', options)).toEqual([{ children: [text('a '), text('<'), text(' b '), text('<'), text('3 '), text('<'), text('strong')] }]);
  });
});

describe('isSafeHref', () => {
  test.each(['/', '/path', '/path?x=1#y', 'https://example.com', 'HTTPS://example.com/x'])('accepts %s', href => {
    expect(isSafeHref(href)).toBe(true);
  });

  test.each([
    '',
    '  ',
    '//evil.com',
    '/\\evil.com',
    'http://example.com',
    'javascript:alert(1)',
    'data:text/html,x',
    'mailto:a@b.c',
    'relative/path',
    'https://',
    '/with space',
    `/${'a'.repeat(256)}`,
  ])('rejects %s', href => {
    expect(isSafeHref(href)).toBe(false);
  });
});
