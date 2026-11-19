import {
  buildSearchUrl, chatSearchParams, cleanAnswer, emptyMessage, formatResultDate, htmlToParts, optionToDate, optionToDays,
  parseAnswer, parseInline, resultHref, standardSearchParams, tabToBaseType, tabToUrlParam, urlParamToTab,
} from '@/app/_v2/special/searchLogic';

describe('tabs', () => {
  it('maps url params to tabs and back', () => {
    expect(urlParamToTab(null)).toBe('chat');
    expect(urlParamToTab('c')).toBe('chat');
    expect(urlParamToTab('images')).toBe('images');
    expect(tabToUrlParam('chat')).toBe('c');
    expect(tabToUrlParam('videos')).toBe('videos');
  });
  it('maps tabs to base types', () => {
    expect(tabToBaseType('images')).toBe('image');
    expect(tabToBaseType('videos')).toBe('url');
    expect(tabToBaseType('articles')).toBe('article');
  });
  it('builds the search url', () => {
    expect(buildSearchUrl('chat', 'a b', 'Last Week')).toBe('/search?query=a+b&time=Last+Week&t=c');
  });
});

describe('time windows', () => {
  const now = new Date(2026, 5, 15, 13, 30);
  it('computes the start date at local midnight', () => {
    expect(optionToDate('Last Week', now)).toEqual(new Date(2026, 5, 8));
    expect(optionToDate('Last Year', now)).toEqual(new Date(2025, 5, 15));
    expect(optionToDate('Today', now)).toEqual(new Date(2026, 5, 14));
    expect(optionToDate('weird', now)).toEqual(new Date(2026, 5, 8));
  });
  it('maps options to past days', () => {
    expect(['Today', 'Last Week', 'Last Month', 'Last Quarter', 'Last Year', 'x'].map(optionToDays))
      .toEqual(['1', '7', '30', '120', '365', '7']);
  });
});

describe('request params', () => {
  it('builds chat params with an optional thread id', () => {
    expect(chatSearchParams('q', 'Today', 't1').toString()).toBe('query=q&pastDays=1&searchType=CHAT&threadId=t1');
    expect(chatSearchParams('q', 'Today', '').has('threadId')).toBe(false);
  });
  it('builds standard params and skips a url without query', () => {
    const p = standardSearchParams(new URLSearchParams('query=hi&time=Today'), 'article')!;
    expect(p.get('query')).toBe('hi');
    expect(p.get('baseType')).toBe('article');
    expect(p.get('startDate')).toMatch(/^\d{4}-\d\d-\d\dT/);
    expect(standardSearchParams(new URLSearchParams('t=images'), 'image')).toBeNull();
  });
});

describe('htmlToParts', () => {
  it('emphasises highlight tags and drops everything else', () => {
    expect(htmlToParts('a <em>b</em> <script>x</script>c &amp; d')).toEqual([
      { text: 'a ', emphasis: false },
      { text: 'b', emphasis: true },
      { text: ' ', emphasis: false },
      { text: 'x', emphasis: false },
      { text: 'c & d', emphasis: false },
    ]);
  });
  it('never yields markup', () => {
    const joined = htmlToParts('<img src=x onerror=alert(1)>hi &lt;b&gt;').map((p) => p.text).join('');
    expect(joined).toBe('hi <b>');
  });
});

describe('answers', () => {
  it('strips tool tags', () => {
    expect(cleanAnswer('hello <tool id="search-assistant" /> world')).toBe('hello  world');
  });
  it('parses inline markers', () => {
    expect(parseInline('a **b** *c*')).toEqual([
      { text: 'a ', style: 'plain' }, { text: 'b', style: 'bold' }, { text: ' ', style: 'plain' }, { text: 'c', style: 'italic' },
    ]);
  });
  it('splits paragraphs and lists', () => {
    expect(parseAnswer('one\ntwo\n\n- x\n- y')).toEqual([
      { kind: 'paragraph', lines: ['one', 'two'] },
      { kind: 'list', items: ['x', 'y'] },
    ]);
  });
});

describe('result helpers', () => {
  it('formats the date with an ordinal', () => {
    expect(formatResultDate('2026-03-03T10:00:00Z')).toMatch(/^3rd March 2026$/);
    expect(formatResultDate('2026-03-11T10:00:00Z')).toMatch(/^11th March 2026$/);
    expect(formatResultDate('nope')).toBe('');
    expect(formatResultDate(undefined)).toBe('');
  });
  it('falls back through url, detailPage, importUrl', () => {
    expect(resultHref({ nodeData: { url: '/a' } })).toBe('/a');
    expect(resultHref({ nodeData: { sys: { detailPage: '/b' } } })).toBe('/b');
    expect(resultHref({ nodeData: { sys: { importUrl: '/c' } } })).toBe('/c');
    expect(resultHref({ nodeData: {} })).toBe('#');
    expect(resultHref({ nodeData: { url: 'javascript:alert(1)' } })).toBe('#');
    expect(resultHref({ nodeData: { sys: { detailPage: '//evil.example/x' } } })).toBe('#');
  });
});

describe('emptyMessage', () => {
  it('names the tab, query and period', () => {
    expect(emptyMessage('videos', ' climate ', 'Last Year')).toBe(
      'There are no videos for “climate” in the last year. Try a different keyword or a longer time period.'
    );
    expect(emptyMessage('chat', 'x', 'Today')).toContain('articles for “x” today.');
  });
  it('prompts for a keyword when there is no query', () => {
    expect(emptyMessage('images', '  ', 'Last Year')).toBe('Type a keyword to search articles, images and videos.');
  });
});
