import type { WebpageNodeModel } from '@eidosmedia/neon-frontoffice-ts-sdk';

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
