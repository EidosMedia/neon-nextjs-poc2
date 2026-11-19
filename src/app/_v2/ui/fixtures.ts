import type { BaseModel, PageData, WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';
import type { MenuLink } from '../lib/menu';

/** Neutral inline SVG placeholder (no external hosts) labelled with its ratio. */
export function placeholderImage(label: string, width = 640, height = 360): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="#c9ccd1"/>` +
    `<text x="50%" y="50%" fill="#5b6068" font-family="sans-serif" font-size="${Math.round(height / 8)}" ` +
    `text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export type FixtureKind = 'article' | 'liveblog' | 'gallery';

/**
 * Fake teaser node. No `attributes.contentIds` (so never editable) and an id prefixed `fixture-`.
 */
export function makeFixtureNode(kind: FixtureKind, n: number, overrides: Partial<{ image: boolean; summary: boolean }> = {}): WebpageNodeModel {
  const { image = true, summary = true } = overrides;
  const label = kind === 'article' ? 'Article' : kind === 'liveblog' ? 'Live blog' : 'Gallery';
  const day = String(10 + (n % 5)).padStart(2, '0');
  const node = {
    id: `fixture-${kind}-${n}`,
    title: `${label} fixture headline number ${n} that runs to a realistic length`,
    summary: summary
      ? `Fixture standfirst ${n}: a short placeholder summary written to exercise wrapping and line clamping.`
      : undefined,
    url: `/fixtures/${kind}-${n}/`,
    mainPicture: image ? placeholderImage('16:9') : undefined,
    author: 'Fixture Author',
    attributes: { overhead: 'Fixtures' },
    pubInfo: { publicationTime: `2026-11-${day}T09:${String(10 + n).padStart(2, '0')}:00Z` },
    sys: {
      baseType: kind === 'liveblog' ? 'liveblog' : 'article',
      type: kind === 'gallery' ? 'gallery' : kind === 'liveblog' ? 'liveblog' : 'article',
    },
  };
  return node as unknown as WebpageNodeModel;
}

export function makeFixtureNodes(count: number): WebpageNodeModel[] {
  return Array.from({ length: count }, (_, i) => makeFixtureNode('article', i + 1));
}

type FixtureBlockInput = {
  type: string;
  title?: string;
  summary?: string;
  attributes?: Record<string, unknown>;
  items?: { title: string; url?: string; time?: string; attributes?: Record<string, unknown> }[];
};

/** Fake content block (PageData shape) for brand modules; items go in the `main` link zone. */
export function makeFixtureBlock(input: FixtureBlockInput): PageData<BaseModel> {
  const nodes: Record<string, unknown> = {};
  const main = (input.items ?? []).map((item, i) => {
    const id = `fixture-${input.type}-item-${i + 1}`;
    nodes[id] = {
      id,
      title: item.title,
      url: item.url ?? `/fixtures/${input.type}-${i + 1}/`,
      attributes: item.attributes ?? {},
      pubInfo: item.time ? { publicationTime: item.time } : undefined,
    };
    return { targetId: id };
  });
  return {
    siteData: { viewStatus: 'live' },
    model: {
      data: {
        id: `fixture-${input.type}`,
        title: input.title,
        summary: input.summary,
        attributes: input.attributes ?? {},
        links: { pagelink: main.length ? { main } : {} },
        sys: { baseType: 'contentblock', type: input.type },
      },
      nodes,
    },
  } as unknown as PageData<BaseModel>;
}

const MATCHES = [
  { teams: 'Rovers|United', score: '2-1', status: 'FT', competition: 'League' },
  { teams: 'City|Athletic', score: '0-0', status: 'FT', competition: 'League' },
  { teams: 'Wanderers|Town', score: '3-2', status: "Live 78'", competition: 'Cup' },
  { teams: 'Albion|Rangers', status: 'Sat 15:00', competition: 'League' },
];

/** Fixture blocks per brand module key; provide the attribute keys the modules read. */
export const MODULE_FIXTURES: Record<string, Record<string, PageData<BaseModel>>> = {
  theglobe: {
    newsletter: makeFixtureBlock({
      type: 'newsletter',
      title: 'The morning briefing',
      summary: 'The stories that matter, in your inbox before breakfast.',
      attributes: { signupUrl: '/fixtures/newsletter/' },
    }),
  },
  sportsarena: {
    breakingnews: makeFixtureBlock({ type: 'breakingnews', title: 'Late winner sends Rovers top of the table', items: [{ title: 'Late winner' }] }),
    results: makeFixtureBlock({
      type: 'results',
      title: 'Results and fixtures',
      items: MATCHES.map((m, i) => ({ title: `Match ${i + 1}`, attributes: m })),
    }),
    scorecard: makeFixtureBlock({ type: 'scorecard', attributes: MATCHES[0] }),
  },
  nextfrontier: {
    breakingnews: makeFixtureBlock({ type: 'breakingnews', title: 'Chip export rules tightened overnight', items: [{ title: 'Chip rules' }] }),
    liveticker: makeFixtureBlock({
      type: 'liveticker',
      title: 'Live updates',
      items: [
        { title: 'Keynote begins with a new compute platform', time: '2026-11-16T09:05:00Z' },
        { title: 'Pricing announced for the developer tier', time: '2026-11-16T09:20:00Z' },
        { title: 'Early benchmarks show a 40 percent gain', time: '2026-11-16T09:42:00Z' },
      ],
    }),
    topstories: makeFixtureBlock({
      type: 'topstories',
      items: ['Quantum chips leave the lab', 'The race for orbital data centres', 'Why batteries stopped getting cheaper', 'Robots enter the warehouse for real'].map((title) => ({ title })),
    }),
    hottopics: makeFixtureBlock({
      type: 'hottopics',
      items: ['AI regulation', 'Space', 'Batteries', 'Quantum', 'Open source'].map((title) => ({ title })),
    }),
    verdict: makeFixtureBlock({
      type: 'verdict',
      summary: 'Fast, polished and priced fairly, with battery life the only real compromise.',
      attributes: { rating: '8.5', pros: 'Excellent display|Fast charging|Repairable', cons: 'Average battery|No headphone jack' },
    }),
    specs: makeFixtureBlock({
      type: 'specs',
      attributes: { specs: 'Display: 6.7 in OLED|Chip: N3 Pro|Battery: 4,800 mAh|Weight: 198 g' },
    }),
  },
};

/** Large menu tree for /ui: 10 sections, one with 14 sub-sections (over the panel cap), one three levels deep. */
export const MENU_FIXTURE: MenuLink[] = (() => {
  const kids = (base: string, names: string[]): MenuLink[] =>
    names.map(name => ({ label: name, href: `/ui-fixture/${base}/${name.toLowerCase().replace(/\W+/g, '-')}/` }));
  return [
    { label: 'News', href: '/ui-fixture/news/', items: kids('news', ['World', 'Europe', 'Politics', 'Local']) },
    { label: 'Economy', href: '/ui-fixture/economy/', items: kids('economy', ['Markets', 'Business', 'Personal finance', 'Jobs']) },
    {
      label: 'Technology & Science',
      href: '/ui-fixture/tech/',
      items: [{ label: 'AI', href: '/ui-fixture/tech/ai/', items: kids('tech/ai', ['Models', 'Policy', 'Chips']) }, ...kids('tech', ['Space', 'Health'])],
    },
    {
      label: 'Culture',
      href: '/ui-fixture/culture/',
      items: kids('culture', ['Film', 'Music', 'Books', 'Theatre', 'Art', 'Design', 'Games', 'TV', 'Podcasts', 'Comics', 'Dance', 'Photography', 'Architecture', 'Opera']),
    },
    { label: 'Life', href: '/ui-fixture/life/', items: kids('life', ['Travel', 'Food', 'Style']) },
    { label: 'Sport', href: '/ui-fixture/sport/', items: kids('sport', ['Football', 'Tennis', 'Basketball', 'Cycling']) },
    { label: 'Groups only', items: kids('groups', ['First', 'Second']) },
    { label: 'Opinion', href: '/ui-fixture/opinion/' },
    { label: 'Podcast', href: '/ui-fixture/podcast/' },
    { label: 'Newsletter', href: '/ui-fixture/newsletter/' },
  ];
})();
